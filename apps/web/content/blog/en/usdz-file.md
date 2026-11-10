---

group: usdz-file
title: What is a USDZ file? AR Quick Look on iPhone, explained
description: "A USDZ file is the 3D format iPhone and iPad open in AR: what is inside it, how to open and make one, and why it can look the wrong size."
date: 2026-11-17
updated: 2026-11-10
keyword: usdz file
cta: Pick a sharp photo of one piece, an oak side table or a floor lamp, and check every angle before you spend a credit.
---

A USDZ file is a 3D model packed in Pixar's Universal Scene Description format, USD, inside an uncompressed zip archive. Apple uses it for AR Quick Look, so an iPhone or iPad can open a USDZ from Safari, Files, Mail or Messages and place the object in the room through the camera. Android does not open USDZ.

## What is inside a USDZ file?

USD is the scene format Pixar built for film production. The [USDZ specification](https://openusd.org/release/spec_usdz.html) describes a zip archive with zero compression that holds USD layers and the images they use, laid out so a device can read them in place.

Apple [introduced USDZ with ARKit 2](https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/) at WWDC in June 2018, for iOS 12, alongside AR Quick Look. Since then it has been the format Apple devices expect for AR from a web page or a message.

## USDZ viewer: how do you open a USDZ file?

The device you are on decides how:

- iPhone and iPad: tap the file in Safari, Files, Mail or Messages. Quick Look opens it with an Object view and an AR view.
- Mac: select it in Finder and press the space bar for a Quick Look preview.
- Windows and Android: there is no built-in viewer. [Blender 3.5 and later](https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/) import USDZ, so you can open it there.

If you need the same model on Android or in a browser, use its GLB version instead. [What a GLB file is](/learn/glb-file) covers that side.

<!-- IMAGE PENDING: a real iPhone screenshot of an easyrender USDZ (for example the bouclé armchair) open in Quick Look's Object view, unretouched. Not the AR view until AR is tested on device (REQ-00). -->

## How does AR Quick Look work on a web page?

A page links to the USDZ with `rel="ar"` around a preview image, and Safari adds a small AR badge to that image. [WebKit's guide](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) shows the markup. Tapping the image opens the model in the room, with no app to install.

Google's open-source [model-viewer](https://modelviewer.dev/) component handles both systems from one snippet: it shows a GLB in the page and hands iPhones a USDZ for Quick Look.

AR Quick Look places the model at the size stored in the file. If that size was never measured, the object can appear bigger or smaller than the real one, and the shopper can pinch to resize it anyway.

## How do you make a USDZ file?

Apple's Reality Converter, a free Mac app, [converts files such as OBJ, glTF, FBX and USD](https://developer.apple.com/videos/play/wwdc2022/10141/) to USDZ and lets you check the materials before you export. Blender 3.5 and later export USDZ directly.

If you start from a photo, some image-to-3D tools export USDZ next to the GLB, so you skip the conversion. The steps are in [how to turn a photo into a 3D model](/learn/how-to-make-a-3d-model-from-photos).

easyrender gives you both files for every finished model. AR is coming soon, so you will be able to open the piece on your phone and see it in your room. The model shows its shape and materials, not its real-world size.

## An example: an oak side table on an iPhone

Send yourself the USDZ of an oak side table by Messages and tap it. Quick Look opens the Object view first, where you can spin it with one finger. Switch to AR, point the camera at the floor, and the table appears on the spot you tap.

Walk round it and look where the legs meet the floor. A model whose base sits slightly off will appear to float.

![A round solid wood table as a 3D model in a viewer, that can be turned to check the legs from every side](/showcase/coffee-table.glb "A round solid wood table easyrender modelled from one photo, shown here from its GLB. easyrender makes the USDZ download from this same GLB, in your browser. Turn it and look where the legs meet the ground.")

Then check the grain under your own lamp, which is warmer than the studio light in the original photo.

## GLB to USDZ: should you keep both?

Both, if the model goes on a product page. GLB covers the web and Android, and USDZ covers AR on Apple devices. Shopify, for example, accepts both as product media.

The [guide to making a 3D model](/learn/how-to-make-a-3d-model) explains where both files come from, whichever method you use. For a store, [3D for ecommerce](/learn/3d-models-for-ecommerce) covers which products are worth it.

## FAQ

### Can you open a USDZ file on Android?

Not natively, because Android's AR uses Google's Scene Viewer, which reads glTF and GLB files rather than USDZ. To show the same model on Android, use a GLB version of it. If you only have the Apple file, Blender 3.5 or later can import the USDZ and export a GLB, though you should check the materials afterwards.

### Can you convert a USDZ to a GLB?

Yes. Import the USDZ into Blender 3.5 or later, then export it as glTF 2.0 in the binary GLB format. Check the result in a viewer, because USD and glTF describe surfaces differently and some material settings, such as a clear coat on lacquered wood, may not carry over exactly between the two formats.

### Why does a USDZ model look the wrong size in AR?

AR Quick Look uses the size stored in the file. If the model was never made with real measurements, as with models generated from a photo or scans without a reference, it can appear larger or smaller than the real piece. Treat AR as a way to see the look of an object, not to check whether it fits.

### Is USDZ the same as USD?

USDZ is a package of USD. A USD scene can be a text file (.usda), a binary file (.usdc) or several files that reference each other. USDZ zips those layers and their textures into a single uncompressed file, which is what makes it easy to send by message and open on an iPhone.

### Can Blender export a USDZ file?

Yes, since Blender 3.5. Use File, Export, Universal Scene Description and give the file a .usdz extension. Check the export in Quick Look on a Mac or an iPhone, because some Blender material setups do not translate to USD and can come out flatter or a different colour than in the viewport.
