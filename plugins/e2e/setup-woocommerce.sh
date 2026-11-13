#!/usr/bin/env bash
# Starts WordPress + WooCommerce in Docker, installs the plugin and creates three products
# four products (three with a photo, one without) and a page with the shortcode. THEME picks the
# active theme.
set -euo pipefail
cd "$(dirname "$0")"
THEME="${THEME:-storefront}"
C="docker compose -f compose.woocommerce.yml"
WP="$C run --rm -T wpcli wp"

$C up -d db api wordpress
echo "waiting for WordPress files"
for _ in $(seq 1 90); do
  $C exec -T wordpress test -f /var/www/html/wp-config.php && break
  sleep 2
done
$C exec -T wordpress test -f /var/www/html/wp-config.php

$WP core install --url=http://localhost:8080 --title="E2E shop" --admin_user=admin --admin_password=admin --admin_email=admin@example.com --skip-email
$WP option update permalink_structure ''
$WP plugin install woocommerce --activate
$WP theme install "$THEME" --activate
$WP plugin activate easyrender-3d
# Skip the WooCommerce setup wizard and pages that would get in the way of the screenshots.
$WP option update woocommerce_onboarding_profile '{"skipped":true}' --format=json
$WP option update woocommerce_coming_soon no
$WP option update woocommerce_store_pages_only no

IMG=$($WP media import /fixtures/chair.png --title="Chair photo" --porcelain)
OAK=$($WP wc product create --user=admin --name="Oak chair" --type=simple --regular_price=129 --status=publish --slug=oak-chair --images="[{\"id\":${IMG}}]" --porcelain)
$WP wc product create --user=admin --name="Walnut table" --type=simple --regular_price=349 --status=publish --slug=walnut-table --images="[{\"id\":${IMG}}]" --porcelain
$WP wc product create --user=admin --name="Linen sofa" --type=simple --regular_price=899 --status=publish --slug=linen-sofa --images="[{\"id\":${IMG}}]" --porcelain
# No photo: the plugin skips it and says so.
$WP wc product create --user=admin --name="Bare shelf" --type=simple --regular_price=59 --status=publish --slug=bare-shelf --porcelain
$WP post create --post_type=page --post_status=publish --post_title="AR shortcode" --post_name=ar-shortcode --post_content="[easyrender_ar id=${OAK}]"
$WP wc product list --user=admin --fields=id,name,status

echo "shop is up at http://localhost:8080"
