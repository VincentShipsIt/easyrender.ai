<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '/../../classes/Easyrender3dPrestaShop.php';

/**
 * Optional background sync: point a cron job at this URL (shown on the module page) and finished
 * models turn up on product pages even when nobody has the module page open.
 */
class Easyrender3dCronModuleFrontController extends ModuleFrontController
{
    public function display()
    {
        header('Content-Type: text/plain');
        if (!hash_equals(Easyrender3dFactory::cronToken(), (string) Tools::getValue('token'))) {
            http_response_code(403);
            die('forbidden');
        }
        try {
            $summary = Easyrender3dFactory::runner()->sync();
            die('ok ' . (isset($summary['ready']) ? (int) $summary['ready'] : 0) . ' ready');
        } catch (Easyrender3dError $e) {
            http_response_code(502);
            die('error');
        }
    }
}
