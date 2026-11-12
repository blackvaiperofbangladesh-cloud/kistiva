import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
const all=['marketplace','mobile','merchant','admin','owner'];const app=process.argv[2];
if(app&&!all.includes(app))throw new Error('Unknown application');
for(const name of app?[app]:all){
 const out=`dist/${name}`;await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
 await cp(`apps/${name}`,out,{recursive:true});await cp('shared',`${out}/shared`,{recursive:true});
 await mkdir(`${out}/shared/vendor`,{recursive:true});
 await cp('node_modules/@supabase/supabase-js/dist/umd/supabase.js',`${out}/shared/vendor/supabase.js`);
 const config={supabaseUrl:process.env.PUBLIC_SUPABASE_URL||'https://imtlvvninxwvxhzydjqa.supabase.co',supabaseKey:process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_TicRFUA3OuQm9YPPxWBQzA_XH9cnVX5',app:name};
 if(config.supabaseUrl!=='https://imtlvvninxwvxhzydjqa.supabase.co')throw new Error('Unexpected Supabase project');
 if(!config.supabaseKey.startsWith('sb_publishable_'))throw new Error('Only a publishable key may enter the browser');
 await writeFile(`${out}/config.js`,`window.KRISTIVA_CONFIG=${JSON.stringify(config)};\n`);
 const html=await readFile(`${out}/index.html`,'utf8');
 if(/service_role|sb_secret_/.test(html))throw new Error('Secret key detected');
 console.log(`Built ${name} → ${out}`);
}
