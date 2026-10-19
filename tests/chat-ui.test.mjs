import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';import {randomUUID} from 'node:crypto';import {seed} from '../domain.mjs';import {formatChatText} from '../chat-format.mjs';
async function harness(){
 const s={...seed(),csrf:'fixture',authenticated:true,credentialCount:1,chats:[],audit:[],auditValid:true,trust:{tier:0,total:0,successes:0,lower:0,source:'test'}};
 const nodes=new Map();const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',classList:{toggle(){},add(){},remove(){}},scrollTop:0,scrollHeight:100,focus(){}});return nodes.get(selector);};
 const requests=[];let release;
 const sandbox={formatChatText,Intl,Date,console,crypto:{randomUUID},sessionStorage:{getItem:()=>null,setItem(){}},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},navigator:{clipboard:{writeText:async()=>{}}},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:fn=>fn(),fetch:async(url,options)=>{
  const body=options?.body?JSON.parse(options.body):null;requests.push({url,body});
  if(url==='/api/chat/new'){s.chats.unshift({id:'chat-fixture',title:'New conversation',messages:[]});return {ok:true,json:async()=>({id:'chat-fixture'})};}
  if(url==='/api/chat'){await new Promise(r=>{release=()=>{const c=s.chats[0];c.messages.push({id:'u',role:'user',content:body.message,status:'complete',requestId:body.requestId},{id:'a',role:'assistant',content:'Try a **tutoring** trial.',status:'complete',requestId:body.requestId});r();};});return {ok:true,json:async()=>({conversationId:'chat-fixture'})};}
  return {ok:true,json:async()=>structuredClone(s)};
 }};
 const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import [^\r\n]*\r?\n/,'');
 const app=await vm.runInNewContext(`(async()=>{${source}\nreturn {openChat:()=>{view='agent';render()},sendChat};})()`,sandbox);
 return {app,node,requests,release:()=>release(),isWaiting:()=>!!release};
}
test('chat view renders a composer and suggestions instead of raw tool logs',async()=>{const h=await harness();h.app.openChat();const html=h.node('#main').innerHTML;assert.match(html,/Talk to Nirob/);assert.match(html,/id="chat-form"/);assert.match(html,/A business idea/);assert.ok(!html.includes('Agent execution trace'));assert.ok(!html.includes('Inspect tool observations'));});
test('sending a first message shows waiting feedback then the persisted conversation',async()=>{const h=await harness();h.app.openChat();const task=h.app.sendChat('I want a business idea');for(let i=0;i<20&&!h.isWaiting();i++)await new Promise(r=>setTimeout(r,0));assert.equal(h.isWaiting(),true);assert.match(h.node('#main').innerHTML,/Reading your message/);h.release();await task;const html=h.node('#main').innerHTML;assert.match(html,/I want a business idea/);assert.match(html,/<strong>tutoring<\/strong>/);assert.equal(h.requests.filter(r=>r.url==='/api/chat').length,1);});
