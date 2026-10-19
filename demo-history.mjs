// Synthetic records only. Separate archived sources preserve current spending balances.
export const HISTORY_SOURCE='synthetic seven-month history';
export function addDemoHistory(state,asOf){
 if(state.demoHistory?.version===1)return {added:0,months:state.demoHistory.months};
 if(!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(asOf))throw Error('Invalid history anchor date');
 const anchor=new Date(asOf.slice(0,7)+'-01T00:00:00Z'),months=[];
 const bank='history-demo-bank',cash='history-demo-cash';
 if(state.accounts.some(a=>[bank,cash].includes(a.id)))throw Error('Historical demo source IDs already exist');
 const rows=[];
 for(let i=0;i<7;i++){
  const d=new Date(anchor);d.setUTCMonth(d.getUTCMonth()-7+i);const m=d.toISOString().slice(0,7);months.push(m);
  const entries=[
   ['Salary demo','Income','income',[58000,58000,60000,62000,65000,68000,68000][i],2,bank],
   ['Rent demo','Housing','expense',18000,3,bank],
   ['Groceries demo','Groceries','expense',[6900,7200,7600,7400,8100,7900,8200][i],7,bank],
   ['Electricity demo','Utilities','expense',[1700,1900,2300,2500,2400,2200,2100][i],12,bank],
   ['Internet demo','Utilities','expense',1250,13,bank],
   ['Transport cash demo','Transport','expense',[2100,2300,2400,2200,2500,2300,2400][i],15,cash],
   ['Dining demo','Dining','expense',[1800,2200,2600,3000,3600,4100,4500][i],18,bank],
   ['Subscriptions demo','Subscriptions','expense',i<3?590:990,20,bank],
   ['Learning supplies demo','Education','expense',[800,600,1200,700,900,600,800][i],21,cash],
   ['Health demo','Health','expense',i===4?6200:600,23,bank],
   ['Shopping demo','Shopping','expense',[1100,1600,800,2300,1400,1800,1200][i],25,bank]
  ];
  entries.forEach(([merchant,category,kind,taka,date,accountId],j)=>rows.push({id:`demo-history-v1-${m}-${j}`,merchant,category,kind,amountMinor:taka*100,date:`${m}-${String(date).padStart(2,'0')}`,accountId,status:'posted',source:HISTORY_SOURCE,synthetic:true}));
 }
 state.accounts.push({id:bank,name:'Archived synthetic history bank',type:'bank',active:false,openingMinor:0,synthetic:true},{id:cash,name:'Archived synthetic history cash',type:'cash',active:false,openingMinor:10000000,synthetic:true});
 state.transactions.push(...rows);state.transactions.sort((a,b)=>b.date.localeCompare(a.date));
 state.demoHistory={version:1,months,rows:rows.length,installedAt:new Date().toISOString(),asOf,description:'Seven complete synthetic months in separate archived accounts. Current balances, trust and credentials are unchanged.'};
 return {added:rows.length,months};
}
