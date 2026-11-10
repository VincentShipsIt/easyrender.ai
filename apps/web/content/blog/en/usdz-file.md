---

group: usdz-file
title: What is a USDZ file? AR Quick Look on iPhone, explained
description: A USDZ file is the 3D format iPhone and iPad open in AR. What is inside it, how to open and make one, and why it can look the wrong size.
date: 2026-11-17
keyword: usdz file
---

A USDZ file is a 3D model packed in Pixar's Universal Scene Description format, inside an uncompressed zip archive. Apple uses it for AR Quick Look, so an iPhone or iPad can open a USDZ from Safari, Files, Mail or Messages and place the object in the room through the camera. Android does not open USDZ.

## What is inside a USDZ file?

USD is the scene format Pixar built for film production. A USDZ wraps one USD scene and its texture images into a single file, stored without compression so the device can read it in place.

Apple introduced USDZ with iOS 12 in 2018, alongside AR Quick Look. Since then it has been the format Apple devices expect for AR from a web page or a message.

## How do you open a USDZ file?

The device you are on decides how:

- iPhone and iPad: tap the file in Safari, Files, Mail or Messages. Quick Look opens it with an Object view and an AR view.
- Mac: select it in Finder and press the space bar for a Quick Look preview, or open it in Preview.
- Windows and Android: there is no built-in viewer. Recent versions of Blender can import USD files, USDZ included.

If you need the same model on Android or in a browser, use its GLB version instead. [What a GLB file is](/learn/glb-file) covers that side.

## How does AR Quick Look work on a web page?

A page links to the USDZ with `rel="ar"` around a preview image, and Safari adds a small AR badge to that image. Tapping it opens the model in the room, with no app to install.

Google's open-source model-viewer component handles both systems from one snippet: it shows a GLB in the page and hands iPhones the USDZ for Quick Look.

AR Quick Look places the model at the size stored in the file. If that size was never measured, the object can appear bigger or smaller than the real one, and the shopper can pinch to resize it anyway.

## How do you make a USDZ file?

Apple's Reality Converter, a free Mac app, turns glTF, OBJ and FBX files into USDZ and lets you check the materials before you export. Blender exports USD, and recent versions write USDZ directly.

If you start from a photo, some image-to-3D tools export USDZ next to the GLB, so you skip the conversion. The steps are in [how to turn a photo into a 3D model](/learn/how-to-make-a-3d-model-from-photos).

easyrender gives you both files for every finished model. AR is coming soon, so you will be able to open the piece on your phone and see it in your room. The model shows its shape and materials, not its real-world size.

## A real example: an oak side table on an iPhone

Send yourself the USDZ of an oak side table by Messages and tap it. Quick Look opens the Object view first, where you can spin it with one finger. Switch to AR, point the camera at the floor, and the table appears on the spot you tap.

Walk round it and look where the legs meet the floor. A model whose base sits slightly off will appear to float. Then check the grain under your own lamp, which is warmer than the studio light in the original photo.

## Should you keep GLB or USDZ?

Both, if the model goes on a product page. GLB covers the web and Android, and USDZ covers AR on Apple devices. The [guide to making a 3D model](/learn/how-to-make-a-3d-model) explains where both files come from, whichever method you use.

## FAQ

### Can you open a USDZ file on Android?

Not natively, because Android's AR uses Google's Scene Viewer, which reads GLB files rather than USDZ. To show the same model on Android, use a GLB version of it. If you only have the Apple file, Blender can import the USDZ and export a GLB, though you should check the materials afterwards.

### Can you convert a USDZ to a GLB?

Yes. Import the USDZ into a recent version of Blender, then export it as glTF 2.0 in the GLB format. Check the result in a viewer, because USD and glTF describe surfaces differently and some material settings, such as a clear coat on lacquered wood, may not carry over exactly.

### Why does a USDZ model look the wrong size in AR?

AR Quick Look uses the size stored in the file. If the model was never made with real measurements, as with models generated from a photo or scans without a reference, it can appear larger or smaller than the real piece. Treat AR as a way to see the look of an object, not its fit.

### Is USDZ the same as USD?

USDZ is a package of USD. A USD scene can be a text file (.usda), a binary file (.usdc) or several files referencing each other. USDZ zips one scene and its textures into a single uncompressed file, which is what makes it easy to send and open on an iPhone.

## Get both files from one photo

Pick a sharp photo of one piece, an oak side table or a floor lamp, and check every angle before you spend a credit. [See the free preview](/)
