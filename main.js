/* ===== D On Groups — Shared JS ===== */

// ── Mobile menu toggle ──
(function(){
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if(!ham||!menu) return;
  ham.addEventListener('click',()=>{
    menu.classList.toggle('open');
    const spans = ham.querySelectorAll('span');
    if(menu.classList.contains('open')){
      spans[0].style.transform='rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity='0';
      spans[2].style.transform='rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s=>{s.style.transform='';s.style.opacity='';});
    }
  });
  document.addEventListener('click',e=>{
    if(!ham.contains(e.target)&&!menu.contains(e.target)){
      menu.classList.remove('open');
      ham.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
    }
  });
})();

// ── Active nav link ──
(function(){
  const path = location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
    if(a.getAttribute('href')===path) a.classList.add('active');
  });
})();
