/* PWA enhancement only; educational and multiplayer code remain unchanged. */
(() => {
  'use strict';
  let installEvent = null, registration = null, lastFocus = null;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const buttons = [...document.querySelectorAll('[data-pwa-install]')];
  const dialog = document.getElementById('pwa-help');
  const message = document.getElementById('pwa-help-text');
  const offline = document.getElementById('pwa-offline');
  const update = document.getElementById('pwa-update');
  const syncButtons = () => buttons.forEach(b => b.hidden = installed());
  function showHelp(text) {
    lastFocus = document.activeElement;
    message.textContent = text;
    dialog.hidden = false;
    document.getElementById('pwa-close').focus();
  }
  function closeHelp() { dialog.hidden = true; if(lastFocus) lastFocus.focus(); }
  document.getElementById('pwa-close').addEventListener('click', closeHelp);
  dialog.addEventListener('click', e => { if(e.target === dialog) closeHelp(); });
  dialog.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeHelp();
    if(e.key === 'Tab') { e.preventDefault(); document.getElementById('pwa-close').focus(); }
  });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; syncButtons(); });
  window.addEventListener('appinstalled', () => { installEvent = null; buttons.forEach(b => b.hidden = true); });
  buttons.forEach(button => button.addEventListener('click', async () => {
    if(installed()) { syncButtons(); return; }
    if(installEvent) {
      const prompt = installEvent; installEvent = null;
      try { await prompt.prompt(); await prompt.userChoice; }
      catch { showHelp('Não foi possível abrir a instalação. Tente pelo menu do navegador, na opção Instalar aplicativo.'); }
      return;
    }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if(ios) showHelp('No iPhone ou iPad, abra este site no Safari. Toque em Compartilhar e em Adicionar à Tela de Início. Se aparecer Abrir como App da Web, mantenha essa opção ativada e toque em Adicionar.');
    else if(/Android/i.test(navigator.userAgent)) showHelp('No Chrome, abra o menu ⋮ e procure Instalar aplicativo ou Adicionar à tela inicial. Se a instalação ainda não aparecer, aguarde o carregamento do site e tente novamente. Navegadores dentro de outros aplicativos podem exigir Abrir no Chrome.');
    else showHelp('No computador, procure Instalar Química em Missão na barra de endereço ou no menu do Chrome/Edge. No Safari do Mac, procure Arquivo → Adicionar ao Dock. Se o navegador não oferecer instalação, você pode continuar usando o site normalmente.');
  }));
  function connectionChanged() {
    offline.hidden = navigator.onLine;
    if(navigator.onLine && registration) registration.update().catch(() => {});
  }
  window.addEventListener('offline', connectionChanged);
  window.addEventListener('online', connectionChanged);
  document.getElementById('pwa-reconnect').addEventListener('click', () => location.reload());
  document.addEventListener('click', e => {
    if(navigator.onLine) return;
    const control = e.target.closest('button,a');
    if(!control) return;
    const inRoom = !!control.closest('#room');
    const handler = control.getAttribute('onclick') || '';
    const external = control.tagName === 'A' && /^https?:/.test(control.href) && new URL(control.href).origin !== location.origin;
    if(external || (inRoom && /createLobby|joinLobby|startRoom/.test(handler)) || (inRoom && control.matches('[data-action],[data-choice],[data-kick]'))) {
      e.preventDefault(); e.stopImmediatePropagation();
      showHelp(external ? 'Este vídeo ou recurso externo precisa de internet. Conecte-se e tente novamente.' : 'A Sala de Competição precisa de internet para conectar os participantes. Sua partida não funciona offline. Reconecte-se para continuar.');
    }
  }, true);
  syncButtons(); connectionChanged();
  const displayMode = window.matchMedia('(display-mode: standalone)');
  if(displayMode.addEventListener) displayMode.addEventListener('change',syncButtons);
  if('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', async () => {
      try {
        registration = await navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'});
        const offerUpdate = () => { if(registration.waiting && navigator.serviceWorker.controller) update.hidden = false; };
        offerUpdate();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if(worker) worker.addEventListener('statechange', () => { if(worker.state === 'installed') offerUpdate(); });
        });
        document.getElementById('pwa-update-button').addEventListener('click', () => {
          // User chooses when to reload; never interrupt a multiplayer match automatically.
          if(registration.waiting) {
            navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {once:true});
            registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
          } else location.reload();
        });
        await registration.update();
      } catch { /* Normal online site remains usable if installation/offline support is unavailable. */ }
    });
  }
})();
