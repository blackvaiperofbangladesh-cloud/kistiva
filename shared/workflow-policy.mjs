// KRISTIVA staging contract, versioned from the approved 12 Nov 2026 architecture.
// Pure validation only: the server must authenticate roles, MFA, evidence and persist
// transition + audit atomically. This module performs no writes or payment verification.
export const WORKFLOW_VERSION='kristiva-staging-2026-11-13';
export const OWNER_MENU=Object.freeze([
 'Executive Overview','All Users','Merchant Approval Requests','Product Review',
 'Homepage Product Review','All Product Hub','Customer Links',
 'Crypto Installment Applications [HOLD]','Payment Server',
 'Merchant Sales & Settlement','Owner Product Sales','Wallet Configuration',
 'Services & Email','Business & Security Settings','Deployment Control','Activity & Audit Logs'
]);
export const HOLD=Object.freeze({
 installmentApplications:true,installmentCollections:true,merchantFee500USDT:true,
 bangladeshCheckout:true, bKash:true,cod:true,liveCrypto:true,
 uncheckedWalletChanges:true,unverifiedPayouts:true
});
const merchantTransitions=Object.freeze({
 SUBMITTED:{start_review:['KYC_REVIEW','admin']},
 KYC_REVIEW:{request_correction:['CORRECTION_REQUIRED','admin'],
             recommend:['ADMIN_RECOMMENDED','admin']},
 CORRECTION_REQUIRED:{reply:['MERCHANT_REPLIED','merchant']},
 MERCHANT_REPLIED:{start_review:['KYC_REVIEW','admin']},
 ADMIN_RECOMMENDED:{owner_approve:['OWNER_APPROVED','owner'],
                    owner_reject:['REJECTED','owner']},
 OWNER_APPROVED:{activate:['ACTIVE','owner']},
 ACTIVE:{suspend:['SUSPENDED','owner']},
 SUSPENDED:{reactivate:['ACTIVE','owner']}
});
const productTransitions=Object.freeze({
 DRAFT:{submit:['PENDING_ADMIN','merchant']},
 PENDING_ADMIN:{request_correction:['CORRECTION_REQUIRED','admin'],recommend:['OWNER_REVIEW','admin']},
 CORRECTION_REQUIRED:{resubmit:['PENDING_ADMIN','merchant']},
 OWNER_REVIEW:{owner_approve:['PUBLISHED','owner'],owner_reject:['REJECTED','owner']},
 PUBLISHED:{unpublish:['UNPUBLISHED','owner']},
 UNPUBLISHED:{resubmit:['PENDING_ADMIN','merchant']}
});
function insist(value,message){if(!value)throw new Error(message);}
function checkTransition(flow,state,action,ctx={}){
 const spec=flow[state]?.[action];insist(spec, 'Invalid workflow transition');
 const [next,requiredRole]=spec;
 insist(ctx.authorizedRole===requiredRole,'Server-authorized role required');
 insist(typeof ctx.reason==='string'&&ctx.reason.trim().length>=3&&ctx.reason.length<=1000,'Audited decision reason required');
 if(requiredRole==='owner')insist(ctx.mfaVerified===true,'Owner step-up MFA required');
 return next;
}
export function nextMerchantState(state,action,ctx={}){
 const next=checkTransition(merchantTransitions,state,action,ctx);
 if(action==='recommend'&&ctx.recommendation==='approve')insist(ctx.kycVerified===true,'Admin KYC verification required');
 if(action==='owner_approve'){
  insist(ctx.adminRecommendation==='approve'&&ctx.emailVerified===true&&ctx.kycVerified===true,
    'Verified email, reviewed KYC and positive Admin recommendation required');
 }
 if(action==='activate')insist(ctx.emailVerified===true&&ctx.kycVerified===true&&ctx.ownerApproved===true,
  'Separate verified Owner activation gate required');
 // Collection of the proposed 500 USDT merchant fee is intentionally NOT a condition.
 return next;
}
export function nextProductState(state,action,ctx={}){
 const next=checkTransition(productTransitions,state,action,ctx);
 if(action==='submit'||action==='resubmit')insist(ctx.merchantActive===true,'Active merchant required');
 if(action==='owner_approve')insist(ctx.adminRecommendation==='approve'&&ctx.productReviewed===true,
   'Owner approval requires complete Admin review');
 return next;
}
export function homepageSelection(product,ctx={}){
 insist(ctx.authorizedRole==='owner'&&ctx.mfaVerified===true,'Owner MFA required for homepage selection');
 insist(typeof ctx.reason==='string'&&ctx.reason.trim().length>=3,'Audited reason required');
 insist(product?.status==='PUBLISHED','Only published products can be selected');
 insist(product?.installmentEligible===true,'Product is not marked installment-eligible');
 insist(ctx.approvedPolicyVersion,'Eligibility policy version is required');
 return Object.freeze({
  productId:product.id,selected:ctx.selected===true,
  displayOrder:ctx.selected===true?Math.max(0,Math.floor(ctx.displayOrder||0)):null,
  policyVersion:ctx.approvedPolicyVersion,installmentApplicationsEnabled:false,
  checkoutMode:'normal_full_payment_only'
 });
}
export function verifyPaymentEvidence(e){
 insist(e?.source==='independent_server_chain_verifier','Trusted verifier required');
 insist(e.recipientMatches===true&&e.chainMatches===true&&e.tokenMatches===true&&e.amountMatches===true,'On-chain payment mismatch');
 insist(e.uniqueTxHash===true&&e.quoteUnexpired===true,'Duplicate/expired transaction');
 insist(Number.isSafeInteger(e.confirmations)&&Number.isSafeInteger(e.requiredConfirmations)&&e.requiredConfirmations>0&&e.confirmations>=e.requiredConfirmations,'Insufficient finality');
 insist(typeof e.txHash==='string'&&e.txHash.length>=32,'Transaction hash required');
 // The token 'source' must be created by a protected backend, NEVER accepted from a customer request.
 return true;
}
export function readiness(){
 return Object.freeze({
  architecture:WORKFLOW_VERSION,
  source:'staging specification; this function is not evidence of integration',
  merchantKyc:'BLOCKED — verified migration/RLS/owner MFA not implemented',
  productApproval:'BLOCKED — server-side owner review workflow not implemented',
  homepageSelection:'BLOCKED — owner-only audited persistence not implemented',
  payment:'HOLD — independent blockchain verifier not connected',
  financing:'HOLD',
  merchantFee:'HOLD',
  production:'LOCKED'
 });
}
