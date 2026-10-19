import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,createHmac} from 'node:crypto';
import {seed} from './domain.mjs';
export function openStore(directory){mkdirSync(directory,{recursive:true});const keyPath=join(directory,'audit.key');if(!existsSync(keyPath))writeFileSync(keyPath,randomBytes(32),{mode:0o600});const key=readFileSync(keyPath);const db=new DatabaseSync(join(directory,'nirob.sqlite'));db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS audit (seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT,event TEXT,data TEXT,prev TEXT,hash TEXT);');if(!db.prepare('SELECT id FROM state').get())db.prepare('INSERT INTO state VALUES(1,?)').run(JSON.stringify(seed()));
 const read=()=>JSON.parse(db.prepare('SELECT json FROM state WHERE id=1').get().json);
 const sign=text=>createHmac('sha256',key).update(text).digest('base64url');
 const audit=()=>db.prepare('SELECT * FROM audit ORDER BY seq').all();
 const verify=()=>{let prev='GENESIS';for(const row of audit()){if(row.prev!==prev||row.hash!==sign(JSON.stringify([row.at,row.event,row.data,row.prev])))return false;prev=row.hash;}return true;};
 function mutate(event,fn){db.exec('BEGIN IMMEDIATE');try{if(!verify())throw Error('Audit integrity check failed; writes are locked');const state=read();const value=fn(state);db.prepare('UPDATE state SET json=? WHERE id=1').run(JSON.stringify(state));const at=new Date().toISOString(),data=JSON.stringify(value??{}),prev=db.prepare('SELECT hash FROM audit ORDER BY seq DESC LIMIT 1').get()?.hash||'GENESIS';const hash=sign(JSON.stringify([at,event,data,prev]));db.prepare('INSERT INTO audit(at,event,data,prev,hash) VALUES(?,?,?,?,?)').run(at,event,data,prev,hash);db.exec('COMMIT');return value;}catch(e){db.exec('ROLLBACK');throw e;}}
 function replaceWorkspace(next,event){db.exec('PRAGMA secure_delete=ON; BEGIN IMMEDIATE');try{db.exec("DELETE FROM audit; DELETE FROM sqlite_sequence WHERE name='audit'");db.prepare('UPDATE state SET json=? WHERE id=1').run(JSON.stringify(next));const at=new Date().toISOString(),data=JSON.stringify({workspaceReplaced:true}),prev='GENESIS';db.prepare('INSERT INTO audit(at,event,data,prev,hash) VALUES(?,?,?,?,?)').run(at,event,data,prev,sign(JSON.stringify([at,event,data,prev])));db.exec('COMMIT');db.exec('PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE)');}catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}}
 return {read,mutate,audit,verify,sign,replaceWorkspace,close:()=>db.close(),db};
}
