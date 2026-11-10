---

group: how-to-make-a-3d-model
title: "How to make a 3D model: five ways, with or without skills"
description: "How to make a 3D model five ways, from Blender to one photo: what each method needs, how long it takes, where it fails, and how to pick one."
date: 2026-11-16
updated: 2026-11-10
keyword: how to make a 3d model
cta: If you have a sharp photo of a chair, a lamp or a sideboard, you can see it from every angle before deciding whether a model is worth making.
---

You can make a 3D model in five ways: build it in software like Blender, scan the object with photogrammetry, scan it with a phone's LiDAR sensor, generate it with AI from a photo, or hire a 3D artist. Which one fits depends on whether the object exists, whether you have it in hand, and how much time you have.

## Which method should you pick?

If the object does not exist yet, model it in software or hire an artist. If it exists and is in front of you, scan it. If all you have is a photo of it, use image-to-3D.

![Decision tree: if the object does not exist yet, model it in software or hire an artist; if it exists but you only have a photo, use AI image-to-3D; if it is in front of you, use LiDAR for large simple shapes and photogrammetry for detailed surfaces](diagram:method-decision-tree "The three questions behind the table below. A 3D artist is also the answer whenever the model has to be exact.")

Accuracy roughly follows effort. An artist working from measurements gives the most exact model. A model generated from one photo is the quickest to get, and its back is an estimate.

| Method               | What you need                                     | Best for                                     | Watch for                                      |
| -------------------- | ------------------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| Model it in software | Weeks of practice, reference photos, measurements | Objects that do not exist yet                | Proportions, textures and UV mapping           |
| Photogrammetry       | The object in hand, 20 to 100 or more photos      | Real surface detail                          | Plain white surfaces, glass, polished metal    |
| LiDAR on a phone     | An iPhone Pro or iPad Pro, the object in hand     | Large, simple shapes like a sofa             | Less detail: turned legs, woven seats          |
| AI from a photo      | One sharp photo                                   | A supplier photo of a piece you cannot touch | The back is an estimate, with no measured size |
| Hire a 3D artist     | Photos, measurements and a budget                 | Exact models, or one model in several sizes  | Time to brief and commission                   |

One thing none of this covers is 3D printing. This guide is about models for screens, product pages and AR. A part you want to print needs a CAD model built from real measurements, which is a different job.

## Method 1: Model it yourself in software

