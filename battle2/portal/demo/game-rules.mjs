export const TOTAL_ROUNDS=15;
export const ERROR_LIMIT=Math.ceil(TOTAL_ROUNDS*.7);
export const LEVELS=['Fácil','Média','Média','Média','Difícil'];
export function errorCount(answers){return answers.filter(a=>!a.correct&&a.reason!=='timeout').length;}
export function isEliminated(answers){return errorCount(answers)>=ERROR_LIMIT;}
export function rankPlayers(players){return players.filter(p=>!['observer','host_observer','teacher_observer'].includes(p.role)).slice().sort((a,b)=>Number(!!a.eliminated)-Number(!!b.eliminated)||b.score-a.score||b.correct_count-a.correct_count||a.elapsed_ms-b.elapsed_ms||String(a.id).localeCompare(String(b.id),'en')).map((p,i)=>({...p,position:i+1}));}
export function awardIndex(player){return player.eliminated?null:Math.min(player.position-1,3);}
export function chooseMatch(bank,random=Math.random){return LEVELS.flatMap((level,e)=>{const pool=bank.filter(q=>q.environment_index===e&&q.level===level);if(pool.length<3)throw Error('Banco insuficiente');for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3);});}
// Contract for the future isolated server adapter. Not an authorization boundary.
export function observerMay(action){return ['admit','remove','view_participants','view_progress','view_ranking'].includes(action);}
export function playerMayEnter({codeValidated,admitted}){return codeValidated===true&&admitted===true;}
// Must receive a server-authoritative roster and confirmed response IDs in multiplayer.
export function responseProgress(players,confirmedIds){const observers=new Set(['observer','host_observer','teacher_observer']);const eligible=new Set(players.filter(p=>!observers.has(p.role)&&!p.eliminated&&p.active!==false).map(p=>p.id));const answered=new Set(confirmedIds.filter(id=>eligible.has(id)));return {answered:answered.size,total:eligible.size,complete:eligible.size>0&&answered.size===eligible.size};}
