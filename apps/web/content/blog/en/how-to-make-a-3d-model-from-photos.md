---

group: how-to-make-a-3d-model-from-photos
title: How to turn a photo into a 3D model
description: How to turn a photo into a 3D model: which photo to use, how to check the sides the camera never saw, the files you get and the limits.
date: 2026-11-11
updated: 2026-11-10
keyword: how to turn a photo into a 3d model
cta: Pick one sharp catalogue photo, a chair or a sideboard shot from three-quarters, and check it from every angle before you spend a credit.
---

To turn a photo into a 3D model, take one sharp, evenly lit photo of a single object and give it to an image-to-3D tool, which predicts the sides the camera did not see. Photogrammetry is the other route: it needs at least 20 overlapping photos taken all the way round. Either way, the photo decides most of the result.

## How to make a 3D model from photos: one photo or many?

Photogrammetry stitches overlapping photos into a model. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) asks for at least 20, with about 70% overlap, and detailed objects need 100 or more. [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) works the same way on a phone.

LiDAR scanning, on an iPhone Pro or iPad Pro, measures depth as you walk round the piece. Both routes need the object in front of you.

AI image-to-3D works from a single picture. When all you have is a supplier's catalogue shot, it is the only route that works. If the piece is in your stockroom and you have an afternoon, photogrammetry captures real surface detail better.

## How does image to 3D work?

The tool reads the visible side of the object and predicts the rest: the back of a sideboard, the far legs of a chair. Some tools first draw the object from several angles, then build a textured model from those views.

The prediction is good at overall shape and colour and weak at things one photo cannot show, like what sits behind an open weave. The other routes are compared in [how to make a 3D model](/learn/how-to-make-a-3d-model).

## Step 1: Pick the right photo

The best photo shows the whole object, sharp, in soft even light, against a plain background. Nothing should cover it: no cushion over the armrest, no plant in front of a leg.

For furniture, a three-quarter angle beats a straight front shot. From the front, a lounge chair hides its depth and the tool has to guess how deep the seat is. From three-quarters it sees the front and one side at once.

![A bouclé lounge armchair with a tubular steel frame, photographed from three-quarters on a white background](/showcase/armchair.jpg "A good input photo: the whole chair, three-quarter angle, plain background.")

Before you upload, check the photo against this list:

- The whole piece is in frame, with a little space around it.
- The edges are sharp at full size, not only on a phone screen.
- The light is even, with no hard shadow cutting across the object.
- The background is plain: a wall, a paper backdrop or a clean floor.
- There is one object in the photo, not a styled room.

Sharpness matters more than pixel count. A crisp 1,500-pixel photo gives a better model than a blurry 4,000-pixel one.

## Step 2: Remove what is not the object

A busy background is the most common reason a model comes out wrong. The tool can read a rug pattern as part of a table base, or fuse a floor lamp with the curtain behind it.

If your only photo is a lifestyle shot, crop it tight to the piece first. Some tools cut out the background for you, but a clean crop still helps them decide where the object ends.

## Step 3: Check the preview from every angle

Good image-to-3D tools show the object from several sides before they build the final model. Look hard at the back and the sides, because that is where the guesses go wrong.

Typical problems to catch: a cabinet with four doors that comes back with three, chair legs that merge into one, a lampshade that turns oval from above. If the preview is wrong, change the photo rather than trying again with the same one.

![Nine views of the same bouclé armchair, front, sides, back and top, drawn from the single photo above](/showcase/armchair-angles.jpg "The free angle sheet easyrender drew from that one photo, unretouched. The back and the top view are predictions.")

That sheet is real easyrender output from the photo in step 1. The preview is free, and you only spend credits if you decide to build the model. [Upload a photo](/)

## Step 4: Build the model and download the files

Once the shape looks right, the tool builds a textured 3D model. Most export GLB, the standard format for the web and Android. Many also give you USDZ, the format iPhones and iPads open in AR Quick Look.

A GLB opens in Blender (File, Import, glTF 2.0) and in free browser viewers such as the [Babylon.js Sandbox](https://sandbox.babylonjs.com/). Open it there once before you use it anywhere, and spin it slowly. What is inside the file is explained in [what a GLB file is](/learn/glb-file) and [what a USDZ file is](/learn/usdz-file).

easyrender gives you both files for every finished model. AR is coming soon, so you will be able to open a chair on your phone and see it in your room. It shows the shape and materials, not the real size.

## What a model made from one photo cannot do

It does not know the object's real size. If a buyer needs dimensions, write them in the listing.

Fine details come out soft. A small logo on a backrest, thin brass handles or printed text on a box rarely survive. Open rattan tends to become a printed pattern on a solid surface, because one photo cannot show what sits behind each gap.

Glass, mirrors and polished chrome confuse every method, photogrammetry included, because the surface shows its surroundings instead of itself. And these tools model one object at a time, not a furnished room.

## FAQ

### How many photos do you need for a 3D model?

One, for AI image-to-3D, which predicts the sides it cannot see. Photogrammetry measures every side instead, so it needs at least 20 overlapping photos and often 100 or more for a detailed piece. More photos give truer surfaces, but only if you have the object in front of you and room to walk round it.

### Is image-to-3D the same as photogrammetry?

No, photogrammetry measures the object from many real photos, so every surface it shows was seen by the camera. Image-to-3D starts from one photo and predicts the hidden sides, so the back is an estimate. Photogrammetry needs the object in hand; image-to-3D works from a catalogue shot of a piece you have never touched.

### Which files do you get from a photo?

Usually GLB, a single file that holds the shape, colours and textures and opens in browsers, Blender and on Android. Many tools also export USDZ for iPhone and iPad. If your shop platform asks for another format, convert the GLB in Blender rather than making the model again from the photo.

### Is it free to turn a photo into a 3D model?

Trying usually is; the final file usually is not. Most tools offer a free tier or a free preview, then charge per model or by subscription. On easyrender the angle preview is free and a finished model costs {{renderCredits}} credits, which is {{renderPrice}} at {{creditPrice}} per credit, as the pricing page lists.

### Can you 3D print a model made from a photo?

Treat it as a model for screens, not for printing. The hidden sides are estimates and the model carries no measured size, so a print would not match the real piece. easyrender exports GLB and USDZ for the web and AR, not STL or print files. For a printed part, model it in CAD from real measurements.
