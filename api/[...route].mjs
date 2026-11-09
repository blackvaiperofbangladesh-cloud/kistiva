import {handle} from '../server/handler.mjs';
export default async function handler(req,res){
 const host=req.headers.host;const protocol=req.headers['x-forwarded-proto']==='http'?'http':'https';
 const body=typeof req.body==='string'?req.body:req.body?JSON.stringify(req.body):undefined;
 const r=await handle(new Request(`${protocol}://${host}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)&&body?{body}:{})}));
 res.statusCode=r.status;for(const [k,v] of r.headers)res.setHeader(k,v);res.end(await r.text());
}
