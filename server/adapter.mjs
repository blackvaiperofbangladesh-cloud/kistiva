import {handle} from './handler.mjs';
export async function serve(req,res,env=process.env,transport=fetch){
 const host=req.headers.host||'localhost';
 const protocol=req.headers['x-forwarded-proto']==='http'?'http':'https';
 const url=new URL(req.url,`${protocol}://${host}`);
 // Vercel's explicit rewrite sends nested API paths to one Node function.
 // req.url can be original or rewritten, depending on the runtime adapter.
 if(url.pathname==='/api/router'){
  const route=url.searchParams.get('__route')||req.query?.__route||'';
  url.pathname='/api/'+(Array.isArray(route)?route.join('/'):String(route));
  url.searchParams.delete('__route');
 }
 const body=Buffer.isBuffer(req.body)?req.body:typeof req.body==='string'?req.body:req.body!==undefined?JSON.stringify(req.body):undefined;
 const response=await handle(new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)&&body!==undefined?{body}:{})}),env,transport);
 res.statusCode=response.status;
 for(const [key,value] of response.headers)res.setHeader(key,value);
 res.end(await response.text());
}
