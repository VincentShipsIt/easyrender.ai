<?php
/**
 * Test-only override for the plugin end-to-end run. The test shop is served over http, but the
 * easyrender API only takes https photos, so while the module collects products in the back office
 * this reports each photo URL as https. The mock API never fetches it, and shoppers' pages are
 * untouched.
 */
class Link extends LinkCore
{
    public function getImageLink($name, $ids, $type = null)
    {
        $url = parent::getImageLink($name, $ids, $type);
        $controller = Context::getContext()->controller;

        return $controller instanceof AdminController ? preg_replace('#^http://#', 'https://', (string) $url) : $url;
    }
}
