import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const app of ['marketplace','mobile','merchant','admin','owner','landing']){
 test(`${app} builds independently with isolated config`,()=>{
  assert.ok(existsSync(`apps/${app}/vercel.json`),'independent deployment configuration missing');
  const r=spawnSync(process.execPath,['scripts/build.mjs',app],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  assert.ok(existsSync(`dist/${app}/index.html`));
  const cfg=JSON.parse(readFileSync(`apps/${app}/vercel.json`));
  assert.equal(cfg.outputDirectory,`dist/${app}`);
  assert.ok(cfg.rewrites.some(r=>r.source==='/api/:path*'&&r.destination==='/api/router?__route=:path*'),'nested API rewrite missing');
 });
}
test('recovered storefront preserves approved styles',()=>{
 const source=readFileSync('design-reference/marketplace.styles.html','utf8');
 const built=readFileSync('apps/marketplace/index.html','utf8');
 const styles=[...source.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(x=>x[0]);
 for(const style of styles)assert.ok(built.includes(style),'approved style changed');
 assert.ok(!built.includes('Demo rating'));
});

test('Git-source previews preserve shared security headers and deep-link rewrites',()=>{
 const cfg=JSON.parse(readFileSync('vercel.json'));
 assert.ok(cfg.headers[0].headers.some(h=>h.key==='X-Frame-Options'&&h.value==='DENY'));
 assert.ok(cfg.rewrites.some(r=>r.source==='/account'&&r.destination==='/index.html'));
 assert.ok(cfg.rewrites.some(r=>r.source==='/products/:id'));
 assert.equal(cfg.env,undefined,'application identity must remain isolated per project');
});

test('customer store and mobile list published products without falsely calling them featured',()=>{
 for(const app of ['marketplace','mobile']){
  const html=readFileSync(`apps/${app}/index.html`,'utf8');
  assert.match(html,/<h2>All available products<\/h2>/);
  assert.doesNotMatch(html,/<h2>Featured collection<\/h2>/);
  assert.match(html,/id="products"/);
 }
});

test('admin login is not mislabeled Owner, and financing panels remain HOLD',()=>{
 const html=readFileSync('apps/admin/index.html','utf8');
 assert.match(html,/<h2>Admin sign in<\/h2>/);
 assert.doesNotMatch(html,/<h2>Owner sign in<\/h2>/);
 assert.match(html,/Crypto Installment Applications — HOLD/);
 assert.match(html,/merchant approval fee collection are OFF\/HOLD/);
});
test('owner blueprint has no active payment or privileged submission form',()=>{
 const html=readFileSync('apps/owner/index.html','utf8');
 assert.match(html,/Owner Governance — Staging Blueprint/);
 assert.match(html,/NO PRIVILEGED ACCESS/);
 assert.doesNotMatch(html,/type="submit"/);
});

test('customer payment messaging never falsely advertises live bKash or manual crypto',()=>{
 for(const app of ['marketplace','mobile']){
  const html=readFileSync(`apps/${app}/index.html`,'utf8');
  assert.doesNotMatch(html,/Bangladesh: bKash Merchant Gateway/);
  assert.doesNotMatch(html,/Other supported countries: manually verified crypto payments/);
  assert.match(html,/Do not transfer funds/);
  assert.match(html,/Bangladesh\/bKash HOLD/);
 }
});

test('all shipped staging apps explicitly disable live Supabase auth and mutation',()=>{
 for(const app of ['marketplace','mobile','merchant','admin','owner','landing']){
  const p=readFileSync(`dist/${app}/config.js`,'utf8');
  assert.match(p,/"readOnly":true/);
 }
 const client=readFileSync('shared/client.mjs','utf8');
 assert.match(client,/if\(readOnly&&method!=='GET'\)/);
});

test('marketing landing retains approved source, exactly three hero slides and HOLD section',()=>{
 const html=readFileSync('apps/landing/index.html','utf8');
 assert.equal((html.match(/<article class="k4-slide /g)||[]).length,3);
 assert.match(html,/Crypto Installment Products/);
 assert.match(html,/PROTECTED STAGING PREVIEW/);
 assert.match(html,/Bangladesh Store — HOLD/);
 assert.match(html,/kristiva-marketplace-preview-/);
 assert.doesNotMatch(html,/href="create-account\//);
 assert.doesNotMatch(html,/sb_secret_|service_role|sk-emergent/);
});

test('landing never claims live search or active signup',()=>{
 const html=readFileSync('apps/landing/index.html','utf8');
 assert.doesNotMatch(html,/Preview shows categories\. Product search is not live\./);
 assert.doesNotMatch(html,/Shop Now · Create Account/);
 assert.match(html,/Search opens the protected International Store Preview/);
 assert.match(html,/Account Preview — Login HOLD/);
});
