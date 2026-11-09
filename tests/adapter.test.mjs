import test from 'node:test';
import assert from 'node:assert/strict';
import {serve} from '../server/adapter.mjs';
async function invoke(url,app,options={}){
 const response={headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=JSON.parse(body);}};
 await serve({url,method:'GET',headers:{host:'preview.invalid'},...options},response,{KRISTIVA_APP:app,SUPABASE_URL:'https://imtlvvninxwvxhzydjqa.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'},()=>{throw Error('No provider request expected');});
 return response;
}
for(const [app,path,status] of [['marketplace','admin/users',403],['merchant','admin/users',403],['admin','merchant/orders',403],['merchant','merchant/orders',401],['admin','admin/users',401]]){
 for(const rewritten of [false,true])test(`${app} ${path} resolves ${rewritten?'rewritten':'original'} nested route`,async()=>{const r=await invoke(rewritten?'/api/router?__route='+encodeURIComponent(path):'/api/'+path,app);assert.equal(r.statusCode,status);});
}
test('rewritten health keeps app identity and financial gate',async()=>{const r=await invoke('/api/router?__route=health','mobile');assert.equal(r.statusCode,200);assert.equal(r.body.app,'mobile');assert.equal(r.body.paymentsEnabled,false);});
test('unknown rewritten route remains a 404',async()=>assert.equal((await invoke('/api/router?__route=missing','marketplace')).statusCode,404));
