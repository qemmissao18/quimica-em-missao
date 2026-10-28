import * as T from 'portal/vendor/three.module.js';
// Reference-led structural sets. No game state, RPCs or answer data here.
export function buildArchitecture(index,color){
 const group=new T.Group();group.name=`architecture-${index}`;
 const metal=new T.MeshStandardMaterial({color:index===4?0x574529:0x172735,metalness:.75,roughness:.38});
 const rock=new T.MeshStandardMaterial({color:0x241333,roughness:.88,flatShading:true});
 const lit=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.1,roughness:.35});
 function mesh(g,m,x,y,z){const o=new T.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;}
 function box(w,h,d,x,y,z,m=metal){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z);}
 function pipe(a,b,r=.09,m=metal){const u=new T.Vector3(...a),v=new T.Vector3(...b),d=v.clone().sub(u);const o=mesh(new T.CylinderGeometry(r,r,d.length(),8),m,...u.add(v).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 function hoop(r,x,y,z){return mesh(new T.TorusGeometry(r,.1,6,32),metal,x,y,z);}
 if(index===0){
  for(const x of [-7,7])for(const y of [5.5,6]){pipe([x,y,9],[x,y,-10],.13);for(const z of [-7,-2,3,8]){const c=hoop(.2,x,y,z);c.rotation.y=Math.PI/2;}}
  for(const x of [-6.8,6.8])for(const z of [-6,-2,2]){box(1.4,2,.7,x,2.5,z);box(1.2,.06,.8,x,3.6,z,lit);for(let j=0;j<3;j++)mesh(new T.CylinderGeometry(.1,.1,.35,8),lit,x-.4+j*.4,3.8,z);}
 }else if(index===1){
  // Jagged cavern silhouette instead of the industrial box used by the portal.
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Math.sin(a)*7,z=Math.cos(a)*9;const o=mesh(new T.IcosahedronGeometry(1.4,0),rock,x,2.7,z);o.scale.set(1.1,2.4+(i%3)*.3,1);o.rotation.y=i*.71;}
  for(let i=0;i<12;i++){const o=mesh(new T.ConeGeometry(.7,1.8,5),rock,Math.sin(i*2.4)*6,6,Math.cos(i*2.4)*8);o.rotation.z=Math.PI;}
  mesh(new T.CylinderGeometry(2.6,2.9,.25,24),metal,0,.35,-5);
  for(const x of [-2.7,2.7])pipe([x,.6,1],[x,.6,-5],.045,lit);
 }else if(index===2){
  // Side laboratory benches, shelves and rack-mounted samples.
  for(const x of [-5.5,5.5]){box(2.6,.18,13,x,1.1,-1);for(const z of [-6,0,5])box(2.4,.95,1.7,x,.55,z);for(const y of [3.8,5]){box(2,.12,13,x,y,-1);for(let j=0;j<12;j++){const z=-6+j;mesh(new T.CylinderGeometry(.12,.16,.45,8),j%3===0?lit:metal,x,y+.3,z);}}}
  for(const x of [-7.5,7.5])for(const z of [-7,-2,3,8]){box(.12,5,.1,x,3,z,lit);box(.08,.08,4,x,5.5,z);}
  box(9,.15,1,0,6,-4,lit);
 }else if(index===3){
  // Raised industrial reactor frame and connected overhead pipe network.
  for(const x of [-3,3]){pipe([x,.2,-7],[x,6.3,-7],.22);pipe([x,6.3,-7],[x,6.3,6],.2);pipe([x,4.8,-7],[x*2,4.8,-7],.16);}
  for(const y of [1,4.8,6]){const ring=hoop(3,0,y,-6);ring.rotation.x=Math.PI/2;}
  for(const x of [-6,6]){pipe([x,4.8,-7],[x,4.8,7],.2);for(const z of [-4,0,4])box(.6,.15,.6,x,4.8,z,lit);}
  for(let j=0;j<4;j++)box(4,.18,1,0,.15+j*.18,-2-j);
 }else{
  // A tall colonnaded control chamber with a central raised dais.
  for(const x of [-6,6])for(const z of [-8,-3,2,7]){mesh(new T.CylinderGeometry(.35,.5,6.5,12),metal,x,3.25,z);for(const y of [.3,5.9])mesh(new T.CylinderGeometry(.65,.65,.2,12),lit,x,y,z);}
  for(const z of [-8,-3,2,7]){box(12,.3,.45,0,6.3,z);box(11,.05,.08,0,6.1,z,lit);}
  mesh(new T.CylinderGeometry(2.9,3.1,.45,32),metal,0,.8,-6);
  for(const x of [-2.3,2.3])pipe([x,1,0],[x,1.6,-5],.055,lit);
  for(let i=0;i<8;i++){const o=mesh(new T.IcosahedronGeometry(.35,0),rock,(i%2?1:-1)*6.8,5.4+(i%3)*.25,-9+(i%4)*.25);o.rotation.set(i,.7*i,0);}
 }
 return group;
}
