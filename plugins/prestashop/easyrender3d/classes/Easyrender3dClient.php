<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class Easyrender3dError extends Exception
{
    /** @var string */
    public $errorCode;

    public function __construct($message, $status = 0, $errorCode = '')
    {
        parent::__construct($message, (int) $status);
        $this->errorCode = $errorCode;
    }
}

/**
 * Talks to the easyrender catalogue API with the merchant's API key. No generation logic here.
 */
class Easyrender3dClient
{
    /** @var string */
    private $base;
    /** @var string */
    private $key;
    /** @var callable|null fn($method, $url, $headers, $body): array('status' => int, 'body' => string) */
    private $http;

    public function __construct($base, $key, $http = null)
    {
        $this->base = rtrim($base, '/');
        $this->key = (string) $key;
        $this->http = $http;
    }

    public function hasKey()
    {
        return $this->key !== '';
    }

    public function baseUrl()
    {
        return $this->base;
    }

    /** What a run for $items products costs, and the merchant's balance. */
    public function quote($items)
    {
        return $this->request('GET', '/api/catalog/quote?items=' . max(1, (int) $items));
    }

    /** Queues products. $maxCredits is the total the merchant approved. */
    public function submit($store, array $items, $maxCredits)
    {
        return $this->request('POST', '/api/catalog', array(
            'platform' => 'prestashop',
            'store' => $store,
            'maxCredits' => (int) $maxCredits,
            'items' => array_values($items),
        ));
    }

    /** The shop's products and their states. Also moves the queue forward on the server. */
    public function status($store)
    {
        return $this->request('GET', '/api/catalog?platform=prestashop&store=' . rawurlencode($store));
    }

    public function forget($store)
    {
        $this->request('DELETE', '/api/catalog?platform=prestashop&store=' . rawurlencode($store));
    }

    private function request($method, $path, $body = null)
    {
        if (!$this->hasKey()) {
            throw new Easyrender3dError('Add your easyrender API key first.', 401, 'unauthorized');
        }
        $headers = array(
            'Authorization: Bearer ' . $this->key,
            'Accept: application/json',
            'Content-Type: application/json',
        );
        $payload = $body === null ? null : json_encode($body);
        $url = $this->base . $path;
        $response = $this->http
            ? call_user_func($this->http, $method, $url, $headers, $payload)
            : self::curl($method, $url, $headers, $payload);

        $data = $response['body'] === '' ? array() : json_decode($response['body'], true);
        if ($response['status'] >= 400) {
            $message = is_array($data) && isset($data['error']) ? (string) $data['error'] : 'easyrender returned an error.';
            $code = is_array($data) && isset($data['code']) ? (string) $data['code'] : '';
            throw new Easyrender3dError($message, $response['status'], $code);
        }

        return is_array($data) ? $data : array();
    }

    private static function curl($method, $url, array $headers, $payload)
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, array(
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_FOLLOWLOCATION => false,
        ));
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }
        $body = curl_exec($ch);
        if ($body === false) {
            $message = curl_error($ch);
            curl_close($ch);
            throw new Easyrender3dError('Could not reach easyrender: ' . $message);
        }
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        return array('status' => $status, 'body' => (string) $body);
    }
}
