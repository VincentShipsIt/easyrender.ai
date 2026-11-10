---

group: glb-file
title: What is a GLB file? How to open, check and use one
description: A GLB file is a 3D model in binary glTF 2.0. What is inside it, how to open it on any device, how to keep it light, and where it is used.
date: 2026-11-15
keyword: glb file
---

A GLB file is a 3D model saved in the binary version of glTF 2.0, an open format from the Khronos Group. One .glb file holds the shape, materials, textures and any animation, so it loads on the web without extra files. It is the standard format for 3D on product pages and for AR on Android.

## What is inside a GLB file?

A glTF model can come as a .gltf text file plus separate texture images and a .bin file for the geometry. A GLB packs all of that into one binary file, which is easier to upload, email and host.

Materials follow the PBR metallic-roughness model. PBR, physically based rendering, describes a surface by its base colour, how metallic it is and how rough it is. That is why the same GLB looks much the same in every viewer that follows the standard.

## How do you open a GLB file?

You need a viewer, not a converter. These open GLB files without extra setup:

- In a browser: drag the file into the Babylon.js Sandbox or the editor on modelviewer.dev.
- In Blender: File, Import, glTF 2.0 (.glb/.gltf).
- In code: three.js and Babylon.js load GLB directly, and Unity reads it through its glTFast package.
- On Android: Google's Scene Viewer opens a GLB linked from a web page, in 3D or in AR.

iPhones and iPads do not open GLB files in AR Quick Look. Apple's AR uses USDZ, so stores that want AR on both systems keep both files.

Once it is open, spin it slowly. Look underneath, behind, and close up at fine details such as handles and stitching.

## What is a GLB file used for?

On product pages, Shopify accepts 3D models as product media. On a site you build yourself, Google's open-source model-viewer component shows a GLB with a short snippet of code, with rotate and zoom built in.

Outside ecommerce, GLB is common in web 3D, games and AR apps, because it is compact, open and supported by most 3D software. Blender exports it, and so do most scanning and AI tools.

## How big should a GLB file be?

Small enough to load on a phone over mobile data. Texture images are usually the heaviest part, so 2048-pixel textures, or 1024 for small items, are a common choice for product pages.

Command-line tools such as glTF Transform can compress the geometry with Draco or Meshopt and resize the textures. Check the result in a viewer afterwards: heavy compression can blur a linen texture or round off a sharp table edge.

## Where do GLB files come from?

From 3D software, from scanning apps, from manufacturer files converted in Blender, or from AI tools that build a model from a photo. The [3D models for ecommerce](/learn/3d-models-for-ecommerce) guide compares those routes.

easyrender, for example, gives you a GLB and a USDZ for every finished model it makes from one photo. The steps are in [how to turn a photo into a 3D model](/learn/how-to-make-a-3d-model-from-photos). The model keeps shape and materials, not measurements.

## What does a GLB file not tell you?

glTF measures in metres, but a model is only the right size if whoever made it set the size right. A model generated from a photo has no measured size, so keep dimensions in the product text.

A GLB also says nothing about how good the model is. A file can be valid and still have a melted chair leg or a blurry texture, which only a look in a viewer will catch.

## FAQ

### Is GLB the same as glTF?

They are the same format in two packages. glTF can be a .gltf text file with separate texture and geometry files beside it. GLB is the binary version that packs everything into one file. Both follow the glTF 2.0 standard, and most tools that read one read the other.

### Can you open a GLB file on an iPhone?

Not natively in AR Quick Look, which uses USDZ. You can view a GLB in a browser on the iPhone through a web viewer such as the Babylon.js Sandbox. For AR on Apple devices, convert the GLB to USDZ with Apple's Reality Converter on a Mac, or ask your tool for both files.

### Can you convert a GLB to another format?

Yes, Blender imports GLB and exports FBX, OBJ, USD and others. Each conversion can lose information: OBJ, for example, has no metallic-roughness materials, so a brass handle may look flat afterwards. Check the converted file in a viewer before you use it.

### Why does my GLB look grey or untextured?

Usually the textures were never exported: a .gltf model repackaged without its texture files, or a tool that exports geometry only, gives a plain grey shape. Re-export with the textures embedded. If it looks right in the Babylon.js Sandbox but not in one app, that app is the problem.

## Get a GLB from one photo

If you have a sharp photo of a lamp or a chair, you can see it from every angle before any GLB is built. [See the free preview](/)
