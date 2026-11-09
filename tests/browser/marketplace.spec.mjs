import {test,expect} from '@playwright/test';
test('approved dark storefront, real catalogue and cart remain usable',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('.hero')).toBeVisible();
 await expect(page.locator('body')).toHaveCSS('background-color','rgb(8, 10, 18)');
 const response=await page.request.get('/api/catalog');expect(response.status()).toBe(200);
 const products=await response.json();expect(Array.isArray(products)).toBe(true);
 await expect(page.locator('.product')).toHaveCount(products.length);
 const available=products.find(p=>p.stock_quantity>0);
 if(available){await page.locator(`[data-add="${available.id}"]`).click();await expect(page.locator('#cartCount')).toHaveText('1');await page.locator('#cartBtn').click();await expect(page.locator('#cartItems')).toContainText(available.name);await page.locator('[data-delta="-1"]').click();await expect(page.locator('#cartCount')).toHaveText('0');}
 await page.screenshot({path:'test-results/marketplace-desktop.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('mobile layout, search and safe sign-in gate',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('#resultCount')).toContainText('products found');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#search').fill('no-such-product-987654321');await expect(page.locator('.product')).toHaveCount(0);
 await page.locator('#ordersBtn').click();await expect(page.locator('#kstAuthModal')).toHaveClass(/show/);
 await page.screenshot({path:'test-results/marketplace-mobile.png',fullPage:true});
});
test('financial operations remain disabled before release gate',async({request})=>{const h=await request.get('/api/health');expect((await h.json()).paymentsEnabled).toBe(false);const r=await request.post('/api/checkout',{data:{}});expect(r.status()).toBe(401);});
