<?php
/**
 * Test-only helper for the plugin end-to-end run. The test shop is served over http, but the
 * easyrender API only takes https photos, so while the plugin collects products in the back office
 * this reports each photo URL as https. The mock API never fetches it, and shoppers' pages are
 * untouched.
 */
add_filter(
	'wp_get_attachment_image_src',
	static function ( $image ) {
		if ( is_array( $image ) && isset( $image[0] ) && ( is_admin() || wp_doing_ajax() ) ) {
			$image[0] = preg_replace( '#^http://#', 'https://', (string) $image[0] );
		}
		return $image;
	}
);
