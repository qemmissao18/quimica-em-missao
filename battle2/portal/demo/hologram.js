import * as T from 'portal/vendor/three.module.js';
// Deliberately displays only the given situation, never a solution or hidden product.
let renderer,scene,camera,group,frame=0,collapseTimer;
const root=document.getElementById('projection'),body=document.getElementById('projection-body'),canvas=root.querySelector('canvas');
root.querySelector('button').onclick=()=>{clearTimeout(collapseTimer);body.hidden=!body.hidden;root.querySelector('button').setAttribute('aria-expanded',String(!body.hidden));root.querySelector('button').textContent=body.hidden?'Holograma · expandir':'Holograma da investigação · recolher';};
function init(){try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));scene=new T.Scene();camera=new T.PerspectiveCamera(40,2,.1,20);camera.position.set(0,2.6,6);camera.lookAt(0,.6,0);scene.add(new T.HemisphereLight(0xa3efff,0x0b162b,3));const light=new T.PointLight(0x43eaff,15);light.position.set(2,3,3);scene.add(light);}catch{canvas.hidden=true;}}
function clear(){cancelAnimationFrame(frame);if(group){scene.remove(group);group.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});}}
export function hideHologram(){clearTimeout(collapseTimer);root.hidden=true;clear();}
export function showHologram(q){if(!q){hideHologram();return;}clearTimeout(collapseTimer);root.hidden=false;body.hidden=false;root.querySelector('button').setAttribute('aria-expanded','true');root.querySelector('button').textContent='Holograma da investigação · recolher';collapseTimer=setTimeout(()=>{body.hidden=true;root.querySelector('button').setAttribute('aria-expanded','false');root.querySelector('button').textContent='Holograma · expandir';},15000);if(!q.hologram)throw Error('Questão sem configuração holográfica');const {kind,caption:text}=q.hologram;root.querySelector('p').textContent=text;if(!renderer)init();if(!renderer)return;clear();group=new T.Group();scene.add(group);
 function mesh(geo,x,y,z,wire=false){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x70efff,emissive:0x087c9c,emissiveIntensity:.6,transparent:true,opacity:wire?.8:.55,wireframe:wire,metalness:.2,roughness:.3}));m.position.set(x,y,z);group.add(m);return m;}
 function vessel(x){mesh(new T.CylinderGeometry(.25,.4,.7,20,1,true),x,.5,0);mesh(new T.CylinderGeometry(.17,.17,.3,16,1,true),x,1,0);mesh(new T.CylinderGeometry(.3,.33,.22,20),x,.3,0);}
 const ring=mesh(new T.TorusGeometry(1.65,.025,8,64),0,.02,0);ring.rotation.x=Math.PI/2;
 if(kind==='rack'){for(let i=0;i<5;i++)vessel((i-2)*.65);}
 if(kind==='single')vessel(0);
