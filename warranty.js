'use strict';
const WARRANTY_CONFIG={sheetId:'18r0YdKmEnrVmOxjFNysVWW3Z7w31QkUglL48dx9v_Rc',gid:'514177570',columns:{serial:3,customer:1,brand:4,installed:5,expiry:6}};
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
function renderWarranty(row,serial){
 const result=document.getElementById('result');result.hidden=false;
 if(!row){result.innerHTML='<div class="warranty-result unknown"><span class="result-kicker">SEARCH RESULT</span><h3>ไม่พบข้อมูลหมายเลขเครื่องนี้</h3><p>ตรวจตัวอักษรและตัวเลขอีกครั้ง หากถูกต้องแล้ว กรุณาส่ง Serial Number ให้ทีมงานตรวจสอบ</p><a class="text-link" href="https://page.line.me/624izvff" target="_blank" rel="noopener">ให้ทีมงานช่วยตรวจสอบ ↗</a></div>';return;}
 const col=WARRANTY_CONFIG.columns;const cell=index=>row.c?.[index];const text=index=>escapeWarranty(cell(index)?.v??'-');const date=index=>parseWarrantyDate(cell(index)?.v)??parseWarrantyDate(cell(index)?.f);
 const installed=date(col.installed),expiry=date(col.expiry),today=bangkokToday(),status=warrantyStatus(expiry,today);
 const duration=installed&&expiry?(expiry-installed)/86400000:null;const progress=duration>0?Math.max(0,Math.min(100,Math.round((today-installed)/86400000/duration*100))):null;
 result.innerHTML=`<div class="warranty-result ${status.kind}"><div class="warranty-status"><div><span class="result-kicker">WARRANTY STATUS</span><h3>${status.label}</h3><p>${status.message}</p></div><span class="status-mark" aria-hidden="true">${status.kind==='valid'?'✓':status.kind==='expired'?'!':'i'}</span></div><dl class="warranty-details"><div><dt>Serial Number</dt><dd>${escapeWarranty(serial)}</dd></div><div><dt>ชื่อลูกค้า</dt><dd>${text(col.customer)}</dd></div><div><dt>ยี่ห้อ / รุ่น</dt><dd>${text(col.brand)}</dd></div><div><dt>วันติดตั้ง</dt><dd>${formatWarrantyDate(installed)}</dd></div><div><dt>วันหมดประกัน</dt><dd>${formatWarrantyDate(expiry)}</dd></div></dl>${progress!==null?`<div class="warranty-timeline"><div><span>ระยะเวลาที่ผ่านไป</span><strong>${progress}%</strong></div><progress max="100" value="${progress}" aria-label="ระยะเวลาประกันที่ผ่านไป">${progress}%</progress><p>อ้างอิงวันติดตั้งและวันหมดประกันที่บันทึกไว้</p></div>`:''}<p class="result-footnote">รายละเอียดความคุ้มครองให้ยึดเงื่อนไขในใบงาน หากข้อมูลไม่ตรง กรุณาติดต่อทีมงาน</p><a class="text-link" href="submit.html">ติดต่อแจ้งบริการ →</a></div>`;
}
async function searchWarranty(event){
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const serial=document.getElementById('serialInput').value.trim().toUpperCase();if(!serial){document.getElementById('serialInput').focus();return;}
 const button=document.getElementById('searchButton'),loading=document.getElementById('loading'),result=document.getElementById('result');if(button.disabled)return;
 button.disabled=true;button.textContent='กำลังค้นหา…';loading.hidden=false;result.hidden=true;form.setAttribute('aria-busy','true');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(`https://docs.google.com/spreadsheets/d/${WARRANTY_CONFIG.sheetId}/gviz/tq?tqx=out:json&gid=${WARRANTY_CONFIG.gid}`,{signal:controller.signal});if(!response.ok)throw new Error('Lookup failed');const payload=await response.text();const match=payload.match(/^[\s\S]*?\(([\s\S]*)\);?\s*$/);if(!match)throw new Error('Invalid response');const data=JSON.parse(match[1]);if(!Array.isArray(data.table?.rows))throw new Error('Missing data');const row=data.table.rows.find(row=>String(row.c?.[WARRANTY_CONFIG.columns.serial]?.v??'').trim().toUpperCase()===serial);renderWarranty(row,serial);}
 catch{result.hidden=false;result.innerHTML='<div class="warranty-result unknown"><span class="result-kicker">CONNECTION UNAVAILABLE</span><h3>ยังไม่สามารถค้นหาข้อมูลได้</h3><p>ลองค้นหาอีกครั้ง หรือติดต่อทีมงานพร้อมแจ้ง Serial Number ของเครื่อง</p><a class="text-link" href="tel:0915192945">โทร 091-519-2945 ↗</a></div>';}
 finally{clearTimeout(timeout);loading.hidden=true;button.disabled=false;button.textContent='ค้นหาประกัน →';form.removeAttribute('aria-busy');}
}
document.getElementById('warrantyForm').addEventListener('submit',searchWarranty);
