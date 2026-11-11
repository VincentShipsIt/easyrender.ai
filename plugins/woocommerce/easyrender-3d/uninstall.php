<?php
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

require_once __DIR__ . '/includes/class-easyrender-client.php';
require_once __DIR__ . '/includes/class-easyrender-catalog.php';

// Tell the API to forget this store's product list. The key and options go either way.
try {
	$client = Easyrender_Client::from_settings();
	if ( $client->has_key() ) {
		$client->forget( Easyrender_Catalog::store() );
	}
} catch ( Exception $e ) {
	// Uninstalling must never fail because the API is unreachable.
}
delete_option( 'easyrender_api_key' );
delete_option( 'easyrender_summary' );
delete_option( 'easyrender_per_model' );
wp_clear_scheduled_hook( 'easyrender_cron_sync' );
