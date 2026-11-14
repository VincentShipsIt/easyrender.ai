"""Check only the public bouclé armchair assets. Requires Pillow and NumPy.

Run: python3 scripts/check-armchair-materials.py [--asset-ref <git-ref>]
The optional ref checks historical files without modifying the worktree.
"""
import argparse
import io
import json
from pathlib import Path
import struct
import subprocess
import unittest

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FILES = ["showcase/armchair.glb"] + [
    f"studio/models/armchair{suffix}.glb" for suffix in ("", ".hd", ".lod1", ".lod2")
]
ARGS = argparse.ArgumentParser()
ARGS.add_argument("--asset-ref")
OPTIONS = ARGS.parse_args()


def load(relative, ref=None):
    path = "apps/web/public/" + relative
    data = (subprocess.check_output(["git", "show", f"{ref}:{path}"], cwd=ROOT)
            if ref else (ROOT / path).read_bytes())
    magic, version, length = struct.unpack_from("<4sII", data)
    assert (magic, version, length) == (b"glTF", 2, len(data))
    size = struct.unpack_from("<I", data, 12)[0]
    return json.loads(data[20:20 + size]), data[28 + size:], len(data)


def image(doc, binary, texture):
    source = doc["textures"][texture]["extensions"]["EXT_texture_webp"]["source"]
    view = doc["bufferViews"][doc["images"][source]["bufferView"]]
    start = view.get("byteOffset", 0)
    return Image.open(io.BytesIO(binary[start:start + view["byteLength"]])).convert("RGB")


class ArmchairMaterials(unittest.TestCase):
    def test_warm_fabric_and_separate_brushed_steel(self):
        for file in FILES:
            with self.subTest(file=file):
                doc, binary, size = load(file, OPTIONS.asset_ref)
                pbr = doc["materials"][0]["pbrMetallicRoughness"]
                color = image(doc, binary, pbr["baseColorTexture"]["index"])
                rgb = np.asarray(color, dtype=float)
                cloth = (rgb[:, :, 0] - rgb[:, :, 2] > 40) & (rgb[:, :, 0] > 80)
                median = np.median(rgb[cloth], axis=0)
                self.assertGreater(median[0] / median[1], 1.25, "upholstery must not be olive")
                self.assertLess(median[0] / median[1], 1.6)
                self.assertGreater(median[1] / median[2], 1.45)
                self.assertIn("metallicRoughnessTexture", pbr, "fabric and steel need separate responses")
                mr = np.asarray(image(doc, binary, pbr["metallicRoughnessTexture"]["index"])
                                .resize(color.size, Image.Resampling.BILINEAR))
                self.assertLess(np.median(mr[:, :, 2][cloth]), 10, "fabric must be nonmetallic")
                self.assertGreater(np.median(mr[:, :, 1][cloth]), 215, "fabric must be matte")
                steel = (rgb.max(2) - rgb.min(2) < 12) & (rgb.mean(2) > 80)
                self.assertGreater(np.median(mr[:, :, 2][steel]), 220)
                self.assertGreater(np.median(mr[:, :, 1][steel]), 100, "steel must not be mirror chrome")
                if file.startswith("showcase"):
                    self.assertLess(size, 650_000, "keep the web asset small")
                    # A central fabric island, away from seams: visible fine detail must survive compression.
                    patch = color.crop((570, 220, 720, 340)).convert("L")
                    residual = np.asarray(patch, float) - np.asarray(patch.filter(ImageFilter.GaussianBlur(1)), float)
                    self.assertGreater(np.std(residual), 2.5, "fabric detail is too blurred")

    def test_poster_dimensions(self):
        path = "apps/web/public/blog/models/armchair.webp"
        data = (subprocess.check_output(["git", "show", f"{OPTIONS.asset_ref}:{path}"], cwd=ROOT)
                if OPTIONS.asset_ref else (ROOT / path).read_bytes())
        poster = Image.open(io.BytesIO(data))
        self.assertEqual(poster.size, (960, 960))
        self.assertEqual(poster.mode, "RGBA", "poster must work on light and dark backgrounds")


if __name__ == "__main__":
    unittest.main(argv=[__file__], verbosity=2)
