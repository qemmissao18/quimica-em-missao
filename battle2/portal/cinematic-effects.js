import * as T from 'portal/vendor/three.module.js';
export function eliminationFrame(seconds,reduced=false){const t=Math.max(0,seconds);return {phase:reduced?(t<.5?'alert':t<1?'blocked':'denied'):(t<5?'alert':t<7?'burst':t<8.5?'blocked':'denied'),blast:reduced?-1:t-5,door:reduced?t>=.5:t>=7,reveal:reduced?t>=1:t>=8.5};}
export function buildSiren(){
 const group=new T.Group();group.name='individual-security-siren';
 const metal=new T.MeshStandardMaterial({color:0x35414c,metalness:.75,roughness:.35}),red=new T.MeshPhysicalMaterial({color:0xc52b31,transparent:true,opacity:.42,roughness:.18,depthWrite:false});
 const foot=new T.Mesh(new T.CylinderGeometry(.34,.4,.15,24),metal);group.add(foot);
 const dome=new T.Mesh(new T.CylinderGeometry(.23,.3,.5,24,1,true),red);dome.position.y=.32;group.add(dome);
 const cap=new T.Mesh(new T.SphereGeometry(.23,20,10,0,Math.PI*2,0,Math.PI/2),red);cap.position.y=.57;group.add(cap);
 const rotor=new T.Group();rotor.position.y=.35;group.add(rotor);
 const bulbMat=new T.MeshStandardMaterial({color:0xff5c42,emissive:0xff250e,emissiveIntensity:0});
 const bulb=new T.Mesh(new T.SphereGeometry(.085,12,8),bulbMat);rotor.add(bulb);
 for(const x of [-.12,.12]){const reflector=new T.Mesh(new T.ConeGeometry(.16,.13,12,1,true),metal);reflector.rotation.z=x<0?Math.PI/2:-Math.PI/2;reflector.position.x=x;rotor.add(reflector);}
 const light=new T.PointLight(0xff3b27,0,9);light.position.y=.4;group.add(light);
 return {group,rotor,light,tick(seconds,active,{reduced=false,lights=true,critical=false}={}){if(!active){rotor.rotation.y=0;light.intensity=0;bulbMat.emissiveIntensity=0;return;}rotor.rotation.y=reduced?0:seconds*(critical?4:2);const pulse=lights&&!reduced?.7+.3*Math.sin(seconds*Math.PI):.55;light.intensity=(critical?42:26)*pulse;bulbMat.emissiveIntensity=2+3*pulse;}};
}
export function buildBurst(color=0xff9d5d){
 const group=new T.Group();group.visible=false;
 const hot=new T.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false});
 const ring=new T.Mesh(new T.TorusGeometry(1,.035,8,48),hot);group.add(ring);
 const flare=new T.Mesh(new T.SphereGeometry(.3,12,8),hot);group.add(flare);
 const material=new T.MeshStandardMaterial({color:0xa8b5c4,metalness:.4,roughness:.4});
 const shards=[];for(let i=0;i<24;i++){const shard=new T.Mesh(new T.TetrahedronGeometry(.08+(i%4)*.025),material);group.add(shard);shards.push(shard);}
 const smoke=[];for(let i=0;i<10;i++){const m=new T.Mesh(new T.IcosahedronGeometry(.22,1),new T.MeshBasicMaterial({color:0x5d7385,transparent:true,opacity:0,depthWrite:false}));group.add(m);smoke.push(m);}
 const sparks=[];for(let i=0;i<18;i++){const m=new T.Mesh(new T.BoxGeometry(.015,.13,.015),hot);group.add(m);sparks.push(m);}
 return {group,shards,smoke,ring,tick(t,{reduced=false,low=false,lights=true}={}){group.visible=t>=0&&t<3&&!reduced;if(!group.visible)return;const u=Math.max(0,t);hot.opacity=lights?Math.max(0,.45-u*.2):.12;ring.scale.setScalar(.2+u*3);flare.visible=u<.3&&lights;flare.scale.setScalar(1+u*4);
 shards.forEach((m,i)=>{m.visible=!low||i<10;const a=i*2.399,r=u*(1.2+(i%5)*.25);m.position.set(Math.cos(a)*r,.2+Math.sin(i*1.7)*r-u*u*.6,Math.sin(a)*r*.6);m.rotation.set(u*(i%3+1),u*2,i);});
 smoke.forEach((m,i)=>{m.visible=!low||i<4;const a=i*2.399;m.position.set(Math.cos(a)*u*.5,.3+u*.55,Math.sin(a)*u*.4);m.scale.setScalar(.5+u*2);m.material.opacity=Math.max(0,.18*(1-u/3));});
 sparks.forEach((m,i)=>{m.visible=!low&&u<1;const a=i*2.399;m.position.set(Math.cos(a)*u*3,Math.sin(a)*u*2,Math.sin(i)*u);m.rotation.z=-a;});},dispose(){const materials=new Set();group.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());}};
}
export function buildBarrier(){
 const group=new T.Group();group.name='physical-red-security-tape';let map;
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#d33239';ctx.fillRect(0,0,1024,96);ctx.fillStyle='#160e16';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillText('PERIGO • ÁREA INTERDITADA',512,64);map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;}
 const material=new T.MeshStandardMaterial({color:map?0xffffff:0xc82f39,...(map?{map}:{}),roughness:.65,side:T.DoubleSide});
 for(const [y,angle]of [[2.2,.35],[3.6,-.35],[4.4,.08]]){const band=new T.Mesh(new T.BoxGeometry(6.7,.26,.055),material);band.position.set(0,y,3.65);band.rotation.z=angle;group.add(band);}group.visible=false;return {group};
}
export function buildRoomDamage(roots){
 const group=new T.Group(),hidden=[],pieces=[];let count=0;
 for(const root of roots){root.updateWorldMatrix(true,true);root.traverse(o=>{if(!o.isMesh||!o.visible||count>=24)return;const box=new T.Box3().setFromObject(o),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());if(size.length()<.3||size.length()>12)return;count++;hidden.push([o,o.visible]);for(let i=0;i<3;i++){const m=new T.Mesh(new T.TetrahedronGeometry(Math.min(.45,Math.max(.08,size.length()/8))),Array.isArray(o.material)?o.material[0]:o.material);m.position.copy(center);group.add(m);pieces.push({m,origin:center.clone(),i:pieces.length});}});}
 group.visible=false;
 return {group,tick(t,reduced=false){const broken=t>=0;group.visible=broken&&!reduced;hidden.forEach(([o,v])=>o.visible=broken?false:v);pieces.forEach(({m,origin,i})=>{const u=Math.min(2.5,Math.max(0,t)),a=i*2.399;m.position.copy(origin).add(new T.Vector3(Math.cos(a)*u*.7,-u*u*.4,Math.sin(a)*u*.7));m.rotation.set(u*Math.sin(a),u,0);});},restore(){hidden.forEach(([o,v])=>o.visible=v);pieces.forEach(({m})=>m.geometry.dispose());}};
}
