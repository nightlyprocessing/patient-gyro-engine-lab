import {BUILD,SPAWNS,move,npcAt} from './world.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function snapshot(db,room){
 const r=await db.prepare('SELECT * FROM rooms WHERE id=?').bind(room).first();if(!r)return null;
 const now=Date.now();const ps=await db.prepare('SELECT id,slot,x,z,yaw,seq FROM players WHERE room=? AND heartbeat>? ORDER BY slot').bind(room,now-15000).all();
 return {build:BUILD,room,serverTime:now,created:r.created,players:ps.results,npc:npcAt(r.created,now),hatch:!!r.hatch,grill:!!r.grill,served:r.served,message:r.message,messageAt:r.message_at};
}
export async function api(request,env){
 const url=new URL(request.url),db=env.DB;
 if(url.pathname==='/api/health')return json({build:BUILD,storage:!!db,transport:'HTTPS snapshots',maxPlayers:2});
 if(!db)return json({error:'Shared session storage is unavailable.'},503);
 if(request.method!=='POST')return json({error:'Use POST.'},405);
 if(request.headers.get('Origin')&&new URL(request.headers.get('Origin')).host!==url.host)return json({error:'Origin rejected.'},403);
 if(Number(request.headers.get('Content-Length')||0)>2048)return json({error:'Request too large.'},413);
 let b;try{const raw=await request.text();if(raw.length>2048)return json({error:'Request too large.'},413);b=JSON.parse(raw);}catch{return json({error:'Invalid request.'},400);}
 if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'Invalid request.'},400);
 const now=Date.now();
 if(url.pathname==='/api/join'){
  if(b.room!==undefined&&typeof b.room!=='string')return json({error:'Enter a six-character room code.'},400);
  const room=(b.room||crypto.randomUUID().replaceAll('-','').slice(0,6)).toUpperCase();if(!/^[A-Z0-9]{6}$/.test(room))return json({error:'Enter a six-character room code.'},400);
  await db.batch([db.prepare('DELETE FROM players WHERE heartbeat<?').bind(now-15000),db.prepare('DELETE FROM rooms WHERE created<? AND id NOT IN (SELECT room FROM players)').bind(now-86400000),db.prepare('INSERT OR IGNORE INTO rooms (id,created) VALUES (?,?)').bind(room,now)]);
  const id=crypto.randomUUID(),token=crypto.randomUUID();
  for(let slot=1;slot<=2;slot++){
   const p=SPAWNS[slot-1];
   try{await db.prepare('INSERT INTO players (id,room,slot,token,x,z,yaw,heartbeat,last_input) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,room,slot,token,p.x,p.z,p.yaw,now,now).run();return json({id,token,slot,state:await snapshot(db,room)});}catch(e){if(!String(e).includes('UNIQUE'))throw e;}
  }
  return json({error:'Both places are taken. Create another room or wait for a player to leave.'},409);
 }
 if(typeof b.token!=='string'||b.token.length>60)return json({error:'Session expired. Enter again.'},401);
 const p=await db.prepare('SELECT * FROM players WHERE token=? AND heartbeat>?').bind(b.token,now-15000).first();if(!p)return json({error:'Session expired. Enter again.'},401);
 if(url.pathname==='/api/leave'){await db.prepare('DELETE FROM players WHERE token=?').bind(b.token).run();return json({left:true});}
 if(url.pathname!=='/api/tick')return json({error:'Not found.'},404);
 if(!Number.isSafeInteger(b.seq)||b.seq<=p.seq)return json({error:'Stale input.'},409);
 if(![b.dx,b.dz,b.yaw].every(Number.isFinite))return json({error:'Invalid movement.'},400);
 const next=move(p,b.dx,b.dz,(now-p.last_input)/1000,!!b.sprint);
 const updated=await db.prepare('UPDATE players SET x=?,z=?,yaw=?,heartbeat=?,last_input=?,seq=? WHERE token=? AND seq=?').bind(next.x,next.z,b.yaw,now,now,b.seq,b.token,p.seq).run();if(!updated.meta.changes)return json({error:'Stale input.'},409);
 if(['hatch','grill','talk'].includes(b.action)){
  const r=await db.prepare('SELECT * FROM rooms WHERE id=?').bind(p.room).first();const npc=npcAt(r.created,now);
  const target=b.action==='hatch'?{x:2.2,z:-1.4}:b.action==='grill'?{x:-.9,z:1}:npc;
  if(Math.hypot(next.x-target.x,next.z-target.z)<2.4){
   if(b.action==='talk')await db.prepare('UPDATE rooms SET served=served+1,message=?,message_at=? WHERE id=?').bind('Customer: One gyro, extra tzatziki. This place smells incredible!',now,p.room).run();
   else {const field=b.action==='hatch'?'hatch':'grill';await db.prepare('UPDATE rooms SET '+field+'=1-'+field+',message=?,message_at=? WHERE id=?').bind(field==='hatch'?'Serving window adjusted.':'Grill switched.',now,p.room).run();}
  }
 }
 return json(await snapshot(db,p.room));
}
