'use strict';
function validDate(year,month,day){const date=new Date(Date.UTC(year,month-1,day));return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?date:null;}
function parseWarrantyDate(value){
 if(value==null||value==='')return null;
 const text=String(value).trim();let match=text.match(/^Date\((\d+),\s*(\d+),\s*(\d+)(?:,.*)?\)$/);
 if(match)return validDate(Number(match[1]),Number(match[2])+1,Number(match[3]));
 match=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/);
 if(match)return validDate(Number(match[1])>2400?Number(match[1])-543:Number(match[1]),Number(match[2]),Number(match[3]));
 // Retain the original Sheet convention: formatted dates are M/D/YYYY.
 match=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
 if(match){let year=Number(match[3]);if(year>2400)year-=543;if(year<100)year+=2000;return validDate(year,Number(match[1]),Number(match[2]));}
 return null;
}
function bangkokToday(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=type=>Number(parts.find(part=>part.type===type).value);return validDate(get('year'),get('month'),get('day'));}
function warrantyStatus(expiry,today=bangkokToday()){if(!expiry)return {kind:'unknown',label:'รอยืนยันวันหมดประกัน',message:'กรุณาติดต่อทีมงานเพื่อตรวจสอบข้อมูล'};const days=Math.round((expiry-today)/86400000);if(days<0)return {kind:'expired',label:'หมดประกันแล้ว',message:`หมดประกันไปแล้ว ${Math.abs(days)} วัน`};if(days===0)return {kind:'today',label:'ถึงวันหมดประกัน',message:'วันที่ระบุสิ้นสุดประกันคือวันนี้ กรุณาติดต่อทีมงานเพื่อยืนยันสิทธิ์'};return {kind:'valid',label:'อยู่ในประกัน',message:`เหลืออีก ${days} วัน ถึงวันหมดประกัน`};}
function escapeWarranty(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function formatWarrantyDate(date){return date?new Intl.DateTimeFormat('th-TH',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(date):'ยังไม่มีข้อมูล';}
function renderWarranty(w,serial){
 const result=document.getElementById('result');result.hidden=false;
 if(!w){result.innerHTML='<div class="warranty-result unknown"><h3>ไม่พบข้อมูลประกันที่เปิดให้ค้นหา</h3><p>ตรวจ Serial Number อีกครั้ง หรือติดต่อทีมงานพร้อมใบงาน การค้นหาไม่พบยังไม่ยืนยันว่าเครื่องไม่มีประกัน</p><a class="text-link" href="https://line.me/ti/p/7WVA7WKmYW" target="_blank" rel="noopener">ติดต่อทีมงาน ↗</a></div>';return;}
 const installed=parseWarrantyDate(w.startDate),expiry=parseWarrantyDate(w.expiryDate),status=warrantyStatus(expiry);
 result.innerHTML='<div class="warranty-result '+status.kind+'"><div class="warranty-status"><div><span class="result-kicker">WARRANTY STATUS</span><h3>'+status.label+'</h3><p>'+status.message+'</p></div></div><dl class="warranty-details"><div><dt>Serial Number</dt><dd>'+escapeWarranty(serial)+'</dd></div><div><dt>รุ่นเครื่อง</dt><dd>'+escapeWarranty(w.model||'-')+'</dd></div><div><dt>วันเริ่มประกัน</dt><dd>'+formatWarrantyDate(installed)+'</dd></div><div><dt>วันหมดประกัน</dt><dd>'+formatWarrantyDate(expiry)+'</dd></div></dl><p class="result-footnote">ข้อมูลประกันที่บริษัทเปิดให้ตรวจสอบ หากข้อมูลไม่ตรงกับใบงาน กรุณาติดต่อทีมงาน</p><a class="text-link" href="submit.html">ติดต่อแจ้งบริการ →</a></div>';
}
async function searchWarranty(event){
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const serial=document.getElementById('serialInput').value.trim().toUpperCase().replace(/\s+/g,'');if(!/^[A-Z0-9][A-Z0-9._\/-]{2,79}$/.test(serial)){document.getElementById('serialInput').focus();return;}
 const button=document.getElementById('searchButton'),loading=document.getElementById('loading'),result=document.getElementById('result');if(button.disabled)return;
 button.disabled=true;button.textContent='กำลังค้นหา…';loading.hidden=false;result.hidden=true;form.setAttribute('aria-busy','true');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{const config=window.WARRANTY_API_CONFIG;if(!config?.enabled||!config.endpoint)throw Error('Lookup unavailable');const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({serial}),signal:controller.signal,credentials:'omit',cache:'no-store'});if(!response.ok)throw Error('Lookup unavailable');const data=await response.json();if(data.ok!==true||typeof data.found!=='boolean')throw Error('Invalid receipt');if(!data.found){renderWarranty(null,serial);return;}const w=data.warranty;if(w?.serial!==serial||!parseWarrantyDate(w.startDate)||!parseWarrantyDate(w.expiryDate))throw Error('Invalid warranty');renderWarranty(w,serial);}
 catch{result.hidden=false;result.innerHTML='<div class="warranty-result unknown"><h3>ยังตรวจสอบข้อมูลไม่ได้</h3><p>กรุณาติดต่อทีมงานพร้อม Serial Number และใบงาน</p><a class="text-link" href="tel:0652629886">โทร 065 262 9886 ↗</a></div>';}
 finally{clearTimeout(timeout);loading.hidden=true;button.disabled=false;button.textContent='ค้นหาประกัน →';form.removeAttribute('aria-busy');}
}
document.getElementById('warrantyForm').addEventListener('submit',searchWarranty);
