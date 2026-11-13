# easyrender 3D & AR for PrestaShop

Turns a PrestaShop catalogue into 3D models in one click, and puts a "View in your room" button and
a QR code on each product page. A shopper on a phone taps the button and sees the product in their
own room (Android Scene Viewer, iPhone Quick Look). A shopper on a computer scans the QR code.

The module holds no generation logic. It sends products to the shared easyrender catalogue API
(`/api/catalog`, the same one the WooCommerce plugin and the Shopify app use), copies the states
back, and shows the AR links. Credits are the only unit and are charged by easyrender.

## Install

1. Zip the `easyrender3d` folder (`cd plugins/prestashop && zip -r easyrender3d.zip easyrender3d -x 'easyrender3d/tests/*'`).
2. Back office, Modules, Module Manager, Upload a module.
3. Open the module's Configure page, paste an API key made at https://easyrender.ai/connectors and save.
4. The button reads "Generate 3D for N products (C credits)". The price is shown before anything is charged.
   Click it. Products are sent in batches of 100 and the page follows their progress.
5. A product page shows the button and QR code once its model is ready.

Optional: the Configure page shows a background-sync URL. Call it from a cron job (every 5 to 10
minutes) so finished models appear on product pages even when nobody has the Configure page open.

Needs PrestaShop 1.7.7 or later (including 8.x) and photos served over https. Products without an
https cover photo are skipped and counted on the page. Spanish strings are in `translations/es.php`.

## How it works

- `classes/Easyrender3dClient.php`: HTTP client for `quote`, `submit`, `status`, `forget`.
- `classes/Easyrender3dRunner.php`: picks the products that need a model, prices the run, sends
  batches with `maxCredits` (the credits the owner saw), and copies API states onto products.
- `classes/Easyrender3dPrestaShop.php`: the PrestaShop parts: the product query, the
  `easyrender3d_product` table, and the cron token.
- `controllers/admin/AdminEasyrender3dAjaxController.php`: answers the Configure page (PrestaShop
  checks the admin token). `controllers/front/cron.php`: the token-protected sync URL.
- `hookDisplayProductAdditionalInfo`: the button and QR code, only for products with a ready model.

## Tests

`php plugins/prestashop/easyrender3d/tests/run.php` covers the client and the runner (batching,
price guard, state mapping, links) with PrestaShop left out. CI runs it with `php -l` on every file.

**Not verified:** installing on a real PrestaShop, the product query on a real database, the hook
placement in a real theme, the back-office AJAX token flow, and AR on a real phone. Composer and
PrestaShop's own validator are not reachable from the build sandbox. Check these on a test shop
before telling merchants about it.