if(kind==='bottle'){vessel(-.4);mesh(new T.CylinderGeometry(.27,.27,.7,20,1,true),.6,.45,0);for(let i=0;i<9;i++)mesh(new T.SphereGeometry(.035,8,6),-.4+Math.sin(i)*.12,.35+i*.06,Math.cos(i)*.1);}
 if(kind==='crystal'){for(let i=0;i<5;i++){const c=mesh(new T.OctahedronGeometry(.22+(i%2)*.08),Math.sin(i*2.4)*.65,.4+(i%2)*.25,Math.cos(i*2.4)*.5);c.rotation.z=i*.3;}}
 if(kind==='package'){mesh(new T.BoxGeometry(.85,1.15,.45),0,.6,0);mesh(new T.BoxGeometry(.7,.2,.48),0,1.2,0,true);}
 if(kind==='battery'){mesh(new T.BoxGeometry(1.4,.8,.8),0,.5,0);mesh(new T.CylinderGeometry(.1,.1,.15,12),-.4,1,0);mesh(new T.CylinderGeometry(.1,.1,.15,12),.4,1,0);}
 if(kind==='metal'){const bar=mesh(new T.BoxGeometry(1.7,.2,.5),0,.5,0);bar.rotation.z=.2;for(let i=0;i<10;i++)mesh(new T.DodecahedronGeometry(.07),-.7+i*.15,.65,Math.sin(i)*.18);}
 if(kind==='gas'){mesh(new T.CylinderGeometry(.65,.65,1.3,20,1,true),0,.7,0);for(let i=0;i<14;i++)mesh(new T.SphereGeometry(.045,8,6),Math.sin(i*2.4)*.4,.2+(i%7)*.15,Math.cos(i*2.4)*.4);}
 if(kind==='indicator'){vessel(-.5);mesh(new T.BoxGeometry(.12,1,.03),.5,.65,0);mesh(new T.BoxGeometry(.12,.3,.035),.5,.3,0,true);}
 if(kind==='meter'){vessel(-.7);mesh(new T.BoxGeometry(.8,.95,.12),.6,.7,0);for(let i=0;i<7;i++)mesh(new T.BoxGeometry(.4,.025,.03),.6,.4+i*.1,.1);}
 if(kind==='heater'){mesh(new T.CylinderGeometry(.7,.75,.18,20),0,.1,0);mesh(new T.DodecahedronGeometry(.4),0,.6,0,true);}
 if(kind==='balance'){mesh(new T.BoxGeometry(1.8,.18,.65),0,.1,0);mesh(new T.CylinderGeometry(.05,.05,.9,12),0,.6,0);mesh(new T.BoxGeometry(1.6,.05,.05),0,1.1,0);for(const x of [-.65,.65])mesh(new T.CylinderGeometry(.3,.3,.05,20),x,.6,0);}

 if(kind==='pair'){vessel(-.65);vessel(.65);}
 if(kind==='stone'){vessel(.8);mesh(new T.DodecahedronGeometry(.5,0),-.65,.45,0,true);}
 if(kind==='tank'){mesh(new T.CylinderGeometry(.7,.7,1.3,24,1,true),0,.75,0);mesh(new T.CylinderGeometry(.64,.64,.7,24),0,.5,0);vessel(1.15);}
 if(kind==='pipe'){const pipe=mesh(new T.CylinderGeometry(.55,.55,2.5,24,1,true),0,.6,0);pipe.rotation.z=Math.PI/2;for(let i=0;i<12;i++){const t=i*Math.PI/6;mesh(new T.DodecahedronGeometry(.14),Math.sin(t)*.5,.6+Math.cos(t)*.43,Math.sin(t)*.4);}}
 if(kind==='scan'){const disc=mesh(new T.TorusGeometry(.75,.035,8,40),0,.8,0);disc.rotation.y=.3;mesh(new T.BoxGeometry(1.9,.08,.8),0,.15,0,true);for(let i=0;i<3;i++)mesh(new T.BoxGeometry(1.5,.02,.02),0,.4+i*.35,0);}
 // Labels are copied only from the question, never from its answer key.
 const labels=q.hologram.labels||[];
 labels.forEach((text,i)=>{
  const c=document.createElement('canvas');c.width=1024;c.height=160;
  const ctx=c.getContext('2d');ctx.fillStyle='rgba(2,18,32,.92)';ctx.fillRect(0,0,c.width,c.height);
  ctx.font='bold 56px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d8fbff';
  ctx.fillText(text,512,80,960);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
  sprite.position.set(0,1.75+i*.42,0);sprite.scale.set(3.3,.52,1);group.add(sprite);
 });
 let previous=0;function animate(t){frame=requestAnimationFrame(animate);if(document.hidden||root.hidden||body.hidden||t-previous<50)return;previous=t;const reduced=document.getElementById('reduced').checked;group.rotation.y=reduced?0:Math.sin(t*.00035)*.25;const rect=canvas.getBoundingClientRect();if(!rect.width)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.render(scene,camera);}frame=requestAnimationFrame(animate);
}
