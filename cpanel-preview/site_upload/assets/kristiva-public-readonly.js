/* KRISTIVA: client-safe public data, read-only progressive enhancement.
 * Never use this file for checkout decisions, owner wallet, auth or payment confirmation.
 * Fallback Webflow reference images remain when the network is unavailable.
 */
(()=>{"use strict";
const root=document.getElementById("kp");
if(!root)return;
const ORIGIN="https://imtlvvninxwvxhzydjqa.supabase.co";
const PUBLIC_KEY="sb_publishable_TicRFUA3OuQm9YPPxWBQzA_XH9cnVX5";
const alias={"beauty & care":"beauty & personal care","sports & fitness":"sports & outdoors"};
const norm=s=>String(s||"").trim().toLocaleLowerCase("en").replace(/\s+/g," ");
const validImage=s=>{try{const u=new URL(s);return u.protocol==="https:"&&u.hostname!=="localhost"&&u.hostname!=="127.0.0.1"}catch{return false}};
async function getPublic(table,cols){
 const url=ORIGIN+"/rest/v1/"+table+"?select="+encodeURIComponent(cols)+"&is_active=eq.true";
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),8000);
 try{
  const res=await fetch(url,{headers:{"apikey":PUBLIC_KEY,"Accept":"application/json"},method:"GET",credentials:"omit",signal:controller.signal,cache:"no-store"});
  if(!res.ok)throw new Error("Supabase public read HTTP "+res.status);
  const rows=await res.json();
  return Array.isArray(rows)?rows:[];
 }finally{clearTimeout(timer)}
}
async function enhance(){
 try{
  const [categories,media]=await Promise.all([
   getPublic("categories","name,image_url,is_active"),
   getPublic("homepage_media","slot,image_url,is_active")
  ]);
  const catMap=new Map(categories.map(x=>[norm(x.name),x]));
  for(const card of root.querySelectorAll(".catgrid [data-category]")){
   const label=norm(card.getAttribute("data-category"));
   const item=catMap.get(alias[label]||label);
   if(item&&validImage(item.image_url)){
    const img=card.querySelector("img");if(img){img.src=item.image_url;img.alt=item.name+" category";}
   }
  }
  const logo=media.find(x=>x.slot==="brand_logo"&&validImage(x.image_url));
  if(logo){
   for(const img of root.querySelectorAll(".brand img")){img.src=logo.image_url;img.alt="KRISTIVA official logo";}
  }
  // Promo slides are intentionally untouched: the approved 3-slide composition remains frozen.
  root.dataset.publicDataSource="supabase-readonly";
 }catch(e){
  // Network error / RLS denied: retain approved source design; never inject guessed data.
  root.dataset.publicDataSource="static-fallback";
  console.warn("KRISTIVA public media fallback",e?.message||"unavailable");
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhance,{once:true});else enhance();
})();
