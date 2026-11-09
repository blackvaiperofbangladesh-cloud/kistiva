import test from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../server/request.mjs';
const request=body=>new Request('https://test.invalid',{method:'POST',body});
test('request limit counts UTF-8 bytes, not JavaScript characters',async()=>{await assert.rejects(readJson(request(JSON.stringify({value:'অ'.repeat(23000)}))),{status:413});});
test('streamed request is cancelled as soon as byte budget is exceeded',async()=>{let cancelled=false;const body=new ReadableStream({pull(c){c.enqueue(new Uint8Array(32769));},cancel(){cancelled=true;}});await assert.rejects(readJson(new Request('https://test.invalid',{method:'POST',body,duplex:'half'})),{status:413});assert.equal(cancelled,true);});
for(const value of ['null','[]','true','42','"string"','{'])test(`invalid request shape ${value} rejected`,async()=>assert.rejects(readJson(request(value)),{status:400}));
test('invalid UTF-8 cannot be silently replaced in a JSON request',async()=>assert.rejects(readJson(request(new Uint8Array([123,34,120,34,58,34,255,34,125]))),{status:400}));
