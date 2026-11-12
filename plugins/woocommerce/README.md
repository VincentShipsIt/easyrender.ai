# easyrender 3D & AR for WooCommerce

Turns a store's whole catalogue into 3D models in one click, and puts a "View in your room" button
and a QR code on every product page that has a model.

The plugin only sends products and shows results. All generation, credit spending and refunds happen
in easyrender through the catalogue API (`/api/catalog`, `/api/catalog/quote`).

## How it works

1. **WooCommerce > 3D & AR**: paste an API key from https://easyrender.ai/connectors.
2. The page counts published products that have an https photo and no model yet, asks the API what
   that costs, and shows it on the button: "Generate 3D for 120 products (7,680 credits)". The price
   comes from the API, never from the plugin.
3. One click sends the products in batches of 100. The click carries the credits the owner saw, and the
   API refuses a run that would cost more.
4. easyrender drafts each product, then builds the 3D model and spends credits as each one starts. The
   page and a background job (WP-Cron, every 5 minutes while work is pending) copy the state onto each
   product (`_easyrender_state`, `_easyrender_render_id`).
5. A product with a finished model shows the button and QR on its page (after the add-to-cart block), or
   anywhere with `[easyrender_ar id="123"]`. The button opens `https://easyrender.ai/ar/<id>`; on a phone
   that hands over to Android Scene Viewer or iPhone Quick Look. The QR code carries the same page from
   a computer to a phone.

Products without an https photo are skipped and counted. Products with an unusable photo show up as
"need a usable photo"; products that failed are refunded and can be retried by clicking again.

## Install (until it is listed)

```bash
cd plugins/woocommerce
zip -r easyrender-3d.zip easyrender-3d -x 'easyrender-3d/tests/*'
```

Upload the zip under Plugins > Add New > Upload. Requires WordPress 6.0+, PHP 7.4+, WooCommerce.
Set `define( 'EASYRENDER_API_URL', 'https://...' );` in `wp-config.php` to point at another easyrender.

## Tests

```bash
php plugins/woocommerce/easyrender-3d/tests/run.php
```

These run the client, the product mapping and the shopper block with the WordPress functions stubbed.
They do not load WordPress or WooCommerce. Not yet verified: the admin page, AJAX handlers, WP-Cron and
the product-page hook on a real WooCommerce site, and AR on a real phone.

## Not in this version

Per-product generate button, bulk action on the products list, OAuth connect instead of a pasted key,
Spanish and other translations (strings use the `easyrender-3d` text domain), variation images.
