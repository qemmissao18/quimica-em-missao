import {buildAlert} from 'portal/alert-hologram.js';
import {buildFinale} from 'portal/finale.mjs';
import {buildSiren,buildBurst,buildBarrier,buildRoomDamage,eliminationFrame} from 'portal/cinematic-effects.js';
import {directionFor} from 'portal/round-direction.js';
import {buildCuratedFixtures} from 'portal/art-direction.js';
import {buildEveryday} from 'portal/everyday.js';
import {buildSectorDoor,COMPLETIONS} from 'portal/sector-transition.js';
import {buildVault} from 'portal/vault.js';
import {scienceSet} from 'portal/scientific-models.js';
import {finishPortal} from 'portal/portal-finish.js';
import {buildArchitecture} from 'portal/architecture.js';
/* Portal dos Íons — fase 2. Visualização apenas: nunca calcula pontos,
   sorteia questões, altera deadlines ou envia respostas ao Supabase. */
import * as T from 'portal/vendor/three.module.js';
import {THEMES,buildEnvironment} from 'portal/environments.js';
const room=document.querySelector('#room');
const host=document.createElement('section');host.className='b2-portal';host.hidden=true;
host.innerHTML=`<header><strong>01 · PORTAL DOS ÍONS</strong><span>Prévia 3D em desenvolvimento</span></header><div class="b2-view"><canvas tabindex="0" aria-label="Laboratório 3D. Arraste para olhar; use as setas no teclado. Os objetos também estão nos botões abaixo."></canvas><p class="b2-hint">Arraste para explorar · toque nos equipamentos</p></div><div class="b2-controls"><button type="button" data-object="0">Painel de íons</button><button type="button" data-object="1">Modelo de partículas</button><button type="button" data-object="2">Analisador de amostras</button><button type="button" data-center>Centralizar câmera</button><button type="button" data-zoom="-3" aria-label="Aproximar visualização">Aproximar</button><button type="button" data-zoom="3" aria-label="Afastar visualização">Afastar</button><label><input type="checkbox" data-motion> Reduzir movimento</label></div><p class="b2-information" role="status" aria-live="polite">Explore os três equipamentos. A questão e as alternativas continuam logo abaixo.</p>`;
const lobby=room.querySelector('#lobby');lobby.before(host);
let renderer;
try{renderer=new T.WebGLRenderer({canvas:host.querySelector('canvas'),antialias:true,alpha:false,powerPreference:'low-power'});}catch{host.remove();console.info('Portal 3D indisponível; competição original preservada.');}
if(renderer) init();
function init(){
const scene=new T.Scene();scene.background=new T.Color('#030b19');scene.fog=new T.Fog('#030b19',14,34);
// Individual visual events never mutate authoritative multiplayer state.
const siren=buildSiren(),blast=buildBurst(),barrier=buildBarrier();
siren.group.position.set(0,5,-3);blast.group.position.set(0,3,-2);scene.add(siren.group,blast.group,barrier.group);
const emergency=buildAlert();emergency.group.position.set(0,3.7,-.5);scene.add(emergency.group);let alertStarted=-1e9,alertCount=0;
let cinematic=null,roomDamage=null;
let alarmUntil=0,eliminationStart=null,effectReduced=false,critical=false;
window.addEventListener('chem:local-error',e=>{alertCount=e.detail.count;alertStarted=performance.now();emergency.show(alertCount);critical=e.detail.count>=5;alarmUntil=performance.now()+(critical?3000:1400);effectReduced=!!e.detail.reduced;});
window.addEventListener('chem:local-eliminated',e=>{eliminationMarkers.clear();eliminationStart=performance.now();effectReduced=!!e.detail?.reduced;critical=true;roomDamage?.restore();if(roomDamage)scene.remove(roomDamage.group);roomDamage=buildRoomDamage([scienceSets[environmentIndex].group,everydaySets[environmentIndex].group,environments[environmentIndex]?.group].filter(Boolean));scene.add(roomDamage.group);});
window.addEventListener('chem:preview-ceremony',e=>{
 cinematic?.model.dispose();if(cinematic)scene.remove(cinematic.model.group);
 const model=buildFinale({color:e.detail.color});model.group.position.set(0,1.2,1);scene.add(model.group);
 cinematic={model,start:performance.now()-Math.max(0,e.detail.elapsed||0)*1000,reduced:!!e.detail.reduced,onFrame:e.detail.onFrame,skip:false,cues:new Set()};
 accessPreview=false;host.hidden=false;vault.group.visible=false;transitionUntil=0;
 for(const o of scene.children)if(o.userData.vaultVisibility!==undefined){o.visible=o.userData.vaultVisibility;delete o.userData.vaultVisibility;}
 model.group.visible=true;resume();
});
window.addEventListener('chem:skip-ceremony',()=>{if(cinematic)cinematic.skip=true;});
window.addEventListener('chem:close-ceremony',()=>{if(cinematic){scene.remove(cinematic.model.group);cinematic.model.dispose();cinematic=null;}eliminationStart=null;if(roomDamage){roomDamage.restore();scene.remove(roomDamage.group);roomDamage=null;}camera.position.y=3;barrier.group.visible=false;blast.group.visible=false;});
const camera=new T.PerspectiveCamera(80,1,.1,60);camera.position.set(0,3,6);camera.rotation.order='YXZ';
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
scene.add(new T.HemisphereLight(0x7abfff,0x101328,2));
const key=new T.PointLight(0x00bfff,70,20);key.position.set(0,4,-5);scene.add(key);
const steel=new T.MeshStandardMaterial({color:0x172a3c,metalness:.7,roughness:.4});
const dark=new T.MeshStandardMaterial({color:0x081323,metalness:.5,roughness:.55});
const cyan=new T.MeshStandardMaterial({color:0x30d9ff,emissive:0x00b9ff,emissiveIntensity:2});
const glow=new T.MeshBasicMaterial({color:0x55ddff});
const sectorDoor=buildSectorDoor();scene.add(sectorDoor.group);
const vault=buildVault();scene.add(vault.group);vault.group.visible=false;
let objects=[];const animated=[];
const portalArchitecture=buildArchitecture(0,0x36cfff);scene.add(portalArchitecture);
function mesh(g,m,x,y,z,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
function box(w,h,d,x,y,z,m=steel,p=scene){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);}
box(16,.3,22,0,-.15,0).name="portal-floor";box(16,.3,22,0,7,0);box(.3,7,22,-8,3.5,0);box(.3,7,22,8,3.5,0);box(16,7,.3,0,3.5,-11);box(16,7,.3,0,3.5,11);
const grid=new T.GridHelper(22,22,0x1c88bb,0x173d56);grid.position.y=.02;scene.add(grid);
for(let z=-9;z<=9;z+=3){for(const x of [-7.8,7.8]){box(.14,5,.17,x,3,z,cyan);box(.5,.3,.6,x,6.4,z);}box(15,.12,.15,0,6.7,z,cyan);}
// Circular metallic portal with independent light rings, as in the blue reference.
for(const [radius,thickness,mat] of [[2.6,.25,steel],[2.35,.065,cyan],[1.95,.035,cyan]]){const ring=mesh(new T.TorusGeometry(radius,thickness,10,64),mat,0,3,-10.6);}
const gateLeft=box(4.1,7,.25,-2.05,3.5,3,dark),gateRight=box(4.1,7,.25,2.05,3.5,3,dark);gateLeft.visible=gateRight.visible=false;let transitionUntil=0,transitionTarget=0;
const shutter=box(18,14,.3,0,12,3,dark);shutter.visible=false;
const transitionCaption=document.createElement("p");transitionCaption.className="b2-transition-caption";transitionCaption.hidden=true;viewPlaceholder();
function viewPlaceholder(){host.querySelector(".b2-view").append(transitionCaption);}
const door=mesh(new T.CylinderGeometry(2.3,2.3,.25,48),dark,0,3,-10.7);door.rotation.x=Math.PI/2;
box(.07,4.3,.2,0,3,-10.4,cyan);
for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=box(.12,.35,.12,Math.sin(a)*2.13,3+Math.cos(a)*2.13,-10.35,glow);mark.rotation.z=-a;}
const portalBenches=new T.Group();scene.add(portalBenches);for(const x of [-5.7,5.7]){box(3.3,.25,8,x,1.2,-1,steel,portalBenches);for(const z of [-4,2])box(.25,1.2,.25,x,0.6,z,steel,portalBenches);}
function label(text,x,y,z){const c=document.createElement('canvas');c.width=1024;c.height=240;const ctx=c.getContext('2d');ctx.fillStyle='#08172c';ctx.fillRect(0,0,1024,240);ctx.strokeStyle='#4ddaff';ctx.lineWidth=6;ctx.strokeRect(3,3,1018,234);ctx.font='bold 80px sans-serif';ctx.fillStyle='#ddfaff';ctx.textAlign='center';ctx.fillText(text,512,150);const tex=new T.CanvasTexture(c);return mesh(new T.PlaneGeometry(3.2,.85),new T.MeshBasicMaterial({map:tex}),x,y,z);}
const panel=new T.Group(); // Superseded decorative board is no longer rendered.
const atom=new T.Group();atom.position.set(-4.8,3,-3.8);atom.userData.contextName='Instalação de transferência eletrônica';scene.add(atom);objects.push(atom);animated.push(atom);
const bottle=new T.Group();bottle.position.set(5.7,1.325,-2);scene.add(bottle);
const glass=new T.MeshStandardMaterial({color:0x9aeaff,transparent:true,opacity:.25,roughness:.15,metalness:.1,side:T.DoubleSide,depthWrite:false});
mesh(new T.CylinderGeometry(.48,.48,1.7,24),glass,0,.85,0,bottle);mesh(new T.CylinderGeometry(.43,.43,1.1,24),new T.MeshStandardMaterial({color:0x009cbf,emissive:0x006d99,transparent:true,opacity:.7}),0,.57,0,bottle);mesh(new T.CylinderGeometry(.55,.55,.14,24),steel,0,1.75,0,bottle);objects.push(bottle);
const sampleLabel=new T.Group(); // Equipment names are contextual HTML, not floating labels.
const particleGeometry=new T.BufferGeometry();const positions=new Float32Array(72*3);for(let i=0;i<72;i++){positions[i*3]=(Math.random()-.5)*13;positions[i*3+1]=Math.random()*6;positions[i*3+2]=(Math.random()-.5)*18;}particleGeometry.setAttribute('position',new T.BufferAttribute(positions,3));const particles=new T.Points(particleGeometry,new T.PointsMaterial({color:0x3ecfff,size:.045,transparent:true,opacity:.65}));scene.add(particles);
let messages=[
'Instalação de transferência eletrônica: Na perde um elétron e forma Na⁺; Cl ganha um elétron e forma Cl⁻. As partículas e o deslocamento são esquemáticos, não trajetórias reais.',
'Analisador: a cor azul é um recurso visual do jogo. A cor de uma solução, sozinha, não permite classificá-la como ácido, base ou sal.'
];
const portalFinish=finishPortal(scene,renderer,steel,dark,glass);portalFinish.setActive(true);
const scienceSets=[0,1,2,3,4].map(scienceSet);scienceSets.forEach((e,i)=>{e.group.visible=i===0;scene.add(e.group)});
const everydaySets=[0,1,2,3,4].map(buildEveryday);everydaySets.forEach((e,i)=>{e.group.visible=i===0;scene.add(e.group)});
// Consolidate all sodium/chloride teaching into one installation.
const ionInstallation=scienceSets[0].targets[0];ionInstallation.position.set(0,0,0);atom.add(ionInstallation);
objects.push(...everydaySets[0].targets);messages.push(...everydaySets[0].messages);
bottle.userData.contextName='Amostra aquosa — inspeção';
const fixtures=[buildCuratedFixtures(0),buildCuratedFixtures(1)];fixtures.forEach((g,i)=>{g.visible=i===0;scene.add(g)});
const portalObjects=objects,portalMessages=messages;let environmentIndex=0;
const environments=[null,...[1,2,3,4].map(buildEnvironment)];environments.slice(1).forEach(e=>{e.group.visible=false;scene.add(e.group)});
function changeEnvironment(index){
 if(index===environmentIndex)return;
 hintEffect=null;scanner.visible=false;atom.position.y=3;atom.scale.setScalar(1);
 scienceSets.forEach((e,i)=>e.group.visible=i===index);everydaySets.forEach((e,i)=>e.group.visible=i===index);
 environments[environmentIndex]?.complete(0);environmentIndex=index;portalFinish.setActive(index===0);
 environments.slice(1).forEach((e,i)=>e.group.visible=index===i+1);
 fixtures.forEach((g,i)=>g.visible=i===index);portalArchitecture.visible=index===0;portalBenches.visible=index===0;
 portalObjects.forEach(o=>o.visible=index===0);sampleLabel.visible=index===0;
 objects=index===0?portalObjects:[...environments[index].objects,...scienceSets[index].targets,...everydaySets[index].targets];
 messages=index===0?portalMessages:[...environments[index].messages,...scienceSets[index].messages,...everydaySets[index].messages];
 const theme=THEMES[index];key.color.set(theme.color);cyan.color.set(theme.color);cyan.emissive.set(theme.color);glow.color.set(theme.color);
 host.querySelector('header strong').textContent=`${index+1} · ${theme.name.toUpperCase()}`;
 host.querySelectorAll('[data-object]').forEach((b,i)=>{b.textContent=theme.labels[i];b.setAttribute('aria-pressed','false')});
 info.textContent='Explore os equipamentos. Questão e alternativas continuam disponíveis abaixo.';detail.hidden=true;rebuildEquipmentList();center();
}
const info=host.querySelector('.b2-information');
const detail=document.createElement('section');detail.className='b2-detail';detail.hidden=true;detail.setAttribute('aria-label','Leitura ampliada do equipamento');
detail.innerHTML='<button type="button" aria-label="Fechar leitura ampliada">Fechar ×</button><h3 tabindex="-1"></h3><p></p>';
host.append(detail);let lastControl=null;
detail.querySelector('button').onclick=()=>{detail.hidden=true;lastControl?.focus();};
detail.addEventListener('keydown',e=>{if(e.key==='Escape')detail.querySelector('button').click()});
const equipmentList=document.createElement('div');equipmentList.className='b2-equipment-list';equipmentList.setAttribute('aria-label','Equipamentos deste ambiente');host.querySelector('.b2-controls').before(equipmentList);
function rebuildEquipmentList(){equipmentList.replaceChildren();objects.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=o.userData.contextName||(i<3?THEMES[environmentIndex].labels[i]:['Modelo científico ampliado','Modelo de água'][i-3]||'Modelo científico');b.onclick=()=>interact(i);equipmentList.append(b);});}
rebuildEquipmentList();
const narrative=document.createElement('aside');narrative.className='b2-round-direction';narrative.innerHTML='<strong></strong><p></p><button type="button">Examinar estação</button>';host.querySelector('.b2-view').after(narrative);let roundDirection=null;
function showDirection(position){roundDirection=directionFor(position);narrative.hidden=!roundDirection;if(!roundDirection)return;narrative.querySelector('strong').textContent=`Rodada ${position+1} · ${roundDirection.title}`;narrative.querySelector('p').textContent=roundDirection.description;}
narrative.querySelector('button').onclick=()=>{if(roundDirection&&roundDirection.environment===environmentIndex){const target=objects[roundDirection.target]||objects[0];focusObject(target);interact(objects.indexOf(target));}};
showDirection(0);let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const checkbox=host.querySelector('[data-motion]');checkbox.checked=reduced;checkbox.onchange=()=>{reduced=checkbox.checked};
function interact(i){objects[i].userData.activate?.(performance.now());lastControl=document.activeElement;detail.hidden=false;detail.querySelector('h3').textContent=equipmentList.children[i]?.textContent||'Equipamento científico';detail.querySelector('p').textContent=messages[i];detail.querySelector('h3').focus({preventScroll:true});if(environmentIndex<2)focusObject(objects[i]);info.textContent=messages[i];objects[i].userData.pulse=performance.now();host.querySelectorAll('[data-object]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));}
host.querySelectorAll('[data-object]').forEach(b=>b.remove());
let yaw=0,pitch=0,down=null,contextLost=false;const canvas=renderer.domElement;
function zoom(delta){camera.fov=Math.max(45,Math.min(95,camera.fov+delta));camera.updateProjectionMatrix();}
host.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>zoom(Number(b.dataset.zoom)));
canvas.addEventListener('wheel',e=>{if(document.activeElement!==canvas)return;e.preventDefault();zoom(Math.sign(e.deltaY)*3);},{passive:false});
function focusObject(o){const b=new T.Box3().setFromObject(o),v=b.getCenter(new T.Vector3()).sub(camera.position);yaw=Math.atan2(-v.x,-v.z);pitch=Math.atan2(v.y,Math.hypot(v.x,v.z));camera.fov=42;camera.updateProjectionMatrix();}
function center(){yaw=0;pitch=0;camera.fov=80;camera.updateProjectionMatrix();}host.querySelector('[data-center]').onclick=center;for(const [name,angle] of [['Vista frontal',0],['Vista lateral esquerda',Math.PI/2],['Vista lateral direita',-Math.PI/2]]){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{center();yaw=angle;};host.querySelector('.b2-controls').append(b);}
canvas.addEventListener('pointerdown',e=>{if(down)return;canvas.focus({preventScroll:true});down={id:e.pointerId,x:e.clientX,y:e.clientY,travel:0};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;down.travel+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=Math.max(-1.1,Math.min(1.1,pitch-dy*.004));down.x=e.clientX;down.y=e.clientY;});
const ray=new T.Raycaster();canvas.addEventListener('pointerup',e=>{if(!down||e.pointerId!==down.id)return;const click=down.travel<8;down=null;if(!click)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=ray.intersectObjects(objects,true);if(hits.length){let o=hits[0].object;while(o&&!objects.includes(o))o=o.parent;if(o)interact(objects.indexOf(o));}});
canvas.addEventListener('pointercancel',()=>{down=null});canvas.addEventListener('lostpointercapture',()=>{down=null});
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='Home')center();if(e.key==='ArrowLeft')yaw+=.12;if(e.key==='ArrowRight')yaw-=.12;if(e.key==='ArrowUp')pitch=Math.min(1.1,pitch+.12);if(e.key==='ArrowDown')pitch=Math.max(-1.1,pitch-.12);if(e.key==='+'||e.key==='-'){zoom(e.key==='+'?-3:3);}});
const view=host.querySelector('.b2-view');new ResizeObserver(()=>{const w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(view);
// Two Portal-specific hint effects. The text is revealed by the controller only
// after this real scene animation reaches its reveal point (or its fallback).
const scanner=mesh(new T.PlaneGeometry(2.8,.12),new T.MeshBasicMaterial({color:0x77ffff,transparent:true,opacity:.65,side:T.DoubleSide}),4,1.5,-3.4);scanner.visible=false;
let hintEffect=null;
window.addEventListener('chem:hint-animation',e=>{
 const d=e.detail;if(host.hidden)return;if(environmentIndex>0){environments[environmentIndex].animate(d.animation,d.signal,d.reveal,reduced);return;}if(!['holograma_atomico','scanner_ions'].includes(d.animation))return;
 hintEffect={...d,start:performance.now()-Math.max(0,e.detail.elapsed||0)*1000,revealed:false};
 if(reduced){key.intensity=85;setTimeout(()=>{if(!d.signal.aborted)d.reveal();key.intensity=70;},150);}
});
let visualSkipped=false;const skipTransition=document.createElement('button');skipTransition.textContent='Pular movimento da transição';skipTransition.hidden=true;skipTransition.onclick=()=>{visualSkipped=true;};host.querySelector('.b2-controls').append(skipTransition);
let sonicTransition=null,sonicMarkers=new Set(),eliminationMarkers=new Set();
function cue(name){window.dispatchEvent(new CustomEvent('chem:cinematic-cue',{detail:name}));}
function motion(active){window.dispatchEvent(new CustomEvent('chem:mechanical-motion',{detail:active}));}
function timelineCues(age,markers,sequence){for(const [time,name] of sequence)if(age>=time&&!markers.has(time)){markers.add(time);if(age-time<.25)cue(name);}}
let running=false,last=0,accessPreview=false;
function frame(now){if(contextLost||host.hidden||!room.classList.contains('on')||document.hidden){running=false;return}requestAnimationFrame(frame);if(now-last<32)return;const dt=Math.min((now-last)/1000,.05);last=now;const transitionRemaining=transitionUntil-now;const open=1-Math.max(0,Math.min(1,transitionRemaining/5000));
if(sonicTransition!==transitionUntil){sonicTransition=transitionUntil;sonicMarkers.clear();}
if(transitionRemaining>0&&!accessPreview&&!visualSkipped&&!reduced){
 timelineCues(open*5,sonicMarkers,transitionTarget===0?[[0,'unlock'],[.8,'lock'],[1.6,'open'],[3.4,'lock']]:[[0,'correct'],[.9,'open'],[2,'lock'],[2.9,'unlock'],[3.2,'open'],[4.4,'lock']]);
 motion(transitionTarget===0?open<.68:(open>=.18&&open<.4)||(open>=.64&&open<.88));
}else motion(false);
gateLeft.visible=gateRight.visible=false;
vault.group.visible=accessPreview||(transitionRemaining>0&&transitionTarget===0);
let vaultState=null;if(vault.group.visible){vaultState=vault.update(accessPreview?0:visualSkipped?1:open);for(const o of scene.children){if(o===vault.group||o.isLight)continue;if(o.userData.vaultVisibility===undefined)o.userData.vaultVisibility=o.visible;o.visible=vaultState.reveal?o.userData.vaultVisibility:false;if(o.geometry?.type==='BoxGeometry'&&o.position.z===11)o.visible=false;}}else{for(const o of scene.children){if(o.userData.vaultVisibility!==undefined){o.visible=o.userData.vaultVisibility;delete o.userData.vaultVisibility;}}}
shutter.visible=false;
sectorDoor.group.visible=transitionRemaining>0&&transitionTarget>0&&!visualSkipped;
transitionCaption.hidden=transitionRemaining<=0||visualSkipped;skipTransition.hidden=transitionRemaining<=0;
let sectorState=null;
if(transitionRemaining>0&&transitionTarget>0){
 sectorState=sectorDoor.update(open,reduced||visualSkipped);
 if(open<.5){if(environmentIndex===0&&!reduced)particles.rotation.y+=dt*.2;environments[environmentIndex]?.complete(open*2,reduced);key.intensity=70+10*Math.min(1,open*2);transitionCaption.textContent=COMPLETIONS[environmentIndex];}
 if(sectorState.swap){changeEnvironment(transitionTarget);key.intensity=70;transitionCaption.textContent=THEMES[transitionTarget].name+' · '+(transitionTarget<1?'Fácil':transitionTarget<4?'Médio':'Difícil');}
}else if(transitionRemaining<=0&&!accessPreview){changeEnvironment(transitionTarget);key.intensity=70;visualSkipped=false;}
if(visualSkipped){vault.group.visible=false;sectorDoor.group.visible=false;transitionCaption.hidden=false;transitionCaption.textContent='Aguardando o início sincronizado da rodada';}
camera.position.z=vaultState?(reduced?14:vaultState.cameraZ):sectorState?sectorState.cameraZ:6;camera.rotation.y=(vaultState||sectorState)?0:yaw;camera.rotation.x=(vaultState||sectorState)?0:pitch;if(!reduced){particles.rotation.y+=dt*.008;}
if(hintEffect){const h=hintEffect,elapsed=now-h.start;
 if(h.signal.aborted||elapsed>1500){scanner.visible=false;atom.scale.setScalar(1);hintEffect=null;}
 else if(!reduced){if(h.animation==='scanner_ions'){scanner.visible=true;scanner.position.y=1.5+Math.sin(elapsed/1500*Math.PI)*1.8;}
 else{ionInstallation.children.filter(o=>o.isMesh&&o.geometry.type==='SphereGeometry').forEach(o=>o.rotation.y+=dt*2);atom.position.y=3+Math.sin(elapsed/1500*Math.PI)*.4;}
 if(elapsed>=900&&!h.revealed){h.revealed=true;h.reveal();}}
} else atom.position.y=3;
objects.forEach(o=>{const age=now-(o.userData.pulse||-10000);o.scale.setScalar(!reduced&&age<700?1+.08*Math.sin(age/700*Math.PI):1);});
// Apply hint transforms after the interaction pulse, which resets object scale.
if(environmentIndex>0)environments[environmentIndex].tick(now,dt,reduced);
everydaySets[environmentIndex].tick(now,reduced);scienceSets[environmentIndex].tick(dt,reduced);portalFinish.tick(now,reduced);
emergency.tick((now-alertStarted)/1000,reduced||effectReduced);
const elapsed=eliminationStart===null?null:(now-eliminationStart)/1000;
siren.tick(now/1000,elapsed!==null||now<alarmUntil,{reduced:reduced||effectReduced,critical,lights:!document.getElementById('low-flash')?.checked});
if(elapsed!==null){if(!effectReduced)timelineCues(elapsed,eliminationMarkers,[[5,'blast'],[5.15,'debris'],[6.2,'steam'],[7,'open'],[8.5,'lock']]);const f=eliminationFrame(elapsed,effectReduced);blast.tick(f.blast,{reduced:effectReduced,low:document.getElementById('low-particles')?.checked,lights:!document.getElementById('low-flash')?.checked});roomDamage?.tick(f.blast,effectReduced);barrier.group.visible=f.door;if(f.reveal){if(alertCount!==11){alertCount=11;emergency.show(11);}emergency.group.position.set(0,3.8,4);emergency.tick(1,true,true);}if(f.door){sectorDoor.group.visible=true;sectorDoor.update(.5,false);}camera.rotation.set(0,0,0);camera.position.z=effectReduced?6:6-Math.min(elapsed/5,1)*.7;}
if(cinematic){const c=cinematic,f=c.model.tick(c.skip?10:(now-c.start)/1000,c.reduced);camera.position.set(0,3.3,7);camera.lookAt(0,2.5,1);c.onFrame?.(f);const age=(now-c.start)/1000;for(const [time,name]of [[1,'foam'],[3,'foam-rise'],[4.4,'wrong'],[6,'glass'],[6.2,'debris'],[7,'award']])if(age>=time&&!c.cues.has(name)&&!c.skip&&!c.reduced){c.cues.add(name);window.dispatchEvent(new CustomEvent('chem:cinematic-cue',{detail:name==='foam-rise'?'foam':name}));}}
renderer.render(scene,camera);}
function resume(){if(!contextLost&&!running&&!host.hidden&&room.classList.contains('on')&&!document.hidden){running=true;last=performance.now();requestAnimationFrame(frame)}}
window.addEventListener('chem:access-preview',()=>{accessPreview=true;visualSkipped=false;transitionUntil=0;host.hidden=false;showDirection(null);resume();});
// Bridge receives only the already-authoritative state rendered by the existing room.
window.addEventListener('chem:room-state',e=>{accessPreview=false;const s=e.detail;showDirection(s?.phase==='question'?s.position:null);preview.hidden=!!s;selector.hidden=!!s;host.hidden=!(s&&s.experience==='battle2'&&['question','transition'].includes(s.phase)&&s.position>=0&&s.position<15);if(!host.hidden){transitionTarget=Math.floor(s.position/3);if(s.phase==='transition'){transitionUntil=performance.now()+Math.max(0,Date.parse(s.started_at)-Date.parse(s.server_now));transitionCaption.textContent=THEMES[transitionTarget].name+' · '+(transitionTarget<1?'Fácil':transitionTarget<4?'Médio':'Difícil');}else{transitionUntil=0;changeEnvironment(transitionTarget);}resume();}});
new MutationObserver(resume).observe(room,{attributes:true,attributeFilter:['hidden','class','style']});document.addEventListener('visibilitychange',resume);
// Explicit local visual review; not a fake multiplayer room or an alternate game.
const preview=document.createElement('button');preview.type='button';preview.className='btn white';preview.textContent='Prévia dos ambientes 3D (sem partida)';preview.onclick=()=>{host.hidden=!host.hidden;resume()};room.append(preview);
const selector=document.createElement('select');selector.setAttribute('aria-label','Ambiente da prévia sem partida');THEMES.forEach((t,i)=>{const o=document.createElement('option');o.value=i;o.textContent=t.name;selector.append(o)});selector.onchange=()=>{host.hidden=false;transitionTarget=Number(selector.value);changeEnvironment(transitionTarget);showDirection(transitionTarget*3);resume()};room.append(selector);
const demoTransition=document.createElement('button');demoTransition.type='button';demoTransition.textContent='Concluir etapa e atravessar porta';demoTransition.onclick=()=>{if(preview.hidden)return;host.hidden=false;if(environmentIndex===4){window.dispatchEvent(new CustomEvent('chem:demo-finale'));return;}transitionTarget=environmentIndex+1;selector.value=String(transitionTarget);visualSkipped=false;transitionUntil=performance.now()+5000;transitionCaption.textContent=THEMES[transitionTarget].name+' · demonstração local';resume()};room.append(demoTransition);
const opening=document.createElement('button');opening.textContent='Demonstrar entrada pelo cofre';opening.onclick=()=>{if(preview.hidden)return;host.hidden=false;changeEnvironment(0);transitionTarget=0;selector.value='0';visualSkipped=false;transitionUntil=performance.now()+5000;resume();};room.append(opening);window.addEventListener('chem:room-state',({detail:s})=>{demoTransition.hidden=opening.hidden=!!s;});
const roundPreview=document.createElement('select');roundPreview.setAttribute('aria-label','Rodada demonstrativa, sem partida');for(let i=0;i<15;i++){const o=document.createElement('option');o.value=i;o.textContent=`Rodada ${i+1} · ${directionFor(i).title}`;roundPreview.append(o);}roundPreview.onchange=()=>{const p=Number(roundPreview.value);host.hidden=false;transitionUntil=0;transitionTarget=Math.floor(p/3);selector.value=String(transitionTarget);changeEnvironment(transitionTarget);showDirection(p);resume();};room.append(roundPreview);window.addEventListener('chem:room-state',({detail:s})=>{roundPreview.hidden=!!s;});
canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;info.textContent='Visual 3D recuperado. A competição foi preservada.';resume();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;info.textContent='Visual 3D temporariamente indisponível. A competição continua abaixo.'});
}
