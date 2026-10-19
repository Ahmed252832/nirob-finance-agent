import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} from '@simplewebauthn/server';
import {openStore} from './store.mjs';
import {draft,execute,feedback,guard,trust,snapshot,uuid,day,month,accountBalance,suggestBudget} from './domain.mjs';
import {amountToMinor} from './logic.mjs';
import {runAgent} from './agent.mjs';
import {extractBill} from './ocr.mjs';
import {newConversation,runChat,recoverInterruptedChats} from './chat.mjs';
import {trustProgress} from './trust-progress.mjs';
const root=dirname(fileURLToPath(import.meta.url)),port=Number(process.env.NIROB_PORT||4177),origin=`http://localhost:${port}`,dataDir=process.env.NIROB_DATA_DIR||join(root,'data');
const store=openStore(dataDir),sessions=new Map(),challenges=new Map(),approvals=new Map();
recoverInterruptedChats(store);
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
function session(req,res){const sid=/nirob_session=([^;]+)/.exec(req.headers.cookie||'')?.[1];let s=sessions.get(sid);if(!s||s.expires<Date.now()){s={id:randomBytes(32).toString('hex'),csrf:randomBytes(32).toString('hex'),authenticated:false,expires:Date.now()+8*3600000};sessions.set(s.id,s);res.setHeader('Set-Cookie',`nirob_session=${s.id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);}return s;}
function auth(s){if(!s.authenticated)throw Error('Unlock the workspace with your passkey first');}
function newChallenge(s,purpose,binding=''){const id=uuid(),expires=Date.now()+120000;const signed=store.sign(JSON.stringify([id,s.id,purpose,binding,expires]));return {id,sid:s.id,purpose,binding,expires,signed};}
function take(s,id,purpose){const c=challenges.get(id);challenges.delete(id);if(!c||c.sid!==s.id||c.purpose!==purpose||c.expires<Date.now())throw Error('Challenge expired, already used or invalid');return c;}
function publicState(s){const state=store.read();return {...state,credentials:undefined,chats:s.authenticated?(state.chats||[]):[],traces:s.authenticated?state.traces:[],credentialCount:state.credentials.length,authenticated:s.authenticated,csrf:s.csrf,accounts:state.accounts.map(a=>({...a,balanceMinor:accountBalance(a,state.transactions,state.accounts)})),trust:trust(state),trustProgress:{bill:trustProgress(state,'bill'),transfer:trustProgress(state,'transfer')},audit:store.audit().slice(-80).reverse(),auditValid:store.verify()};}
async function body(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12*1024*1024)throw Error('Request is too large');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString()||'{}');}
async function handle(req,res){
 if(req.headers.host!==`localhost:${port}`){json(res,400,{error:`Open ${origin} (localhost is required for passkeys).`});return;}
 const s=session(req,res);let path;try{path=decodeURIComponent(new URL(req.url,origin).pathname);}catch{json(res,400,{error:'Invalid path'});return;}
 if(path.startsWith('/api/')){
  if(req.method==='GET'&&path==='/api/state')return json(res,200,publicState(s));
  if(req.method==='GET'&&path==='/api/evidence'){auth(s);return json(res,200,{demo:true,audit:store.audit(),integrityValid:store.verify(),traces:store.read().traces,feedback:store.read().feedback});}
  if(req.method!=='POST'||req.headers.origin!==origin||req.headers['x-csrf-token']!==s.csrf||!req.headers['content-type']?.startsWith('application/json'))return json(res,403,{error:'Request rejected'});
  const b=await body(req);const state=store.read();
  if(path==='/api/register/options'){
   if(state.credentials.length){auth(s);if(!s.enrollUntil||s.enrollUntil<Date.now())throw Error('Verify your existing passkey to add another');s.enrollUntil=0;}
   const c=newChallenge(s,'register');const options=await generateRegistrationOptions({rpName:'Nirob Demo',rpID:'localhost',userName:'demo-user',userID:new TextEncoder().encode('nirob-local-demo-user'),challenge:new TextEncoder().encode(c.signed),attestationType:'none',excludeCredentials:state.credentials.map(k=>({id:k.id,transports:k.transports})),authenticatorSelection:{residentKey:'preferred',userVerification:'required',...(state.credentials.length?{}:{authenticatorAttachment:'platform'})}});c.expected=options.challenge;challenges.set(c.id,c);return json(res,200,{id:c.id,options});
  }
  if(path==='/api/register/verify'){
   const c=take(s,b.id,'register');const v=await verifyRegistrationResponse({response:b.response,expectedChallenge:c.expected,expectedOrigin:origin,expectedRPID:'localhost',requireUserVerification:true});if(!v.verified)throw Error('Passkey registration failed');
   store.mutate('passkey_registered',st=>{const k=v.registrationInfo.credential;if(st.credentials.some(x=>x.id===k.id))throw Error('Passkey already registered');st.credentials.push({...k,publicKey:Buffer.from(k.publicKey).toString('base64'),deviceType:v.registrationInfo.credentialDeviceType,backedUp:v.registrationInfo.credentialBackedUp});return {credentialId:k.id,deviceType:v.registrationInfo.credentialDeviceType};});s.authenticated=true;return json(res,200,{verified:true});
  }
  if(path==='/api/auth/options'){
   const purpose=b.purpose;if(!['login','enroll','payment'].includes(purpose))throw Error('Invalid verification purpose');if(purpose!=='login')auth(s);if(!state.credentials.length)throw Error('Register a passkey first');let binding='',exclude=[];
   if(purpose==='payment'){const p=state.proposals.find(p=>p.id===b.proposalId&&p.status==='pending');if(!p)throw Error('Payment is no longer pending');const check=guard(state,p);if(!check.allowed)throw Error(check.reasons.join('; '));binding=snapshot(p);const progress=approvals.get(p.id);if(progress&&progress.sid===s.id&&progress.binding===binding&&progress.expires>Date.now())exclude=progress.credentials;else approvals.delete(p.id);}
   const allowed=state.credentials.filter(k=>!exclude.includes(k.id));if(!allowed.length)throw Error('This request needs a second, distinct passkey. Add another passkey in Safety first.');const c=newChallenge(s,purpose,binding);c.proposalId=b.proposalId;c.allowed=allowed.map(k=>k.id);const options=await generateAuthenticationOptions({rpID:'localhost',challenge:new TextEncoder().encode(c.signed),userVerification:'required',allowCredentials:allowed.map(k=>({id:k.id,transports:k.transports}))});c.expected=options.challenge;challenges.set(c.id,c);return json(res,200,{id:c.id,options});
  }
  if(path==='/api/auth/verify'){
   if(!['login','enroll','payment'].includes(b.purpose))throw Error('Invalid verification purpose');const c=take(s,b.id,b.purpose);const credential=store.read().credentials.find(k=>k.id===b.response?.id);if(!credential||!c.allowed.includes(credential.id))throw Error('Unrecognized passkey');
   const v=await verifyAuthenticationResponse({response:b.response,expectedChallenge:c.expected,expectedOrigin:origin,expectedRPID:'localhost',credential:{...credential,publicKey:new Uint8Array(Buffer.from(credential.publicKey,'base64'))},requireUserVerification:true});if(!v.verified)throw Error('Passkey verification failed');
   store.mutate('passkey_verified',st=>{st.credentials.find(k=>k.id===credential.id).counter=v.authenticationInfo.newCounter;return {purpose:c.purpose,credentialId:credential.id};});
   if(c.purpose==='login'){s.authenticated=true;return json(res,200,{verified:true});}
   if(c.purpose==='enroll'){s.enrollUntil=Date.now()+120000;return json(res,200,{verified:true});}
   auth(s);const current=store.read(),p=current.proposals.find(p=>p.id===c.proposalId&&p.status==='pending');if(!p||snapshot(p)!==c.binding)throw Error('Transaction changed; review and approve again');const check=guard(current,p);if(!check.allowed)throw Error(check.reasons.join('; '));let progress=approvals.get(p.id);if(!progress||progress.sid!==s.id||progress.binding!==c.binding||progress.expires<Date.now())progress={sid:s.id,binding:c.binding,credentials:[],expires:Date.now()+120000};if(!progress.credentials.includes(credential.id))progress.credentials.push(credential.id);approvals.set(p.id,progress);
   if(check.needsSecondDevice&&progress.credentials.length<2)return json(res,200,{verified:true,needsSecondPasskey:true,message:'A second distinct passkey must approve this flagged request.'});
   const receipt=store.mutate('payment_executed_after_webauthn',st=>{const pending=st.proposals.find(x=>x.id===p.id);if(!pending||snapshot(pending)!==c.binding)throw Error('Transaction changed');return {receipt:execute(st,p.id),approvalCredentialCount:progress.credentials.length,transactionHash:c.binding};});approvals.delete(p.id);return json(res,200,{verified:true,executed:true,...receipt});
  }
  auth(s);
  if(path==='/api/chat/new')return json(res,200,newConversation(store));
  if(path==='/api/chat')return json(res,200,await runChat(b,store));
  if(path==='/api/agent')return json(res,200,await runAgent(b.goal,store));
  if(path==='/api/budget/suggest')return json(res,200,suggestBudget({...state,skills:String(b.skills||'').slice(0,100)},b.month||month(),b.savingsMinor??state.savingsGoalMinor));
  if(path==='/api/budget/save'){if(!Number.isSafeInteger(b.limitMinor)||b.limitMinor<=0||!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month))throw Error('Invalid budget');return json(res,200,store.mutate('budget_saved',st=>{st.budgets[b.month]=b.limitMinor;return b;}));}
  if(path==='/api/draft')return json(res,200,store.mutate('manual_draft',st=>draft(st,b)));
  if(path==='/api/feedback')return json(res,200,store.mutate('agent_feedback',st=>feedback(st,b.proposalId,b.accepted,b.unsafe)));
  if(path==='/api/discard')return json(res,200,store.mutate('proposal_discarded',st=>{const p=st.proposals.find(p=>p.id===b.id&&p.status==='pending');if(!p)throw Error('No pending draft');p.status='discarded';return {id:p.id};}));
  if(path==='/api/cash'){const minor=amountToMinor(b.amount);if(!minor||!b.merchant?.trim())throw Error('Enter a positive amount and description');return json(res,200,store.mutate('cash_expense_added',st=>{const cash=st.accounts.find(a=>a.type==='cash'&&a.active);if(!cash)throw Error('Add a cash account first');const tx={id:uuid(),kind:'expense',merchant:String(b.merchant).slice(0,80),amountMinor:minor,accountId:cash.id,category:String(b.category||'Other').slice(0,40),status:'posted',source:'cash',date:day()};st.transactions.unshift(tx);return tx;}));}
  if(path==='/api/accounts/add'){if(!['bank','debit','credit','cash'].includes(b.type)||!b.name?.trim())throw Error('Invalid demo source');const minor=amountToMinor(b.amount||'0');if(minor===null)throw Error('Invalid demo amount');return json(res,200,store.mutate('demo_source_added',st=>{if(b.type==='debit'&&!st.accounts.some(a=>a.active&&a.type==='bank'&&a.id===b.linkedTo))throw Error('Select an active linked bank');const a={id:uuid(),name:String(b.name).slice(0,40),type:b.type,active:true,openingMinor:minor,creditLimitMinor:minor,linkedTo:b.linkedTo};st.accounts.push(a);return a;}));}
  if(path==='/api/accounts/archive')return json(res,200,store.mutate('demo_source_archived',st=>{const a=st.accounts.find(a=>a.id===b.id);if(!a)throw Error('Source not found');if(st.accounts.some(c=>c.active&&c.linkedTo===a.id))throw Error('Remove linked cards first');a.active=false;return {id:a.id};}));
  if(path==='/api/bills/extract')return json(res,200,await extractBill(b,dataDir));
  if(path==='/api/bills/save'){const minor=amountToMinor(b.amount);if(!minor||!b.payee?.trim()||!b.reference?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(b.dueDate))throw Error('Review all bill fields');return json(res,200,store.mutate('reviewed_bill_saved',st=>{if(st.bills.some(x=>x.reference===b.reference&&x.payee===b.payee))throw Error('Duplicate bill');const bill={id:uuid(),name:String(b.name||b.payee).slice(0,60),payee:String(b.payee).slice(0,80),amountMinor:minor,reference:String(b.reference).slice(0,80),dueDate:b.dueDate,category:'Utilities',status:'unpaid',source:'user-reviewed extraction'};st.bills.unshift(bill);return bill;}));}
  if(path==='/api/alerts/mock')return json(res,200,store.mutate('mock_unknown_card_request',st=>{const p=draft(st,{kind:'card',accountId:'debit',payee:'Unknown Online Shop',amountMinor:489000});return p;}));
  if(path==='/api/alerts/block')return json(res,200,store.mutate('request_blocked',st=>{const a=st.alerts.find(a=>a.id===b.id&&a.status==='open');if(!a)throw Error('Alert not found');a.status='blocked';const p=st.proposals.find(p=>p.id===a.proposalId);if(p?.status==='pending')p.status='blocked';return a;}));
  return json(res,404,{error:'Unknown endpoint'});
 }
 const files={'/':'index.html','/app.js':'app.js','/chat-format.mjs':'chat-format.mjs','/styles.css':'styles.css','/webauthn.js':'node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js'};
 if(req.method!=='GET'||!files[path])return json(res,404,{error:'Not found'});
 const content=await readFile(join(root,files[path]));res.writeHead(200,{'Content-Type':path.endsWith('.css')?'text/css':(path.endsWith('.js')||path.endsWith('.mjs'))?'text/javascript':'text/html','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});res.end(content);
}
const server=createServer((req,res)=>handle(req,res).catch(e=>{if(!res.headersSent)json(res,400,{error:e.message});else res.end();}));
server.listen(port,'127.0.0.1',()=>console.log(`Nirob Agent: ${origin} · synthetic payments only`));
const timer=setInterval(()=>{const st=store.read();if(trust(st).tier<1)return;const due=st.bills.filter(b=>b.status==='unpaid'&&st.knownPayees.includes(b.payee)&&b.dueDate>=day()&&new Date(b.dueDate)-new Date(day())<=10*86400000&&!st.proposals.some(p=>p.billId===b.id&&p.status==='pending'));if(due.length)try{store.mutate('scheduler_drafts',s=>due.map(b=>draft(s,{billId:b.id},'scheduler')));}catch{}},60000);timer.unref();
