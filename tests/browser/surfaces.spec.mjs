import {test,expect} from '@playwright/test';
// Isolated UI regression fixtures: no real users, orders, payments or database writes.
const product={id:'11111111-1111-4111-8111-111111111111',name:'Fixture product',description:'Browser regression fixture',price:100,currency:'BDT',stock_quantity:2,categories:{name:'Fixture category'},product_images:[]};
async function fixtures(page,responses={},signedIn=false,allowMockWrites=true){
 // Only isolated test fixtures can replace readOnly=true in served config.js.
 // Never commit this override to any application build.
 if(allowMockWrites)await page.route('**/config.js',async route=>{
  const response=await route.fetch();
  const content=await response.text();
  if(!content.includes('"readOnly":true'))throw Error('Staging readOnly flag missing');
  await route.fulfill({response,body:content.replace('"readOnly":true','"readOnly":false')});
 });
 await page.route('**/shared/vendor/supabase.js',route=>route.fulfill({contentType:'text/javascript',body:`window.supabase={createClient(){const user=${signedIn?'{id:"fixture-user",email:"fixture@example.invalid"}':'null'};return {auth:{getUser:async()=>({data:{user}}),getSession:async()=>({data:{session:user?{access_token:"fixture-token"}:null}}),onAuthStateChange(fn){fn("INITIAL_SESSION",user?{user}:null);},signOut:async()=>({error:null})}}}};`}));
 await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname.slice(5);const value=responses[path]??(path==='catalog'?[product]:path==='categories'?[]:[]);if(typeof value==='function')return value(route);await route.fulfill({json:value});});
}
for(const [app,port] of [['marketplace',4173],['mobile',4174]]){
 test(`${app}: in-stock cart quantities and keyboard dialog controls`,async({page})=>{
  await fixtures(page);await page.goto(`http://127.0.0.1:${port}`);
  await page.locator('[data-add]').click();await page.locator('[data-add]').click();await page.locator('[data-add]').click();await expect(page.locator('#cartCount')).toHaveText('2');
  await page.locator('#cartBtn').click();await expect(page.locator('#cartModal')).toHaveAttribute('aria-modal','true');
  const buttons=page.locator('#cartModal button:visible');await buttons.last().focus();await page.keyboard.press('Tab');await expect(buttons.first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#cartModal')).not.toHaveClass(/show/);await expect(page.locator('#cartBtn')).toBeFocused();
 });
 test(`${app}: customer support history and notification acknowledgement`,async({page})=>{
  let acknowledged=false;await fixtures(page,{'support':[{subject:'Fixture support request',category:'support',status:'submitted'}],'me':{profile:{full_name:'Fixture customer'}},'notifications':async route=>{if(route.request().method()==='PATCH'){acknowledged=true;return route.fulfill({json:[]});}return route.fulfill({json:acknowledged?[]:[{id:product.id,title:'Fixture notice',message:'Test notification',read_at:null}]});}},true);
  await page.goto(`http://127.0.0.1:${port}`);await page.evaluate(()=>window.openSupport());await expect(page.locator('#supportHistory')).toContainText('Fixture support request');await page.keyboard.press('Escape');
  await page.locator('#kstAccountBtn').click();await page.getByRole('button',{name:'Mark as read'}).click();await expect(page.locator('#notifications')).toContainText('No notifications');expect(acknowledged).toBe(true);
 });
}
for(const [app,port] of [['merchant',4175],['admin',4176]]){
 test(`${app}: sign-in form has accessible labels and remains isolated`,async({page})=>{
  await fixtures(page);await page.goto(`http://127.0.0.1:${port}`);await expect(page.getByLabel('Email',{exact:true})).toBeVisible();await expect(page.getByLabel('Password',{exact:true})).toBeVisible();await expect(page.locator('#app')).toBeHidden();
  const response=await page.request.get(`http://127.0.0.1:${port}/api/${app==='admin'?'merchant/orders':'admin/users'}`);expect(response.status()).toBe(403);
 });
}
test('merchant: approved fixture can navigate to store profile without browser errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await fixtures(page,{'merchant/profile':{id:'fixture-seller',user_id:'fixture-user',store_name:'Fixture store',status:'approved',deposit_status:'verified'},'merchant/reports':{commissions:[],payouts:[]}},true);
 await page.goto('http://127.0.0.1:4175');await expect(page.locator('#app')).toBeVisible();await page.getByRole('button',{name:'Store profile',exact:true}).click();await expect(page.locator('#profileBox')).toContainText('Fixture store');expect(errors).toEqual([]);
});
test('admin: fixture reports render once and records remain escaped',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await fixtures(page,{'admin/users':[{full_name:'<img onerror=alert(1)>',created_at:'2026-01-01'}],'admin/reports':{commissions:[],payouts:[]}},true);
 await page.goto('http://127.0.0.1:4176');await expect(page.locator('[data-live-report]')).toHaveCount(4);await page.getByRole('button',{name:'Customers',exact:true}).click();await expect(page.locator('#customerRows')).toContainText('<img onerror=alert(1)>');await expect(page.locator('#customerRows img')).toHaveCount(0);expect(errors).toEqual([]);
});

