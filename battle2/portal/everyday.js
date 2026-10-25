import * as T from 'portal/vendor/three.module.js';
// Original low-poly props. Labels belong to the fictional packaging, not floating signs.
export const CASES=[
 [
 ['bicarbonate','Bicarbonato de sódio','NaHCO₃ é um sal: contém Na⁺ e HCO₃⁻ na proporção 1:1. A projeção mostra esses íons, não uma molécula isolada do sólido. Uma solução pode ser básica mesmo quando o soluto pertence à função sal.',-5.7,1.325,1],
 ['caustic','Soda cáustica','NaOH é uma base. Em água, sua dissociação produz Na⁺ e OH⁻. É corrosivo; a embalagem fictícia permanece fechada. A animação é um alerta visual, não uma proposta de manuseio ou mistura.',5.7,1.325,2]
 ],
 [
 ['limestone','Calcário','Calcário é uma rocha rica em carbonatos, frequentemente CaCO₃, e pode conter outros minerais. CaCO₃ é um sal: Ca²⁺ e CO₃²⁻ equilibram as cargas na proporção 1:1. O grupo carbonato é trigonal planar.',4.8,2,-2],
 ['carbonate','Carbonato de sódio','Na₂CO₃ é um sal. São necessários dois Na⁺ para equilibrar um CO₃²⁻. Carbonato e bicarbonato são espécies diferentes: CO₃²⁻ não é HCO₃⁻.',4.8,2,3],
 ],
 [
 ['soda','Refrigerante e copo','Refrigerantes contêm CO₂ dissolvido. Parte dele participa do equilíbrio CO₂ + H₂O ⇌ H₂CO₃. As bolhas são de CO₂, não de ácido carbônico. Algumas formulações, como certas colas, também contêm H₃PO₄; isso depende do rótulo.',-5.5,1.19,3.5],
 ['magnesia','Leite de magnésia','Leite de magnésia é uma suspensão aquosa de Mg(OH)₂, uma base pouco solúvel. As partículas claras representam sólido disperso, não moléculas dissolvidas nem bolhas. A representação não fornece orientação de uso medicinal.',5.5,1.19,4],
 ['detergent','Produto para lavar roupas','Esta embalagem fictícia representa uma formulação em pó com tensoativos e Na₂CO₃ como um dos componentes. A composição varia entre produtos. O carbonato é um sal; um produto de limpeza é uma mistura, não uma função inorgânica única.',5.5,1.19,-6]
 ],
 [
 ['muriatic','Ácido muriático','Ácido muriático é uma solução comercial de HCl em água, de concentração variável. Em água, HCl origina H₃O⁺ e Cl⁻. É corrosivo. Recipiente fechado: nenhuma mistura doméstica é proposta.',-5,1.2,3],
 ['lime','Cal hidratada','Ca(OH)₂ é uma base presente na cal hidratada. Não é CaO (cal virgem, um óxido) nem CaCO₃ (um sal). Materiais comerciais podem conter impurezas. A amostra permanece isolada.',5,1.2,4],
 ['quicklime','Cal virgem','CaO é um óxido básico. Cal virgem, cal hidratada e calcário são materiais diferentes. A reação de CaO com água libera calor; não é simulada como atividade doméstica.',-5,1.2,6]
 ],
 [
 ['rust','Peça de ferro enferrujada','Ferrugem não é uma substância pura com fórmula única: contém óxidos hidratados e oxi-hidróxidos de ferro, como FeOOH. A mudança de superfície é acelerada artisticamente; corrosão real exige condições e tempo.',-5,1.3,3],
 ['silica','Quartzo e materiais','Quartzo é uma forma cristalina de SiO₂, um óxido de rede covalente. Não é um sal iônico. Sílica também está presente em muitos materiais; vidro comum é uma mistura, não SiO₂ puro.',5,1.3,4],
 ['phosphate','Amostra de ácido fosfórico','H₃PO₄ é um oxiácido. Pode estar presente em algumas bebidas, conforme a formulação, mas a amostra de laboratório não é alimento. Embalagem fictícia fechada: concentração e composição importam.',-5,1.3,6]
 ]
];
export function buildEveryday(stage){
 const group=new T.Group();group.name='everyday-'+stage;const targets=[],messages=[],animations=[];
 const metal=new T.MeshStandardMaterial({color:0x35566a,metalness:.6,roughness:.4});
 const glass=new T.MeshStandardMaterial({color:0xaee7ee,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide,roughness:.15});
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.55});
 const cyan=mat(0x4adaff),white=mat(0xf3ede0),rust=mat(0xb55727),green=mat(0x7bdd9a);
 function mesh(parent,geo,m,x,y,z){const o=new T.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o;}
 function cylinder(g,r,h,x,y,z,m){return mesh(g,new T.CylinderGeometry(r,r,h,16),m,x,y,z);}
 function label(g,text,color=0x335e88){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.fillRect(0,0,512,256);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 52px sans-serif';text.forEach((line,i)=>ctx.fillText(line,256,85+i*70));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;mesh(g,new T.PlaneGeometry(.72,.4),new T.MeshBasicMaterial({map:t}),0,.62,.365);}
 function bottle(g,m,lines){cylinder(g,.35,.95,0,.475,0,m);mesh(g,new T.CylinderGeometry(.16,.35,.22,16),m,0,1.06,0);cylinder(g,.16,.25,0,1.28,0,m);cylinder(g,.19,.12,0,1.46,0,metal);label(g,lines);}
 function carton(g,lines,color){mesh(g,new T.BoxGeometry(.8,1.2,.65),mat(color),0,.6,0);label(g,lines,color);}
 for(const [kind,title,message,x,y,z] of CASES[stage]){
  const g=new T.Group();g.position.set(x,y,z);g.userData.contextName=title;group.add(g);targets.push(g);messages.push(message);
  // Dedicated small wall-side sample pods only where no bench exists.
  if(stage!==0&&stage!==2&&stage!==1){cylinder(group,.9,.12,x,y-.06,z,metal);cylinder(group,.12,y-.12,x,(y-.12)/2,z,metal);}
  if(stage===1)cylinder(g,.7,.1,0,.05,0,metal);
  let activeAt=-Infinity;const fx=new T.Group();fx.name="context-effect";g.add(fx);fx.visible=false;
  const bits=[];
  if(kind==='soda'){
   bottle(g,glass,['BEBIDA','GASEIFICADA']);cylinder(g,.3,.85,0,.46,0,mat(0x704125));
   cylinder(g,.24,.65,.65,.325,.1,glass);cylinder(g,.2,.4,.65,.22,.1,mat(0x704125));
   for(let i=0;i<9;i++)bits.push(mesh(fx,new T.SphereGeometry(.035,6,4),cyan,Math.sin(i)*.18,.1+i*.08,Math.cos(i)*.18));
  }else if(kind==='magnesia'){
   bottle(g,mat(0xe7f5fc),['LEITE DE','MAGNÉSIA']);
   // Magnified suspension beside the opaque bottle, not bubbles inside it.
   cylinder(fx,.25,.65,.62,.55,0,glass);for(let i=0;i<12;i++)bits.push(mesh(fx,new T.SphereGeometry(.035,6,4),white,.62+Math.sin(i*2.4)*.17,.28+i*.04,Math.cos(i*2.4)*.17));
  }else if(kind==='carbonate'&&stage===1){cylinder(g,.55,.14,0,.07,0,white);for(let i=0;i<12;i++)mesh(g,new T.IcosahedronGeometry(.08,0),white,Math.sin(i*2.4)*.38,.17,Math.cos(i*2.4)*.38);
  }else if(['bicarbonate','carbonate','detergent','salt','lime','quicklime'].includes(kind)){
   const names={bicarbonate:['BICARBONATO','NaHCO₃'],carbonate:['CARBONATO','Na₂CO₃'],detergent:['LAVA-ROUPAS','FÓRMULA MODELO'],salt:['SAL','NaCl'],lime:['CAL HIDRATADA','Ca(OH)₂'],quicklime:['CAL VIRGEM','CaO']};carton(g,names[kind],kind==='detergent'?0x6f578a:0x2e7d79);
  }else if(['caustic','muriatic','phosphate'].includes(kind)){
   const names={caustic:['SODA CÁUSTICA','NaOH'],muriatic:['ÁCIDO MURIÁTICO','HCl(aq)'],phosphate:['ÁCIDO FOSFÓRICO','H₃PO₄']};bottle(g,mat(kind==='caustic'?0xe3e0d2:0xd09743),names[kind]);
   const ring=mesh(fx,new T.TorusGeometry(.55,.035,6,24),mat(0xffaa33),0,.65,0);ring.rotation.x=Math.PI/2;bits.push(ring);
  }else if(kind==='rust'){
   mesh(g,new T.BoxGeometry(.8,.3,.5),metal,0,.2,0);for(let i=0;i<8;i++){const p=mesh(g,new T.IcosahedronGeometry(.12,0),rust,Math.sin(i*2.4)*.3,.35,Math.cos(i*2.4)*.16);bits.push(p);}
  }else{
   const rock=mesh(g,new T.IcosahedronGeometry(.48,1),kind==='silica'?glass:white,0,.48,0);rock.scale.set(1,.85,.8);
   if(kind==='silica'){for(let i=0;i<3;i++)mesh(g,new T.ConeGeometry(.16,.7,6),glass,(i-1)*.22,.7,0);}
  }
  if(['carbonate','limestone','bicarbonate','salt'].includes(kind)){
   // Symbolic charge tokens, not an invented crystal structure or atomic orbit.
   const names=kind==='carbonate'?['Na⁺','Na⁺','CO₃²⁻']:kind==='limestone'?['Ca²⁺','CO₃²⁻']:kind==='bicarbonate'?['Na⁺','HCO₃⁻']:['Na⁺','Cl⁻'];
   names.forEach((name,i)=>{const token=new T.Group();token.position.set((i-(names.length-1)/2)*.65,1.75,0);fx.add(token);const b=mesh(token,new T.SphereGeometry(.16,10,8),i===names.length-1?green:cyan,0,0,0);bits.push(b);const c=document.createElement('canvas');c.width=256;c.height=96;const cx=c.getContext('2d');cx.fillStyle='#061521';cx.fillRect(0,0,256,96);cx.fillStyle='white';cx.textAlign='center';cx.font='bold 42px sans-serif';cx.fillText(name,128,60);mesh(token,new T.PlaneGeometry(.6,.23),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}),0,.3,0);});
  }
  if(kind==='limestone'){const carbon=mat(0x354453),oxygen=mat(0xe96565);mesh(fx,new T.SphereGeometry(.1,10,8),carbon,0,1.15,.4);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;mesh(fx,new T.SphereGeometry(.085,10,8),oxygen,Math.cos(a)*.27,1.15+Math.sin(a)*.27,.4);}}
  g.userData.activate=now=>{activeAt=now;};
  animations.push((now,reduced)=>{const t=(now-activeAt)/1000,active=t>=0&&t<5;fx.visible=active;
   if(kind==='rust'){bits.forEach((b,i)=>b.scale.setScalar(active?(reduced?1: .65+.35*Math.min(1,t/3)):.65));}
   if(!active||reduced)return;
   if(kind==='soda')bits.forEach((b,i)=>b.position.y=.1+((i*.08+t*.3)%.78));
   if(kind==='magnesia')bits.forEach((b,i)=>{b.position.y=.28+i*.035+Math.sin(t*1.8+i)*.035;});
   if(['caustic','muriatic','phosphate'].includes(kind))fx.rotation.y=t*.5;
  });
 }
 return {group,targets,messages,tick(now,reduced){animations.forEach(f=>f(now,reduced));}};
}
