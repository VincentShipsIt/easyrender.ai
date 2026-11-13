#!/usr/bin/env bash
# Starts a real PrestaShop in Docker (PS_TAG picks the version), installs the module, points it at
# the mock API. The shop installs itself on first start, which takes a few minutes.
set -euo pipefail
cd "$(dirname "$0")"
export PS_TAG="${PS_TAG:-8.1}"
C="docker compose -f compose.prestashop.yml"
PS="$C exec -T -u www-data prestashop"
SQL="$C exec -T db mariadb -ups -pps prestashop"

$C up -d db api prestashop

echo "waiting for PrestaShop ${PS_TAG} to install itself (up to 15 minutes)"
for i in $(seq 1 180); do
  if curl -fsS -o /dev/null "http://localhost:8080/index.php" 2>/dev/null; then
    break
  fi
  if [ $((i % 12)) -eq 0 ]; then $C logs --tail 3 prestashop || true; fi
  sleep 5
done
curl -fsS -o /dev/null "http://localhost:8080/index.php"
$C exec -T prestashop test -f /var/www/html/app/config/parameters.php

echo "installing the module"
$C exec -T prestashop sh -c 'rm -rf /var/www/html/modules/easyrender3d && cp -r /mnt/easyrender3d /var/www/html/modules/easyrender3d && chown -R www-data:www-data /var/www/html/modules/easyrender3d'
# Test-only: report photos as https while the module collects products (see prestashop/Link.php).
$C cp ./prestashop/Link.php prestashop:/var/www/html/override/classes/Link.php
$C exec -T prestashop sh -c 'chown www-data:www-data /var/www/html/override/classes/Link.php && rm -rf /var/www/html/var/cache/*'
$PS php bin/console prestashop:module install easyrender3d

# The API address (the key is typed into the module page by the test).
$SQL -e "INSERT INTO ps_configuration (name, value, date_add, date_upd) VALUES ('EASYRENDER3D_API_URL', 'http://api.test:4010', NOW(), NOW())"
$PS php bin/console cache:clear --no-warmup || true

echo "products in the shop:"
$SQL -e "SELECT COUNT(*) AS products FROM ps_product p JOIN ps_product_shop ps ON ps.id_product = p.id_product AND ps.active = 1"
echo "shop is up at http://localhost:8080"
