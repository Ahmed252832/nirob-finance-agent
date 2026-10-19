import {mkdirSync,copyFileSync} from 'node:fs';import {resolve,dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
import {openStore} from '../store.mjs';import {day,accountBalance} from '../domain.mjs';import {addDemoHistory} from '../demo-history.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),data=process.env.NIROB_DATA_DIR||join(root,'data');
const backup=resolve(root,'../../work/history-coaching/backups',new Date().toISOString().replace(/[:.]/g,'-'));
const st=openStore(data);
try{
 if(st.read().demoHistory?.version===1){console.log(JSON.stringify({alreadyInstalled:true,...st.read().demoHistory}));}
 else{
  mkdirSync(backup,{recursive:true});st.db.prepare('VACUUM INTO ?').run(join(backup,'nirob.sqlite'));copyFileSync(join(data,'audit.key'),join(backup,'audit.key'));
  const result=st.mutate('synthetic_history_installed',s=>{
   const prior={credentials:JSON.stringify(s.credentials),feedback:JSON.stringify(s.feedback),bills:JSON.stringify(s.bills),transactions:new Map(s.transactions.map(t=>[t.id,JSON.stringify(t)])),balances:new Map(s.accounts.filter(a=>a.active).map(a=>[a.id,accountBalance(a,s.transactions,s.accounts)]))};
   const installed=addDemoHistory(s,day());
   if(JSON.stringify(s.credentials)!==prior.credentials||JSON.stringify(s.feedback)!==prior.feedback||JSON.stringify(s.bills)!==prior.bills)throw Error('Protected state changed');
   for(const t of s.transactions)if(prior.transactions.has(t.id)&&JSON.stringify(t)!==prior.transactions.get(t.id))throw Error('Existing transaction changed');
   for(const [id,balance]of prior.balances)if(!Object.is(balance,accountBalance(s.accounts.find(a=>a.id===id),s.transactions,s.accounts)))throw Error('Current balance changed');
   return {...installed,synthetic:true,currentBalancesPreserved:true,credentialsPreserved:true,trustPreserved:true};
  });
  console.log(JSON.stringify({...result,auditValid:st.verify(),privateBackup:backup},null,2));
 }
}finally{st.close();}
