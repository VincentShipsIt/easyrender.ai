import { expect, test } from '@playwright/test';
import { API_KEY, apiRequests, isImageLoaded, resetApi, shot } from './helpers';

const THEME = process.env.THEME ?? 'storefront';

test.describe(`WooCommerce plugin on a real shop (${THEME} theme)`, () => {
  test.beforeAll(resetApi);

  test('connect, price, generate the catalogue, show the button and QR', async ({ page }) => {
    // Sign in to the back office.
    await page.goto('/wp-login.php');
    await page.fill('#user_login', 'admin');
    await page.fill('#user_pass', 'admin');
    await page.click('#wp-submit');
    await expect(page.locator('#wpadminbar')).toBeVisible();

    // The module page asks for a key first.
    await page.goto('/wp-admin/admin.php?page=easyrender-3d');
    await expect(page.getByRole('heading', { name: '3D & AR' })).toBeVisible();
    await shot(page, `woocommerce-${THEME}-1-settings`);
    await page.fill('#easyrender_api_key', API_KEY);
    await page.locator('form[action$="admin-post.php"] #submit').click();

    // Saved: the button states the count and the price before anything is charged.
    const generate = page.locator('#easyrender-generate');
    await expect(generate).toHaveText(/Generate 3D for 3 products \(192 credits\)/);
    await expect(page.locator('#easyrender-detail')).toContainText('1 have no https photo');
    await shot(page, `woocommerce-${THEME}-2-price-before-click`);

    // Saving the form again without touching the key must keep the key.
    await page.locator('form[action$="admin-post.php"] #submit').click();
    await expect(generate).toHaveText(/Generate 3D for 3 products \(192 credits\)/);

    // One click.
    await generate.click();
    await expect(page.locator('#easyrender-status')).toContainText(/3 ready/, { timeout: 90_000 });
    await shot(page, `woocommerce-${THEME}-3-after-generate`);

    // What the API received.
    const posts = (await apiRequests()).filter((request) => request.method === 'POST');
    expect(posts).toHaveLength(1);
    const [post] = posts;
    expect(post.platform).toBe('woocommerce');
    expect(post.store).toBe('localhost');
    expect(post.maxCredits).toBe(192);
    const items = post.items as Array<{ externalId: string; title: string; imageUrl: string }>;
    expect(items.map((item) => item.title).sort()).toEqual([
      'Linen sofa',
      'Oak chair',
      'Walnut table',
    ]);
    for (const item of items)
      expect(item.imageUrl).toMatch(/^https:\/\/localhost:8080\/wp-content\/uploads\/.+chair/);

    // The Products list shows each state.
    await page.goto('/wp-admin/edit.php?post_type=product');
    await expect(
      page.locator('tr', { hasText: 'Oak chair' }).locator('td.easyrender_3d'),
    ).toHaveText('3D ready');
    await expect(
      page.locator('tr', { hasText: 'Bare shelf' }).locator('td.easyrender_3d'),
    ).toHaveText('–');
    await shot(page, `woocommerce-${THEME}-4-products-list`);
  });

  test('the product page shows "View in your room" and a working QR code', async ({ page }) => {
    await page.goto('/?product=oak-chair');
    // One block, not one per placement.
    await expect(page.locator('.easyrender-ar')).toHaveCount(1);
    const button = page.locator('.easyrender-ar__button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('View in your room');
    await expect(button).toHaveAttribute('href', /^http:\/\/api\.test:4010\/ar\/r_[0-9a-f]+$/);

    const qr = page.locator('.easyrender-ar__qr img');
    await expect(qr).toBeVisible();
    await expect(qr).toHaveAttribute(
      'src',
      /^http:\/\/api\.test:4010\/api\/renders\/r_[0-9a-f]+\/qr$/,
    );
    await expect.poll(() => isImageLoaded(page, '.easyrender-ar__qr img')).toBe(true);

    await page.locator('.easyrender-ar').scrollIntoViewIfNeeded();
    await shot(page, `woocommerce-${THEME}-5-product-page`);
    await page
      .locator('.easyrender-ar')
      .screenshot({ path: `screenshots/woocommerce-${THEME}-6-button-and-qr.png` });

    // The button opens the AR page.
    const href = (await button.getAttribute('href')) as string;
    const popup = page.waitForEvent('popup');
    await button.click();
    const ar = await popup;
    await expect(ar).toHaveURL(href);
    await expect(ar.locator('h1')).toHaveText('View in your room');
  });

  test('a product without a photo has no AR block', async ({ page }) => {
    await page.goto('/?product=bare-shelf');
    await expect(page.locator('h1')).toContainText('Bare shelf');
    await expect(page.locator('.easyrender-ar')).toHaveCount(0);
  });

  test('the shortcode shows the block anywhere', async ({ page }) => {
    // Added by setup-woocommerce.sh: a page that holds [easyrender_ar id=...].
    await page.goto('/?pagename=ar-shortcode');
    await expect(page.locator('.easyrender-ar__button')).toBeVisible();
  });
});
