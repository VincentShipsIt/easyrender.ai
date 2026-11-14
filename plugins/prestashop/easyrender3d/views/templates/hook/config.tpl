<div class="panel">
  <div class="panel-heading">{l s='3D & AR product models' mod='easyrender3d'}</div>
  <p>{l s='Turn your catalogue into 3D models. Shoppers see each product in their own room from a button or a QR code on the product page.' mod='easyrender3d'}</p>
  <form method="post" action="{$er_action|escape:'html':'UTF-8'}" class="form-horizontal">
    <div class="form-group">
      <label class="control-label col-lg-3" for="EASYRENDER3D_API_KEY">{l s='API key' mod='easyrender3d'}</label>
      <div class="col-lg-5">
        <input type="password" class="form-control" id="EASYRENDER3D_API_KEY" name="EASYRENDER3D_API_KEY" autocomplete="off" placeholder="er_..." value="{if $er_has_key}••••••••{/if}">
        <p class="help-block">{l s='Create a key at' mod='easyrender3d'} <a href="{$er_connectors_url|escape:'html':'UTF-8'}" target="_blank" rel="noopener">{$er_connectors_url|escape:'html':'UTF-8'}</a></p>
      </div>
      <div class="col-lg-2"><button type="submit" name="submitEasyrender3dKey" class="btn btn-default">{l s='Save' mod='easyrender3d'}</button></div>
    </div>
  </form>
  {if $er_has_key}
    <hr>
    <p id="easyrender-status" aria-live="polite"></p>
    <p><button type="button" class="btn btn-primary" id="easyrender-generate" disabled>{l s='Checking your catalogue...' mod='easyrender3d'}</button></p>
    <p id="easyrender-detail" class="help-block"></p>
    <p class="help-block">{l s='Optional: call this address from a cron job so finished models appear without opening this page.' mod='easyrender3d'} <code>{$er_cron_url|escape:'html':'UTF-8'}</code></p>
  {/if}
</div>