Blender is free, open source and exports GLB, FBX, OBJ and USD. SketchUp is gentler for furniture and buildings, because you [push and pull flat shapes](https://help.sketchup.com/en/sketchup/pushing-and-pulling-shapes-3d) into solids. [Tinkercad](https://www.tinkercad.com/help-center/what-is-tinkercad), a free app that runs in a browser, is the easiest place to learn basic shapes.

Expect weeks of practice before a chair you model looks right. The hard parts for beginners are proportions and textures. UV mapping, which unfolds a surface flat so an image can be painted onto it, is where most people stall.

For a simple piece like a side table, the workflow looks like this:

1. Gather reference: a front photo, a side photo and the real measurements.
2. Block out the main shapes with boxes and cylinders: top, legs, apron.
3. Bevel the edges slightly, so corners catch the light like real wood.
4. Add materials: a wood texture on the top, a metal finish on any handles.
5. Check it from every side, underneath included, then export it as GLB.

![A side table modelled in three stages: rough boxes and cylinders for the top and legs, the same shapes with bevelled edges, then with a wood texture before export](diagram:blockout-side-table "Steps 2 to 5 on one simple table. Drawn for this guide.")

## Method 2: Photogrammetry

Photogrammetry builds a model from many overlapping photos. [Polycam's guide](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) asks for at least 20, with about 70% overlap between shots, taken in rings at different heights in soft, even light. Detailed objects need 100 or more.

![A floor lamp ringed by camera positions at three heights, low, middle and high looking down, with two neighbouring shots whose views overlap](diagram:photogrammetry-rings "How a photogrammetry capture is shot: rings at several heights, each photo sharing about 70% of its view with the next, as Polycam's guide asks.")

RealityScan and Polycam run it on a phone, and the open-source [Meshroom](https://alicevision.org/) runs it on a computer. It captures real surface detail well. It struggles with plain white surfaces, glass and polished metal, because it needs visible texture to match one photo to the next.

## Method 3: LiDAR scanning on a phone

Pro iPhones from the iPhone 12 Pro on, and recent iPad Pro models, have a [LiDAR sensor](https://www.apple.com/newsroom/2020/03/apple-unveils-new-ipad-pro-with-lidar-scanner-and-trackpad-support-in-ipados/) that measures depth directly. Apps like Polycam use it to build a model as you walk round the object.

LiDAR is quick and handles large, simple shapes like a sofa well. It records less detail than photogrammetry, so turned legs and woven seats come out lumpy.

## Method 4: Generate it with AI

AI tools make a model from a photo, called image-to-3D, or from a written description, called text-to-3D. Image-to-3D keeps the look of a real product. Text-to-3D invents one, which is fine for a concept and wrong for something you sell.

The method is the same in every tool: one sharp photo of the whole object on a plain background, then a check of the hidden sides before you keep the result. Each step is in [how to turn a photo into a 3D model](/learn/how-to-make-a-3d-model-from-photos).

![A matte stoneware vase in its catalogue photo, straight on against a white background](/showcase/vase.jpg "The one photo.")
![The 3D model easyrender built from that photo, a pale stoneware vase in a viewer that can be turned](/showcase/vase.glb "The model easyrender built from it, by way of a free angle sheet, textures compressed for this page. Turn it and check the back, which the photo never showed.")

easyrender is one of these tools. It shows a free preview of every angle, and a finished model costs {{renderCredits}} credits ({{renderPrice}}). It models single objects, such as furniture, decor and building exteriors, not whole rooms, and small logos come out soft. [Upload a photo](/)

Meshy and Tripo also turn images into 3D models and add text-to-3D, each with its own pricing. Try the same photo in two tools before you pick one for a catalogue.

## Method 5: Hire a 3D artist

An artist models the object from your photos and measurements. It is the right choice when the model must be exact, such as a sofa sold in three widths, or when you need one polished model for an ad campaign.

Brief them well: photos from every side, dimensions, close-ups of each material, and the format and size limit of wherever the model will go. For a product page, ask for both GLB and USDZ. Freelance marketplaces such as Fiverr and Upwork list product modellers, and it is worth asking for a sample before a whole catalogue.

## How much does a 3D model cost?

Free software costs time. An artist quotes per model, by complexity. Scanning apps and AI tools charge per model or by subscription, often after a free tier or a free preview.

On easyrender, credits cost {{creditPrice}} each and are pay as you go, from {{paygMinCredits}} credits. The Pro plan is {{proPrice}} a month for {{proCredits}} credits, and credits never expire.

## How do you check a finished model?

Whatever the method, open the model in a viewer and look underneath and behind, where errors hide. Zoom into the textures at full screen, because a fabric that looks fine as a thumbnail can be blurred up close. Then load it on a phone over mobile data to see whether the file is too heavy.

For product pages you usually need two files: GLB for the web and Android, USDZ for AR on Apple devices. [What a GLB file is](/learn/glb-file) covers opening, checking and compressing one, and [what a USDZ file is](/learn/usdz-file) covers the Apple side.

## An example: one floor lamp, three ways

Take a floor lamp with a linen shade and a brass stem. In Blender, a beginner can block out the stem and shade in an afternoon. Making the linen look like linen takes far longer.

Photogrammetry struggles with the polished brass, which reflects the room and confuses the matching. People who scan for a living dull shiny parts with a temporary matte spray, which you would not do to stock.

Image-to-3D, from a clean catalogue shot, gets the overall shape and the colour of the shade. The thin stem is the part to check, because thin parts can come out bent or thicker than they are.

## What are the limits of each method?

Models from one photo carry no measured size. Scans miss whatever the camera could not see, like the underside of a sofa that sits flat on the floor. Models you build yourself take time to learn, and artist models take time to commission.

All five methods make one object at a time. A whole furnished room is a different job from a single chair. For selling furniture and decor, [3D for ecommerce](/learn/3d-models-for-ecommerce) compares the routes for a catalogue, and [selling vintage furniture online](/learn/sell-vintage-furniture-online) covers one-off pieces.

## FAQ

### Do you need to learn Blender to make a 3D model?

No, scanning apps and image-to-3D both produce a model without any modelling. You still need a good eye, because checking the back, the textures and the thin parts is what separates a usable model from a strange one. Learning Blender pays off if you often need exact, editable models of things that do not exist yet.

### How long does it take to make a 3D model?

It varies by method more than by object: image-to-3D and phone scans take the least of your own time, and photogrammetry takes an hour or two of shooting plus processing. Modelling a chair in Blender can take a day once you know the software, after weeks of learning. Artists quote their own turnaround.

### Can you make a 3D model from one photo?

Yes, with an image-to-3D tool, which predicts the sides the camera did not see. The result keeps the overall shape and the materials of a real product, while the back and fine details are estimates you need to check. It works best with a sharp three-quarter shot of one object on a plain background.

### Is this the same as making a model for 3D printing?

No: models for screens and AR need to look right, while models for printing need exact measurements and a closed, printable shape. Image-to-3D and most scans give you the first kind. easyrender, for one, exports GLB and USDZ for the web and AR, not STL. For a printed part, use CAD software and real measurements.

### Which file format should a 3D model be in?

GLB for the web, Android and most 3D tools, and USDZ for AR on iPhone and iPad. For product pages, keep both. If a platform or another app asks for something else, convert the GLB in Blender rather than making the model again from scratch with a different method.
