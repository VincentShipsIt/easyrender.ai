---

group: glb-file
title: What is a GLB file? How to open, check and use one
description: "A GLB file is a 3D model in binary glTF 2.0: what is inside it, how to open it on any device, how to make it smaller, and where it is used."
date: 2026-11-15
updated: 2026-11-10
keyword: glb file
cta: If you have a sharp photo of a lamp or a chair, you can see it from every angle before any GLB is built.
---

A GLB file is a 3D model saved in the binary version of glTF 2.0, an open format from the Khronos Group. One .glb file holds the shape, materials, textures and any animation, so it loads on the web without extra files. It is the usual format for 3D on product pages and for AR on Android.

## What is inside a GLB file?

A glTF model can come as a .gltf text file plus separate texture images and a .bin file for the geometry. A GLB packs all of that into one binary file, which is easier to upload, email and host. The [glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) defines both.

![The clay vase GLB on this page drawn in proportion to its bytes: a 1.4 KB JSON chunk, then a binary chunk of 85 KB of triangle indices, 164 KB of vertex positions and texture coordinates and a 50 KB WebP texture, with the same model as three separate glTF files below](diagram:glb-anatomy "Inside the clay vase GLB further down this page, read from the file itself: 301 KB in all. Its texture is already WebP, so here the uncompressed geometry is the heavy part.")

Materials follow the PBR metallic-roughness model. PBR, physically based rendering, describes a surface by its base colour, how metallic it is and how rough it is. That is why the same GLB looks much the same in every viewer that follows the standard.

![The single texture image inside the clay vase GLB: the surface of the vase cut into patches and laid flat, rings of whitewashed clay, the rim and the base](/blog/figures/glb-file/clay-vase-texture.webp "The base colour texture inside that GLB, copied out of the file unchanged, 1024 by 1024 pixels. The texture coordinates tell the viewer which patch wraps onto which part of the vase.")

## How do you open a GLB file?

You need a viewer, not a converter. These open GLB files without extra setup:

- In a browser: drag the file into the [Babylon.js Sandbox](https://sandbox.babylonjs.com/) or the [model-viewer editor](https://modelviewer.dev/editor/).
- In Blender: [File, Import, glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) (.glb/.gltf).
- In code: three.js and Babylon.js load GLB directly, and Unity reads it through the [glTFast package](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).
- On Android: Google's [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) opens a GLB linked from a web page, in 3D or in AR.

iPhones and iPads do not open GLB files in AR Quick Look. Apple's AR uses USDZ, so stores that want AR on both systems keep both files.

![An aged clay vase as a GLB file, open in Google's model-viewer and ready to turn](/showcase/clay-vase.glb "A real easyrender GLB of an aged clay vase, open in model-viewer, the component linked above. The file is 301 KB: one mesh of about 14,600 triangles and one 1024-pixel WebP texture, packed with glTF Transform.")

Once it is open, spin it slowly. Look underneath, behind, and close up at fine details such as handles and stitching.

## What is a GLB file used for?

On product pages, Shopify accepts GLB files as product media. On a site you build yourself, Google's open-source [model-viewer](https://modelviewer.dev/) component shows a GLB with a short snippet of code, with rotate and zoom built in.

Outside ecommerce, GLB is common in web 3D, games and AR apps, because it is compact, open and read by most 3D software. Blender exports it, and so do most scanning and AI tools.

## How do you reduce GLB file size?

Make it small enough to load on a phone over mobile data. Texture images are usually the heaviest part, so 2048-pixel textures, or 1024 for small items, are a common choice for product pages.

[glTF Transform](https://gltf-transform.dev/cli) is a free command-line tool that compresses the geometry with Draco or Meshopt and resizes PNG and JPEG textures. Check the result in a viewer afterwards: heavy compression can blur a linen texture or round off a sharp table edge.

## How do you get a GLB from Blender, a scan or a photo?

In Blender, use File, Export, glTF 2.0 and pick the binary .glb option, so the textures travel inside the file. Scanning apps and AI tools usually offer GLB as a download.

The routes to a model in the first place, from modelling to a single photo, are compared in [how to make a 3D model](/learn/how-to-make-a-3d-model). For a store catalogue, [3D for ecommerce](/learn/3d-models-for-ecommerce) covers which route suits which product.

easyrender, for example, gives you a GLB and a USDZ for every finished model it makes from one photo, following the steps in [how to turn a photo into a 3D model](/learn/how-to-make-a-3d-model-from-photos). The model keeps shape and materials, not measurements.

## GLB to USDZ: do you need both?

For AR on iPhone and iPad, yes. Apple's Reality Converter, a free Mac app, turns a GLB into a USDZ, and recent versions of Blender export USDZ directly. [What a USDZ file is](/learn/usdz-file) covers the Apple side.

| File | What is inside                                             | Opens on                                     | Use it for                                         |
| ---- | ---------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| GLB  | One binary file: geometry, materials and textures          | Browsers, Blender, Android Scene Viewer      | Product pages, web 3D, AR on Android               |
| glTF | A JSON .gltf file, a .bin file and separate texture images | The same viewers, if the files stay together | Editing and inspecting, since the JSON is readable |
| USDZ | An uncompressed zip of USD layers and their images         | iPhone, iPad and Mac Quick Look              | AR on Apple devices                                |

## What does a GLB file not tell you?

glTF measures in metres, but a model is only the right size if whoever made it set the size right. A model generated from a photo has no measured size, so keep dimensions in the product text.

A GLB also says nothing about how good the model is. A file can be valid and still have a melted chair leg or a blurry texture, which only a look in a viewer will catch.

## FAQ

### Is GLB the same as glTF?

They are the same format in two packages. glTF can be a .gltf text file with separate texture and geometry files beside it. GLB is the binary version that packs everything into one file. Both follow the glTF 2.0 standard from the Khronos Group, and most tools that read one also read the other.

### Can you open a GLB file on an iPhone?

Not natively in AR Quick Look, which uses USDZ. You can view a GLB in a browser on the iPhone through a web viewer such as the Babylon.js Sandbox. For AR on Apple devices, convert the GLB to USDZ with Apple's Reality Converter on a Mac, or ask your tool for both files.

### How do you convert a GLB to another format?

Open it in Blender, which imports GLB and exports FBX, OBJ, USD and USDZ, among others. Each conversion can lose information: OBJ, for example, has no metallic-roughness materials, so a brass handle may look flat afterwards. Check the converted file in a viewer before you use it anywhere a customer will see it.

### Why is my GLB file so big?

Usually the textures. A model with several 4096-pixel images can weigh tens of megabytes before the geometry counts at all. Resize the textures to 2048 or 1024 pixels and compress the geometry with Draco or Meshopt, for example with glTF Transform, then check in a viewer that the surfaces still look right.

### Why does my GLB look grey or untextured?

Usually the textures were never exported: a .gltf model repackaged without its texture files, or a tool that exports geometry only, gives a plain grey shape. Re-export as binary .glb so the textures are embedded. If it looks right in the Babylon.js Sandbox but not in one app, that app is the problem.
