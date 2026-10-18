import test from 'node:test';
import assert from 'node:assert/strict';
import { asciiDigits, amountToMinor, wilsonLowerBound, trustTier, accountBalance, monthSummary, riskSignals, assessPayment, parseIntent, adviceFor } from '../logic.mjs';

const proposal = overrides => ({ payee:'Electric Demo', amountMinor:100000, reference:'E-1', category:'Utilities', ...overrides });
const context = overrides => ({ knownPayees:['Electric Demo'], availableMinor:1000000, alreadyPaidRefs:[], trust:{successes:0,total:0}, ...overrides });

test('01 Bengali digits become ASCII digits',()=>assert.equal(asciiDigits('৳৫০০'), '৳500'));
test('02 whole BDT becomes exact minor units',()=>assert.equal(amountToMinor('৳1,250'),125000));
test('03 fractional BDT keeps two decimal places',()=>assert.equal(amountToMinor('12.05'),1205));
test('04 negative and malformed amounts are rejected',()=>assert.equal(amountToMinor('-5'),null));
test('05 Wilson lower bound is zero without observations',()=>assert.equal(wilsonLowerBound(0,0),0));
test('06 twenty perfect results grant only tier one',()=>assert.equal(trustTier(20,20),1));
test('07 forty perfect results grant tier two',()=>assert.equal(trustTier(40,40),2));
test('08 eighty perfect results grant tier three',()=>assert.equal(trustTier(80,80),3));
test('09 unsafe result resets autonomy',()=>assert.equal(trustTier(80,80,true),0));
test('10 debit card expense reduces linked bank balance',()=>{const accounts=[{id:'b',type:'bank',openingMinor:100000},{id:'d',type:'debit',linkedTo:'b'}];assert.equal(accountBalance(accounts[0],[{accountId:'d',status:'posted',kind:'expense',amountMinor:25000}],accounts),75000);});
test('11 credit card available credit decreases after purchase',()=>{const a={id:'c',type:'credit',creditLimitMinor:100000};assert.equal(accountBalance(a,[{accountId:'c',status:'posted',kind:'expense',amountMinor:30000}],[a]),70000);});
test('12 monthly summary includes manual cash expense',()=>{const s=monthSummary([{date:'2026-10-03',status:'posted',kind:'expense',amountMinor:2500,category:'Food',source:'cash'}],'2026-10');assert.equal(s.spendMinor,2500);});
test('13 other months do not change selected month',()=>{const s=monthSummary([{date:'2026-09-03',status:'posted',kind:'expense',amountMinor:2500,category:'Food'}],'2026-10');assert.equal(s.spendMinor,0);});
test('14 unknown payee creates risk signal',()=>assert.ok(riskSignals({payee:'Unknown',knownPayees:['Known']}).includes('New or unrecognized payee')));
test('15 new device creates risk signal',()=>assert.ok(riskSignals({payee:'Known',knownPayees:['Known'],newDevice:true}).includes('New device')));
test('16 hard payment cap blocks execution',()=>assert.equal(assessPayment(proposal({amountMinor:1000001}),context()).allowed,false));
test('17 emergency reserve blocks execution',()=>assert.equal(assessPayment(proposal({amountMinor:100000}),context({availableMinor:250000})).allowed,false));
test('18 duplicate bill reference blocks execution',()=>assert.equal(assessPayment(proposal(),context({alreadyPaidRefs:['E-1']})).allowed,false));
test('19 transfer request parses amount and recipient',()=>assert.deepEqual(parseIntent('Send 500 to Rahim'),{kind:'transfer',amountMinor:50000,payee:'Rahim'}));
test('20 advisor uses actual recorded category and marks earnings idea as uncertain',()=>{const result=adviceFor([{date:'2026-10-03',status:'posted',kind:'expense',amountMinor:5000,category:'Groceries',source:'cash'}],'2026-10','tutoring');assert.match(result.tips[0].title,/Groceries/);assert.match(result.tips.at(-1).body,/not a promise/);});
test('21 an overdue bill is held for provider review',()=>assert.equal(assessPayment(proposal({kind:'bill',dueDate:'2026-10-01'}),context({currentDate:'2026-10-18'})).allowed,false));
