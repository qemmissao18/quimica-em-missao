import * as T from 'portal/vendor/three.module.js';
// Original meshes; colours/radii are schematic, not measured atomic dimensions.
export function scienceSet(stage){
 const group=new T.Group(),targets=[],messages=[];let phase=0;
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.28,metalness:.15});
 const sodium=mat(0x36cfff),chloride=mat(0x83db66),oxygen=mat(0xed5757),hydrogen=mat(0xf5f7ff),metal=mat(0x476276);
 const glass=new T.MeshStandardMaterial({color:0xcdefff,transparent:true,opacity:.22,roughness:.12,side:T.DoubleSide,depthWrite:false});
 const sphere=new T.SphereGeometry(1,12,8);
 function ball(parent,x,y,z,r,m){const o=new T.Mesh(sphere,m);o.position.set(x,y,z);o.scale.setScalar(r);parent.add(o);return o;}
 function label(parent,text,x,y,z){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#061627';ctx.fillRect(0,0,768,128);ctx.fillStyle='#ecfaff';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,76);const o=new T.Mesh(new T.PlaneGeometry(4.2,.75),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));o.position.set(x,y,z);parent.add(o);}
 function target(x,y,z,message){const g=new T.Group();g.position.set(x,y,z);group.add(g);targets.push(g);messages.push(message);return g;}
 function cylinder(p,a,b,h,x,y,z,m=metal){const o=new T.Mesh(new T.CylinderGeometry(a,b,h,16),m);o.position.set(x,y,z);p.add(o);return o;}
 if(stage===0){
  const g=target(-4.3,3.1,-8,'Na tem 11 prótons e 11 elétrons. Ao perder um elétron, forma Na⁺ (11 prótons e 10 elétrons). Cl tem 17 prótons e 17 elétrons; ao receber um elétron, forma Cl⁻ (17 prótons e 18 elétrons). Esferas e deslocamento são esquemáticos, não trajetórias reais.');
  ball(g,-1.4,0,0,.42,sodium);ball(g,1.4,0,0,.55,chloride);const electron=ball(g,-.8,.3,0,.09,hydrogen);electron.name='transfer-electron';
  label(g,'Na → Na⁺ + e⁻',0,1.05,0);label(g,'Cl + e⁻ → Cl⁻',0,-.95,0);
  g.userData.tick=t=>{electron.position.x=-.8+1.6*t;electron.position.y=.3+Math.sin(t*Math.PI)*.6;};
 }else if(stage===1||stage===4){
  const g=target(stage===4?4.4:-4.6,stage===4?3:2.7,stage===4?-4:-4.5,'Trecho do retículo de NaCl: íons Na⁺ (azul) e Cl⁻ (verde) alternados. No interior do cristal, cada íon tem seis vizinhos mais próximos de carga oposta. Não são moléculas isoladas de NaCl. Cores e raios são esquemáticos.');
  for(let x=0;x<4;x++)for(let y=0;y<4;y++)for(let z=0;z<4;z++)ball(g,(x-1.5)*.53,(y-1.5)*.53,(z-1.5)*.53,(x+y+z)%2?.21:.14,(x+y+z)%2?chloride:sodium);
  g.userData.contextName='Retículo de NaCl — inspeção';
 }else if(stage===2){
  const g=target(-5.5,1.19,-4,'Vidrarias: béquer, Erlenmeyer e proveta têm formas e usos diferentes. As soluções coloridas são ilustrativas; a cor sozinha não determina acidez ou basicidade.');

  cylinder(g,.45,.45,1, 0,.5,-1.5,glass);cylinder(g,.4,.4,.5,0,.25,-1.5,sodium);
  cylinder(g,.16,.5,.9,0,.45,0,glass);cylinder(g,.16,.16,.4,0,1.1,0,glass);cylinder(g,.22,.43,.45,0,.225,0,chloride);
  cylinder(g,.2,.2,1.6,0,.9,1.5,glass);cylinder(g,.35,.35,.1,0,.05,1.5);cylinder(g,.16,.16,.9,0,.5,1.5,oxygen);

 }else{
  const g=target(5,2.1,-7,'Em solução aquosa: H₃O⁺ + OH⁻ → 2 H₂O. A neutralização depende das quantidades e espécies envolvidas. O pH final não é sempre 7. O tanque é uma representação de equipamento, não um procedimento experimental.');
  cylinder(g,.85,.85,1.8,0,0,0);cylinder(g,.9,.9,.12,0,1,0);cylinder(g,.22,.22,.7,0,1.4,0,sodium);
  for(const x of [-.6,.6])cylinder(g,.08,.08,.8,x,-1.2,0);
  label(g,'H₃O⁺ + OH⁻ → 2 H₂O',0,2.3,0);
 }
 if(stage===4){const g=target(4.4,3,1,'Modelo de H₂O: dois átomos de hidrogênio e um de oxigênio, com geometria angular. Cores e tamanhos são convenções didáticas.');ball(g,0,0,0,.4,oxygen);ball(g,-.48,.37,0,.23,hydrogen);ball(g,.48,.37,0,.23,hydrogen);g.userData.contextName='H₂O — geometria angular';}
 return {group,targets,messages,tick(dt,reduced){if(reduced)return;phase=(phase+dt*.2)%1;for(const o of targets)o.userData.tick?.(phase);}};
}
