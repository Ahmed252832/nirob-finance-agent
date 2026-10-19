export function weeklyHours(message,history){
 const userTexts=[...history.filter(m=>m.role==='user').map(m=>m.content),message].join('\n');
 const weekly=[...userTexts.matchAll(/(\d+(?:\.\d+)?)\s*hours?\s+(?:a|per|each)\s+week/ig)].at(-1)?.[1];
 const explicit=/within\s+(?:my\s+)?(\d+(?:\.\d+)?)\s*hours?/i.exec(message)?.[1];
 const value=explicit??weekly;return value===undefined?null:Number(value);
}
export function checkedWeeklyPlan(answer,message,history){
 const hours=weeklyHours(message,history);
 if(!/first.?week|week.?one|7.?day|seven.?day/i.test(message)||hours===null)return {answer,check:null};
 if(hours<=0||hours>168)return {answer:{summary:'Please choose a realistic weekly time allowance before planning tasks.',steps:[],question:'How many hours can you set aside in a week?'},check:{status:'clarification_required',hours}};
 if(!answer.steps.length)return {answer,check:null};
 const minutes=Math.floor(hours*60),base=Math.floor(minutes/answer.steps.length);let remaining=minutes;
 const steps=answer.steps.map((step,i)=>{
  const allocated=i===answer.steps.length-1?remaining:base;remaining-=allocated;
  // Scheduling is computed by the application, not accepted as model arithmetic.
  const clean=step.replace(/\(?\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)\b\)?/gi,'').replace(/\(\s*\)/g,'').replace(/\s*[:;–-]\s*[.!]?\s*$/,'').replace(/[.\s]+$/,'').trim();
  return `${clean}. Time allowance: **${allocated} minutes**.`;
 });
 return {answer:{...answer,steps},check:{status:'computed',hours,totalMinutes:minutes,stepMinutes:steps.map((_,i)=>i===steps.length-1?minutes-base*(steps.length-1):base)}};
}
