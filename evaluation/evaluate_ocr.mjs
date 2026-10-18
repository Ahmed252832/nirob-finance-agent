import {extractBill} from '../ocr.mjs';import {readFile,writeFile} from 'node:fs/promises';
const rows=[];for(const name of ['sample_bill.pdf','sample_bill.png']){const r=await extractBill({name,base64:(await readFile('evidence/'+name)).toString('base64')},'data/ocr-evaluation');const passed=r.fields.payee==='City Gas Demo'&&r.fields.amount==='1250.50'&&r.fields.reference==='GAS-DEMO-018'&&r.fields.dueDate==='2026-10-28';rows.push({name,passed,...r});console.log(passed?'PASS':'FAIL',name,r.fields,r.confidence);}
await writeFile('evidence/ocr-evaluation.json',JSON.stringify(rows,null,2));
