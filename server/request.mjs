export class HttpFailure extends Error {
 constructor(status,message){super(message);this.status=status;}
}
export async function readJson(request,limit=65536){
 const length=request.headers.get('content-length');
 if(length&&/^\d+$/.test(length)&&Number(length)>limit)throw new HttpFailure(413,'Request too large');
 const reader=request.body?.getReader();
 const chunks=[];let size=0;
 if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new HttpFailure(413,'Request too large');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)||'{}');}catch{throw new HttpFailure(400,'Invalid JSON');}
 if(!body||Array.isArray(body)||typeof body!=='object')throw new HttpFailure(400,'JSON object required');
 return body;
}
