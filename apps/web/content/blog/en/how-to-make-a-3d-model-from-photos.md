---

group: how-to-make-a-3d-model-from-photos
title: How to turn a photo into a 3D model
description: Which photo to use, how to check the sides the camera never saw, which files you get, and what a model made from one photo cannot do.
date: 2026-11-11
keyword: how to turn a photo into a 3d model
---

To turn a photo into a 3D model, you need one sharp, evenly lit photo of a single object and a tool that builds the hidden sides from it. AI image-to-3D tools work from that one picture, while photogrammetry needs dozens taken all the way round. Either way, the photo decides most of the result.

## Which method works with one photo?

Photogrammetry stitches many overlapping photos into a model, usually 50 or more taken in a full circle around the object. Apps like Polycam and RealityScan guide you through it on a phone.

LiDAR scanning, on an iPhone Pro or iPad Pro, measures depth as you walk round the piece. Both routes need the object in front of you.

AI image-to-3D works from a single picture. It reads the visible side and predicts the rest: the back of a sideboard, the far legs of a chair. When all you have is a supplier's catalogue shot, it is the only route that works.

If the piece is in your stockroom and you have an afternoon, photogrammetry captures real surface detail better. If you only have the listing photo, use image-to-3D.

## Step 1: Pick the right photo

The best photo shows the whole object, sharp, in soft even light, against a plain background. Nothing should cover it: no cushion over the armrest, no plant in front of a leg.

For furniture, a three-quarter angle beats a straight front shot. A rattan armchair photographed from the front hides its depth, so the software has to guess how deep the seat is. From three-quarters it sees the front and one side at once.

Before you upload, check the photo against this list:

- The whole piece is in frame, with a little space around it.
- The edges are sharp at full size, not only on a phone screen.
- The light is even, with no hard shadow cutting across the object.
- The background is plain: a wall, a paper backdrop or a clean floor.
- There is one object in the photo, not a styled room.

JPEG, PNG and WebP are the formats these tools usually accept. Sharpness matters more than pixel count. A crisp 1,500-pixel photo gives a better model than a blurry 4,000-pixel one.

## Step 2: Remove what is not the object

A busy background is the most common reason a model comes out wrong. The tool can read a rug pattern as part of a table base, or fuse a floor lamp with the curtain behind it.

If your only photo is a lifestyle shot, crop it tight to the piece first. Some tools cut out the background for you, but a clean crop still helps them decide where the object ends.

## Step 3: Check the preview from every angle

Good image-to-3D tools show the object from several sides before they build the final model. Look hard at the back and the sides, because that is where the guesses go wrong.

Typical problems to catch: a cabinet with four doors that comes back with three, chair legs that merge into one, a lampshade that turns oval from above. If the preview is wrong, change the photo rather than trying again with the same one.

With easyrender, you upload one photo and see a free preview of every angle before you spend anything. You only spend credits if you decide to build the model. [Upload a photo](/)

## Step 4: Build the model and download the files

Once the shape looks right, the tool builds a textured 3D model. Most export GLB, the standard format for the web and Android. Many also give you USDZ, the format iPhones and iPads open in AR Quick Look.

A GLB opens in Blender (File, Import, glTF 2.0) and in free browser viewers such as the Babylon.js Sandbox. Open it there once before you use it anywhere, and spin it slowly.

easyrender gives you both files for every finished model. AR is coming soon, so you will be able to open a chair on your phone and see it in your room. It shows the shape and materials, not the real size.

## A real example: a rattan armchair

Take a rattan armchair from a supplier's catalogue. The photo is a three-quarter shot on white, taken in a studio, which is close to ideal.

Expect the overall shape, the curved back and the four legs to come out well. The weave is where single-photo tools struggle: open rattan tends to become a printed pattern on a solid surface, because one photo cannot show what sits behind each gap.

The same chair shot in a styled living room, with a throw over one arm, gives a worse result. The throw becomes part of the chair.

## What a model made from one photo cannot do

It does not know the object's real size. If a buyer needs dimensions, write them in the listing.

Fine details come out soft. A small logo on a backrest, thin brass handles or printed text on a box rarely survive.

Glass, mirrors and polished chrome confuse every method, photogrammetry included, because the surface shows its surroundings instead of itself. And these tools model one object at a time, not a furnished room.

## FAQ

### Can you make a 3D model from one photo?

Yes, AI image-to-3D tools build a full model from a single photo by predicting the sides the camera did not see. The shape and materials come out well when the photo is sharp, evenly lit and shows the whole object. Fine details and the exact back of the piece are estimates, so check them.

### How many photos do you need?

One, for AI image-to-3D. Photogrammetry needs far more, often 50 to 200 overlapping shots taken in rings around the object, because it measures every side instead of predicting it. More photos give more accurate surfaces, but only if you have the object in front of you and room to walk round it.

### Is it free to turn a photo into a 3D model?

Trying usually is; the final file usually is not. Most tools offer a free tier or a free preview, then charge per model or by subscription. On easyrender the angle preview is free and a finished model costs 80 credits, which is $0.80 at one cent per credit, as listed on the pricing page in November 2026.

### Which file format do you get?

Usually GLB, a single file that holds the shape, colours and textures and opens in browsers, Blender and on Android. Many tools also export USDZ for iPhone and iPad. If your shop platform asks for another format, convert the GLB in Blender rather than making the model again.

## Try it with one photo

Pick one sharp photo from your catalogue, a chair or a sideboard shot from three-quarters, and see it from every angle before you spend a credit. [See the free preview](/)
