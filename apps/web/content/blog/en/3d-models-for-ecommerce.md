---

group: 3d-models-for-ecommerce
title: "3D for ecommerce: how stores get 3D models"
description: "3D for ecommerce: what a 3D product model adds, which files a store needs (GLB and USDZ), four ways to get one, and the limits to know first."
date: 2026-11-13
updated: 2026-11-10
keyword: 3d for ecommerce
cta: Pick one piece with depth, an armchair or a sideboard, and check every angle before you decide whether 3D is worth it for your store.
---

3D for ecommerce means giving a product a 3D model, usually a GLB or USDZ file, that shoppers can spin on screen and, on a phone, place in their room with AR. Stores get these models in four ways: from a 3D artist, from the manufacturer's CAD files, by scanning the product, or with AI from a single photo.

## What does a 3D model add to a product page?

A photo shows the view you chose. A 3D model lets the shopper choose: the back of a bookcase, the underside of a coffee table, how thick the cushion on a lounge chair really is.

![A grey upholstered swivel armchair in its catalogue photo, seen from behind at three-quarters](/showcase/swivel-chair.jpg "The catalogue photo: one view, from behind, chosen by the photographer.")
![The same grey swivel armchair as a 3D model in a viewer, which the shopper can turn to see the front and the seat](/showcase/swivel-chair.glb "The model easyrender built from that photo: the shopper picks the view. The front is a prediction, because the photo only shows the back.")

On iPhone and iPad, a USDZ file opens in [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) and places the object in the room through the camera. On Android, Google's [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) does the same with a GLB.

AR shows how a piece looks in a room. It only shows the real size if the file was made with correct dimensions, and many models are not.

## Which files does a store need for 3D?

GLB for the web and Android, USDZ for AR on Apple devices. Most platforms that support 3D take one or both.

![One product model split into two files: the GLB opens on a product page in any browser and in AR on Android through Scene Viewer, the USDZ opens in AR Quick Look on iPhone and iPad](diagram:store-files "One model, two files, three places a shopper meets it. A site you build yourself can serve both through model-viewer.")

### Shopify 3D models

[Shopify accepts 3D models as product media](https://help.shopify.com/en/manual/products/product-media/product-media-types), in GLB or USDZ, in the same place you add photos. The help page lists the current file size limit.

### WooCommerce and custom sites

WooCommerce stores add 3D through extensions, such as [Arty 3D Viewer](https://woocommerce.com/products/arty-3d-viewer/) in the WooCommerce marketplace. On a site you build yourself, Google's open-source [model-viewer](https://modelviewer.dev/) component shows a GLB and can hand iPhones a USDZ for AR.

Keep the files light. A product model has to load on a phone over mobile data, and a 2048-pixel texture is plenty for most furniture.

## Ways to create 3D product models

There are four, and they trade accuracy against time and access to the product.

### Hire a 3D artist

An artist builds the model from your photos, drawings and measurements. It is the most accurate route and the slowest. Freelance marketplaces such as Fiverr and Upwork list product modellers, and quotes vary with the complexity of the piece.

### Use the manufacturer's CAD files

If you sell your own designs, the factory may already have CAD or SketchUp files. They are accurate but rarely ready for the web: they usually need real textures and a lighter version of the geometry before they load well on a page.

### Scan the product

Photogrammetry apps like Polycam and RealityScan build a model from at least 20 overlapping photos taken around the object. This suits pieces you have in hand, in a space where you can walk all the way round them.

### Generate it from one photo with AI

Image-to-3D tools such as Meshy, Tripo and easyrender predict the hidden sides from a single picture. It is the only route when you have a supplier photo and no access to the item. The trade-off is that the back is an estimate, so you check it before you keep the model.

![Nine views of a matte stoneware vase, drawn from one product photo](/showcase/vase-angles.jpg "An angle sheet easyrender drew from one photo of a stoneware vase, unretouched. Round, matte objects like this are the easy case.")

Each of these routes, with what it needs and where it fails, is in [how to make a 3D model](/learn/how-to-make-a-3d-model).

## 3D models for furniture stores: where to start

Start with the products where depth matters: an armchair, a sideboard, a floor lamp with a shaped shade. Flat items like a framed print gain little from 3D.

Then test before you commit. Run one product through two routes, for example a phone scan and an image-to-3D model of the same table lamp, and compare them on a phone. That tells you more than any feature list.

For a large catalogue, look at bulk options and pricing per model. easyrender lets you drop a set of catalogue photos into a library, check a free preview for each, and build only the ones that look right.

## An example: a walnut sideboard

Say a shop has three supplier photos of a walnut sideboard: front, three-quarter and a close-up of the brass handles. The three-quarter shot is the one to use for image-to-3D, because it shows depth and one end panel.

![Three supplier photos of a sideboard drawn as frames: a straight front view with no depth, a three-quarter view showing the front and one end panel, marked as the one to use, and a close-up of a bar handle](diagram:sideboard-photo-pick "Of the three supplier shots, only the three-quarter one shows the end panel, so the tool has less depth to guess. A drawing for this example, not a real listing.")

Expect the doors, legs and wood grain to read well. Expect the brass handles to come out softer than in the photo, and look closely at the back, which the tool has never seen.

Then upload the GLB with your platform's own tools, such as Shopify's product media, and open the page on an iPhone and on an Android phone before you publish.

## What are the limits of 3D for ecommerce?

A model generated from one photo shows shape and materials, not measurements. Keep the dimensions in the product text, and do not rely on AR to tell a shopper whether a piece fits.

Transparent and reflective products, like a glass vase or a chrome lamp, are hard for every method. Fine print and small logos come out soft.

3D does not replace photos. Platforms still use still images for search results, ads and category grids, so the [product photography for ecommerce](/learn/product-photography-for-ecommerce) basics still apply.

## FAQ

### Do I need 3D models for my online store?

Not for every product: 3D helps most where shoppers want to see depth and the back: chairs, sofas, sideboards, lamps. For flat or very simple items, good photos do the job. Start with a handful of products where buyers ask for more angles, and judge from there rather than converting the whole catalogue at once.

### Which 3D file format does an online store need?

Two, in most cases: GLB for the web and for AR on Android, and USDZ, the format iPhones and iPads open in AR Quick Look. Shopify accepts both as product media. If a tool only gives you one, Apple's Reality Converter on a Mac or Blender can make the other.

### How much does a 3D model for ecommerce cost?

It depends on the route. Artists quote per model by complexity, scanning apps usually charge a subscription, and AI tools charge per model or per month. On easyrender the preview is free and a finished model costs {{renderCredits}} credits ({{renderPrice}}); credits are pay as you go, or {{proCredits}} a month on Pro for {{proPrice}}.

### Can shoppers see a 3D product in AR at its real size?

They can see it in AR on most recent phones: iPhones and iPads use AR Quick Look with USDZ, Android uses Scene Viewer with GLB. The size is another matter. A model only appears at the real size if it was made with correct measurements, and a model generated from a photo was not.

### Do I need a 3D artist for ecommerce models?

Only when the model must be exact, such as a sofa sold in three widths, or when you need one polished model for a campaign. For pieces you have in hand, a scanning app works. For a supplier photo of a piece you have never touched, image-to-3D is the practical route, as long as you check the back.
