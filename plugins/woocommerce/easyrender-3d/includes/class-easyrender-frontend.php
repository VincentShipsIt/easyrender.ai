<?php
defined( 'ABSPATH' ) || exit;

/**
 * The shopper side: a "View in your room" button and a QR code on the product page.
 * The button opens easyrender's AR page, which hands over to the phone's own AR (Android Scene
 * Viewer, iPhone Quick Look). On a computer the QR code carries the page to a phone.
 */
class Easyrender_Frontend {
	public static function init(): void {
		add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'output' ), 35 );
		add_shortcode( 'easyrender_ar', array( __CLASS__, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	public static function assets(): void {
		if ( function_exists( 'is_product' ) && is_product() ) {
			wp_enqueue_style( 'easyrender-ar', plugins_url( 'assets/frontend.css', EASYRENDER_3D_FILE ), array(), EASYRENDER_3D_VERSION );
		}
	}

	public static function output(): void {
		echo self::html( (int) get_the_ID() ); // phpcs:ignore WordPress.Security.EscapeOutput -- html() escapes.
	}

	/** [easyrender_ar id="123"] shows the block for a product anywhere. */
	public static function shortcode( $atts ): string {
		$atts = shortcode_atts( array( 'id' => get_the_ID() ), $atts, 'easyrender_ar' );
		return self::html( (int) $atts['id'] );
	}

	public static function html( int $product_id ): string {
		$base  = Easyrender_Client::from_settings()->base_url();
		$links = Easyrender_Catalog::links( $product_id, $base );
		if ( ! $links ) {
			return '';
		}
		$html  = '<div class="easyrender-ar">';
		$html .= '<a class="button easyrender-ar__button" href="' . esc_url( $links['ar'] ) . '" target="_blank" rel="noopener">' . esc_html__( 'View in your room', 'easyrender-3d' ) . '</a>';
		$html .= '<figure class="easyrender-ar__qr">';
		$html .= '<img src="' . esc_url( $links['qr'] ) . '" alt="' . esc_attr__( 'QR code: scan with your phone to see this piece in your room', 'easyrender-3d' ) . '" width="140" height="140" loading="lazy" />';
		$html .= '<figcaption>' . esc_html__( 'Scan with your phone to see it in your room', 'easyrender-3d' ) . '</figcaption>';
		$html .= '</figure></div>';
		return $html;
	}
}
