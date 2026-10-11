import {Engine} from '@babylonjs/core/Engines/engine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color.js';
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera.js';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight.js';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight.js';
import {PointLight} from '@babylonjs/core/Lights/pointLight.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator.js';
import {BUILD,SPAWNS,move,npcAt} from './world.js';
const $=id=>document.getElementById(id),canvas=$('view'),touch=matchMedia('(pointer:coarse)').matches,bootStart=performance.now();
let engine,scene,camera,active=false,network=null,world={created:Date.now(),hatch:true,grill:true,served:0},yaw=-Math.PI/2,pitch=0,position={x:6,z:-1},jumpY=0,jumpV=0,action=null,quality=touch?'low':'high',muted=false,lastMsg=0,lastFrame=performance.now(),frames=[],rtt=[],measurementStart=0;
let audio,master,sources=[],shadow,hatch,customer,remote=null,remoteID=null,remoteTarget=null,stepTimer=0;
const keys=new Set();let stick={x:0,y:0},moveID=null,lookID=null,lookLast=null,metricsVisible=false;
const toast=text=>{$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,6000);};
function mat(name,color,emissive=false){const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=new Color3(.12,.12,.12);if(emissive)m.emissiveColor=m.diffuseColor.scale(.8);return m;}
let mats={};
function box(name,x,y,z,w,h,d,m,cast=false){const mesh=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);mesh.position.set(x,y,z);mesh.material=m;mesh.receiveShadows=true;if(cast)shadow?.addShadowCaster(mesh);return mesh;}
function cylinder(name,x,y,z,d,h,m){const mesh=MeshBuilder.CreateCylinder(name,{diameter:d,height:h,tessellation:16},scene);mesh.position.set(x,y,z);mesh.material=m;mesh.receiveShadows=true;return mesh;}
function sign(text,x,y,z,w,h,color='#fff1cf',background='#214f43',rot=Math.PI/2){
 const texture=new DynamicTexture('sign '+text,{width:1024,height:256},scene,false);const c=texture.getContext();c.fillStyle=background;c.fillRect(0,0,1024,256);c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='bold '+(text.length>18?'64':'95')+'px Georgia';c.fillText(text,512,132);texture.update();const material=mat('lettering '+text,'#ffffff');material.diffuseTexture=texture;material.emissiveColor=new Color3(.15,.13,.1);const p=MeshBuilder.CreatePlane('sign '+text,{width:w,height:h,sideOrientation:Mesh.DOUBLESIDE},scene);p.position.set(x,y,z);p.rotation.y=rot;p.material=material;return p;
}
function character(name,color){
 const root=new TransformNode(name,scene);const shirt=mat(name+' shirt',color),skin=mats.skin;
 const parts=[];function part(n,x,y,z,w,h,d,m){const p=box(name+n,x,y,z,w,h,d,m,true);p.parent=root;parts.push(p);return p;}
 part(' torso',0,1.02,0,.48,.62,.28,shirt);part(' head',0,1.57,0,.29,.34,.3,skin);part(' hair',0,1.75,-.02,.31,.12,.3,mats.hair);part(' nose',0,1.58,.17,.08,.09,.08,skin);
 for(const x of [-.08,.08])part(' eye',x,1.62,.155,.03,.025,.01,mats.black);
 const legs=[part(' left leg',-.13,.42,0,.18,.73,.19,mats.denim),part(' right leg',.13,.42,0,.18,.73,.19,mats.denim)];
 const arms=[part(' left arm',-.34,1.03,0,.15,.57,.17,shirt),part(' right arm',.34,1.03,0,.15,.57,.17,shirt)];
 for(const x of [-.13,.13])part(' shoe',x,.07,.07,.22,.13,.36,mats.black);
 root.legs=legs;root.arms=arms;root.parts=parts;return root;
}
function animateCharacter(root,walking,time){const swing=walking?Math.sin(time*8)*.26:0;root.legs[0].rotation.x=swing;root.legs[1].rotation.x=-swing;root.arms[0].rotation.x=-swing;root.arms[1].rotation.x=swing;}
function makeScene(){
 engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'});scene=new Scene(engine);scene.clearColor=new Color4(.78,.7,.56,1);scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.014;scene.fogColor=new Color3(.74,.7,.62);
 camera=new UniversalCamera('eyes',new Vector3(6,1.75,-1),scene);camera.inputs.clear();camera.minZ=.06;camera.maxZ=130;camera.fov=1.15;scene.activeCamera=camera;
 const hemi=new HemisphericLight('sky',new Vector3(0,1,0),scene);hemi.intensity=.85;hemi.groundColor=new Color3(.23,.28,.26);
 const sun=new DirectionalLight('sun',new Vector3(.7,-.65,-.5),scene);sun.position.set(-25,28,25);sun.intensity=1.25;sun.diffuse=new Color3(1,.79,.53);shadow=new ShadowGenerator(1024,sun);shadow.usePercentageCloserFiltering=true;shadow.filteringQuality=ShadowGenerator.QUALITY_LOW;shadow.bias=.001;
 for(const [name,color] of Object.entries({green:'#28584b',cream:'#e7ddbd',copper:'#b9673f',black:'#202725',metal:'#afb7ac',denim:'#465767',skin:'#c99470',hair:'#352823',concrete:'#a29986',road:'#454d4b',wood:'#946141',brick:'#8c6853',glass:'#6b8d8b',window:'#e9bc77',leaf:'#596b41',grill:'#393d36'}))mats[name]=mat(name,color,name==='window');
 const asphalt=new DynamicTexture('original asphalt',{width:256,height:256},scene,false);const ctx=asphalt.getContext();ctx.fillStyle='#48504d';ctx.fillRect(0,0,256,256);let seed=17;for(let i=0;i<7000;i++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;ctx.fillStyle=i%2?'#535954':'#3e4744';ctx.fillRect(x,seed%256,1,1);}asphalt.update();asphalt.uScale=10;asphalt.vScale=10;mats.road.diffuseTexture=asphalt;
 const ground=box('courtyard',0,-.16,0,55,.25,55,mats.road);ground.receiveShadows=true;
 box('sidewalk rear',0,-.015,-9.1,34,.24,2,mats.concrete);box('sidewalk front',0,-.015,9.1,34,.24,2,mats.concrete);box('sidewalk left',-9,-.015,0,2,.24,20,mats.concrete);
 for(let z=-8;z<9;z+=2.1)box('road dash',10.5,-.02,z,.12,.025,.95,mats.cream);
 for(const z of [-8.05,8.05])box('curb',0,.09,z,30,.18,.2,mats.cream);
 // Original truck body. Rear doorway remains open, with a walkable floor.
 box('truck floor',0,.04,0,4,.08,8,mats.metal);box('truck roof',0,3.17,0,4.12,.15,8.25,mats.cream,true);
 box('driver side',-1.9,1.55,0,.18,3.05,8,mats.green,true);box('front cab',0,1.45,4,4,2.9,.2,mats.green,true);
 for(const x of [-1.35,1.35])box('rear doorway jamb',x,1.5,-4,1.3,3,.2,mats.green,true);
 box('rear door lintel',0,2.82,-4,1.4,.35,.2,mats.cream);box('rear step',0,.015,-4.3,1.3,.04,.6,mats.metal);
 box('serving side lower',1.9,.56,0,.18,1.05,8,mats.green,true);box('serving side upper',1.9,2.7,0,.18,.85,8,mats.cream,true);
 for(const z of [-2.85,2.85])box('serving side panel',1.9,1.65,z,.18,1.18,2.3,mats.cream,true);
 box('copper trim',1.99,1.05,0,.07,.07,8,mats.copper);box('serving counter',2.16,1.04,0,.72,.09,3.6,mats.wood,true);
 hatch=box('serving shutter',1.97,1.72,0,.09,1.27,3.42,mats.cream);hatch.isVisible=false;
 const awning=box('striped awning',2.6,2.53,0,1.5,.09,4.2,mats.copper,true);awning.rotation.z=-.08;
 for(let z=-1.9;z<=2;z+=.42)box('awning stripe',2.6,2.59,z,1.5,.015,.16,mats.cream).rotation.z=-.08;
 sign('PATIENT GYRO',2.015,2.84,0,3.65,.54);sign('GOOD FOOD. LATE HOURS.',2.025,.56,0,3.4,.37,'#fff0c9','#28584b');
 sign('OPEN LATE',2.03,1.7,-2.8,1.15,.44,'#ffbd70','#193a31');sign('GYRO  /  8',2.03,1.62,2.8,1.25,.45,'#193a31','#e7ddbd');
 for(const z of [-2.7,2.7])for(const x of [-2,2]){const wheel=cylinder('tire',x,.36,z,.72,.18,mats.black);wheel.rotation.z=Math.PI/2;const hub=cylinder('wheel hub',x*1.015,.36,z,.36,.2,mats.metal);hub.rotation.z=Math.PI/2;}
 for(const x of [-1.4,1.4])box('front light',x,.65,4.14,.55,.26,.05,mats.window);box('front windshield',0,2.17,4.13,2.8,.7,.035,mats.glass);box('bumper',0,.26,4.15,3.8,.15,.2,mats.metal);
 // Kitchen, readable through the window and accessible from the rear.
 box('left prep counter',-1.18,.88,.4,1.06,1,6,mats.metal);box('counter worktop',-1.18,1.41,.4,1.14,.09,6.1,mats.cream);
 box('right cooler',1.2,.85,2.65,1.05,1.6,1.65,mats.cream);box('cooler handle',.65,1.1,2.65,.035,.42,.045,mats.black);
 box('grill',-.98,1.51,1,1.03,.13,1.5,mats.grill);for(let z=.4;z<1.7;z+=.13)box('grill bar',-.98,1.6,z,1,.02,.025,mats.metal);
 for(let i=0;i<4;i++){const food=cylinder('gyro ingredient',-1.2+(i%2)*.3,1.66,.75+Math.floor(i/2)*.4,.19,.045,mats.copper);food.rotation.z=.1;}
 box('chopping board',-1.05,1.49,-.6,.75,.045,.63,mats.wood);box('knife',-1.0,1.53,-.65,.04,.025,.42,mats.metal);
 for(let i=0;i<3;i++){const bowl=cylinder('ingredient bowl',-1.3+i*.22,1.54,-1.5,.18,.12,[mats.cream,mats.leaf,mats.copper][i]);}
 box('extraction hood',-1.08,2.63,1,1.3,.4,1.8,mats.metal);for(let z=.4;z<1.8;z+=.18)box('hood vent',-.4,2.66,z,.014,.17,.05,mats.black);
 box('shelf',-1.5,2.13,-1.5,.6,.07,2,mats.wood);for(let i=0;i<5;i++)cylinder('spice jar',-1.45,2.25,-2.2+i*.3,.14,.2,mats.cream);
 const bulb=new PointLight('kitchen light',new Vector3(0,2.65,0),scene);bulb.diffuse=new Color3(1,.82,.55);bulb.intensity=1.1;bulb.range=7;box('ceiling light',0,3.04,0,.65,.04,.6,mats.window);
 // Generator and patio tables.
 box('generator',-4.1,.51,1.9,1.3,.9,1.3,mats.copper,true);box('generator top',-4.1,1.03,1.9,1.3,.12,1.3,mats.black);for(let z=1.5;z<2.3;z+=.12)box('generator vent',-3.44,.6,z,.01,.4,.045,mats.black);
 for(const z of [-5.8,5.8]){box('picnic table',8,.87,z,2.8,.13,1.5,mats.wood,true);for(const x of [7.05,8.95])box('table leg',x,.43,z,.13,.8,1.05,mats.black);for(const zz of [z-1.0,z+1.0]){box('bench',8,.48,zz,2.8,.12,.36,mats.wood,true);for(const x of [7,9])box('bench foot',x,.22,zz,.12,.42,.24,mats.black);}}
 // Office and apartment facades create an outdoor streetscape.
 for(let i=0;i<7;i++){const x=-12+i*4.4,h=9+(i%3)*2.4;const material=i%2?mats.brick:mats.concrete;box('apartment facade',x,h/2,-12.5,4.25,h,5,material);box('roof cornice',x,h,-9.97,4.35,.28,.3,mats.cream);
  for(let row=0;row<Math.floor(h/2.3);row++)for(let col=0;col<3;col++){const wx=x+(col-1)*1.1,wy=1.4+row*2.2;box('window frame',wx,wy,-9.96,.87,1.3,.06,mats.cream);box('apartment glass',wx,wy,-9.91,.69,1.12,.05,(row+col+i)%3?mats.glass:mats.window);box('window sill',wx,wy-.64,-9.82,.95,.08,.23,mats.cream);}
  if(i===4)sign('CORNER COFFEE',x,1.08,-9.83,3.9,.6,'#ffe7b7','#6a4637',0);
 }
 for(let i=0;i<4;i++){const x=-10+i*7.3,h=13+(i%2)*5;box('office building',x,h/2,13.5,7,h,7,mats.concrete);for(let row=0;row<6;row++)for(let col=0;col<5;col++){box('office glass',x+(col-2)*1.22,1.5+row*2.2,9.97,1.04,1.6,.04,(row+col)%4?mats.glass:mats.window);}box('office band',x,3.0,9.9,7.1,.28,.1,mats.green);}
 for(let i=0;i<3;i++)box('side building',-13,6+i*2,-6+i*7,6,12+i*4,6,mats.brick);
 // Trees, lamps, cable lights, and a distant car.
 for(const z of [-7,6.8]){cylinder('tree trunk',-7,.95,z,.23,2,mats.wood);for(let i=0;i<3;i++){const leaf=MeshBuilder.CreateIcoSphere('tree foliage',{radius:1.1,subdivisions:1},scene);leaf.position.set(-7+(i-1)*.4,2.7+(i%2)*.6,z);leaf.material=mats.leaf;shadow.addShadowCaster(leaf);}box('tree planter',-7,.15,z,1.6,.3,1.6,mats.concrete);}
 for(const z of [-7.6,7.6]){cylinder('lamp post',5,2.4,z,.12,4.8,mats.black);box('lamp arm',5.35,4.76,z,.8,.09,.09,mats.black);box('street lamp',5.7,4.67,z,.5,.08,.35,mats.window);}
 for(let z=-3;z<4;z++){cylinder('festoon bulb',3.6,2.92,z,.095,.12,mats.window);box('light cable',3.6,3.0,z,.015,.015,1,mats.black);}
 box('parked car',10.8,.58,-8,1.4,.9,3.7,mats.green);box('car cabin',10.8,1.2,-7.9,1.27,.6,1.85,mats.glass);
 customer=character('customer','#b16843');customer.position.set(4.35,0,0);customer.rotation.y=-Math.PI/2;
 // A few warm emissive geometry pieces make the scene feel lived in without heavy postprocessing.
 for(const mesh of scene.meshes)if(!mesh.parent&&mesh!==hatch)mesh.freezeWorldMatrix();
 setQuality(quality);scene.render();$('boot').remove();$('intro').classList.add('ready');for(const id of ['solo','create','join'])$(id).disabled=false;$('solo').textContent='Enter the truck';$('quality').value=quality;
}
function setQuality(value){quality=value;if(!engine)return;const width=value==='low'?960:1440;engine.setHardwareScalingLevel(Math.max(1,window.innerWidth/width));scene.shadowsEnabled=value==='high';engine.resize();}
// Original synthesized mono audio, spatialized with Web Audio HRTF panners.
function audioSource(kind,x,y,z,volume){
 const panner=audio.createPanner();panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=1.5;panner.maxDistance=40;panner.rolloffFactor=1.15;panner.positionX.value=x;panner.positionY.value=y;panner.positionZ.value=-z;
 const gain=audio.createGain();gain.gain.value=volume;gain.connect(panner);panner.connect(master);
 let source;if(kind==='hum'){source=audio.createOscillator();source.type='sawtooth';source.frequency.value=58;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=220;source.connect(filter);filter.connect(gain);}else{const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.3;source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type=kind==='traffic'?'lowpass':'highpass';filter.frequency.value=kind==='traffic'?500:1600;source.connect(filter);filter.connect(gain);}source.start();const item={kind,gain,source,panner,volume};sources.push(item);return item;
}
async function startAudio(){try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();master.gain.value=muted?0:.5;master.connect(audio.destination);audioSource('hum',-4.1,.7,1.9,.15);audioSource('grill',-.98,1.55,1,.8);audioSource('traffic',10.5,1,5,.22);}await audio.resume();}catch{toast('Audio could not start. Use Sound on to retry.');}}
function updateAudio(){if(!audio)return;const l=audio.listener;l.positionX.value=position.x;l.positionY.value=1.75+jumpY;l.positionZ.value=-position.z;l.forwardX.value=Math.sin(yaw)*Math.cos(pitch);l.forwardY.value=-Math.sin(pitch);l.forwardZ.value=-Math.cos(yaw)*Math.cos(pitch);l.upX.value=0;l.upY.value=1;l.upZ.value=0;for(const s of sources)if(s.kind==='grill')s.gain.gain.setTargetAtTime(world.grill?s.volume:0,audio.currentTime,.15);}
function footstep(){if(!audio||muted)return;const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(95,audio.currentTime);o.frequency.exponentialRampToValueAtTime(40,audio.currentTime+.07);g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.09);o.connect(g);g.connect(master);o.start();o.stop(audio.currentTime+.1);}
function input(){let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-stick.y;let s=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x;const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}return {dx:Math.sin(yaw)*f+Math.cos(yaw)*s,dz:Math.cos(yaw)*f-Math.sin(yaw)*s,sprint:keys.has('ShiftLeft')};}
function target(){const npc=world.npc||npcAt(world.created,Date.now());const all=[{name:'talk',label:'Talk to the customer',x:npc.x,z:npc.z},{name:'hatch',label:world.hatch?'Close serving window':'Open serving window',x:2.2,z:-1.4},{name:'grill',label:world.grill?'Switch grill off':'Switch grill on',x:-.9,z:1}];return all.map(t=>({...t,d:Math.hypot(t.x-position.x,t.z-position.z)})).filter(t=>t.d<2.35).sort((a,b)=>a.d-b.d)[0];}
function interact(){if(!active)return;const t=target();if(!t)return;if(network)action=t.name;else{if(t.name==='talk'){world.served++;toast('Customer: One gyro, extra tzatziki. This place smells incredible!');}else{world[t.name]=!world[t.name];toast(t.name==='hatch'?'Serving window adjusted.':'Grill switched.');}}}
function doJump(){if(active&&jumpY===0)jumpV=3.5;}
function enter(){active=true;measurementStart=performance.now();frames=[];$('intro').style.display='none';$('crosshair').style.display='block';$('hint').hidden=false;if(touch)$('touch').style.display='block';else{canvas.focus();canvas.requestPointerLock?.();}startAudio();toast(touch?'Left stick moves. Swipe right to look. Approach objects to interact.':'Rear doorway is behind the truck. E interacts when you are close.');}
async function request(path,data){const start=performance.now();const response=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Session unavailable.');rtt.push(performance.now()-start);if(rtt.length>300)rtt.shift();return result;}
async function join(room){$('error').textContent='';$('create').disabled=$('join').disabled=true;try{const r=await request('join',room?{room}:{});network={token:r.token,id:r.id,slot:r.slot,room:r.state.room,seq:0,busy:false};world=r.state;const me=world.players.find(p=>p.id===network.id);position={x:me.x,z:me.z};yaw=me.yaw;$('share').hidden=false;history.replaceState(null,'','?room='+network.room);enter();}catch(e){$('error').textContent=e.message;}finally{$('create').disabled=$('join').disabled=false;}}
async function sync(){if(!network||network.busy)return;network.busy=true;const current=network;const controls=active?input():{dx:0,dz:0,sprint:false};const pending=action;action=null;try{const state=await request('tick',{token:current.token,seq:++current.seq,...controls,yaw,action:pending});if(network!==current)return;world=state;const me=state.players.find(p=>p.id===current.id);if(me&&Math.hypot(me.x-position.x,me.z-position.z)>1.2)position={x:me.x,z:me.z};remoteTarget=state.players.find(p=>p.id!==current.id)||null;if(state.messageAt>lastMsg&&Date.now()-state.messageAt<7000){lastMsg=state.messageAt;toast(state.message);} }catch(e){toast(e.message);if(/expired/.test(e.message)){network=null;remoteTarget=null;$('share').hidden=true;$('status').textContent='Session expired · exploring solo';}}finally{current.busy=false;}}
function stats(){const sorted=[...frames].sort((a,b)=>a-b);const p=n=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*n))]||0;return {build:BUILD,engine:Engine.Version,mode:network?'shared':'solo',room:network?.room||null,userAgent:navigator.userAgent,physicalDeviceVerified:false,quality,renderWidth:engine.getRenderWidth(),renderHeight:engine.getRenderHeight(),dpr:devicePixelRatio,samples:frames.length,durationSeconds:measurementStart?(performance.now()-measurementStart)/1000:0,meanFps:frames.length?1000/(frames.reduce((a,b)=>a+b,0)/frames.length):null,p50FrameMs:p(.5),p95FrameMs:p(.95),p99FrameMs:p(.99),stallsOver50ms:frames.filter(x=>x>50).length,drawCalls:scene.getEngine()._drawCalls?.current??null,meshes:scene.meshes.length,heapBytes:performance.memory?.usedJSHeapSize??null,meanRequestRttMs:rtt.length?rtt.reduce((a,b)=>a+b,0)/rtt.length:null,sceneInitializationMs:bootSceneMs,navigationToSceneMs:performance.timeOrigin?bootSceneMs+bootStart:null,gpu:engine.getGlInfo?.()??null,audioState:audio?.state||'not started',audioSpatialization:'Web Audio HRTF',collectedAt:new Date().toISOString()};}
let bootSceneMs=0,lastUI=0;
function render(){const now=performance.now(),raw=now-lastFrame,dt=Math.min(.05,raw/1000);lastFrame=now;if(active&&!document.hidden){if(frames.length<36000)frames.push(raw);const c=input();position=move(position,c.dx,c.dz,dt,c.sprint);if(Math.hypot(c.dx,c.dz)>.2){stepTimer+=dt;if(stepTimer>.43){footstep();stepTimer=0;}}jumpY+=jumpV*dt;if(jumpY>0||jumpV>0)jumpV-=9.8*dt;if(jumpY<0){jumpY=0;jumpV=0;}}
 camera.position.set(position.x,1.75+jumpY,position.z);camera.rotation.set(pitch,yaw,0);hatch.isVisible=!world.hatch;
 const npc=network?world.npc:npcAt(world.created,Date.now());if(npc){customer.position.x+=(npc.x-customer.position.x)*Math.min(1,dt*8);customer.position.z+=(npc.z-customer.position.z)*Math.min(1,dt*8);customer.rotation.y=npc.yaw;animateCharacter(customer,npc.walking,now/1000);}
 if(remoteTarget){if(remoteID!==remoteTarget.id){remote?.dispose();remote=character('second player','#467d88');remoteID=remoteTarget.id;remote.position.set(remoteTarget.x,0,remoteTarget.z);}const moving=Math.hypot(remoteTarget.x-remote.position.x,remoteTarget.z-remote.position.z)>.03;remote.position.x+=(remoteTarget.x-remote.position.x)*Math.min(1,dt*10);remote.position.z+=(remoteTarget.z-remote.position.z)*Math.min(1,dt*10);remote.rotation.y=remoteTarget.yaw;animateCharacter(remote,moving,now/1000);}else if(remote){remote.dispose();remote=null;remoteID=null;}
 updateAudio();scene.render();if(now-lastUI>500){lastUI=now;if(active){const t=target();$('prompt').style.display=t?'block':'none';if(t)$('prompt').textContent=(touch?'INTERACT':'E')+' · '+t.label;$('status').textContent=network?'ROOM '+network.room+' · '+world.players.length+'/2 PLAYERS':'SOLO · '+world.served+' CONVERSATIONS';}if(metricsVisible){const s=stats();$('metrics').innerHTML='<b>'+Math.round(s.meanFps||0)+' FPS</b> · '+quality+'<br>p95 '+s.p95FrameMs.toFixed(1)+' ms<br>'+s.renderWidth+' × '+s.renderHeight+'<br>'+s.meshes+' meshes · '+(s.drawCalls??'—')+' draws<br>HTTPS RTT '+(s.meanRequestRttMs?.toFixed(0)||'—')+' ms<br>Audio '+s.audioState+'<br>Phone hardware: unverified<br><button id="resetStats" class="secondary">Reset sample</button>';$('resetStats').onclick=()=>{frames=[];rtt=[];measurementStart=performance.now();};}}}
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||!active)return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)interact();if(e.code==='Space'&&!e.repeat)doJump();});document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();stick={x:0,y:0};});document.addEventListener('visibilitychange',()=>{lastFrame=performance.now();keys.clear();});
document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas){yaw+=e.movementX*.0023;pitch=Math.max(-1.4,Math.min(1.4,pitch+e.movementY*.0023));}});
document.addEventListener('pointerlockchange',()=>{if(!touch&&active){const locked=document.pointerLockElement===canvas;$('resume').style.display=locked?'none':'block';keys.clear();}});$('resume').onclick=()=>{canvas.requestPointerLock?.();startAudio();};canvas.onclick=()=>{if(active&&!touch)canvas.requestPointerLock?.();};
$('solo').onclick=enter;$('create').onclick=()=>join();$('join').onclick=()=>join($('roomInput').value.trim().toUpperCase());$('roomInput').value=new URLSearchParams(location.search).get('room')||'';
$('audio').onclick=()=>{muted=!muted;$('audio').textContent=muted?'Sound off':'Sound on';if(!audio)startAudio();if(master)master.gain.value=muted?0:.5;};$('quality').onchange=e=>setQuality(e.target.value);$('stats').onclick=()=>{metricsVisible=!metricsVisible;$('metrics').style.display=metricsVisible?'block':'none';};
$('export').onclick=()=>{const data=JSON.stringify(stats(),null,2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='patient-gyro-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+'/?room='+network.room);toast('Room link copied. Open it in a second tab or authorized browser.');}catch{toast('Room code: '+network.room);}};
$('jump').onclick=doJump;$('interact').onclick=interact;
const joystick=$('stick');function updateStick(e){const b=joystick.getBoundingClientRect(),x=Math.max(-38,Math.min(38,e.clientX-b.left-55)),y=Math.max(-38,Math.min(38,e.clientY-b.top-55));stick={x:x/38,y:y/38};$('knob').style.transform='translate('+x+'px,'+y+'px)';}
joystick.onpointerdown=e=>{moveID=e.pointerId;joystick.setPointerCapture(moveID);updateStick(e);};joystick.onpointermove=e=>{if(e.pointerId===moveID)updateStick(e);};joystick.onpointerup=joystick.onpointercancel=()=>{moveID=null;stick={x:0,y:0};$('knob').style.transform='';};
const look=$('look');look.onpointerdown=e=>{lookID=e.pointerId;lookLast={x:e.clientX,y:e.clientY};look.setPointerCapture(lookID);};look.onpointermove=e=>{if(e.pointerId!==lookID)return;yaw+=(e.clientX-lookLast.x)*.005;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-lookLast.y)*.005));lookLast={x:e.clientX,y:e.clientY};};look.onpointerup=look.onpointercancel=()=>lookID=null;
window.addEventListener('resize',()=>setQuality(quality));window.addEventListener('pagehide',()=>{if(network)navigator.sendBeacon('/api/leave',new Blob([JSON.stringify({token:network.token})],{type:'application/json'}));});
try{makeScene();bootSceneMs=performance.now()-bootStart;engine.runRenderLoop(render);setInterval(sync,250);}catch(e){$('boot').textContent='This browser could not initialize the 3D scene.';$('error').textContent=e.message;console.error(e);}
