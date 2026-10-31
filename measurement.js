'use strict';
// Disabled until real IDs, consent and an agreed conversion strategy are configured.
function trackSiteEvent(name){
 const events=['contact_phone_click','contact_line_click','service_request_confirmed'];
 if(!events.includes(name))return;
 const page=location.pathname.split('/').pop()||'index.html';
 const safePage=['index.html','services.html','submit.html','faq.html','warranty.html','ups-info.html','privacy.html'].includes(page)?page:'other';
 const event={event:name,page:safePage};
 if(window.ANALYTICS_CONFIG?.enabled!==true||window.ANALYTICS_CONFIG?.consent!==true)return;
 window.dataLayer=window.dataLayer||[];window.dataLayer.push(event);
}
document.addEventListener('click',event=>{
 const a=event.target.closest('a');if(!a)return;
 if(a.getAttribute('href')==='tel:0652629886')trackSiteEvent('contact_phone_click');
 if(a.getAttribute('href')==='https://line.me/ti/p/7WVA7WKmYW')trackSiteEvent('contact_line_click');
});
