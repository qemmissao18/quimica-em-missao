// Public widget configuration only. Never put a Turnstile secret here.
export const captchaConfig = { enabled: false, siteKey: '0x4AAAAAAFaSur99icAamx2F' };
let loading;
function loadScript() {
 if (window.turnstile) return Promise.resolve(window.turnstile);
 if (loading) return loading;
 loading = new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const timer=setTimeout(()=>fail(),15000);
  function fail(){clearTimeout(timer);script.remove();loading=null;reject(new Error('Verificação indisponível. Confira sua conexão e tente novamente.'));}
  script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=()=>{clearTimeout(timer);window.turnstile?resolve(window.turnstile):fail();};script.onerror=fail;
  document.head.append(script);
 });return loading;
}
export async function captchaToken(config=captchaConfig){
 if(!config.enabled)return undefined;
 if(!config.siteKey)throw new Error('Verificação ainda não configurada: falta a Site Key pública.');
 const api=await loadScript();
 return new Promise((resolve,reject)=>{
  const dialog=document.createElement('dialog');
  dialog.setAttribute('aria-label','Verificação de acesso à sala');
  dialog.style.cssText='background:#071e2b;color:white;border:1px solid #43e8ea;border-radius:16px;padding:20px;max-width:calc(100vw - 32px)';
  const label=document.createElement('p');label.textContent='Verificação de acesso · necessária apenas para criar sua sessão';
  const container=document.createElement('div'),cancel=document.createElement('button');cancel.textContent='Cancelar';
  dialog.append(label,container,cancel);document.body.append(dialog);dialog.showModal();
  let widget,done=false;const timer=setTimeout(()=>finish(new Error('Verificação expirou. Tente entrar novamente.')),240000);
  function finish(error,token){if(done)return;done=true;clearTimeout(timer);if(widget!==undefined)api.remove(widget);dialog.close();dialog.remove();error?reject(error):resolve(token);}
  cancel.onclick=()=>finish(new Error('Verificação cancelada.'));
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(new Error('Verificação cancelada.'));});
  try{widget=api.render(container,{sitekey:config.siteKey,theme:'dark',size:'flexible',language:'pt-br',retry:'never',callback:token=>finish(null,token),'error-callback':()=>{finish(new Error('Não foi possível verificar o acesso. Confira o domínio autorizado e tente novamente.'));},'expired-callback':()=>finish(new Error('Token expirado. Tente novamente.')),'timeout-callback':()=>finish(new Error('Verificação demorou demais. Tente novamente.'))});}catch{finish(new Error('Não foi possível iniciar a verificação.'));}
 });
}
export async function authenticateAnonymous(client,getToken=captchaToken){
 const {data,error}=await client.auth.getSession();if(error)throw error;
 if(data.session)return data.session;
 const token=await getToken();
 const result=await client.auth.signInAnonymously(token?{options:{captchaToken:token}}:{});
 if(result.error)throw result.error;
 return result.data.session;
}
