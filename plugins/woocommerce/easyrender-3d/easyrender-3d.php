<?php
/**
 * Plugin Name:       easyrender 3D & AR
 * Description:       Turn your whole WooCommerce catalogue into 3D models in one click. Shoppers scan a QR code or tap a button to see the piece in their own room with AR.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * Author:            easyrender
 * Author URI:        https://easyrender.ai
 * License:           GPL-2.0-or-later
 * Text Domain:       easyrender-3d
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'EASYRENDER_3D_VERSION', '0.1.0' );
define( 'EASYRENDER_3D_FILE', __FILE__ );

require_once __DIR__ . '/includes/class-easyrender-client.php';
require_once __DIR__ . '/includes/class-easyrender-catalog.php';
require_once __DIR__ . '/includes/class-easyrender-admin.php';
require_once __DIR__ . '/includes/class-easyrender-frontend.php';

add_action(
	'plugins_loaded',
	static function () {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		load_plugin_textdomain( 'easyrender-3d', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
		Easyrender_Admin::init();
		Easyrender_Frontend::init();
	}
);
