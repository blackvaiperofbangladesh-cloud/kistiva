import {escapeHtml} from './commerce.mjs';
export const esc=escapeHtml;
export const config=window.KRISTIVA_CONFIG;
export const db=window.supabase.createClient(config.supabaseUrl,config.supabaseKey,{auth:{storageKey:`kristiva-${config.app}-auth`}});
export const $=id=>document.getElementById(id);
export async function api(path,{method='GET',body}={}){
 const {data}=await db.auth.getSession();
 const r=await fetch('/api/'+path,{method,headers:{'content-type':'application/json',...(data.session?{authorization:`Bearer ${data.session.access_token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const result=await r.json();if(!r.ok)throw Error(result.error||'Request failed');return result;
}
export const money=(n,currency='BDT')=>new Intl.NumberFormat('en',{style:'currency',currency:currency.trim()}).format(Number(n||0));
