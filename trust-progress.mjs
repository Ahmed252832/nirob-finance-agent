import {trust} from './domain.mjs';
import {trustTier} from './logic.mjs';
export const TRUST_REQUIREMENTS=[{tier:1,total:20,lower:0.8},{tier:2,total:40,lower:0.9},{tier:3,total:80,lower:0.95}];
export function trustProgress(state,scope='bill'){
 const current=trust(state,scope),unsafe=state.feedback.some(f=>f.scope===scope&&f.unsafe);
 const next=TRUST_REQUIREMENTS.find(r=>r.tier>current.tier)||null;let cleanReviewsNeeded=null;
 if(next&&!unsafe){for(let n=0;n<=10000;n++){if(trustTier(current.successes+n,current.total+n)>=next.tier){cleanReviewsNeeded=n;break;}}}
 return {...current,unsafe,next,cleanReviewsNeeded,capability:scope==='bill'&&current.tier>=1&&!unsafe?'May schedule preparation of known upcoming bills. Final payment always needs passkey approval.':'Preparation on request. Final payment always needs passkey approval.'};
}
