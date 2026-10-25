import * as T from 'portal/vendor/three.module.js';
// Curated fixtures for rooms 0/1 only. No network or gameplay state.
export function buildCuratedFixtures(stage){
 const group=new T.Group();group.name='curated-fixtures-'+stage;
 const steel=new T.MeshStandardMaterial({color:0x344854,metalness:.72,roughness:.4});
 const accent=new T.MeshStandardMaterial({color:stage?0x9577cb:0x5fc5da,emissive:stage?0x72489e:0x277c92,emissiveIntensity:.45,roughness:.35});
 const glass=new T.MeshStandardMaterial({color:0xcadbea,opacity:.09,transparent:true,depthWrite:false,side:T.DoubleSide,roughness:.12});
 function mesh(geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;}
 const sites=stage?[[-4.6,2.7,-4.5],[4.8,2,-2],[4.8,2,3]]:[[-4.8,3,-3.8]];
 for(const [x,y,z] of sites){
  // Slim suspended instrument cradle, not a new tabletop or a sign.
  const r=stage?1.05:1.65;
  const ring=mesh(new T.TorusGeometry(r,.045,8,48),accent,x,y-.7,z);ring.rotation.x=Math.PI/2;
  for(const dx of [-r*.8,r*.8])mesh(new T.CylinderGeometry(.025,.025,Math.max(.1,6-y),6),steel,x+dx,(6+y)/2,z);
  if(stage){const dome=mesh(new T.SphereGeometry(r,20,12,0,Math.PI*2,0,Math.PI/2),glass,x,y-.7,z);}
  else{const back=mesh(new T.BoxGeometry(3.9,3.2,.12),steel,x,y,z-.6);const light=new T.PointLight(0x7ee7ff,9,5);light.position.set(x,y+1,z+.8);group.add(light);}
 }
 return group;
}
