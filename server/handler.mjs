import {authorize,normalizeItems,paymentMethod,PROJECT_REF,validateCryptoEvidence} from '../shared/commerce.mjs';
import {HttpFailure as Failure,readJson} from './request.mjs';
const requireValue=(value,message)=>{if(!value)throw new Failure(400,message);return value;};
const uuid=x=>typeof x==='string'&&/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(x);
const text=(x,max=500)=>typeof x==='string'?x.trim().slice(0,max):'';
export async function handle(request,env=process.env,transport=fetch){
 const headers={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 try{
  const url=new URL(request.url),route=url.pathname.replace(/^\/api\//,'').replace(/\/$/,'');
  if(!['GET','POST','PATCH'].includes(request.method))throw new Failure(405,'Method not allowed');
  if(request.method!=='GET'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)throw new Failure(403,'Cross-origin operation denied');
  const app=env.KRISTIVA_APP||'marketplace';
  const known=['health','catalog','categories','me','orders','notifications','profile','support','checkout','payment/instructions','payment/submit','payment/bkash','payment/bkash/verify','merchant/profile','merchant/products','merchant/orders','merchant/inventory','merchant/reports','admin/users','admin/merchants','admin/products','admin/orders','admin/payments','admin/audit','admin/shipments','admin/reports','admin/product','admin/merchant','admin/payment-review'];
  if(!known.includes(route))throw new Failure(404,'Route not found');
  if(route.startsWith('admin/')&&app!=='admin'||route.startsWith('merchant/')&&app!=='merchant')throw new Failure(403,'Application access denied');
  const reads=new Set(['health','catalog','categories','me','orders','notifications','payment/instructions','merchant/profile','merchant/orders','merchant/reports','admin/users','admin/merchants','admin/products','admin/orders','admin/payments','admin/audit','admin/shipments','admin/reports']);
  const allowed=route==='profile'?['GET','POST','PATCH']:['merchant/products','support'].includes(route)?['GET','POST']:route==='notifications'?['GET','PATCH']:reads.has(route)?['GET']:['POST'];
  if(!allowed.includes(request.method))throw new Failure(405,'Method not allowed');
  const enabled=env.KRISTIVA_PAYMENTS_ENABLED==='true'&&env.KRISTIVA_BACKEND_V2_VERIFIED==='true';
  if(route==='health')return reply({app,projectRef:PROJECT_REF,paymentsEnabled:enabled,releaseGate:'verification_required'});
  const base=env.SUPABASE_URL||`https://${PROJECT_REF}.supabase.co`,key=env.SUPABASE_PUBLISHABLE_KEY;
  if(base!==`https://${PROJECT_REF}.supabase.co`||!key?.startsWith('sb_publishable_'))throw new Failure(503,'Backend configuration unavailable');
  const token=request.headers.get('authorization');
  async function backend(path,method='GET',body){
   const r=await transport(base+path,{method,headers:{apikey:key,Authorization:token||`Bearer ${key}`,'content-type':'application/json',Prefer:'return=representation'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
   const data=await r.json().catch(()=>null);
   if(!r.ok)throw new Failure(r.status===401?401:502,'Backend operation failed');return data;
  }
  const rest=(table,query='',method='GET',body)=>backend(`/rest/v1/${table}${query?'?'+query:''}`,method,body);
  const rpc=(name,args={})=>backend(`/rest/v1/rpc/${name}`,'POST',args);
  if(route==='catalog')return reply(await rest('products','select=id,name,slug,description,price,currency,compare_at_price,discount_percent,stock_quantity,category_id,categories(name),product_images(image_url,sort_order)&status=eq.published&order=created_at.desc&limit=100'));
  if(route==='categories')return reply(await rest('categories','select=id,name,slug&is_active=eq.true&order=sort_order'));
  if(!token?.startsWith('Bearer ')||token.length<8)throw new Failure(401,'Sign in required');
  const user=await backend('/auth/v1/user');if(!user?.id||user.is_anonymous)throw new Failure(401,'Verified customer sign-in required');
  const account=(await rest('profiles',`id=eq.${encodeURIComponent(user.id)}&select=account_status&limit=1`))?.[0];
  if(account?.account_status!=='active')throw new Failure(403,'Active account required');
  let seller=null,isAdmin=false;
  if(route.startsWith('admin/')){isAdmin=await rpc('is_admin');try{authorize('admin',user,null,isAdmin);}catch{throw new Failure(403,'Access denied');}}
  if(route.startsWith('merchant/')){
   const rows=await rest('seller_profiles',`user_id=eq.${encodeURIComponent(user.id)}&removed_at=is.null&select=*&limit=1`);seller=rows?.[0]||null;
   if(route!=='merchant/profile'){try{authorize('merchant',user,seller,false);}catch{throw new Failure(403,'Approved merchant access required');}}
  }
  const own=`customer_id=eq.${encodeURIComponent(user.id)}`;
  if(route==='me')return reply({user:{id:user.id,email:user.email},profile:(await rest('profiles',`id=eq.${user.id}&select=id,full_name,phone,account_status`))?.[0]});
  if(route==='orders')return reply(await rest('orders',`${own}&select=id,order_number,status,currency,grand_total,placed_at,order_items(product_name,quantity,line_total),shipments(carrier,tracking_number,status)&order=placed_at.desc&limit=100`));
  if(route==='notifications'&&request.method==='GET')return reply(await rest('customer_notifications',`user_id=eq.${user.id}&select=id,title,message,read_at,created_at&order=created_at.desc&limit=50`));
  if(route==='profile'&&request.method==='GET')return reply((await rest('profiles',`id=eq.${user.id}&select=id,full_name,phone,account_status`))?.[0]);
  if(route==='support'&&request.method==='GET')return reply(await rest('support_disputes',`${own}&select=id,order_id,subject,category,status,created_at,reviewed_at&order=created_at.desc&limit=100`));
  if(route==='merchant/profile')return reply(seller);
  if(route==='merchant/products'&&request.method==='GET')return reply(await rest('products',`seller_id=eq.${seller.id}&select=id,name,sku,price,currency,stock_quantity,status,category_id,description&order=created_at.desc&limit=100`));
  if(route==='merchant/orders')return reply(await rest('order_items',`seller_id=eq.${seller.id}&select=id,product_name,quantity,line_total,order_id,orders(order_number,status,placed_at)&order=created_at.desc&limit=100`));
  if(route==='merchant/reports')return reply({commissions:await rest('seller_commissions',`seller_id=eq.${seller.id}&select=*&limit=100`),payouts:await rest('seller_payouts',`seller_id=eq.${seller.id}&select=*&limit=100`)});
  const adminTables={'admin/users':'profiles','admin/merchants':'seller_profiles','admin/products':'products','admin/orders':'orders','admin/payments':'payments','admin/audit':'audit_logs','admin/shipments':'shipments'};
  if(adminTables[route])return reply(await rest(adminTables[route],'select=*&limit=100'));
  if(route==='admin/reports')return reply({commissions:await rest('seller_commissions','select=*&limit=100'),payouts:await rest('seller_payouts','select=*&limit=100')});
  if(route==='checkout'&&!enabled)throw new Failure(503,'Checkout is awaiting verified payment activation');
  const body=await readJson(request);
  if(route==='notifications'){requireValue(uuid(body.id),'Invalid notification');return reply(await rest('customer_notifications',`id=eq.${body.id}&user_id=eq.${encodeURIComponent(user.id)}&read_at=is.null`,'PATCH',{read_at:new Date().toISOString()}));}
  if(route==='profile')return reply(await rest('profiles',`id=eq.${user.id}`,'PATCH',{full_name:requireValue(text(body.full_name,100),'Name required'),phone:text(body.phone,30)}));
  if(route==='support'){
   if(body.order_id){requireValue(uuid(body.order_id),'Invalid order');const o=await rest('orders',`id=eq.${body.order_id}&${own}&select=id`);if(!o?.length)throw new Failure(403,'Order access denied');}
   return reply(await rest('support_disputes','','POST',{customer_id:user.id,subject:requireValue(text(body.subject,150),'Subject required'),details:requireValue(text(body.description,3000),'Details required'),category:body.category==='return'?'return':'support',...(body.order_id?{order_id:body.order_id}:{}),status:'submitted'}),201);
  }
  if(route==='merchant/products'){
   requireValue(Number.isFinite(body.price)&&body.price>0&&Number.isSafeInteger(Math.round(body.price*100))&&Math.abs(body.price*100-Math.round(body.price*100))<1e-6,'Price must use at most two decimal places');requireValue(Number.isSafeInteger(body.stock_quantity)&&body.stock_quantity>=0&&body.stock_quantity<=2147483647,'Valid stock required');
   if(body.category_id)requireValue(uuid(body.category_id),'Invalid category');
   const name=requireValue(text(body.name,150),'Product name required');
   const payload={name,description:text(body.description,3000),price:body.price,sku:text(body.sku,100)||null,status:'draft',category_id:body.category_id||null};
   if(body.id){requireValue(uuid(body.id),'Invalid product');return reply(await rest('products',`id=eq.${body.id}&seller_id=eq.${seller.id}`,'PATCH',payload));}
   return reply(await rest('products','','POST',{...payload,currency:'BDT',seller_id:seller.id,stock_quantity:body.stock_quantity,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,80)+'-'+crypto.randomUUID().slice(0,8)}),201);
  }
  if(route==='merchant/inventory'){requireValue(uuid(body.product_id),'Invalid product');requireValue(Number.isSafeInteger(body.delta)&&body.delta!==0&&Math.abs(body.delta)<=2147483647,'Valid quantity required');const reason=requireValue(text(body.reason,250),'Inventory adjustment reason required');return reply(await rpc('merchant_adjust_inventory',{p_product_id:body.product_id,p_quantity_delta:body.delta,p_reason:reason}));}
  // Financial and privileged writes use audited transactional RPCs, never client table patches.
  // These routes stay closed until the staging database contract has passed its release gate.
  if(env.KRISTIVA_BACKEND_V2_VERIFIED!=='true')throw new Failure(503,'This operation requires verified backend migration');
  if(route==='checkout'){
   const items=normalizeItems(body.items),country=text(body.shipping?.country,2),method=paymentMethod(country,{cryptoCountries:(env.KRISTIVA_CRYPTO_COUNTRIES||'').split(',')});
   for(const field of ['name','email','phone','address'])requireValue(text(body.shipping?.[field],220),`Shipping ${field} required`);
   requireValue(uuid(body.idempotency_key),'Valid checkout key required');
   return reply(await rpc('kristiva_checkout',{p_items:items,p_shipping_address:{...Object.fromEntries(['name','email','phone','address'].map(k=>[k,text(body.shipping[k],220)])),country},p_method:method,p_idempotency_key:body.idempotency_key}),201);
  }
  if(route==='admin/payment-review'){
   requireValue(uuid(body.payment_id),'Invalid payment');requireValue(['approve','reject'].includes(body.decision),'Invalid decision');
   if(body.decision==='approve')validateCryptoEvidence(body.evidence);
   return reply(await rpc('kristiva_review_crypto',{p_payment_id:body.payment_id,p_decision:body.decision,p_evidence:body.evidence||{},p_note:text(body.note,1000)}));
  }
  throw new Failure(503,'Workflow is not yet verified');
 }catch(e){return reply({error:e instanceof Failure?e.message:e.message==='Access denied'?'Access denied':'Request could not be completed'},e.status||400);}
}
