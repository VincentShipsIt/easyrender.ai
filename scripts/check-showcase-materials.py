"""Regression checks for the 12 locally corrected public objects (Pillow + NumPy).

python3 scripts/check-showcase-materials.py
python3 scripts/check-showcase-materials.py --asset-ref 0c99bd7  # reproduces coarse brush
python3 scripts/check-showcase-materials.py --asset-ref aaf08a0  # reproduces matte metals
python3 scripts/check-showcase-materials.py --asset-ref e615ff6  # reproduces original defects
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


def espresso_glass(shape):
    # Two fixed dial-face islands, measured in the original 1024-pixel atlas.
    yy, xx = np.mgrid[:shape[0], :shape[1]] * 1024 / shape[0]
    return (((xx - 223) / 29) ** 2 + ((yy - 170) / 31) ** 2 < 1) | (
        ((xx - 354) / 26) ** 2 + ((yy - 851) / 25) ** 2 < 1)


def highpass(rgb):
    gray = Image.fromarray(np.uint8(rgb)).convert('L')
    return np.asarray(gray, float) - np.asarray(gray.filter(ImageFilter.GaussianBlur(2)), float)


def masked_lowpass(values, mask):
    # Exclude glass/rubber boundaries when measuring broad bands in the steel.
    def blur(a):
        kernel = np.array([1, 4, 6, 4, 1]) / 16
        for axis in (0, 1):
            a = np.apply_along_axis(
                lambda row: np.convolve(np.pad(row, 2, mode='edge'), kernel, mode='valid'),
                axis, a)
        return a
    return blur(np.where(mask, values, 0)) / np.maximum(blur(mask.astype(float)), .001)


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
                    mask = (lum > 110) & ~espresso_glass(lum.shape)
                    self.assertGreaterEqual(np.median(rgb[mask]), 194, 'steel F0 reflectance')
                    self.assertLessEqual(np.median(rgb[mask]), 200)
                    self.assertGreaterEqual(np.median(mr[:, :, 1][mask]), 64)
                    self.assertLessEqual(np.median(mr[:, :, 1][mask]), 102)
                    self.assertGreater(np.median(mr[:, :, 2][mask]), 240)
                    self.assertGreaterEqual(doc['materials'][0]['normalTexture'].get('scale', 1), .3)
                elif name == 'lamp':
                    self.assertGreater(np.median(rgb[:, :, 2]), 110, 'champagne brass, not yellow')
                    self.assertGreaterEqual(np.median(mr[:, :, 1]), 64)
                    self.assertLessEqual(np.median(mr[:, :, 1]), 102)
                    self.assertGreater(np.median(mr[:, :, 2]), 240)
                    self.assertGreaterEqual(doc['materials'][0]['normalTexture'].get('scale', 1), .3)
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
                        self.assertGreaterEqual(np.median(mr[:, :, 2][iron]), 250)
                        self.assertGreaterEqual(np.median(rgb[iron]), 85)
                        self.assertLessEqual(np.median(rgb[iron]), 125)

    def test_brushed_metals_and_preserved_dielectrics(self):
        for file in FILES:
            name = Path(file).name.split('.')[0]
            if name not in ('espresso', 'lamp', 'crate'):
                # The follow-up must not alter paint, fabric, wood or the coated chair base.
                self.assertEqual(data(PUBLIC + file, 'aaf08a0'), data(PUBLIC + file, OPTIONS.asset_ref))
                continue
            with self.subTest(file=file):
                doc, rgb, mr = maps(file, OPTIONS.asset_ref)
                _, original, _ = maps(file, OPTIONS.baseline_ref)
                _, previous, previous_mr = maps(file, 'aaf08a0')
                lum = original.mean(2)
                metal = ((lum > 110) if name == 'espresso' else
                         ((original.max(2) - original.min(2) < 15) & (lum < 90))
                         if name == 'crate' else np.ones(lum.shape, bool))
                if name == 'espresso':
                    metal &= ~espresso_glass(lum.shape)
                    steel = metal.copy()
                    glass = espresso_glass(lum.shape)
                    self.assertEqual(np.max(mr[:, :, 2][glass]), 0, 'dial cover stays dielectric')
                    self.assertLess(np.mean(np.abs(rgb[glass] - original[glass])), 4, 'retain printed dial')
                    # Body/front plate samples outside the dial and rear reservoir islands.
                    yy, xx = np.mgrid[:lum.shape[0], :lum.shape[1]] * 1024 / lum.shape[0]
                    body = ((xx > 285) & (xx < 320) & (yy > 140) & (yy < 185)) | (
                        (xx > 155) & (xx < 230) & (yy > 260) & (yy < 310)) | (
                        (xx > 760) & (xx < 790) & (yy > 420) & (yy < 470))
                    self.assertGreater(np.mean(mr[:, :, 2][metal] >= 250), .8, 'retain steel coverage')
                    metal &= body
                    reservoir = (xx > 640) & (xx < 680) & (yy > 670) & (yy < 700)
                    self.assertEqual(np.max(mr[:, :, 2][reservoir]), 0, 'reservoir stays dielectric')
                self.assertTrue(np.all(np.isin(mr[:, :, 2], [0, 255])), 'binary material separation')
                self.assertTrue(np.all(mr[:, :, 2][metal] >= 250), 'pure metal, not mixed grey')
                rough = mr[:, :, 1][metal]
                self.assertGreaterEqual(np.median(rough), 64)
                self.assertLessEqual(np.median(rough), 102)
                self.assertGreater(np.percentile(rough, 90) - np.percentile(rough, 10),
                                   1 if name == 'espresso' else 10,
                                   'roughness must retain brushed variation')
                if name == 'espresso':
                    self.assertLessEqual(np.percentile(rough, 90) - np.percentile(rough, 10), 8,
                                         'satin micro-grain, not corrugated roughness')
                    broad = masked_lowpass(mr[:, :, 1] - np.median(rough), steel)
                    self.assertLess(np.std(broad[metal]), 1.5,
                                    'suppress broad brush bands while retaining fine detail')
                if name in ('espresso', 'lamp'):
                    median = np.median(rgb[metal], axis=0)
                    if name == 'espresso':
                        self.assertTrue(np.all((median >= 194) & (median <= 200)))
                        self.assertLessEqual(abs(median[0] - median[2]), 4, 'neutral/cool steel')
                    else:
                        self.assertTrue(np.all(median >= [187, 165, 118]), 'champagne brass')
                        self.assertTrue(np.all(median <= [202, 183, 141]), 'not chalky or yellow')
                    if name == 'lamp':
                        self.assertGreater(np.std(highpass(rgb)[metal]), .5, 'subtle colour streaks')
                    _, binary, _ = load(file, OPTIONS.asset_ref)
                    normal_info = doc['materials'][0]['normalTexture']
                    normal = np.asarray(texture(doc, binary, normal_info['index']), float)
                    deviation = np.linalg.norm(normal[:, :, :2] - 127.5, axis=2)
                    scale = normal_info.get('scale', 1)
                    if name == 'espresso':
                        # Flat 128/128 texels already have a nonzero radial deviation from
                        # 127.5. Measure actual variation, allowing attenuated LOD normals.
                        self.assertGreater(np.max(np.std(normal[:, :, :2][metal], axis=0)) * scale,
                                           .01, 'retain subtle normal-map variation')
                        limit = 1 if '.lod' in file else 1.5
                        self.assertLess(np.percentile(deviation[metal], 90) * scale, limit,
                                        'micro-normals must not add foil-like ripples')
                    else:
                        self.assertGreater(np.median(deviation[metal]) * scale, 1,
                                           'visible brushed micro-normal, not a flat normal map')
                        self.assertLess(np.percentile(deviation[metal], 90) * scale, 22,
                                        'avoid hammered relief')
                dielectric = ((lum < 40) if name == 'espresso' else
                              (original[:, :, 0] - original[:, :, 2] > 55)
                              if name == 'crate' else np.zeros(lum.shape, bool))
                if dielectric.any():
                    self.assertLessEqual(np.max(mr[:, :, 2][dielectric]), 10)
                    self.assertLess(np.mean(np.abs(rgb[dielectric] - previous[dielectric])), 3,
                                    'preserve black grips/knobs and wood')
                    self.assertLess(np.mean(np.abs(mr[:, :, 1][dielectric] - previous_mr[:, :, 1][dielectric])), 1)
                if name == 'crate':
                    # Existing wood normal texels remain byte-for-byte identical.
                    old, ob, _ = load(file, 'aaf08a0')
                    new, nb, _ = load(file, OPTIONS.asset_ref)
                    self.assertEqual(texture(old, ob, old['materials'][0]['normalTexture']['index']).tobytes(),
                                     texture(new, nb, new['materials'][0]['normalTexture']['index']).tobytes())

    def test_fine_pass_scope_and_dielectrics(self):
        changed = {PUBLIC + f'studio/models/espresso{suffix}.glb'
                   for suffix in ('', '.hd', '.lod1', '.lod2')}
        paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', '0c99bd7',
                                         PUBLIC], cwd=ROOT, text=True).splitlines()
        for path in paths:
            if path not in changed:
                with self.subTest(unchanged=path):
                    self.assertEqual(data(path, '0c99bd7'), data(path, OPTIONS.asset_ref))
        for path in sorted(changed):
            with self.subTest(espresso=path):
                file = path.removeprefix(PUBLIC)
                old, old_rgb, old_mr = maps(file, '0c99bd7')
                new, rgb, mr = maps(file, OPTIONS.asset_ref)
                self.assertEqual(old['materials'], new['materials'], 'retain material response')
                np.testing.assert_array_equal(old_mr[:, :, 2], mr[:, :, 2],
                                              err_msg='retain steel/glass/rubber separation')
                dielectric = old_mr[:, :, 2] == 0
                np.testing.assert_array_equal(old_mr[:, :, 1][dielectric], mr[:, :, 1][dielectric])
                self.assertLess(np.mean(np.abs(old_rgb[dielectric] - rgb[dielectric])), 1.5,
                                'dielectric colour stays within recompression tolerance')

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
