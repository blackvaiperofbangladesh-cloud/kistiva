import {test,expect} from '@playwright/test';
// Isolated UI regression fixtures: no real users, orders, payments or database writes.
const product={id:'11111111-1111-4111-8111-111111111111',name:'Fixture product',description:'Browser regression fixture',price:100,currency:'BDT',stock_quantity:2,categories:{name:'Fixture category'},product_images:[]};
async function fixtures(page,responses={},signedIn=false){
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
