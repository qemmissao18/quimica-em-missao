import {buildArchitecture} from 'portal/architecture.js';
import * as T from 'portal/vendor/three.module.js';
export const THEMES=[
 {name:'Portal dos Íons',color:0x36cfff,labels:['Painel de íons','Modelo de partículas','Analisador de amostras']},
 {name:'Câmara dos Cristais',color:0xba6cff,labels:['Cristal central','Fragmentos suspensos','Analisador cristalino']},
 {name:'Laboratório das Soluções',color:0x47edab,labels:['Frasco de solução','Indicador químico','Coluna de bolhas']},
 {name:'Reator de Neutralização',color:0xff9e36,labels:['Válvula de análise','Reator central','Monitor de neutralização']},
 {name:'Núcleo da Química',color:0xffda62,labels:['Núcleo energético','Projeção molecular','Terminal final']}
];
export function buildEnvironment(index){
 const theme=THEMES[index],group=new T.Group(),objects=[],orbiters=[];let effect=null,completionProgress=0;
 const metal=new T.MeshStandardMaterial({color:0x172338,metalness:.7,roughness:.35});
 const light=new T.MeshStandardMaterial({color:theme.color,emissive:theme.color,emissiveIntensity:1.2,metalness:.25,roughness:.35});
 const glass=new T.MeshStandardMaterial({color:0xc6f6ff,transparent:true,opacity:.24,roughness:.12,side:T.DoubleSide,depthWrite:false});
 function mesh(geo,mat,x,y,z,parent=group){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 const box=(w,h,d,x,y,z,mat=metal,p=group)=>mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,p);
 function actor(x,y,z){const a=new T.Group();a.position.set(x,y,z);group.add(a);objects.push(a);return a;}
 function screen(text,x,y,z){const a=actor(x,y,z);box(3.6,2,.2,0,0,0,metal,a);const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#061327';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#d5faff';ctx.font='bold 72px sans-serif';ctx.textAlign='center';text.forEach((t,i)=>ctx.fillText(t,512,160+i*110));const tex=new T.CanvasTexture(c);mesh(new T.PlaneGeometry(3.4,1.85),new T.MeshBasicMaterial({map:tex}),0,0,.12,a);box(.14,Math.max(.1,y-1),.14,0,-(y-1)/2-1,-.1,metal,a);return a;}
 function pedestal(x,z){mesh(new T.CylinderGeometry(1.3,1.5,.35,24),metal,x,.7,z);mesh(new T.TorusGeometry(1.25,.035,6,40),light,x,.9,z).rotation.x=Math.PI/2;}
 let messages=[];
 if(index===1){
  const crystal=actor(0,2.45,-7);mesh(new T.OctahedronGeometry(.9),light,0,0,0,crystal).scale.set(.8,1.35,.8);pedestal(0,-7);
  const fragments=actor(-5.8,4,-8.5);mesh(new T.OctahedronGeometry(.3),light,0,0,0,fragments);for(let i=0;i<9;i++){const a=i*2.4,m=mesh(new T.OctahedronGeometry(.2),light,Math.cos(a),Math.sin(a),Math.sin(a)*.7,fragments);orbiters.push(m);}
  const sensor=actor(4.8,3,-7);mesh(new T.TorusGeometry(.5,.055,8,32),light,0,0,0,sensor);mesh(new T.OctahedronGeometry(.22),glass,0,0,0,sensor);sensor.userData.contextName='Sensor de análise cristalina';
  for(let i=0;i<4;i++){const x=i%2?-6.8:6.8,z=-9+Math.floor(i/2)*2;mesh(new T.OctahedronGeometry(.6),light,x,1.3,z).scale.y=2.3;}
  messages=['Cristais iônicos organizam cátions e ânions. A forma luminosa é uma representação artística, não a estrutura real de um cristal específico.','As proporções entre íons devem equilibrar as cargas. Fragmentar o modelo não altera a composição de uma substância real.','O analisador compara cargas e proporções; um cristal, por si só, não identifica uma função inorgânica.'];
 }else if(index===2){
  const flask=actor(-5.5,1.09,1);mesh(new T.CylinderGeometry(.2,.75,1.5,24),glass,0,.85,0,flask);mesh(new T.CylinderGeometry(.28,.62,.9,24),light,0,.55,0,flask);mesh(new T.CylinderGeometry(.2,.2,.55,20),glass,0,1.8,0,flask);
  screen(['pH · 25 °C','ÁCIDO | BASE'],5.5,2.4,-3);
  const column=actor(5.5,0,-8.5);mesh(new T.CylinderGeometry(.85,.85,.12,24),metal,0,.06,0,column);mesh(new T.CylinderGeometry(.8,.8,3.8,24),glass,0,1.9,0,column);mesh(new T.CylinderGeometry(.85,.85,.2,24),metal,0,3.8,0,column);for(let i=0;i<16;i++){const m=mesh(new T.SphereGeometry(.07,8,6),light,Math.sin(i)*.5, .1+(i/16)*3.4,Math.cos(i)*.5,column);orbiters.push(m);}
  for(let i=0;i<8;i++)mesh(new T.CylinderGeometry(.11,.11,.9,10),glass,-6.5+i*.3,1.64,-2);
  messages=['Uma solução é uma mistura homogênea. O brilho e a cor deste modelo são ilustrativos e não identificam seu soluto.','A 25 °C, a referência usual de neutralidade aquosa é pH 7. Um indicador real muda de cor em uma faixa própria.','Bolhas podem indicar liberação de gás, mas o contexto é necessário: aquecimento ou agitação também podem produzir bolhas.'];
 }else if(index===3){
  const valve=actor(-3.5,2.3,-3.5);mesh(new T.TorusGeometry(.65,.08,10,24),light,0,0,0,valve);for(let i=0;i<4;i++)box(.08,1.2,.08,0,0,0,metal,valve).rotation.z=i*Math.PI/4;mesh(new T.CylinderGeometry(.22,.22,4,16),metal,0,-.3,-.3,valve);
  const reactor=actor(0,2.4,-6);mesh(new T.SphereGeometry(1.5,24,16),glass,0,0,0,reactor);mesh(new T.SphereGeometry(1,20,12),light,0,0,0,reactor);pedestal(0,-6);for(let i=0;i<3;i++){const ring=mesh(new T.TorusGeometry(1.65,.09,8,40),metal,0,0,0,reactor);ring.rotation.x=i*Math.PI/3;}
  screen(['HCl + NaOH','→ NaCl + H₂O'],4.4,3,-3.8);
  for(const x of [-6,6]){mesh(new T.CylinderGeometry(.6,.6,4.5,20),glass,x,2.5,-7);box(.3,.3,6,x,5,-4,metal);}
  messages=['A válvula regula apenas o equipamento fictício. Em um experimento real, controle de fluxo não substitui o cálculo das quantidades.','Neutralização depende das espécies e das proporções. Misturar ácido e base não garante pH final igual a 7.','HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l). Ácido e base fortes reagem na proporção 1:1. A neutralização completa exige quantidades estequiométricas. Em solução, Na⁺ e Cl⁻ permanecem dissolvidos; os efeitos luminosos não representam uma explosão real.'];
 }else if(index===4){
  const core=actor(0,3.5,-6);mesh(new T.IcosahedronGeometry(.8,1),light,0,0,0,core);for(let i=0;i<4;i++){const ring=mesh(new T.TorusGeometry(1.6,.035,6,48),light,0,0,0,core);ring.rotation.set(i*.7,i*.5,0);}pedestal(0,-6);
  const molecule=actor(-4.1,3.1,-7.5);for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(new T.SphereGeometry(.18,12,8),light,Math.cos(a),Math.sin(a),0,molecule);const bond=box(.06,1,.06,Math.cos(a)*.5,Math.sin(a)*.5,0,metal,molecule);bond.rotation.z=a-Math.PI/2;}
  const finalMonitor=screen(['H₃O⁺ + OH⁻','→ 2 H₂O'],-4.6,2.3,-1);finalMonitor.children.forEach(o=>{o.scale.x*=.65;});finalMonitor.userData.contextName='Terminal de neutralização';
  for(let i=0;i<5;i++)box(3.5,.16,1,0,.1+i*.16,-2-i*.8);
  messages=['O núcleo é fictício. Energia luminosa no cenário não mede o conhecimento nem representa uma reação química específica.','Modelos moleculares destacam relações espaciais, mas não são fotografias de átomos. A carga e a composição devem ser analisadas separadamente.','Integre fórmulas, cargas, NOX, pH e proporções. Confira o que a questão pede antes de confirmar uma resposta.'];
 }
 group.add(buildArchitecture(index,theme.color));
 const fx=new T.Group();group.add(fx);fx.visible=false;
 const mist=new T.MeshBasicMaterial({color:0xc4efff,transparent:true,opacity:.2,depthWrite:false});
 const droplets=[];for(let i=0;i<18;i++){const m=mesh(new T.SphereGeometry(.06,6,4),index===3?mist:light,0,0,0,fx);droplets.push(m);}
 const stream=mesh(new T.CylinderGeometry(.045,.08,1.1,10),light,-2.35,1.7,-4,fx);
 const puddle=mesh(new T.CylinderGeometry(.55,.55,.025,20),light,-2.2,.96,-4,fx);
 const wave=mesh(new T.TorusGeometry(1,.04,6,40),light,0,3.5,-6,fx);
 const original=objects.map(o=>({position:o.position.clone(),rotation:o.rotation.clone(),scale:o.scale.clone()}));
 return {group,objects,messages,
  complete(progress){completionProgress=Math.max(0,Math.min(1,progress));},
  animate(animation,signal,reveal,reduced){effect={animation,signal,reveal,reduced,start:performance.now(),revealed:false};},
  tick(now,dt,reduced){
   if(!reduced){if(index===1){objects[0].rotation.y+=dt*.18;}if(index===3){objects[1].rotation.y+=dt*.15;}if(index===4){objects[0].rotation.y+=dt*.2;objects[1].rotation.y+=dt*.12;}light.emissiveIntensity=1.1+.12*Math.sin(now*.001)+.6*completionProgress;orbiters.forEach((o,i)=>{o.rotation.y+=dt*.5;if(index===2)o.position.y=.1+((o.position.y-.1+dt*.6)%3.4);});}
   if(!effect)return;const e=effect,t=Math.min(1,(now-e.start)/1400);
   if(e.signal.aborted||t>=1){if(!e.signal.aborted&&!e.revealed){e.revealed=true;e.reveal();}fx.visible=false;objects.forEach((o,i)=>{o.position.copy(original[i].position);o.rotation.copy(original[i].rotation);o.scale.copy(original[i].scale)});effect=null;return;}
   fx.visible=!e.reduced;if(index===2){stream.position.set(objects[0].position.x+.65,2.1,objects[0].position.z);puddle.position.set(objects[0].position.x+.8,1.205,objects[0].position.z);}
   stream.visible=index===2&&e.animation==='frasco_derramado';puddle.visible=stream.visible;wave.visible=index===4&&e.animation==='inteligencia_nucleo';
   stream.scale.y=Math.max(.01,Math.sin(Math.PI*t));puddle.scale.setScalar(Math.max(.01,t));wave.scale.setScalar(.5+t*3);wave.material.emissiveIntensity=1.2;
   droplets.forEach((d,i)=>{d.visible=index!==1;const a=i*2.4,r=.3+t*.8;
    if(index===2){d.position.set(e.animation==='frasco_derramado'?objects[0].position.x+.65:objects[2].position.x,3.8-((t*3+i/18)%1)*2.5,e.animation==='frasco_derramado'?objects[0].position.z:objects[2].position.z);}
    else if(index===3){d.position.set(-3.5+Math.sin(a)*r,2.3+t*2+i*.025,-3.5+Math.cos(a)*r);d.scale.setScalar(1+t*3);}
    else d.position.set(Math.cos(a+t*5)*r,3.5+Math.sin(a)*r,-6+Math.sin(a+t*5)*r);
   });
   if(!e.reduced){
    const o=objects[0],pulse=Math.sin(Math.PI*t);
    if(index===1){o.position.y=original[0].position.y+pulse*.7;o.rotation.y=t*Math.PI*2;if(e.animation==='fragmentacao_cristalina')objects[1].scale.setScalar(1+pulse*.7);}
    if(index===2){if(e.animation==='frasco_derramado')o.rotation.z=-pulse*.9;else objects[2].scale.setScalar(1+pulse*.06);}
    if(index===3){o.rotation.z=t*Math.PI*2;objects[1].scale.setScalar(1+pulse*.08);}
    if(index===4){o.rotation.y=t*Math.PI*2;o.scale.setScalar(1+pulse*.18);objects[1].rotation.z=t*Math.PI;}
   }
   if(!e.revealed&&t>=(e.reduced?.1:.65)){e.revealed=true;e.reveal();}
  }};
}
