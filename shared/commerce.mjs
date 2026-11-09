export const PROJECT_REF='imtlvvninxwvxhzydjqa';
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function normalizeItems(items){
 if(!Array.isArray(items)||!items.length||items.length>100)throw new Error('Cart must contain 1–100 lines');
 const quantities=new Map();
 for(const i of items){
  if(!i||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(i.product_id)||!/^[a-f\d-]+$/i.test(i.product_id))throw new Error('Invalid product');
  if(!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>25)throw new Error('Invalid quantity');
  const n=(quantities.get(i.product_id)||0)+i.quantity;if(n>25)throw new Error('Invalid aggregate quantity');quantities.set(i.product_id,n);
 }
 if([...quantities.values()].reduce((a,b)=>a+b,0)>100)throw new Error('Cart quantity limit exceeded');
 return [...quantities].sort(([a],[b])=>a.localeCompare(b)).map(([product_id,quantity])=>({product_id,quantity}));
}
export function paymentMethod(country,{cryptoCountries=[]}={}){
 if(typeof country!=='string'||!(/^[A-Z]{2}$/).test(country))throw new Error('Select a valid country');
 if(country==='BD')return 'bkash';
 if(!cryptoCountries.includes(country))throw new Error('Payment unavailable in this country');
 return 'manual_crypto';
}
export function authorize(role,user,seller,isAdmin){
 if(!user?.id||user.is_anonymous)throw new Error('Access denied');
 if(role==='admin'&&isAdmin!==true)throw new Error('Access denied');
 if(role==='merchant'&&(!seller||seller.user_id!==user.id||seller.status!=='approved'||seller.deposit_status!=='verified'||seller.removed_at))throw new Error('Access denied');
 return true;
}
export function validateCryptoEvidence(e){
 if(!e||['recipientMatches','networkMatches','amountMatches','unique'].some(k=>e[k]!==true))throw new Error('Blockchain verification incomplete');
 if(!Number.isSafeInteger(e.confirmations)||!Number.isSafeInteger(e.requiredConfirmations)||e.requiredConfirmations<1||e.confirmations<e.requiredConfirmations)throw new Error('Insufficient confirmations');
 return true;
}
export function orderTransition(from,to,paid){
 const transitions={awaiting_payment:['cancelled'],confirmed:['processing','cancelled'],processing:['shipped','cancelled'],shipped:['delivered'],delivered:['refunded'],cancelled:[],refunded:[]};
 if(!transitions[from]?.includes(to))throw new Error('Invalid order transition');
 if(['processing','shipped','delivered','refunded'].includes(to)&&paid!==true)throw new Error('Verified payment required');return to;
}