test('owner staging blueprint has 16 approved menus and never offers live financial actions',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4177');
 await expect(page.locator('#nav button')).toHaveCount(16);
 await expect(page.locator('#nav button').nth(3)).toContainText('Product Review');
 await expect(page.locator('#nav button').nth(4)).toContainText('Homepage Product Review');
 await page.locator('#nav button').nth(4).click();
 await expect(page.locator('#title')).toHaveText('Homepage Product Review');
 await expect(page.getByText('NO PRIVILEGED ACCESS',{exact:false})).toBeVisible();
 await expect(page.locator('button').filter({hasText:/approve|mark paid|transfer/i})).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('real staging UI never sends customer signup or login to live Supabase',async({page})=>{
 await fixtures(page,{},false,false);
 await page.goto('http://127.0.0.1:4173');
 await expect(page.locator('#kristivaStagingBanner')).toContainText('READ ONLY');
 await page.locator('#kstAuthForm').evaluate(form=>form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})));
 await expect(page.locator('#kstAuthStatus')).toContainText('cannot create or sign into live accounts');
 await expect(page.locator('#checkoutBtn')).toBeDisabled();
});
for(const [app,port] of [['merchant',4175],['admin',4176]]){
 test(`${app}: read-only staging login is blocked before live auth`,async({page})=>{
  await fixtures(page,{},false,false);
  await page.goto(`http://127.0.0.1:${port}`);
  await expect(page.locator('#kristivaStagingBanner')).toContainText('READ ONLY');
  await page.locator('#login').evaluate(form=>form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})));
  await expect(page.locator('#authmsg')).toContainText('production account sign-in is disabled');
 });
}

test('preserved marketing landing has three hero slides and safe international search routing',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://kristiva-marketplace-preview-5wx7sj3j8.vercel.app/**',route=>route.fulfill({contentType:'text/html',body:'<html><body>Fixture international store</body></html>'}));
 await page.goto('http://127.0.0.1:4178/');
 await expect(page.locator('#k4-track .k4-slide')).toHaveCount(3);
 await expect(page.locator('#k4-installment-products')).toContainText('Crypto Installment Products');
 await expect(page.locator('#k4-installment-products')).toContainText('HOLD');
 await page.locator('#k6-search').fill('Electronics');
 await page.locator('#k6-search-form').evaluate(form=>form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})));
 await expect(page).toHaveURL(/kristiva-marketplace-preview-a3ql1dbjz\.vercel\.app.*\?q=Electronics/);
 expect(errors).toEqual([]);
});
test('international customer catalog honors marketing search parameter',async({page})=>{
 await fixtures(page);
 await page.goto('http://127.0.0.1:4173/?q=Fixture');
 await expect(page.locator('#search')).toHaveValue('Fixture');
 await expect(page.locator('.product')).toHaveCount(1);
});
test('landing mobile layout has no page-level overflow at 390px',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4178/');
 await expect(page.locator('#k4-track .k4-slide')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
