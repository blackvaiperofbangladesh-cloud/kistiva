import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../server/handler.mjs';

// These are isolated local gate checks. No Supabase, crypto provider, or production call.
const request=()=>new Request('https://staging.kristiva.invalid/api/health');
for(const [label,env] of [
  ['no release flags',{}],
  ['payment flag only',{KRISTIVA_PAYMENTS_ENABLED:'true'}],
  ['backend verified flag only',{KRISTIVA_BACKEND_V2_VERIFIED:'true'}],
  ['non-boolean strings',{KRISTIVA_PAYMENTS_ENABLED:'1',KRISTIVA_BACKEND_V2_VERIFIED:'yes'}],
]){
  test(`financial activation remains OFF with ${label}`,async()=>{
    const response=await handle(request(),env,()=>{throw new Error('No outbound calls allowed')});
    assert.equal(response.status,200);
    const body=await response.json();
    assert.equal(body.paymentsEnabled,false);
    assert.equal(body.releaseGate,'verification_required');
  });
}
test('two explicit flags are required to mark health as enabled',async()=>{
  const response=await handle(request(),{
    KRISTIVA_PAYMENTS_ENABLED:'true',
    KRISTIVA_BACKEND_V2_VERIFIED:'true'
  },()=>{throw new Error('Health cannot require external services')});
  const body=await response.json();
  assert.equal(body.paymentsEnabled,true);
  assert.equal(body.releaseGate,'verification_required');
});
