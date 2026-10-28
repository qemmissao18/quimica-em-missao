import {buildBurst} from 'portal/cinematic-effects.js';
import * as T from 'portal/vendor/three.module.js';
export const AWARDS=[
 {color:0xffcd48,title:'MESTRE DAS FUNÇÕES',phrase:'CONHECIMENTO É PODER.'},
 {color:0xbcdfff,title:'EXPLORADOR CIENTÍFICO',phrase:'A CIÊNCIA TE LEVA MAIS LONGE.'},
 {color:0xe18b4b,title:'ANALISTA DAS REAÇÕES',phrase:'CURIOSIDADE TRANSFORMA.'},
 {color:0xb88aff,title:'AVENTUREIRO DO CONHECIMENTO',phrase:'TODA JORNADA DEIXA UMA MARCA.'}
];
export function awardFor(snapshot,user){
 if(!snapshot?.settled||!Array.isArray(snapshot.ranking))return null;
 const i=snapshot.ranking.findIndex(p=>p.id===user);if(i<0)return null;
 return {...AWARDS[Math.min(i,3)],...snapshot.ranking[i],position:i+1};
}
export function finaleFrame(seconds,reduced=false){
 const t=Math.max(0,seconds);
 return {warning:!reduced&&t>=4.4&&t<6,ruptured:reduced||t>=6,foam:Math.min(1,Math.max(0,(t-2)/3)),fill:Math.min(1,Math.max(0,(t-1)/3)),reaction:Math.max(0,1-Math.abs(t-5)/1.5),
  burst:Math.max(0,1-Math.abs(t-6)/1),card:Math.min(1,Math.max(0,(t-7)/2)),
  reveal:reduced||t>=9,done:reduced||t>=10};
}
export function buildFinale(award){
 const group=new T.Group();
 const luminous=new T.MeshStandardMaterial({color:award.color,emissive:award.color,emissiveIntensity:1.2});
 const glass=new T.MeshPhysicalMaterial({color:0xdffaff,transparent:true,opacity:.22,roughness:.12,metalness:.1,side:T.DoubleSide,depthWrite:false});
 const points=[[.65,0],[.9,.15],[.86,.35],[.25,1.65],[.23,2.15],[.29,2.2]].map(([x,y])=>new T.Vector2(x,y));
 const flask=new T.Mesh(new T.LatheGeometry(points,32),glass);group.add(flask);
 const liquid=new T.Mesh(new T.CylinderGeometry(.24,.8,1.5,32),luminous);liquid.position.y=.75;group.add(liquid);
 const platform=new T.Mesh(new T.CylinderGeometry(1.3,1.4,.18,32),new T.MeshStandardMaterial({color:0x172338,metalness:.8,roughness:.25}));platform.position.y=-.1;group.add(platform);
 const card=new T.Group();group.add(card);
 const backing=new T.Mesh(new T.BoxGeometry(1.55,2.25,.07),new T.MeshStandardMaterial({color:0x131b30,metalness:.65,roughness:.3}));card.add(backing);
 for(const [w,h,x,y]of [[1.64,.08,0,1.14],[1.64,.08,0,-1.14],[.08,2.25,-.8,0],[.08,2.25,.8,0]]){const m=new T.Mesh(new T.BoxGeometry(w,h,.11),luminous);m.position.set(x,y,0);card.add(m)}
 const emblem=new T.Mesh(new T.OctahedronGeometry(.38),luminous);emblem.position.z=.12;card.add(emblem);
 const particles=[];for(let i=0;i<48;i++){const p=new T.Mesh(new T.SphereGeometry(.025,6,4),luminous);group.add(p);particles.push(p);}
 const foamMaterial=new T.MeshStandardMaterial({color:0xeefff4,emissive:award.color,emissiveIntensity:.2,roughness:.7});
 const foam=[];for(let i=0;i<22;i++){const b=new T.Mesh(new T.SphereGeometry(.09+(i%3)*.025,8,6),foamMaterial);group.add(b);foam.push(b);}
 const fracture=new T.Group();group.add(fracture);for(let i=0;i<14;i++){const g=new T.LatheGeometry(points,3,i*Math.PI*2/14,Math.PI*2/14*.84);const shard=new T.Mesh(g,glass);fracture.add(shard);}
 const burst=buildBurst(award.color);burst.group.position.y=1.2;group.add(burst.group);
 return {group,card,flask,liquid,foam,fracture,burst,

  tick(seconds,reduced=false,options={}){const f=finaleFrame(seconds,reduced);liquid.scale.y=Math.max(.001,f.fill);liquid.position.y=.75*f.fill;flask.visible=seconds<6&&!f.done;liquid.visible=flask.visible;
   card.visible=seconds>=7||f.done;card.position.y=1.2+f.card*.6;card.rotation.y=f.done?0:Math.PI*(1-f.card);card.scale.setScalar(.5+.5*f.card);
   foam.forEach((b,i)=>{b.visible=seconds>=2&&seconds<6&&!reduced&&(!options.low||i<10);const a=i*2.399;b.position.set(Math.cos(a)*(.1+(1-f.foam)*.35),.3+f.foam*(1.6+i/22*.6),Math.sin(a)*(.1+(1-f.foam)*.35));b.scale.setScalar(.6+f.foam*.8);});
   fracture.visible=seconds>=6&&seconds<8&&!reduced;fracture.children.forEach((o,i)=>{const t=Math.max(0,seconds-6),a=i*Math.PI*2/14;o.position.set(Math.cos(a)*t*.8,t*.3-t*t*.5,Math.sin(a)*t*.8);o.rotation.set(t*.4*Math.sin(a),t*.3,t*.4*Math.cos(a));});burst.tick(seconds-6,{reduced,...options});
   flask.rotation.z=reduced?0:Math.sin(seconds*23)*f.reaction*.018;
   particles.forEach((p,i)=>{p.visible=!reduced&&!f.done;const a=i*2.399+seconds*.5,r=.3+(i%7)*.08+f.burst*2;p.position.set(Math.cos(a)*r,.2+(i/48)*2.3+f.burst*.6,Math.sin(a)*r);});return f;},
  dispose(){group.traverse(o=>{if(o.geometry)o.geometry.dispose()});const materials=new Set();group.traverse(o=>{if(o.material)materials.add(o.material)});materials.forEach(m=>m.dispose());}
 };
}
