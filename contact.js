'use strict';
document.addEventListener('focusin',event=>{if(event.target.matches('input,select,textarea'))document.body.classList.add('form-focused');});
document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement?.matches('input,select,textarea'))document.body.classList.remove('form-focused');},100));
if(window.visualViewport){const update=()=>document.body.classList.toggle('keyboard-open',window.visualViewport.height<window.innerHeight*.75);window.visualViewport.addEventListener('resize',update);}
