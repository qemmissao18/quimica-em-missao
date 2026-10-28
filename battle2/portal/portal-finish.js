import * as T from 'portal/vendor/three.module.js';
// Portal-only material pass; no multiplayer state or question data.
export function finishPortal(scene,renderer,steel,dark,glass){
 const original={background:scene.background,fog:scene.fog,environment:scene.environment,toneMapping:renderer.toneMapping,exposure:renderer.toneMappingExposure};
 const originals=new Map(),extras=new T.Group();extras.name='portal-finish';scene.add(extras);
 function texture(draw,size=256,color=true){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
 const brushed=texture((c,n)=>{c.fillStyle='#60788a';c.fillRect(0,0,n,n);for(let i=0;i<n;i++){c.strokeStyle=`rgba(210,235,255,${.025+(i*17%11)*.006})`;c.beginPath();c.moveTo(0,i);c.lineTo(n,i);c.stroke();}c.strokeStyle='#263d4d';c.lineWidth=3;c.strokeRect(2,2,n-4,n-4);for(const x of [8,n-8])for(const y of [8,n-8]){c.fillStyle='#a9b7bd';c.beginPath();c.arc(x,y,2,0,7);c.fill();}});
 const tiles=texture((c,n)=>{c.fillStyle='#486776';c.fillRect(0,0,n,n);c.fillStyle='#142c3a';c.fillRect(0,0,n,5);c.fillRect(0,0,5,n);c.fillStyle='#698997';c.fillRect(7,7,n-14,2);});tiles.repeat.set(8,11);
 const grain=texture((c,n)=>{for(let y=0;y<n;y++){const v=175+(y*37%25);c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(0,y,n,1);}},256,false);
 const steelFinish=steel.clone();steelFinish.map=brushed;steelFinish.roughnessMap=grain;steelFinish.bumpMap=grain;steelFinish.bumpScale=.008;steelFinish.roughness=.32;steelFinish.envMapIntensity=.65;
 const floorFinish=new T.MeshStandardMaterial({map:tiles,color:0x8ca8b9,metalness:.4,roughness:.28,envMapIntensity:.7});
 const darkFinish=dark.clone();darkFinish.map=brushed;darkFinish.color.setHex(0x243d50);darkFinish.roughness=.38;
 const glassFinish=glass.clone();glassFinish.opacity=.2;glassFinish.envMapIntensity=1;glassFinish.metalness=.05;
 const architecture=scene.getObjectByName('architecture-0'),architectureMaterials=new Map();
 architecture?.traverse(o=>{if(!o.isMesh||!o.material.isMeshStandardMaterial||o.material.emissiveIntensity>1)return;const old=o.material;if(!architectureMaterials.has(old)){const m=old.clone();m.map=brushed;m.roughnessMap=grain;m.bumpMap=grain;m.bumpScale=.006;m.color.setHex(0x6b8495);m.roughness=.48;m.envMapIntensity=.6;architectureMaterials.set(old,m);}originals.set(o,{old,new:architectureMaterials.get(old)});});
 scene.traverse(o=>{if(!o.isMesh||o.parent===extras)return;let m;if(o.material===steel)m=steelFinish;if(o.material===dark)m=darkFinish;if(o.material===glass)m=glassFinish;if(o.name==='portal-floor')m=floorFinish;if(m)originals.set(o,{old:o.material,new:m});});
 // Static environment lighting, generated once; no per-frame reflection render.
 const sky=texture((c,n)=>{const g=c.createLinearGradient(0,0,0,n);g.addColorStop(0,'#071324');g.addColorStop(.48,'#557f9c');g.addColorStop(.55,'#09283b');g.addColorStop(1,'#03101d');c.fillStyle=g;c.fillRect(0,0,n,n);c.fillStyle='#8be7ff';c.fillRect(n*.44,n*.35,n*.1,n*.2);c.fillStyle='#e1aa66';for(const x of [.1,.78])c.fillRect(n*x,n*.4,n*.025,n*.12);});sky.mapping=T.EquirectangularReflectionMapping;
 const generator=new T.PMREMGenerator(renderer),env=generator.fromEquirectangular(sky);generator.dispose();sky.dispose();
 const halo=texture((c,n)=>{const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(30,200,255,.28)');g.addColorStop(.65,'rgba(15,170,255,.12)');g.addColorStop(1,'rgba(0,100,255,0)');c.fillStyle=g;c.fillRect(0,0,n,n);});
 const sprite=new T.Sprite(new T.SpriteMaterial({map:halo,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sprite.position.set(0,3,-10.25);sprite.scale.set(7,7,1);extras.add(sprite);
 // Warm cabinet lighting balances the reference's cyan portal.
 for(const x of [-5.7,5.7]){const l=new T.PointLight(0xffbc69,12,7,2);l.position.set(x,3.6,-2);extras.add(l);}
 const wash=new T.PointLight(0x30cfff,20,12,2);wash.position.set(0,1,-7);extras.add(wash);
 // Lightweight contact darkening beneath benches, not claimed as ray-traced shadows.
 const contact=texture((c,n)=>{const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,n,n);});
 for(const x of [-5.7,5.7]){const m=new T.Mesh(new T.PlaneGeometry(5,10),new T.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.025,-1);extras.add(m);}
 const bg=new T.Color(0x040f1c),fog=new T.FogExp2(0x061827,.025);let active=false;
 return {setActive(on){if(active===on)return;active=on;extras.visible=on;renderer.toneMapping=on?T.ACESFilmicToneMapping:original.toneMapping;renderer.toneMappingExposure=on?1.15:original.exposure;for(const [o,m]of originals)o.material=on?m.new:m.old;scene.environment=on?env.texture:original.environment;scene.background=on?bg:original.background;scene.fog=on?fog:original.fog;},tick(now,reduced){if(active)sprite.material.opacity=reduced?.85:.85+.05*Math.sin(now*.0007);}};
}
