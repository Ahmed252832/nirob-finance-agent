import {spawn,execFile} from 'node:child_process';import {existsSync,mkdirSync,writeFileSync,readFileSync,openSync} from 'node:fs';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {randomBytes} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url));process.chdir(root);const data=join(root,'data');mkdirSync(data,{recursive:true});const key=join(data,'model.key');if(!existsSync(key))writeFileSync(key,randomBytes(32).toString('hex'),{mode:0o600});
const binary=join(root,'runtime','llama','llama-server.exe'),model=join(root,'runtime','model.gguf');
if(!existsSync(binary)||!existsSync(model)){console.error('The full Windows runtime is missing. Use the complete app package.');process.exit(1);}
const log=openSync(join(data,'model.log'),'a');const children=[];
const ai=spawn(binary,['-m',model,'--host','127.0.0.1','--port','8088','-c','4096','-t','4','--parallel','1','--api-key-file',key,'--cors-origins','http://localhost:4177'],{windowsHide:true,stdio:['ignore',log,log]});children.push(ai);
console.log('Starting the local model. The first launch may take a moment…');
let ready=false;for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:8088/health',{headers:{Authorization:'Bearer '+readFileSync(key,'utf8').trim()},signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}
if(!ready){ai.kill();console.error('Model did not start. See data/model.log.');process.exit(1);}
const app=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,NIROB_MODEL_KEY_FILE:key},stdio:'inherit',windowsHide:true});children.push(app);
app.on('exit',()=>{ai.kill();});const stop=()=>{children.forEach(p=>p.kill());process.exit();};process.on('SIGINT',stop);process.on('SIGTERM',stop);process.on('exit',()=>children.forEach(p=>p.kill()));
setTimeout(()=>execFile('cmd.exe',['/c','start','','http://localhost:4177'],{windowsHide:true},()=>{}),1500);
