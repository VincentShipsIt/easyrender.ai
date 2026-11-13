<?php
defined( 'ABSPATH' ) || exit;

/**
 * WooCommerce > 3D & AR: connect the account, see the price, generate the whole catalogue in one click.
 */
class Easyrender_Admin {
	const CAP  = 'manage_woocommerce';
	const PAGE = 'easyrender-3d';
	const CRON = 'easyrender_cron_sync';

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_easyrender_save_key', array( __CLASS__, 'save_key' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'wp_ajax_easyrender_prepare', array( __CLASS__, 'ajax_prepare' ) );
		add_action( 'wp_ajax_easyrender_submit', array( __CLASS__, 'ajax_submit' ) );
		add_action( 'wp_ajax_easyrender_sync', array( __CLASS__, 'ajax_sync' ) );
		add_action( self::CRON, array( __CLASS__, 'cron_sync' ) );
		add_filter( 'manage_edit-product_columns', array( __CLASS__, 'product_column' ) );
		add_action( 'manage_product_posts_custom_column', array( __CLASS__, 'product_column_value' ), 10, 2 );
	}

	/** A "3D" column in the Products list, so the owner sees which products have a model. */
	public static function product_column( array $columns ): array {
		$columns['easyrender_3d'] = __( '3D', 'easyrender-3d' );
		return $columns;
	}

	public static function product_column_value( string $column, int $post_id ): void {
		if ( 'easyrender_3d' !== $column ) {
			return;
		}
		$label = Easyrender_Catalog::state_label( (string) get_post_meta( $post_id, Easyrender_Catalog::META_STATE, true ) );
		echo '' === $label ? '&ndash;' : esc_html( $label );
	}

	public static function menu(): void {
		add_submenu_page( 'woocommerce', __( '3D & AR', 'easyrender-3d' ), __( '3D & AR', 'easyrender-3d' ), self::CAP, self::PAGE, array( __CLASS__, 'render_page' ) );
	}

	public static function assets( string $hook ): void {
		if ( false === strpos( $hook, self::PAGE ) ) {
			return;
		}
		wp_enqueue_script( 'easyrender-admin', plugins_url( 'assets/admin.js', EASYRENDER_3D_FILE ), array(), EASYRENDER_3D_VERSION, true );
		wp_localize_script(
			'easyrender-admin',
			'easyrenderAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'easyrender' ),
				'i18n'    => array(
					'generate'   => __( 'Generate 3D for %1$s products (%2$s credits)', 'easyrender-3d' ),
					'nothing'    => __( 'Every product with a photo already has a 3D model or is on its way.', 'easyrender-3d' ),
					'starting'   => __( 'Starting… %s products queued', 'easyrender-3d' ),
					'progress'   => __( '%1$s ready, %2$s in progress, %3$s waiting', 'easyrender-3d' ),
					'needsInfo'  => __( '%s need a usable photo', 'easyrender-3d' ),
					'needsCredit' => __( '%s are waiting for credits', 'easyrender-3d' ),
					'failed'     => __( '%s failed and can be retried', 'easyrender-3d' ),
					'noPhoto'    => __( '%s have no https photo and are skipped', 'easyrender-3d' ),
					'error'      => __( 'Something went wrong:', 'easyrender-3d' ),
				),
			)
		);
	}

	public static function save_key(): void {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'easyrender-3d' ), 403 );
		}
		check_admin_referer( 'easyrender_save_key' );
		$key = isset( $_POST['easyrender_api_key'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['easyrender_api_key'] ) ) ) : '';
		update_option( 'easyrender_api_key', $key, false );
		wp_safe_redirect( add_query_arg( array( 'page' => self::PAGE ), admin_url( 'admin.php' ) ) );
		exit;
	}

	public static function render_page(): void {
		if ( ! current_user_can( self::CAP ) ) {
			return;
		}
		$client  = Easyrender_Client::from_settings();
		$summary = (array) get_option( 'easyrender_summary', array() );
		echo '<div class="wrap"><h1>' . esc_html__( '3D & AR', 'easyrender-3d' ) . '</h1>';
		echo '<p>' . esc_html__( 'Turn your catalogue into 3D models. Shoppers see each piece in their own room from a button or a QR code on the product page.', 'easyrender-3d' ) . '</p>';

		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
		wp_nonce_field( 'easyrender_save_key' );
		echo '<input type="hidden" name="action" value="easyrender_save_key" />';
		echo '<table class="form-table"><tr><th scope="row"><label for="easyrender_api_key">' . esc_html__( 'API key', 'easyrender-3d' ) . '</label></th><td>';
		echo '<input type="password" id="easyrender_api_key" name="easyrender_api_key" class="regular-text" autocomplete="off" value="' . esc_attr( $client->has_key() ? '••••••••' : '' ) . '" placeholder="er_…" /> ';
		submit_button( __( 'Save', 'easyrender-3d' ), 'secondary', 'submit', false );
		echo '<p class="description">' . sprintf(
			/* translators: %s: link to the easyrender connectors page */
			esc_html__( 'Create a key at %s and paste it here.', 'easyrender-3d' ),
			'<a href="' . esc_url( $client->base_url() . '/connectors' ) . '" target="_blank" rel="noopener">' . esc_html( $client->base_url() . '/connectors' ) . '</a>'
		) . '</p></td></tr></table></form>';

		if ( $client->has_key() ) {
			echo '<div id="easyrender-run" data-summary="' . esc_attr( wp_json_encode( $summary ) ) . '">';
			echo '<p id="easyrender-status" aria-live="polite"></p>';
			echo '<p><button type="button" class="button button-primary" id="easyrender-generate" disabled>' . esc_html__( 'Checking your catalogue…', 'easyrender-3d' ) . '</button></p>';
			echo '<p id="easyrender-detail" class="description"></p>';
			echo '</div>';
		}
		echo '</div>';
	}

	private static function guard(): Easyrender_Client {
		if ( ! current_user_can( self::CAP ) ) {
			wp_send_json_error( array( 'message' => __( 'You are not allowed to do this.', 'easyrender-3d' ) ), 403 );
		}
		check_ajax_referer( 'easyrender' );
		return Easyrender_Client::from_settings();
	}

	/** The button's label: how many products need a model, what that costs, and the balance. */
	public static function ajax_prepare(): void {
		$client = self::guard();
		try {
			$collected = Easyrender_Catalog::collect();
			$count     = count( $collected['items'] );
			$quote     = $count > 0 ? $client->quote( $count ) : null;
			$status    = $client->status( Easyrender_Catalog::store() );
			$summary   = Easyrender_Catalog::apply( $status );
			wp_send_json_success(
				array(
					'count'   => $count,
					'noPhoto' => $collected['no_photo'],
					'quote'   => $quote,
					'summary' => $summary,
				)
			);
		} catch ( Easyrender_Error $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ), $e->getCode() >= 400 ? $e->getCode() : 502 );
		}
	}

	/**
	 * Sends the next batch of products that still need a model. The browser calls this until
	 * `done`, passing the credits the owner saw on the button, so a price that changed in the
	 * meantime stops the run before anything is queued.
	 */
	public static function ajax_submit(): void {
		$client   = self::guard();
		$is_first = ! empty( $_POST['first'] );
		$approved = isset( $_POST['approved'] ) ? max( 0, (int) $_POST['approved'] ) : 0;
		try {
			$items = Easyrender_Catalog::collect()['items'];
			if ( $is_first && count( $items ) > 0 ) {
				$quote = $client->quote( count( $items ) );
				if ( (int) $quote['totalCredits'] > $approved ) {
					wp_send_json_error( array( 'message' => __( 'The price changed. Reload the page and check it again.', 'easyrender-3d' ) ), 409 );
				}
				update_option( 'easyrender_per_model', (int) $quote['creditsPerModel'], false );
			}
			$batch = array_slice( $items, 0, Easyrender_Catalog::BATCH );
			if ( count( $batch ) > 0 ) {
				$per_model = max( 1, (int) get_option( 'easyrender_per_model', 1 ) );
				$client->submit( Easyrender_Catalog::store(), $batch, count( $batch ) * $per_model );
				// Leave these out of the next batch; the next sync replaces this with the server's state.
				foreach ( $batch as $item ) {
					update_post_meta( (int) $item['externalId'], Easyrender_Catalog::META_STATE, 'queued' );
				}
				self::schedule_sync();
			}
			wp_send_json_success(
				array(
					'sent'      => count( $batch ),
					'remaining' => max( 0, count( $items ) - count( $batch ) ),
				)
			);
		} catch ( Easyrender_Error $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ), $e->getCode() >= 400 ? $e->getCode() : 502 );
		}
	}

	public static function ajax_sync(): void {
		$client = self::guard();
		try {
			$summary = Easyrender_Catalog::apply( $client->status( Easyrender_Catalog::store() ) );
			if ( Easyrender_Catalog::has_pending( $summary ) ) {
				self::schedule_sync();
			}
			wp_send_json_success( array( 'summary' => $summary ) );
		} catch ( Easyrender_Error $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ), $e->getCode() >= 400 ? $e->getCode() : 502 );
		}
	}

	/** Keeps checking in the background so products turn up even when nobody has the page open. */
	public static function schedule_sync(): void {
		if ( ! wp_next_scheduled( self::CRON ) ) {
			wp_schedule_single_event( time() + 300, self::CRON );
		}
	}

	public static function cron_sync(): void {
		$client = Easyrender_Client::from_settings();
		if ( ! $client->has_key() ) {
			return;
		}
		try {
			$summary = Easyrender_Catalog::apply( $client->status( Easyrender_Catalog::store() ) );
			if ( Easyrender_Catalog::has_pending( $summary ) ) {
				self::schedule_sync();
			}
		} catch ( Easyrender_Error $e ) {
			// Try again later; a store must not break because the API was briefly unreachable.
			self::schedule_sync();
		}
	}
}
