import * as T from 'portal/vendor/three.module.js';
import {AWARDS,buildFinale} from 'portal/finale.mjs';
import {awardIndex} from 'portal/demo/game-rules.mjs';
let cleanup=()=>{};
export function presentResult(player,ranking,{preview=false,official=false,elapsed=0,onReplay=null}={}){
 cleanup();const root=document.getElementById('ceremony');root.hidden=false;root.replaceChildren();
 const heading=document.createElement('h2');heading.textContent=player.observer?'RESULTADO OFICIAL':player.eliminated?'PARTICIPAÇÃO ENCERRADA':'MISSÃO CONCLUÍDA';root.append(heading);
 const label=document.createElement('p');label.textContent=official?'RESULTADO OFICIAL — Batalha 2.0':preview?'PRÉVIA VISUAL DO SELO — posição ilustrativa, não é resultado de partida.':'RESULTADO LOCAL — esta demonstração não está conectada a uma sala multiplayer.';root.append(label);
 const skip=document.createElement('button');skip.textContent='Pular animação';root.append(skip);
 const details=document.createElement('div');details.hidden=true;root.append(details);
 const title=document.createElement('h3'),message=document.createElement('p');details.append(title,message);
 const award=player.observer?null:awardIndex(player),color=award===null?0xff895d:AWARDS[award].color;
 title.textContent=award===null?'ACESSO NEGADO — VOCÊ FOI ELIMINADO':AWARDS[award].title;
 message.textContent=player.eliminated?'O sistema fictício atingiu o limite de erros e encerrou sua participação. A descarga é um efeito de videogame, não uma consequência real de errar Química. Você pode tentar novamente.':`${player.position}º lugar · ${player.nickname} · ${player.score} pontos · ${player.correct_count} acertos`;
 const table=document.createElement('table');const caption=document.createElement('caption');caption.textContent=preview?'Exemplo de posição selecionada':official?'Classificação oficial completa':'Classificação local completa';table.append(caption);
 const head=document.createElement('tr');for(const t of ['Posição','Participante','Pontos','Acertos','Situação']){const c=document.createElement('th');c.textContent=t;head.append(c);}table.append(head);
 ranking.forEach(p=>{const tr=document.createElement('tr');if(!p.eliminated&&p.position<=3)tr.className='podium podium-'+p.position;for(const t of [p.position+'º',p.nickname,p.score,p.correct_count,p.eliminated?'Eliminado':'Concluiu']){const td=document.createElement('td');td.textContent=t;tr.append(td);}table.append(tr);});
 const scroll=document.createElement('div');scroll.className='ranking-scroll';scroll.tabIndex=0;scroll.append(table);scroll.hidden=true;const rankingButton=document.createElement('button');rankingButton.textContent='Ver ranking';rankingButton.onclick=()=>{scroll.hidden=!scroll.hidden;rankingButton.setAttribute('aria-expanded',String(!scroll.hidden));};rankingButton.setAttribute('aria-expanded','false');details.append(rankingButton,scroll);
 const again=document.createElement('button');again.textContent=official&&!onReplay?'Aguardando nova partida':preview?'Voltar à prévia':'Jogar novamente';again.disabled=official&&!onReplay;again.onclick=()=>{if(official){onReplay?.();return;}cleanup();root.hidden=true;if(!preview)location.reload();else{const tools=document.getElementById('teacher-tools');document.getElementById('splash').hidden=!!tools;if(tools){tools.open=true;document.getElementById('teacher-environment').dispatchEvent(new Event('change'));}else window.dispatchEvent(new Event('chem:access-preview'));}};details.append(again);
 const reveal=()=>{details.hidden=false;skip.hidden=true;};
 const reduced=document.getElementById('reduced').checked;
 const warning=document.createElement('p');warning.setAttribute('role','status');root.append(warning);
 root.classList.add('over-scene');
 skip.onclick=()=>{window.dispatchEvent(new Event('chem:skip-ceremony'));reveal();};
 if(player.eliminated||player.observer){if(player.observer){title.textContent='CLASSIFICAÇÃO FINAL';message.textContent='Modo observador · sem premiação individual';}reveal();skip.hidden=true;}
 else window.dispatchEvent(new CustomEvent('chem:preview-ceremony',{detail:{color,reduced,elapsed,onFrame:f=>{warning.textContent=f.warning?'⚠ CUIDADO — REAÇÃO INSTÁVEL':'';if(f.reveal)reveal();}}}));
 window.addEventListener('chem:hide-result',()=>{cleanup();root.hidden=true;},{once:true});
 cleanup=()=>{window.dispatchEvent(new Event('chem:close-ceremony'));root.classList.remove('over-scene');};
 // The result remains available when the device cannot create a 3D renderer.
 if(!document.querySelector('.b2-portal canvas'))reveal();
 (details.hidden?skip:again).focus();
}
