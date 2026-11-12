import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {handle} from '../server/handler.mjs';
const app=process.argv[2]||'marketplace';if(!['marketplace','mobile','merchant','admin','owner','landing'].includes(app))throw Error('Unknown app');
process.env.KRISTIVA_APP=app;process.env.SUPABASE_URL||='https://imtlvvninxwvxhzydjqa.supabase.co';process.env.SUPABASE_PUBLISHABLE_KEY||='sb_publishable_TicRFUA3OuQm9YPPxWBQzA_XH9cnVX5';
const root=resolve('dist',app),port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,`http://localhost:${port}`);
 if(url.pathname.startsWith('/api/')){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>65536){res.writeHead(413);res.end();return;}chunks.push(c);}const r=await handle(new Request(url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})}));res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}
 let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(root+'/')&&path!==root){res.writeHead(403);res.end();return;}
 if(url.pathname==='/'||!extname(path))path=resolve(root,'index.html');const data=await readFile(path);res.writeHead(200,{'content-type':({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.css':'text/css'})[extname(path)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0',()=>console.log(`${app}: http://localhost:${port}`));
