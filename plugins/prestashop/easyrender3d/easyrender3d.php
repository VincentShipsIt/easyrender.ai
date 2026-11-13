<?php
/**
 * easyrender 3D & AR for PrestaShop: your catalogue as 3D models, with a "View in your room" button
 * and a QR code on each product page. The module holds no generation logic; it sends products to
 * the easyrender API, copies the states back and shows the AR links.
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '/classes/Easyrender3dPrestaShop.php';

class Easyrender3d extends Module
{
    public function __construct()
    {
        $this->name = 'easyrender3d';
        $this->tab = 'front_office_features';
        $this->version = '0.1.0';
        $this->author = 'easyrender.ai';
        $this->need_instance = 0;
        $this->bootstrap = true;
        $this->ps_versions_compliancy = array('min' => '1.7.7.0', 'max' => _PS_VERSION_);

        parent::__construct();

        $this->displayName = $this->l('3D & AR product models');
        $this->description = $this->l('Turn your catalogue into 3D models in one click. Shoppers see each product in their room from a button or a QR code.');
    }

    public function install()
    {
        return parent::install()
            && $this->installDb()
            && $this->installTab()
            && $this->registerHook('displayProductAdditionalInfo')
            && $this->registerHook('displayHeader');
    }

    public function uninstall()
    {
        Configuration::deleteByName('EASYRENDER3D_API_KEY');
        Configuration::deleteByName('EASYRENDER3D_API_URL');
        $this->uninstallTab();
        Db::getInstance()->execute('DROP TABLE IF EXISTS `' . _DB_PREFIX_ . 'easyrender3d_product`');

        return parent::uninstall();
    }

    private function installDb()
    {
        return Db::getInstance()->execute(
            'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'easyrender3d_product` (
                `id_product` INT UNSIGNED NOT NULL,
                `state` VARCHAR(32) NOT NULL DEFAULT \'\',
                `render_id` VARCHAR(64) NULL,
                `date_upd` DATETIME NOT NULL,
                PRIMARY KEY (`id_product`)
            ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4'
        );
    }

    /** A hidden back-office controller that answers the config page's AJAX calls. */
    private function installTab()
    {
        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminEasyrender3dAjax';
        $tab->module = $this->name;
        $tab->id_parent = -1;
        foreach (Language::getLanguages(false) as $language) {
            $tab->name[(int) $language['id_lang']] = 'easyrender 3D';
        }

        return (bool) $tab->add();
    }

    private function uninstallTab()
    {
        $id = (int) Tab::getIdFromClassName('AdminEasyrender3dAjax');
        if ($id) {
            (new Tab($id))->delete();
        }
    }

    public function getContent()
    {
        $output = '';
        if (Tools::isSubmit('submitEasyrender3dKey')) {
            $key = trim((string) Tools::getValue('EASYRENDER3D_API_KEY'));
            // The field shows dots when a key is saved; leaving it alone keeps the key.
            if ($key !== '' && strpos($key, '•') === false) {
                Configuration::updateValue('EASYRENDER3D_API_KEY', $key);
                $output .= $this->displayConfirmation($this->l('API key saved.'));
            } elseif ($key === '') {
                Configuration::deleteByName('EASYRENDER3D_API_KEY');
            }
        }

        $client = Easyrender3dFactory::client();
        $action = AdminController::$currentIndex . '&configure=' . $this->name . '&token=' . Tools::getAdminTokenLite('AdminModules');
        $this->context->smarty->assign(array(
            'er_action' => $action,
            'er_has_key' => $client->hasKey(),
            'er_connectors_url' => $client->baseUrl() . '/connectors',
            'er_cron_url' => $client->hasKey() ? $this->context->link->getModuleLink($this->name, 'cron', array('token' => Easyrender3dFactory::cronToken())) : '',
        ));
        if ($client->hasKey()) {
            $this->context->controller->addJS($this->_path . 'views/js/admin.js');
            Media::addJsDef(array('easyrenderAdmin' => array(
                'ajaxUrl' => $this->context->link->getAdminLink('AdminEasyrender3dAjax'),
                'i18n' => array(
                    'checking' => $this->l('Checking your catalogue...'),
                    'generate' => $this->l('Generate 3D for %1$s products (%2$s credits)'),
                    'nothing' => $this->l('Every product with a photo already has a 3D model or is on its way.'),
                    'starting' => $this->l('Starting... %s products queued'),
                    'progress' => $this->l('%1$s ready, %2$s in progress, %3$s waiting'),
                    'needsInfo' => $this->l('%s need a usable photo'),
                    'needsCredit' => $this->l('%s are waiting for credits'),
                    'failed' => $this->l('%s failed and can be retried'),
                    'noPhoto' => $this->l('%s have no https photo and are skipped'),
                    'error' => $this->l('Something went wrong:'),
                ),
            )));
        }

        return $output . $this->display(__FILE__, 'views/templates/hook/config.tpl');
    }

    public function hookDisplayHeader()
    {
        if (isset($this->context->controller->php_self) && $this->context->controller->php_self === 'product') {
            $this->context->controller->registerStylesheet('easyrender3d-front', 'modules/' . $this->name . '/views/css/front.css', array('media' => 'all', 'priority' => 200));
        }
    }

    public function hookDisplayProductAdditionalInfo($params)
    {
        $idProduct = (int) (isset($params['product']['id_product']) ? $params['product']['id_product'] : Tools::getValue('id_product'));
        $state = new Easyrender3dDbState();
        $links = Easyrender3dRunner::links($state->state($idProduct), $state->renderId($idProduct), Easyrender3dFactory::client()->baseUrl());
        if (!$links) {
            return '';
        }
        $this->context->smarty->assign('er_links', $links);

        return $this->display(__FILE__, 'views/templates/hook/product.tpl');
    }
}
