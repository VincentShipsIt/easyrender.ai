<?php
defined( 'ABSPATH' ) || exit;

/**
 * Maps WooCommerce products to catalogue items and the API's answers back onto products.
 * Product meta: _easyrender_render_id (the model) and _easyrender_state.
 */
class Easyrender_Catalog {
	const META_RENDER = '_easyrender_render_id';
	const META_STATE  = '_easyrender_state';
	const BATCH       = 100;

	/** The store's identity on the API: the site's host. */
	public static function store(): string {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		return strtolower( (string) $host );
	}

	/**
	 * One API item from a plain product record, or null when it has no usable photo.
	 *
	 * @param array{id:int,name:string,image_url:string} $product
	 */
	public static function item_from_product( array $product ): ?array {
		$url = (string) $product['image_url'];
		// The API only fetches https photos.
		if ( 0 !== strpos( $url, 'https://' ) ) {
			return null;
		}
		return array(
			'externalId' => (string) $product['id'],
			'title'      => (string) $product['name'],
			'imageUrl'   => $url,
		);
	}

	/**
	 * Published products that still need a model, as API items, plus the ones skipped for lack of photo.
	 *
	 * @return array{items: array<int,array>, no_photo: int}
	 */
	public static function collect(): array {
		$ids      = wc_get_products(
			array(
				'status' => 'publish',
				'limit'  => -1,
				'return' => 'ids',
			)
		);
		$items    = array();
		$no_photo = 0;
		foreach ( $ids as $id ) {
			$state = get_post_meta( $id, self::META_STATE, true );
			if ( in_array( $state, array( 'ready', 'queued', 'drafting', 'building', 'needs_credits' ), true ) ) {
				continue;
			}
			$product   = wc_get_product( $id );
			$image_id  = $product ? $product->get_image_id() : 0;
			$image_url = $image_id ? wp_get_attachment_image_url( $image_id, apply_filters( 'easyrender_image_size', '1536x1536' ) ) : '';
			$item      = self::item_from_product(
				array(
					'id'        => (int) $id,
					'name'      => $product ? $product->get_name() : (string) $id,
					'image_url' => (string) $image_url,
				)
			);
			if ( $item ) {
				$items[] = $item;
			} else {
				++$no_photo;
			}
		}
		return array(
			'items'    => $items,
			'no_photo' => $no_photo,
		);
	}

	/**
	 * Stores the API's state on each product. Returns the summary counts.
	 *
	 * @param array $response Body of GET /api/catalog.
	 */
	public static function apply( array $response ): array {
		foreach ( (array) ( $response['items'] ?? array() ) as $item ) {
			$id = (int) ( $item['externalId'] ?? 0 );
			if ( $id <= 0 ) {
				continue;
			}
			update_post_meta( $id, self::META_STATE, sanitize_key( (string) ( $item['state'] ?? '' ) ) );
			if ( ! empty( $item['renderId'] ) ) {
				update_post_meta( $id, self::META_RENDER, sanitize_text_field( (string) $item['renderId'] ) );
			} else {
				delete_post_meta( $id, self::META_RENDER );
			}
		}
		$summary = (array) ( $response['summary'] ?? array() );
		update_option( 'easyrender_summary', $summary, false );
		return $summary;
	}

	/** True while the server still has work to do for this store. */
	public static function has_pending( array $summary ): bool {
		foreach ( array( 'queued', 'drafting', 'building' ) as $state ) {
			if ( ! empty( $summary[ $state ] ) ) {
				return true;
			}
		}
		return false;
	}

	/** The text for a product's state in the Products list. Empty state means it has not been sent. */
	public static function state_label( string $state ): string {
		switch ( $state ) {
			case 'ready':
				return __( '3D ready', 'easyrender-3d' );
			case 'queued':
			case 'drafting':
			case 'building':
				return __( 'In progress', 'easyrender-3d' );
			case 'needs_credits':
				return __( 'Waiting for credits', 'easyrender-3d' );
			case 'needs_info':
				return __( 'Needs a usable photo', 'easyrender-3d' );
			case 'failed':
				return __( 'Failed, will retry', 'easyrender-3d' );
			default:
				return '';
		}
	}

	/** The AR page and QR URLs of a product with a finished model, else null. */
	public static function links( int $product_id, string $base ): ?array {
		if ( 'ready' !== get_post_meta( $product_id, self::META_STATE, true ) ) {
			return null;
		}
		$render = (string) get_post_meta( $product_id, self::META_RENDER, true );
		if ( '' === $render ) {
			return null;
		}
		$base = rtrim( $base, '/' );
		return array(
			'ar' => $base . '/ar/' . rawurlencode( $render ),
			'qr' => $base . '/api/renders/' . rawurlencode( $render ) . '/qr',
		);
	}
}
