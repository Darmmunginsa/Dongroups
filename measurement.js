'use strict';
const adsReceipts=new Set();
function trackSiteEvent(name,requestId){
 const events=['contact_phone_click','contact_line_click','service_request_confirmed'];
 if(!events.includes(name))return;
 const page=location.pathname.split('/').pop()||'index.html';
 const safePage=['index.html','services.html','submit.html','faq.html','warranty.html','ups-info.html','privacy.html'].includes(page)?page:'other';
 const event={event:name,page:safePage};
 if(window.ANALYTICS_CONFIG?.enabled!==true||window.ANALYTICS_CONFIG?.consent!==true)return;
 window.dataLayer=window.dataLayer||[];window.dataLayer.push(event);
 if(name!=='service_request_confirmed'||typeof requestId!=='string'||!requestId.trim()||typeof window.gtag!=='function')return;
 // Hash the opaque receipt rather than sharing the receipt or any form fields.
 void sendAdsReceipt(requestId).catch(()=>{});
}

async function sendAdsReceipt(receipt){
 if(!window.crypto?.subtle)return;
 const digest=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(receipt));
 const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 if(window.ANALYTICS_CONFIG?.consent!==true||adsReceipts.has(id))return;
 let prior=[];try{prior=JSON.parse(sessionStorage.getItem('don-ads-receipts')||'[]');if(!Array.isArray(prior))prior=[];}catch{}
 if(prior.includes(id))return;
 window.gtag('event','conversion',{send_to:window.ANALYTICS_CONFIG.sendTo,transaction_id:id});
 adsReceipts.add(id);try{sessionStorage.setItem('don-ads-receipts',JSON.stringify([...prior,id].slice(-100)));}catch{}
}

function setAdsConsent(accepted){
 const config=window.ANALYTICS_CONFIG;if(!config?.enabled)return;
 config.consent=accepted;
 try{localStorage.setItem('don-ads-consent-v1',accepted?'granted':'denied');}catch{}
 if(!accepted){if(typeof window.gtag==='function')window.gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});return;}
 window.dataLayer=window.dataLayer||[];
 if(typeof window.gtag!=='function')window.gtag=function(){window.dataLayer.push(arguments);};
 if(!document.getElementById('don-google-tag')){
  window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
  window.gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'denied',analytics_storage:'denied'});
  window.gtag('js',new Date());
  window.gtag('config',config.adsId,{allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:location.origin+'/',page_title:'D On Net'});
  const script=document.createElement('script');script.id='don-google-tag';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.adsId);document.head.appendChild(script);
 }else window.gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'denied',analytics_storage:'denied'});
}

function setupAdsConsent(){
 if(!window.ANALYTICS_CONFIG?.enabled||!document.body)return;
 let choice;try{choice=localStorage.getItem('don-ads-consent-v1');}catch{}
 if(choice==='granted')setAdsConsent(true);
 const panel=document.createElement('section');panel.setAttribute('aria-label','ตั้งค่าการวัดผลโฆษณา');panel.className='ads-consent';panel.hidden=choice==='granted'||choice==='denied';
 const text=document.createElement('p');text.textContent='อนุญาตให้ใช้ Google Ads วัดผลการติดต่อจากโฆษณาหรือไม่? Google อาจได้รับข้อมูลการเข้าชมและใช้คุกกี้ คุณส่งฟอร์มได้แม้ไม่อนุญาต';panel.appendChild(text);
 const policy=document.createElement('a');policy.href='privacy.html';policy.textContent='รายละเอียดการใช้ข้อมูล';panel.appendChild(policy);
 for(const [label,accepted]of [['ไม่อนุญาต',false],['อนุญาต',true]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{setAdsConsent(accepted);panel.hidden=true;settings.focus();});panel.appendChild(button);}
 const settings=document.createElement('button');settings.type='button';settings.textContent='ตั้งค่าการวัดผลโฆษณา';settings.className='ads-consent-settings';settings.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});
 document.body.appendChild(panel);(document.querySelector('.site-footer')||document.body).appendChild(settings);
 const style=document.createElement('style');style.textContent='.ads-consent{position:fixed;z-index:10000;bottom:90px;left:12px;right:12px;max-width:600px;margin:auto;padding:16px;background:#fff;color:#172b42;border:1px solid #8da3bd;border-radius:12px;box-shadow:0 4px 24px #0003;max-height:65vh;overflow:auto}.ads-consent[hidden]{display:none}.ads-consent p{margin:0 0 12px}.ads-consent button,.ads-consent-settings{padding:10px 14px;margin:6px;cursor:pointer;border:1px solid #64748b;border-radius:6px;background:#fff;color:#172b42}.ads-consent a{color:#174d8f}.ads-consent-settings{display:block;margin:16px auto}';document.head.appendChild(style);
}
// Scripts are loaded near the end of each page. Tests without a DOM do not initialize UI.
if(document.body)setupAdsConsent();
document.addEventListener('click',event=>{
 const a=event.target.closest('a');if(!a)return;
 if(a.getAttribute('href')==='tel:0652629886')trackSiteEvent('contact_phone_click');
 if(a.getAttribute('href')==='https://line.me/ti/p/7WVA7WKmYW')trackSiteEvent('contact_line_click');
});
