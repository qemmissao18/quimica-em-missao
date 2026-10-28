// Shared small-screen controls for multiplayer and the individual demonstration.
const settings = document.getElementById('settings');
let closeTimer;
function closeSettings() {
  settings.hidden = true;
  for (const id of ['mute', 'config']) document.getElementById(id).setAttribute('aria-expanded', 'false');
}
function deferClose() {
  clearTimeout(closeTimer);
  if (!settings.hidden) closeTimer = setTimeout(closeSettings, 5000);
}
for (const event of ['pointerdown', 'pointermove', 'input', 'keydown']) settings.addEventListener(event, deferClose);
for (const id of ['mute', 'config']) document.getElementById(id).addEventListener('click', deferClose);
new MutationObserver(deferClose).observe(settings, {attributes: true, attributeFilter: ['hidden']});
// Native links restore normal navigation and unload the 3D scene and its audio.
window.addEventListener('pagehide', () => window.speechSynthesis?.cancel());

const demoTools = document.getElementById('teacher-tools');
if (demoTools) document.getElementById('toolbar').append(demoTools);
// Position floating panels below the real HUD, including wrapped mobile controls.
const hud = document.getElementById('hud');
const measureHud = () => document.documentElement.style.setProperty('--hud-height', `${hud.getBoundingClientRect().height}px`);
new ResizeObserver(measureHud).observe(hud);
measureHud();
