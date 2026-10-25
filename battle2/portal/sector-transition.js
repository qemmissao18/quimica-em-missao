import * as T from 'portal/vendor/three.module.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Pure visual timeline. Never writes room state, scores or server deadlines.
export function sectorPose(progress,reduced=false){
 const p=Math.max(0,Math.min(1,progress));
 const close=smooth((p-.18)/.22),open=smooth((p-.64)/.24);
 return {swap:p>=.5,closed:p>=.4&&p<=.64,aperture:reduced?(p<.4||p>=.88?1:0):1-close+open,
  completion:Math.min(1,p/.18),bolt:close*(1-smooth((p-.58)/.06)),
  cameraZ:reduced?6:6-1.2*smooth(p/.4)+1.2*smooth((p-.88)/.12),done:p===1};
}
export const COMPLETIONS=[
 'Íons analisados · acesso autorizado',
 'Rede cristalina estabilizada · saída liberada',
 'Análise das soluções concluída · acesso liberado',
 'Neutralização concluída · indicadores estabilizados',
 'Núcleo estabilizado · missão concluída'
];
export function buildSectorDoor(){
 const group=new T.Group();group.name='sector-security-door';
 const metal=new T.MeshStandardMaterial({color:0x344957,metalness:.78,roughness:.34});
 const inset=new T.MeshStandardMaterial({color:0x0b1720,metalness:.65,roughness:.5});
 const lamp=new T.MeshStandardMaterial({color:0x62ffd2,emissive:0x62ffd2,emissiveIntensity:.8});
 function box(w,h,d,x,y,z,m=metal,parent=group){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o;}
 // Wide opaque leaves seal the full frustum, including wide desktop viewports.
 const leaves=[new T.Group(),new T.Group()];leaves.forEach((g,i)=>{group.add(g);box(22,20,.48,0,0,0,metal,g);box(21.7,19.7,.08,0,0,.29,inset,g);
  for(const y of [-2,0,2]){box(21.7,.12,.15,0,y,.38,metal,g);box(.07,1.2,.08,i? -10.6:10.6,y,.42,lamp,g);}
  for(const y of [-2.4,2.4])box(.45,.55,.32,i?-10.2:10.2,y,.48,metal,g);
 });
 // Door frame and rails are persistent geometry during the crossing.
 for(const x of [-3.25,3.25])box(.35,7,.75,x,3,3.1);
 for(const y of [-.35,6.35]){box(7,.35,.8,0,y,3.1);box(6.3,.06,.08,0,y+.12,3.55,lamp);}
 const bolts=[];for(const y of [1.3,3,4.7])bolts.push(box(.8,.14,.18,0,y,3.5));
 group.visible=false;
 return {group,update(p,reduced=false){const s=sectorPose(p,reduced);leaves.forEach((g,i)=>g.position.set((i?1:-1)*(11+s.aperture*22),3,3));bolts.forEach(b=>{b.scale.x=s.bolt;b.visible=s.bolt>.01;});lamp.emissiveIntensity=.65+.25*s.completion;return s;}};
}
