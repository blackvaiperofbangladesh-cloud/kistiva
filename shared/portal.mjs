import {api,db,$,esc,money,config} from './client.mjs';
const admin=config.app==='admin';let seller=null,products=[];
function show(id){document.querySelectorAll('#app main > section, #app .content > section').forEach(x=>x.classList.toggle('hidden',x.id!==id));for(const section of document.querySelectorAll('#app section[id]'))section.classList.toggle('hidden',section.id!==id);document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===id));}
function message(m){let box=$('portalStatus');if(!box){box=document.createElement('p');box.id='portalStatus';box.className='notice';box.setAttribute('role','status');$('app').prepend(box);}box.textContent=m;}
function table(id,rows,columns){if($(id))$(id).innerHTML=rows.length?rows.map(r=>'<tr>'+columns.map(c=>'<td>'+esc(typeof c==='function'?c(r):r[c]??'—')+'</td>').join('')+'</tr>').join(''):`<tr><td colspan="${columns.length}">No records.</td></tr>`;}
async function boot(){
 try{
  const {data,error}=await db.auth.getUser();if(error||!data.user)return;
  if(admin){await api('admin/users');}else{seller=await api('merchant/profile');if(!seller){$('authmsg').textContent='Merchant onboarding requires verified business terms. Contact the platform owner.';return;}if(seller.status!=='approved'||seller.deposit_status!=='verified'||seller.removed_at){$('authmsg').textContent='Merchant verification is pending or access is suspended.';return;}}
  $('auth').classList.add('hidden');$('app').classList.remove('hidden');$('who').textContent=data.user.email;await refresh();
 }catch(e){$('authmsg').textContent=e.message;$('auth').classList.remove('hidden');$('app').classList.add('hidden');}
}
async function refresh(){try{if(admin){
 const [users,merchants,ps,orders,payments,audit,shipments,reports]=await Promise.all(['users','merchants','products','orders','payments','audit','shipments','reports'].map(r=>api('admin/'+r)));
 $('cCustomers').textContent=users.length;$('cMerchants').textContent=merchants.length;$('cProducts').textContent=ps.length;$('cOrders').textContent=orders.length;
 table('customerRows',users,['full_name','phone','account_status',r=>new Date(r.created_at).toLocaleDateString()]);
 table('merchantRows',merchants,['store_name','contact_email','status','deposit_status',()=> 'Review workflow pending verified backend']);
 table('productRows',ps,['name',r=>r.seller_id||'Platform',r=>money(r.price,r.currency),'stock_quantity','status',()=> 'Moderation requires audited workflow']);
 table('orderRows',orders,['order_number','customer_id',r=>money(r.grand_total,r.currency),'status',()=> 'Status changes require verified workflow']);
 table('paymentRows',payments,['order_id',r=>money(r.amount,r.currency),'provider',r=>r.transaction_hash||r.gateway_reference||'—','status',()=> 'Verification workflow not activated']);
 table('installmentRows',[],['id']);table('collectionRows',[],['id']);
 document.querySelectorAll('[data-live-report]').forEach(section=>section.remove());
 for(const [name,rows] of [['Audit logs',audit],['Shipments',shipments],['Commission records',reports.commissions],['Payout records',reports.payouts]]){let s=document.createElement('section');s.className='panel';s.dataset.liveReport='true';s.innerHTML=`<h3>${name}</h3><p>${rows.length} records loaded (maximum 100).</p><div style="overflow:auto"><table><tbody>${rows.map(r=>'<tr><td>'+esc(JSON.stringify(r))+'</td></tr>').join('')}</tbody></table></div>`;$('overview').append(s);}
 message('Live read-only operations. Counts show up to 100 loaded records. Financial approval, moderation, refunds and payouts are awaiting verified transactional workflows.');
 }else{
 const [ps,orders,categories,reports]=await Promise.all([api('merchant/products'),api('merchant/orders'),api('categories'),api('merchant/reports')]);products=ps;
 $('countProducts').textContent=ps.length;$('countOrders').textContent=orders.length;$('sellerStatus').textContent=seller.status;
 $('profileBox').innerHTML=`<h3>${esc(seller.store_name)}</h3><p>${esc(seller.contact_email)}</p><p>${esc(seller.contact_phone)}</p><p>${esc(seller.status)} · ${esc(seller.deposit_status)}</p><h3>Sales & settlement records</h3><p>${reports.commissions.length} commissions · ${reports.payouts.length} payout records (up to 100 loaded).</p>`;
 $('productRows').innerHTML=ps.map(p=>`<tr><td>${esc(p.name)}</td><td>${money(p.price,p.currency)}</td><td>${p.stock_quantity}</td><td>${esc(p.status)}</td><td><button class="btn secondary" data-edit="${p.id}">Edit draft</button><button class="btn secondary" data-stock="${p.id}">Adjust stock</button></td></tr>`).join('')||'<tr><td colspan="5">No products.</td></tr>';
 table('orderRows',orders,[r=>r.orders?.order_number||r.order_id,'product_name','quantity',r=>money(r.line_total),r=>r.orders?.status,r=>r.orders?.placed_at||'—']);
 $('category').innerHTML='<option value="">Uncategorised</option>'+categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 $('productRows').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit));
 $('productRows').querySelectorAll('[data-stock]').forEach(b=>b.onclick=async()=>{const delta=Number(prompt('Stock change (positive or negative integer)'));if(!Number.isInteger(delta)||!delta)return;const reason=prompt('Reason for adjustment');if(!reason)return;try{await api('merchant/inventory',{method:'POST',body:{product_id:b.dataset.stock,delta,reason}});await refresh();}catch(e){message(e.message);}});
 message('Products are submitted as drafts for moderation. Existing financial and onboarding terms remain unchanged.');
 }}catch(e){message(e.message);}}
function edit(id){const p=products.find(p=>p.id===id);if(!p)return;const f=$('saveProduct');for(const field of ['id','name','category_id','price','stock_quantity','sku','description'])f.elements[field].value=p[field]??'';f.elements.stock_quantity.disabled=true;$('productForm').classList.remove('hidden');}
$('login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);$('authmsg').textContent='Signing in…';const {error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error){$('authmsg').textContent=error.message;return;}await boot();};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload();};document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>show(b.dataset.view));
if(!admin){$('newProduct').onclick=()=>{$('saveProduct').reset();$('saveProduct').elements.stock_quantity.disabled=false;$('productForm').classList.remove('hidden');};$('cancelProduct').onclick=()=>$('productForm').classList.add('hidden');$('saveProduct').onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));body.price=Number(body.price);body.stock_quantity=body.id?products.find(p=>p.id===body.id)?.stock_quantity:Number(body.stock_quantity);try{await api('merchant/products',{method:'POST',body});$('productForm').classList.add('hidden');await refresh();message('Product saved as draft for review.');}catch(err){message(err.message);}};}
await boot();
