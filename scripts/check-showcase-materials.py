"""Regression checks for the 12 locally corrected public objects (Pillow + NumPy).

python3 scripts/check-showcase-materials.py
python3 scripts/check-showcase-materials.py --asset-ref e615ff6  # reproduces defects
Geometry is checked against the pre-correction revision without decoding mesh buffers.
"""
import argparse
import copy
import io
import json
from pathlib import Path
import struct
import subprocess
import unittest

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = 'apps/web/public/'
IDS = ('espresso', 'bedside-table', 'swivel-chair', 'vase', 'clay-vase', 'sofa',
       'lamp', 'coffee-table', 'barrel', 'sneaker', 'cactus', 'crate')
SHOWCASE = ('bedside-table', 'swivel-chair', 'vase', 'coffee-table')
NO_HD = ('bedside-table', 'vase', 'coffee-table')
FILES = [f'showcase/{name}.glb' for name in SHOWCASE] + [
    f'studio/models/{name}{suffix}.glb' for name in IDS
    for suffix in (('', '.lod1', '.lod2') if name in NO_HD else ('', '.hd', '.lod1', '.lod2'))
]
PARSER = argparse.ArgumentParser()
PARSER.add_argument('--asset-ref')
PARSER.add_argument('--baseline-ref', default='e615ff6')
OPTIONS = PARSER.parse_args()


def data(path, ref=None):
    return (subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=ROOT)
            if ref else (ROOT / path).read_bytes())


def load(file, ref=None):
    raw = data(PUBLIC + file, ref)
    assert struct.unpack_from('<4sII', raw) == (b'glTF', 2, len(raw))
    n, kind = struct.unpack_from('<I4s', raw, 12)
    assert kind == b'JSON'
    length, kind = struct.unpack_from('<I4s', raw, 20 + n)
    assert kind == b'BIN\0' and length == len(raw) - 28 - n
    return json.loads(raw[20:20+n]), raw[28+n:], len(raw)


def texture(doc, binary, index):
    tex = doc['textures'][index]
    source = tex.get('source', tex.get('extensions', {}).get('EXT_texture_webp', {}).get('source'))
    view = doc['bufferViews'][doc['images'][source]['bufferView']]
    start = view.get('byteOffset', 0)
    return Image.open(io.BytesIO(binary[start:start + view['byteLength']])).convert('RGB')


def maps(file, ref=None):
    doc, binary, _ = load(file, ref)
    pbr = doc['materials'][0]['pbrMetallicRoughness']
    color = texture(doc, binary, pbr['baseColorTexture']['index'])
    if 'metallicRoughnessTexture' in pbr:
        mr = np.asarray(texture(doc, binary, pbr['metallicRoughnessTexture']['index'])
                        .resize(color.size, Image.Resampling.BILINEAR), float)
    else:
        mr = np.empty((color.height, color.width, 3))
        mr[:] = [255, 255, 255]
    mr[:, :, 1] *= pbr.get('roughnessFactor', 1)
    mr[:, :, 2] *= pbr.get('metallicFactor', 1)
    return doc, np.asarray(color, float), mr


def highpass(rgb):
    gray = Image.fromarray(np.uint8(rgb)).convert('L')
    return np.asarray(gray, float) - np.asarray(gray.filter(ImageFilter.GaussianBlur(2)), float)


