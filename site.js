const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
function closeMenu(){ toggle.setAttribute('aria-expanded','false'); menu.classList.remove('is-open'); }
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();toggle.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-shell'))closeMenu();});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
matchMedia('(min-width: 1061px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
// Select the requested service when arriving from a service detail page.
const requestedService = new URLSearchParams(location.search).get('service');
const serviceInputs = {battery:'s1',pm:'s2'};
if(serviceInputs[requestedService] && document.getElementById('serviceForm')){
  const input=document.getElementById(serviceInputs[requestedService]);
  if(input)input.checked=true;
}
