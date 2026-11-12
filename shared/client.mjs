import {escapeHtml} from './commerce.mjs';
export const esc=escapeHtml;
export const config=window.KRISTIVA_CONFIG;
export const readOnly=config?.readOnly!==false;
if(readOnly&&typeof document!=='undefined'){
 const banner=document.createElement('div');banner.id='kristivaStagingBanner';
 banner.setAttribute('role','status');banner.textContent='KRISTIVA STAGING — READ ONLY. Existing accounts, orders, KYC and payments cannot be submitted. No funds should be sent.';
 banner.style.cssText='position:relative;z-index:10010;padding:10px 16px;text-align:center;background:#38241e;color:#ffdfc7;font:600 12px/1.5 system-ui,Arial;border-bottom:1px solid #78543a';
 document.body.prepend(banner);
}
export const db=window.supabase.createClient(config.supabaseUrl,config.supabaseKey,{auth:{storageKey:`kristiva-${config.app}-auth`}});
export const $=id=>document.getElementById(id);
export async function api(path,{method='GET',body}={}){
 if(readOnly&&method!=='GET')throw Error('Staging is read-only. No live account, order, stock or payment changes are permitted.');
 const {data}=await db.auth.getSession();
 const r=await fetch('/api/'+path,{method,headers:{'content-type':'application/json',...(data.session?{authorization:`Bearer ${data.session.access_token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const result=await r.json();if(!r.ok)throw Error(result.error||'Request failed');return result;
}
export const money=(n,currency='BDT')=>new Intl.NumberFormat('en',{style:'currency',currency:currency.trim()}).format(Number(n||0));
