import test from 'node:test';
import assert from 'node:assert/strict';
import {OWNER_MENU,HOLD,nextMerchantState,nextProductState,homepageSelection,verifyPaymentEvidence,readiness} from '../shared/workflow-policy.mjs';
const actor=(authorizedRole)=>({authorizedRole,reason:'Reviewed supporting documents and audit log',mfaVerified:true,emailVerified:true,kycVerified:true,ownerApproved:true,adminRecommendation:'approve',productReviewed:true,merchantActive:true,recommendation:'approve'});
test('owner navigation contract has exactly sixteen entries with independent homepage approval',()=>{
 assert.equal(OWNER_MENU.length,16);
 assert.equal(OWNER_MENU[3],'Product Review');
 assert.equal(OWNER_MENU[4],'Homepage Product Review');
 assert.ok(Object.values(HOLD).every(x=>x===true));
});
test('merchant review separates KYC, recommendation, owner approval and activation',()=>{
 assert.equal(nextMerchantState('SUBMITTED','start_review',actor('admin')),'KYC_REVIEW');
 assert.equal(nextMerchantState('KYC_REVIEW','request_correction',actor('admin')),'CORRECTION_REQUIRED');
 assert.equal(nextMerchantState('CORRECTION_REQUIRED','reply',actor('merchant')),'MERCHANT_REPLIED');
 assert.equal(nextMerchantState('KYC_REVIEW','recommend',actor('admin')),'ADMIN_RECOMMENDED');
 assert.equal(nextMerchantState('ADMIN_RECOMMENDED','owner_approve',actor('owner')),'OWNER_APPROVED');
 assert.equal(nextMerchantState('OWNER_APPROVED','activate',actor('owner')),'ACTIVE');
 assert.throws(()=>nextMerchantState('ADMIN_RECOMMENDED','activate',actor('owner')),/Invalid workflow/);
 assert.throws(()=>nextMerchantState('ADMIN_RECOMMENDED','owner_approve',{...actor('owner'),mfaVerified:false}),/MFA/);
 assert.throws(()=>nextMerchantState('ADMIN_RECOMMENDED','owner_approve',{...actor('owner'),kycVerified:false}),/KYC/);
 assert.throws(()=>nextMerchantState('OWNER_APPROVED','activate',{...actor('owner'),emailVerified:false}),/verified/);
 assert.throws(()=>nextMerchantState('KYC_REVIEW','recommend',{...actor('admin'),kycVerified:false}),/KYC/);
});
test('products need merchant submission, Admin review and independent Owner approval',()=>{
 assert.equal(nextProductState('DRAFT','submit',actor('merchant')),'PENDING_ADMIN');
 assert.equal(nextProductState('PENDING_ADMIN','recommend',actor('admin')),'OWNER_REVIEW');
 assert.equal(nextProductState('OWNER_REVIEW','owner_approve',actor('owner')),'PUBLISHED');
 assert.throws(()=>nextProductState('PENDING_ADMIN','owner_approve',actor('owner')),/Invalid workflow/);
 assert.throws(()=>nextProductState('DRAFT','submit',{...actor('merchant'),merchantActive:false}),/Active merchant/);
 assert.throws(()=>nextProductState('OWNER_REVIEW','owner_approve',{...actor('owner'),adminRecommendation:'reject'}),/Admin review/);
});
test('homepage selection cannot activate financing or select unapproved products',()=>{
 const product={id:'product-1',status:'PUBLISHED',installmentEligible:true};
 const e=homepageSelection(product,{...actor('owner'),approvedPolicyVersion:'v1-HOLD',selected:true,displayOrder:2});
 assert.equal(e.productId,'product-1');
 assert.equal(e.checkoutMode,'normal_full_payment_only');
 assert.equal(e.installmentApplicationsEnabled,false);
 assert.throws(()=>homepageSelection({...product,status:'DRAFT'},{...actor('owner'),approvedPolicyVersion:'v1'}),/published/);
 assert.throws(()=>homepageSelection(product,{...actor('admin'),approvedPolicyVersion:'v1'}),/MFA/);
});
test('client-claimed matching flags are not trusted blockchain evidence',()=>{
 assert.throws(()=>verifyPaymentEvidence({recipientMatches:true,chainMatches:true,tokenMatches:true,amountMatches:true,uniqueTxHash:true,quoteUnexpired:true,confirmations:99,requiredConfirmations:1,txHash:'a'.repeat(64)}),/Trusted verifier/);
 assert.match(readiness().payment,/HOLD/);
 assert.equal(readiness().production,'LOCKED');
});
