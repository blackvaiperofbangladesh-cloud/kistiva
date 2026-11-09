import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const app of ['marketplace','mobile','merchant','admin']){
 test(`${app} builds independently with isolated config`,()=>{
  assert.ok(existsSync(`apps/${app}/vercel.json`),'independent deployment configuration missing');
  const r=spawnSync(process.execPath,['scripts/build.mjs',app],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  assert.ok(existsSync(`dist/${app}/index.html`));
  const cfg=JSON.parse(readFileSync(`apps/${app}/vercel.json`));
  assert.equal(cfg.outputDirectory,`dist/${app}`);
 });
}
test('recovered storefront preserves approved styles',()=>{
 const source=readFileSync('design-reference/marketplace.styles.html','utf8');
 const built=readFileSync('apps/marketplace/index.html','utf8');
 const styles=[...source.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(x=>x[0]);
 for(const style of styles)assert.ok(built.includes(style),'approved style changed');
 assert.ok(!built.includes('Demo rating'));
});
