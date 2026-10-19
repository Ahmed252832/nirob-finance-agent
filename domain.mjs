import {randomUUID,createHash} from 'node:crypto';
import {accountBalance,assessPayment,assessCardPurchase,monthSummary,wilsonLowerBound,trustTier} from './logic.mjs';
export {accountBalance,monthSummary,wilsonLowerBound,trustTier};
export const uuid=()=>randomUUID();
export const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const month=()=>day().slice(0,7);
export function seed(){const m=month(),date=day();return {version:3,accounts:[{id:'bank',name:'Everyday demo bank',type:'bank',active:true,openingMinor:2500000},{id:'debit',name:'Demo Visa debit',type:'debit',active:true,linkedTo:'bank'},{id:'credit',name:'Demo credit card',type:'credit',active:true,creditLimitMinor:5000000},{id:'cash',name:'Cash wallet',type:'cash',active:true,openingMinor:1000000}],transactions:[{id:uuid(),kind:'income',merchant:'Salary',amountMinor:6800000,category:'Income',accountId:'bank',date,status:'posted',source:'seed'},...[[1800000,'Rent','Housing','bank'],[450000,'Fresh Basket','Groceries','debit'],[220000,'Cafe Lane','Dining','credit'],[59000,'Stream Plus','Subscriptions','debit'],[120000,'Dhaka Metro','Transport','cash']].map(([amountMinor,merchant,category,accountId])=>({id:uuid(),amountMinor,merchant,category,accountId,kind:'expense',date,status:'posted',source:'seed'}))],bills:[{id:'electricity',name:'Electricity',payee:'City Electricity Demo',amountMinor:235000,dueDate:m+'-28',reference:m+'-ELEC',category:'Utilities',status:'unpaid'},{id:'internet',name:'Internet',payee:'FiberNet Demo',amountMinor:125000,dueDate:m+'-27',reference:m+'-NET',category:'Utilities',status:'unpaid'}],knownPayees:['City Electricity Demo','FiberNet Demo','Rahim'],proposals:[],alerts:[],feedback:[],traces:[],budgets:{},credentials:[],savingsGoalMinor:1000000};}
export const snapshot=p=>createHash('sha256').update(JSON.stringify([p.id,p.kind,p.payee,p.amountMinor,p.accountId,p.reference,p.billId,p.dueDate])).digest('hex');
export function guard(state,p){
 const source=state.accounts.find(a=>a.id===p.accountId&&a.active);
 if(p.kind==='card'){const r=assessCardPurchase({...p,merchant:p.payee},state.accounts,state.transactions);return {...r,signals:state.knownPayees.includes(p.payee)?[]:['Unknown merchant'],needsSecondDevice:!state.knownPayees.includes(p.payee)};}
 const r=assessPayment(p,{availableMinor:source?.type==='bank'?accountBalance(source,state.transactions,state.accounts):NaN,knownPayees:state.knownPayees,alreadyPaidRefs:state.bills.filter(b=>b.status==='paid').map(b=>b.reference),currentDate:day()});
 if(p.kind==='bill'&&(!p.dueDate||!/^\d{4}-\d{2}-\d{2}$/.test(p.dueDate))){r.allowed=false;r.reasons.push('Bill due date is required');}
 return r;
}
export function draft(state,input,origin='manual',traceId=null){
 const source=state.accounts.find(a=>a.active&&a.type==='bank');
 const bill=input.billId?state.bills.find(b=>b.id===input.billId):null;
 if(input.billId&&!bill)throw Error('Bill not found');
 if(bill?.status==='paid')throw Error('Bill is already paid');
 if(bill&&state.proposals.some(p=>p.billId===bill.id&&p.status==='pending'))throw Error('This bill already has a pending draft');
 const p={id:uuid(),kind:bill?'bill':input.kind||'transfer',payee:bill?.payee||String(input.payee||'').trim(),amountMinor:bill?.amountMinor??input.amountMinor,accountId:input.accountId||source?.id,reference:bill?.reference||'',billId:bill?.id||null,dueDate:bill?.dueDate||null,category:bill?.category||(input.kind==='card'?'Shopping':'Transfers'),status:'pending',origin,traceId,createdAt:new Date().toISOString()};
 if(!p.payee||p.payee.length>80||!Number.isSafeInteger(p.amountMinor)||p.amountMinor<=0)throw Error('Invalid recipient or amount');
 p.guard=guard(state,p);state.proposals.unshift(p);
 if(!p.guard.allowed||p.guard.signals.length)state.alerts.unshift({id:uuid(),proposalId:p.id,status:'open',title:'Payment review',detail:[...p.guard.reasons,...p.guard.signals].join('; ')});
 return p;
}
export function execute(state,id){const p=state.proposals.find(p=>p.id===id);if(!p||p.status!=='pending')throw Error('Payment is no longer pending');const check=guard(state,p);if(!check.allowed)throw Error(check.reasons.join('; '));p.status='executed';p.executedAt=new Date().toISOString();const tx={id:uuid(),proposalId:p.id,cardRequestId:p.kind==='card'?p.id:undefined,kind:'expense',merchant:p.payee,amountMinor:p.amountMinor,accountId:p.accountId,category:p.category,date:day(),status:'posted',source:'verified demo payment'};state.transactions.unshift(tx);if(p.billId)state.bills.find(b=>b.id===p.billId).status='paid';if(!state.knownPayees.includes(p.payee))state.knownPayees.push(p.payee);for(const a of state.alerts)if(a.proposalId===p.id)a.status='resolved';return tx;}
export function trust(state,scope='bill'){const rows=state.feedback.filter(f=>f.scope===scope);const successes=rows.filter(f=>f.accepted).length;return {scope,total:rows.length,successes,lower:wilsonLowerBound(successes,rows.length),tier:trustTier(successes,rows.length,rows.some(f=>f.unsafe)),source:'User decisions on actual agent drafts; evaluation fixtures excluded'};}
export function feedback(state,proposalId,accepted,unsafe=false){if(typeof accepted!=='boolean'||typeof unsafe!=='boolean'||(accepted&&unsafe))throw Error('Choose correct, incorrect or unsafe feedback');const p=state.proposals.find(p=>p.id===proposalId&&p.origin==='agent');if(!p)throw Error('Choose an actual agent draft');if(state.feedback.some(f=>f.proposalId===proposalId))throw Error('This draft already has feedback');const row={id:uuid(),proposalId,scope:p.kind,accepted,unsafe,at:new Date().toISOString(),traceId:p.traceId};state.feedback.push(row);if(unsafe){for(const x of state.proposals)if(x.kind===p.kind&&x.origin==='scheduler'&&x.status==='pending')x.status='discarded';}return row;}
export function suggestBudget(state,selectedMonth=month(),goal=state.savingsGoalMinor){
 const s=monthSummary(state.transactions,selectedMonth);if(!Number.isSafeInteger(goal)||goal<0)throw Error('Invalid savings goal');
 const essentialCats=['Housing','Groceries','Utilities','Health','Education','Transport'];
 const spentEssential=s.expenses.filter(t=>essentialCats.includes(t.category)).reduce((sum,t)=>sum+t.amountMinor,0);
 const upcoming=state.bills.filter(b=>b.status==='unpaid'&&b.dueDate.startsWith(selectedMonth)).reduce((sum,b)=>sum+b.amountMinor,0);
 const minimumCommitments=s.spendMinor+upcoming;
 const availableAfterCommitments=Math.max(0,s.incomeMinor-minimumCommitments);
 const achievableSavings=Math.min(goal,availableAfterCommitments);
 const discretionaryRemaining=Math.max(0,availableAfterCommitments-achievableSavings);
 return {month:selectedMonth,incomeMinor:s.incomeMinor,spentMinor:s.spendMinor,spentEssentialMinor:spentEssential,upcomingBillsMinor:upcoming,requestedSavingsMinor:goal,suggestedSavingsMinor:achievableSavings,savingsShortfallMinor:goal-achievableSavings,spendingLimitMinor:Math.max(s.spendMinor,s.incomeMinor-achievableSavings),discretionaryRemainingMinor:discretionaryRemaining,deficitMinor:Math.max(0,minimumCommitments-s.incomeMinor),incomeExperiment:/teach|tutor/i.test(state.skills||'')?'Try one small tutoring session in a subject you know; validate demand before paying for promotion.':/code|web|design/i.test(state.skills||'')?'Test one small website or design project with a fixed scope and agreed fee.':'List a skill you can teach or sell and test one small paid project before spending money. Earnings are uncertain.',basis:'Recorded income minus posted expenses, unpaid bills and achievable savings. Missing income or expenses changes the result.',recommendations:[...(minimumCommitments>s.incomeMinor?['Recorded commitments exceed income. Check missing income and review non-essential spending; do not assume savings are affordable.']:[]),...(goal>achievableSavings?['The requested savings target is not fully funded by recorded cash flow.']:[]),'Keep essential bills funded before discretionary purchases.','Review subscriptions and add unrecorded cash expenses.']};
}
