import { createSnapshotGate } from './snapshot-order.mjs';
import { authenticateAnonymous } from 'portal/demo/captcha.js';
// Batalha 2.0 multiplayer bridge. No answer key or correction logic lives here.
export function installMultiplayer({$,audio,state,presentResult,catalog,showHologram,hideHologram}){
 const URL='https://fhtczgaiyfmyyfhbukji.supabase.co',KEY='sb_publishable_N-mmMSaODUTuJwXdyZb8fQ_WTCzHpRr';
 let lastAdvanceAttempt=0, optionsKey='', hintRound='', hintController, hintTimer;
 let client,room=null,snapshot=null,channel,busy=false,polling=false,sceneKey='',finishKey='',errorCount=0,clockAnchor=null,lastHeartbeat=0;
 const roleLabel=r=>({host_observer:'Anfitrião observador',teacher_observer:'Professor observador',host_player:'Anfitrião jogador',player:'Jogador'}[r]||'Participante');
 const sessionKey='battle2.room';
 const acceptSnapshot=createSnapshotGate();
 const rosterButton=document.createElement('button');rosterButton.textContent='Participantes';rosterButton.hidden=true;rosterButton.setAttribute('aria-expanded','false');rosterButton.setAttribute('aria-controls','mp-roster');$('toolbar').append(rosterButton);
 const rosterPanel=document.createElement('aside');rosterPanel.id='mp-roster';rosterPanel.hidden=true;rosterPanel.setAttribute('aria-label','Participantes da sala');rosterPanel.style.cssText='position:fixed;right:12px;top:100px;z-index:85;width:min(350px,calc(100vw - 24px));max-height:65dvh;overflow:auto;padding:16px;background:#06262ef5;color:#e6fff7;border:1px solid #69d4c5;border-radius:12px';document.body.append(rosterPanel);
 function closeRoster(){rosterPanel.hidden=true;rosterButton.setAttribute('aria-expanded','false');rosterButton.focus();}
 function drawRoster(r){room=r;rosterPanel.replaceChildren();const close=document.createElement('button');close.textContent='Fechar participantes';close.onclick=closeRoster;rosterPanel.append(close);const own=r.players.find(p=>p.id===r.you);for(const p of r.players){const line=document.createElement('p');line.textContent=p.nickname+' · '+roleLabel(p.role)+(p.connected?' · conectado':' · reconectando');if(r.you===r.host_id&&p.id!==r.you&&(!snapshot||own?.role!=='host_player')){const kick=document.createElement('button');kick.textContent='Remover';kick.onclick=()=>run(async()=>drawRoster(await rpc('chem_battle2_room','kick',{room_id:r.room_id,user_id:p.id})));line.append(kick);}rosterPanel.append(line);}}
 rosterButton.onclick=()=>{if(!rosterPanel.hidden){closeRoster();return;}run(async()=>{drawRoster(await rpc('chem_battle2_room','sync',{room_id:room.room_id}));rosterPanel.hidden=false;rosterButton.setAttribute('aria-expanded','true');rosterPanel.querySelector('button').focus();});};rosterPanel.onkeydown=e=>{if(e.key==='Escape')closeRoster();};

 const note=t=>{$('notice').textContent=t;$('status').textContent=t;};
 let connecting;
 async function connect(){
  if(connecting)return connecting;
  connecting=(async()=>{
   if(!client){const {createClient}=await import('../vendor/supabase.js');client=createClient(URL,KEY,{auth:{storageKey:'battle2.auth',persistSession:true,autoRefreshToken:true}});}
   await authenticateAnonymous(client);return client;
  })();
  try{return await connecting;}finally{connecting=null;}
 }

 async function rpc(name,action,data){await connect();const r=await client.rpc(name,{action,data});if(r.error)throw r.error;return r.data;}
 const now=()=>clockAnchor?clockAnchor.server+(performance.now()-clockAnchor.local):Date.now();
 async function game(action,data={}){const start=performance.now();const s=await rpc('chem_battle2',action,{room_id:room.room_id,match_id:action==='sync'?null:snapshot?.match_id,...data});if(s?.server_now)clockAnchor={server:Date.parse(s.server_now)+(performance.now()-start)/2,local:performance.now()};return s;}
 function lobby(r){room=r;leaveButton.hidden=false;rosterButton.hidden=false;$('lobby-preview').hidden=false;$('lobby-role').textContent='SALA MULTIPLAYER · BATALHA 2.0';$('lobby-person').textContent='Código: '+r.code;$('lobby-description').textContent=r.bank_released?'Aguardando o anfitrião iniciar.':'Sala conectada. Início bloqueado: banco aguardando revisão científica.';const root=$('lobby-preview').querySelector('.holo-panel');root.querySelector('.pending-code').hidden=true;root.querySelectorAll('[data-mp]').forEach(n=>n.remove());
 const list=document.createElement('ul');list.dataset.mp='';for(const p of r.players){const li=document.createElement('li');li.textContent=p.nickname+' · '+roleLabel(p.role)+(p.connected?' · conectado':' · reconectando');if(r.you===r.host_id&&p.id!==r.you){const b=document.createElement('button');b.textContent='Remover';b.onclick=()=>rpc('chem_battle2_room','kick',{room_id:r.room_id,user_id:p.id}).then(lobby).catch(e=>note(e.message));li.append(b);}list.append(li);}root.append(list);
 const b=document.createElement('button');b.dataset.mp='';b.textContent='INICIAR PARTIDA';const readyPlayers=r.players.filter(p=>p.connected&&['player','host_player'].includes(p.role)).length;b.disabled=r.you!==r.host_id||!r.bank_released||readyPlayers<2;if(r.bank_released)$('lobby-description').textContent=readyPlayers<2?`Aguardando ${2-readyPlayers} jogador(es). São necessários dois competidores; observadores não contam. Para testar sozinho, escolha Explorar jogo.`:'Jogadores suficientes. O anfitrião pode iniciar a partida.';b.title=readyPlayers<2?'São necessários pelo menos dois jogadores. Observadores não contam.':'';b.onclick=()=>run(()=>game('start').then(render));root.append(b);
 }
 async function run(fn){if(busy)return;busy=true;try{await fn();}catch(e){note(e.message||'Falha de conexão. Tente novamente.');}finally{busy=false;}}
 async function sync(){if(!room||polling)return;polling=true;try{if(!snapshot||!rosterPanel.hidden||performance.now()-lastHeartbeat>20000){lastHeartbeat=performance.now();const r=await rpc('chem_battle2_room','sync',{room_id:room.room_id});if(!snapshot)lobby(r);if(!rosterPanel.hidden)drawRoster(r);}const s=await game('sync');if(s)render(s);}catch(e){note('Conexão: '+e.message);}finally{polling=false;}}
 function subscribe(){if(channel)client.removeChannel(channel);channel=client.channel('battle2:'+room.room_id).on('postgres_changes',{event:'UPDATE',schema:'public',table:'chem_room_events',filter:'room_id=eq.'+room.room_id},sync).subscribe();try{localStorage.setItem(sessionKey,room.room_id);}catch{}sync();}
 function render(s){if(!acceptSnapshot(s))return;if(snapshot&&snapshot.match_id!==s.match_id){errorCount=0;finishKey='';sceneKey='';window.dispatchEvent(new Event('chem:hide-result'));}if(snapshot&&snapshot.match_id===s.match_id&&s.revision<snapshot.revision)return;snapshot=s;$('splash').hidden=true;$('lobby-preview').hidden=true;$('mission').hidden=s.phase==='transition'||s.settled;$('progress').textContent=`${s.spectator?'ESPECTADOR · ':''}Missão ${s.position+1}/15`;$('score').textContent=`${s.score} pts · ${s.errors}/11 erros`;$('response-count').textContent=`${s.answered_count} de ${s.active_count} responderam · ${s.spectator_count} espectadores`;$('response-bar').max=Math.max(1,s.active_count);$('response-bar').value=s.answered_count;
 const key=s.match_id+':'+s.revision+':'+s.phase;if(key!==sceneKey){sceneKey=key;hintController?.abort();clearTimeout(hintTimer);$('hintbox').hidden=true;audio.stopSpeech();hideHologram();if(s.phase!=='finished'){state(s.position,s.phase,Date.now()+Math.max(0,Date.parse(s.started_at)-now()));const q=catalog.find(q=>q.id===s.question?.id&&q.source_id===s.question?.source_id);if(s.phase==='question'&&q)showHologram(q);}}
 if(s.errors>errorCount){errorCount=s.errors;window.dispatchEvent(new CustomEvent(s.eliminated?'chem:local-eliminated':'chem:local-error',{detail:{count:s.errors,reduced:$('reduced').checked}}));}
 $('next').hidden=s.you!==s.host_id||s.settled;$('next').textContent='PRÓXIMA RODADA';$('next').disabled=!s.can_next;
 $('next').onclick=()=>run(async()=>render(await game('advance',{manual:true,expected_revision:s.revision})));
 $('hint').textContent='💡 '+s.hints_remaining;$('hint').disabled=!s.can_answer||s.hints_remaining===0||hintRound===s.match_id+':'+s.position;
 $('status').textContent=s.eliminated?`ELIMINADO · aguardando o encerramento · questão ${s.elimination_position+1} · ${s.active_count} jogadores ativos`:s.answer?(s.answer.correct?'ACERTO CONFIRMADO':'RESPOSTA INCORRETA'):s.spectator?'Observando a partida':'';
 $('title').textContent=s.question?.topic||'Aguardando passagem';$('stem').textContent=s.question?.stem||'';$('readable').textContent=$('stem').textContent;
 const nextOptionsKey=JSON.stringify([s.match_id,s.position,s.phase,s.question?.opts,s.can_answer]);
 if(nextOptionsKey!==optionsKey){optionsKey=nextOptionsKey;$('opts').replaceChildren();
 for(const [i,text] of (s.question?.opts||[]).entries()){const b=document.createElement('button');b.textContent='ABCDE'[i]+'. '+text;b.disabled=!s.can_answer;b.onclick=()=>run(async()=>{const result=await game('answer',{position:s.position,choice:i});audio.effect(result.answer?.correct?'correct':'wrong');render(result);});$('opts').append(b);}}
 if(s.settled&&s.ranking&&finishKey!==s.match_id){finishKey=s.match_id;const me=s.ranking.find(p=>p.id===s.you)||{nickname:'Observador',position:null,score:0,correct_count:0,observer:true};setTimeout(()=>{if(snapshot?.match_id!==s.match_id)return;$('mission').hidden=true;presentResult(me,s.ranking,{official:true,onReplay:s.you===s.host_id?()=>run(async()=>render(await game('replay'))):null,elapsed:Math.max(0,(now()-Date.parse(s.ceremony_at))/1000)});},Math.max(0,Date.parse(s.ceremony_at)-now()));}
 }
 
 $('start').onclick=()=>{if($('roomcode').value.trim().toUpperCase()==='DEMO'){note('Use um código de seis dígitos. Crie uma sala ou peça o código ao anfitrião.');return;}run(async()=>{await audio.unlock();lobby(await rpc('chem_battle2_room','join',{code:$('roomcode').value.trim(),nickname:$('nickname').value.trim()}));subscribe();});};
 $('create-preview').textContent='CRIAR SALA →';$('create-preview').onclick=()=>run(async()=>{await audio.unlock();lobby(await rpc('chem_battle2_room','create',{nickname:$('nickname').value.trim(),role:document.querySelector('input[name="host-role"]:checked').value}));subscribe();});
 const leaveButton=document.createElement('button');leaveButton.textContent='Sair da sala';leaveButton.hidden=true;$('toolbar').append(leaveButton);leaveButton.onclick=()=>$('lobby-back').click();
 const localHint=$('hint').onclick;$('hint').onclick=()=>{if(!room)return localHint();run(async()=>{const current=snapshot,grant=await game('hint',{position:current.position,claim:true});if(!grant.claimed||snapshot?.match_id!==current.match_id||snapshot.position!==current.position)return;hintRound=current.match_id+':'+current.position;hintController?.abort();const controller=hintController=new AbortController();let shown=false;const reveal=()=>{if(shown||controller.signal.aborted||snapshot?.match_id!==current.match_id||snapshot.position!==current.position)return;shown=true;$('hintbox').textContent=grant.hint;$('hintbox').hidden=false;};window.dispatchEvent(new CustomEvent('chem:hint-animation',{detail:{animation:grant.animation,signal:controller.signal,reveal}}));hintTimer=setTimeout(reveal,$('reduced').checked?100:1800);$('hint').disabled=true;});};
 const localSpeak=$('speak').onclick;$('speak').onclick=()=>room&&snapshot?.question?audio.speak({...snapshot.question,title:snapshot.question.topic}):localSpeak();
 $('stem').onclick=()=>{if(snapshot?.question)$('stem').textContent=snapshot.question.stem;};
 $('lobby-back').onclick=()=>{if(!room){$('lobby-preview').hidden=true;return;}run(async()=>{await rpc('chem_battle2_room','leave',{room_id:room.room_id});localStorage.removeItem(sessionKey);location.reload();});};
 setInterval(()=>{if(!snapshot||snapshot.settled)return;const left=Math.max(0,Date.parse(snapshot.deadline)-now());$('clock').textContent=snapshot.phase==='transition'?'—':String(Math.ceil(left/1000));if(left===0&&!busy&&performance.now()-lastAdvanceAttempt>2500){lastAdvanceAttempt=performance.now();run(async()=>render(await game('advance',{expected_revision:snapshot.revision})));}},250);
 setInterval(sync,2500);window.addEventListener('online',sync);
 // Restore only an existing authenticated session. Stale room IDs are not entry attempts.
 try{const savedRoom=localStorage.getItem(sessionKey);if(savedRoom){
  const savedAuth=localStorage.getItem('battle2.auth');
  if(savedAuth)run(async()=>{try{const restored=await rpc('chem_battle2_room','sync',{room_id:savedRoom});lobby(restored);subscribe();}catch(error){
   if(/inexistente|indisponível|expirada|not found|membership|participante|acesso|permiss/i.test(error.message||'')){localStorage.removeItem(sessionKey);room=null;}
   else note('Não foi possível retomar a conexão. Você pode tentar entrar novamente.');
  }});else localStorage.removeItem(sessionKey);
 }}catch{}
}