class ShowcaseMaterials(unittest.TestCase):
    def test_geometry_and_size(self):
        for file in FILES:
            with self.subTest(file=file):
                old, ob, old_size = load(file, OPTIONS.baseline_ref)
                new, nb, new_size = load(file, OPTIONS.asset_ref)
                for key in ('meshes', 'nodes', 'scenes', 'scene', 'accessors', 'skins', 'animations'):
                    self.assertEqual(old.get(key), new.get(key), key)
                image_views = {im['bufferView'] for im in old['images']}
                for i, ov in enumerate(old['bufferViews']):
                    if i in image_views:
                        continue
                    nv = new['bufferViews'][i]
                    # Physical compressed bytes and the virtual uncompressed view both stay intact.
                    oc, nc = copy.deepcopy(ov), copy.deepcopy(nv)
                    for view, buf in ((oc, ob), (nc, nb)):
                        physical = view if view['buffer'] == 0 else view.get('extensions', {}).get('EXT_meshopt_compression')
                        if physical:
                            offset = physical.pop('byteOffset', 0)
                            physical['payload'] = buf[offset:offset + physical['byteLength']]
                    self.assertEqual(oc, nc, f'geometry bufferView {i}')
                self.assertLess(new_size, old_size * 1.65, 'web asset size growth')
                for view in new['bufferViews']:
                    physical = view if view['buffer'] == 0 else view.get('extensions', {}).get('EXT_meshopt_compression')
                    if physical:
                        self.assertLessEqual(physical.get('byteOffset', 0) + physical['byteLength'], len(nb))
                for tex in range(len(new['textures'])):
                    texture(new, nb, tex).load()

    def test_materials_match_intended_surfaces(self):
        for file in FILES:
            with self.subTest(file=file):
                name = Path(file).name.split('.')[0]
                doc, rgb, mr = maps(file, OPTIONS.asset_ref)
                _, before, _ = maps(file, OPTIONS.baseline_ref)
                lum = before.mean(2)
                # Select parts from the ORIGINAL atlas so tests cannot move their own sample.
                if name == 'espresso':
                    mask = lum > 110
                    self.assertGreater(np.median(rgb[mask]), 195, 'light stainless steel')
                    self.assertGreater(np.median(mr[:, :, 1][mask]), 110, 'brushed, not mirror metal')
                    self.assertGreater(np.median(mr[:, :, 2][mask]), 240)
                    self.assertLessEqual(doc['materials'][0]['normalTexture'].get('scale', 1), .2)
                elif name == 'lamp':
                    self.assertGreater(np.median(rgb[:, :, 2]), 110, 'champagne brass, not yellow')
                    self.assertGreater(np.median(mr[:, :, 1]), 125)
                    self.assertGreater(np.median(mr[:, :, 2]), 240)
                    self.assertLessEqual(doc['materials'][0]['normalTexture'].get('scale', 1), .05)
                else:
                    mask = lum > 70
                    if name in ('bedside-table', 'crate'):
                        mask &= before[:, :, 0] - before[:, :, 2] > 55
                    elif name == 'barrel':
                        mask = before[:, :, 0] - before[:, :, 1] > 65
                    elif name == 'cactus':
                        mask &= before.max(2) - before.min(2) < 14
                    elif name == 'sofa':
                        mask = lum > 15
                    self.assertLess(np.median(mr[:, :, 2][mask]), 10, 'dielectric material')
                    self.assertGreater(np.median(mr[:, :, 1][mask]), 175, 'matte/satin surface')
                    if name == 'bedside-table':
                        self.assertLess(np.median(rgb[:, :, 0][mask] / np.maximum(rgb[:, :, 1][mask], 1)), 1.45, 'walnut must not be orange')
                    elif name == 'swivel-chair':
                        self.assertLess(np.median(rgb[mask]), 125, 'mid-grey fabric')
                        self.assertGreater(np.std(highpass(rgb)[mask]), 3, 'visible heathered weave')
                        self.assertGreater(np.median(mr[:, :, 1][mask]), 225)
                    elif name == 'vase':
                        delta = rgb[:, :, 0] - rgb[:, :, 2]
                        self.assertGreater(np.median(delta[mask]), 20, 'warm sandy stoneware')
                        self.assertGreater(np.std(highpass(rgb)[mask]), 2, 'porous grain')
                    elif name == 'clay-vase':
                        self.assertLess(np.median(rgb[mask]), 201, 'earthy worn clay')
                        self.assertGreater(np.median((rgb[:, :, 0] - rgb[:, :, 2])[mask]), 12)
                    elif name == 'sofa':
                        low = np.asarray(Image.fromarray(np.uint8(rgb)).convert('L').filter(
                            ImageFilter.GaussianBlur(rgb.shape[0] / 64)), float)
                        self.assertLess(np.std(low[mask]), 5, 'remove broad dark stain')
                        self.assertGreater(np.percentile(low[mask], 10), 46)
                        self.assertGreater(np.std(highpass(rgb)[mask]), 2, 'boucle detail')
                    elif name == 'coffee-table':
                        self.assertLess(np.median((rgb[:, :, 0] - rgb[:, :, 2])[mask]), np.median((before[:, :, 0] - before[:, :, 2])[mask]) - 7)
                    elif name == 'barrel':
                        self.assertLess(np.median(rgb[:, :, 0][mask]), np.median(before[:, :, 0][mask]) - 10)
                    elif name == 'sneaker':
                        self.assertLess(np.mean(np.abs(rgb - before)), 5, 'retain off-white and gum colours')
                        self.assertGreater(np.std(highpass(rgb)), np.std(highpass(before)), 'subtle edge definition')
                    elif name == 'cactus':
                        self.assertLess(np.median(rgb[mask]), np.median(before[mask]) - 8)
                        plant = (before[:, :, 1] - before[:, :, 2] > 45) & (before[:, :, 1] > before[:, :, 0] * .9)
                        self.assertLess(np.mean(np.abs(rgb[plant] - before[plant])), 4, 'preserve plant green')
                    elif name == 'crate':
                        self.assertLess(np.median(rgb[mask]), np.median(before[mask]) - 3)
                        iron = (before.max(2) - before.min(2) < 15) & (lum < 90)
                        self.assertLess(np.mean(np.abs(rgb[iron] - before[iron])), 4)

    def test_catalog_and_posters(self):
        catalog = json.loads(data('apps/web/lib/studio/catalog.json', OPTIONS.asset_ref))
        for item in catalog:
            if item['id'] not in IDS:
                continue
            for lod in item['lods'] + ([item['hd']] if item.get('hd') else []):
                size = len(data(PUBLIC + 'studio/models/' + lod['file'], OPTIONS.asset_ref))
                self.assertEqual(lod['kb'], int(size / 1024 + .5), lod['file'])
        for name in SHOWCASE:
            poster = Image.open(io.BytesIO(data(PUBLIC + f'blog/models/{name}.webp', OPTIONS.asset_ref)))
            self.assertEqual(poster.size, (960, 960))
            self.assertEqual(poster.mode, 'RGBA')
            self.assertLess(poster.getchannel('A').getextrema()[0], 255)

    def test_unrelated_models_untouched(self):
        paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', OPTIONS.baseline_ref,
                                         PUBLIC], cwd=ROOT, text=True).splitlines()
        for path in paths:
            if path.endswith(('.glb', '.hull.json', '.usdz')) and path.removeprefix(PUBLIC) not in FILES:
                with self.subTest(path=path):
                    self.assertEqual(data(path, OPTIONS.baseline_ref), data(path, OPTIONS.asset_ref))


if __name__ == '__main__':
    unittest.main(argv=[__file__], verbosity=2)
