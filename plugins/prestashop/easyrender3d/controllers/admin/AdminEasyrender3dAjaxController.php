<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '/../../classes/Easyrender3dPrestaShop.php';

/** Answers the config page's prepare / submit / sync calls. PrestaShop checks the admin token. */
class AdminEasyrender3dAjaxController extends ModuleAdminController
{
    public function __construct()
    {
        $this->ajax = true;
        parent::__construct();
    }

    public function displayAjax()
    {
        try {
            $runner = Easyrender3dFactory::runner();
            switch (Tools::getValue('step')) {
                case 'prepare':
                    $data = $runner->prepare();
                    break;
                case 'submit':
                    $data = $runner->submit((bool) Tools::getValue('first'), max(0, (int) Tools::getValue('approved')));
                    break;
                default:
                    $data = array('summary' => $runner->sync());
            }
            $this->respond(true, $data);
        } catch (Easyrender3dError $e) {
            $this->respond(false, array('message' => $e->getMessage()), $e->getCode() >= 400 ? $e->getCode() : 502);
        }
    }

    private function respond($isOk, array $data, $status = 200)
    {
        if ($status !== 200) {
            http_response_code($status);
        }
        header('Content-Type: application/json');
        die(json_encode(array('success' => $isOk, 'data' => $data)));
    }
}
