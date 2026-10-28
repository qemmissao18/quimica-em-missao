import * as T from 'portal/vendor/three.module.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export function vaultPose(p){p=clamp(p);return {wheel:smooth(p/.24)*Math.PI*1.5,bolts:smooth((p-.16)/.16),angle:-smooth((p-.32)/.36)*Math.PI*.56,cameraZ:14-8*smooth((p-.7)/.3),reveal:p>=.32,complete:p>=1};}
export function buildVault(){
 const group=new T.Group();group.position.set(0,3,9);
 const steel=new T.MeshStandardMaterial({color:0x657d8e,metalness:.85,roughness:.3});
 const dark=new T.MeshStandardMaterial({color:0x122334,metalness:.65,roughness:.45});
 const cyan=new T.MeshStandardMaterial({color:0x55dfff,emissive:0x18bfee,emissiveIntensity:.8});
 function mesh(g,m,x,y,z,p=group){const o=new T.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;}
 const wall=new T.Shape();wall.moveTo(-22,-20);wall.lineTo(22,-20);wall.lineTo(22,20);wall.lineTo(-22,20);wall.closePath();const hole=new T.Path();hole.absarc(0,0,2.45,0,Math.PI*2,true);wall.holes.push(hole);
 mesh(new T.ExtrudeGeometry(wall,{depth:.65,bevelEnabled:false,curveSegments:40}),dark,0,0,-.65);
 mesh(new T.TorusGeometry(2.6,.2,10,64),steel,0,0,0);
 const pivot=new T.Group();pivot.position.x=-2.4;group.add(pivot);
 const leaf=new T.Group();leaf.position.x=2.4;pivot.add(leaf);
 const disk=mesh(new T.CylinderGeometry(2.48,2.48,.5,64),steel,0,0,0,leaf);disk.rotation.x=Math.PI/2;
 mesh(new T.TorusGeometry(2.2,.055,8,64),dark,0,0,.3,leaf);
 const wheel=new T.Group();wheel.position.z=.52;leaf.add(wheel);mesh(new T.TorusGeometry(.64,.09,10,32),dark,0,0,0,wheel);
 for(let i=0;i<4;i++){const spoke=mesh(new T.BoxGeometry(.1,1.2,.12),steel,0,0,0,wheel);spoke.rotation.z=i*Math.PI/4;}
 const bolts=[];for(let i=0;i<8;i++){const a=i*Math.PI/4;const b=mesh(new T.BoxGeometry(.55,.16,.18),dark,Math.cos(a)*2.25,Math.sin(a)*2.25,.32,leaf);b.rotation.z=a;bolts.push({b,a});}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;mesh(new T.CylinderGeometry(.045,.045,.08,6),dark,Math.cos(a)*2.6,Math.sin(a)*2.6,.15).rotation.x=Math.PI/2;}
 for(const y of [-1.4,1.4])mesh(new T.CylinderGeometry(.16,.16,.65,12),steel,-2.45,y,0);
 mesh(new T.BoxGeometry(.65,1,.2),dark,3.2,0,.1);const lamp=mesh(new T.BoxGeometry(.42,.55,.05),cyan,3.2,.1,.23);
 return {group,update(p){const s=vaultPose(p);wheel.rotation.z=s.wheel;pivot.rotation.y=s.angle;for(const {b,a}of bolts){const r=2.25-.45*s.bolts;b.position.set(Math.cos(a)*r,Math.sin(a)*r,.32)}lamp.material.emissiveIntensity=p>0?1.5:.3;return s;}};
}
