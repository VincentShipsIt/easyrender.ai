<?php
defined( 'ABSPATH' ) || exit;

class Easyrender_Error extends Exception {
	/** @var string */
	public $error_code;

	public function __construct( string $message, int $status = 0, string $error_code = '' ) {
		parent::__construct( $message, $status );
		$this->error_code = $error_code;
	}
}

/**
 * Talks to the easyrender catalogue API with the store owner's API key.
 */
class Easyrender_Client {
	/** @var string */
	private $base;
	/** @var string */
	private $key;
	/** @var callable|null  fn( string $method, string $url, array $args ): array{status:int, body:string} */
	private $http;

	public function __construct( string $base, string $key, ?callable $http = null ) {
		$this->base = rtrim( $base, '/' );
		$this->key  = $key;
		$this->http = $http;
	}

	public static function from_settings(): self {
		$base = defined( 'EASYRENDER_API_URL' ) ? EASYRENDER_API_URL : 'https://easyrender.ai';
		return new self( $base, (string) get_option( 'easyrender_api_key', '' ) );
	}

	public function has_key(): bool {
		return '' !== $this->key;
	}

	public function base_url(): string {
		return $this->base;
	}

	/** What a run for $items products costs, and the owner's balance. */
	public function quote( int $items ): array {
		return $this->request( 'GET', '/api/catalog/quote?items=' . max( 1, $items ) );
	}

	/** Queues products. $max_credits is the total the owner approved. */
	public function submit( string $store, array $items, int $max_credits ): array {
		return $this->request(
			'POST',
			'/api/catalog',
			array(
				'platform'   => 'woocommerce',
				'store'      => $store,
				'maxCredits' => $max_credits,
				'items'      => array_values( $items ),
			)
		);
	}

	/** The store's products and their states. Also moves the queue forward on the server. */
	public function status( string $store ): array {
		return $this->request( 'GET', '/api/catalog?platform=woocommerce&store=' . rawurlencode( $store ) );
	}

	public function forget( string $store ): void {
		$this->request( 'DELETE', '/api/catalog?platform=woocommerce&store=' . rawurlencode( $store ) );
	}

	private function request( string $method, string $path, ?array $body = null ): array {
		if ( ! $this->has_key() ) {
			throw new Easyrender_Error( 'Add your easyrender API key first.', 401, 'unauthorized' );
		}
		$args = array(
			'method'  => $method,
			'timeout' => 60,
			'headers' => array(
				'Authorization' => 'Bearer ' . $this->key,
				'Accept'        => 'application/json',
				'Content-Type'  => 'application/json',
			),
		);
		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}
		$response = $this->http
			? call_user_func( $this->http, $method, $this->base . $path, $args )
			: self::wp_http( $method, $this->base . $path, $args );

		$data = '' === $response['body'] ? array() : json_decode( $response['body'], true );
		if ( $response['status'] >= 400 ) {
			$message = is_array( $data ) && isset( $data['error'] ) ? (string) $data['error'] : 'easyrender returned an error.';
			$code    = is_array( $data ) && isset( $data['code'] ) ? (string) $data['code'] : '';
			throw new Easyrender_Error( $message, (int) $response['status'], $code );
		}
		return is_array( $data ) ? $data : array();
	}

	private static function wp_http( string $method, string $url, array $args ): array {
		$result = wp_remote_request( $url, $args );
		if ( is_wp_error( $result ) ) {
			throw new Easyrender_Error( 'Could not reach easyrender: ' . $result->get_error_message() );
		}
		return array(
			'status' => (int) wp_remote_retrieve_response_code( $result ),
			'body'   => (string) wp_remote_retrieve_body( $result ),
		);
	}
}
