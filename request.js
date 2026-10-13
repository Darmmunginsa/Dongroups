'use strict';
const serviceForm=document.getElementById('serviceForm');const submitButton=document.getElementById('btnSubmit');const formError=document.getElementById('formError');
function localServiceDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=type=>parts.find(part=>part.type===type).value;return `${get('year')}-${get('month')}-${get('day')}`;}
function validServicePhone(value){return /^\+?[\d\s().-]+$/.test(value)&&value.replace(/\D/g,'').length>=9&&value.replace(/\D/g,'').length<=15;}
function buildServicePayload(form,services,now=new Date()){const get=key=>String(form.get(key)??'').trim()||'-';return {timestamp:now.toLocaleString('th-TH',{timeZone:'Asia/Bangkok'}),name:get('name'),phone:get('phone'),services:services.join(', '),brand:get('brand'),model:get('model'),detail:get('detail'),address:get('address'),lat:get('lat'),lng:get('lng'),mapLink:get('mapLink'),preferDate:get('preferDate'),preferTime:get('preferTime'),coordinator:get('coordinator'),status:'รอดำเนินการ'};}
document.getElementById('preferDate').min=localServiceDate();
for(const id of ['name','phone','address','preferDate'])document.getElementById(id).addEventListener('input',event=>event.target.setCustomValidity(''));
for(const input of serviceForm.querySelectorAll('input[name="service"]'))input.addEventListener('change',()=>{document.getElementById('serviceError').hidden=true;input.removeAttribute('aria-invalid');});
serviceForm.addEventListener('submit',async event=>{
 event.preventDefault();if(submitButton.disabled)return;formError.hidden=true;
 const services=[...serviceForm.querySelectorAll('input[name="service"]:checked')].map(input=>input.value);
 if(!services.length){document.getElementById('serviceError').hidden=false;const first=document.getElementById('s1');first.setAttribute('aria-describedby','serviceError');first.setAttribute('aria-invalid','true');first.focus();return;}
 for(const id of ['name','address']){const field=document.getElementById(id);field.setCustomValidity(field.value.trim()?'':'กรุณากรอกข้อมูลนี้');}
 const phone=document.getElementById('phone');phone.setCustomValidity(validServicePhone(phone.value.trim())?'':'กรุณากรอกเบอร์โทรให้ถูกต้อง');
 const date=document.getElementById('preferDate');date.min=localServiceDate();date.setCustomValidity(date.value&&date.value<date.min?'กรุณาเลือกวันนี้หรือวันถัดไป':'');
 if(!serviceForm.reportValidity())return;
 const payload=buildServicePayload(new FormData(serviceForm),services);submitButton.disabled=true;submitButton.textContent='กำลังส่งคำขอ…';serviceForm.setAttribute('aria-busy','true');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  if(!window.SERVICE_CONFIG?.endpoint)throw new Error('Missing endpoint');
  // Preserve the existing JSON payload while using a CORS-safelisted content type.
  await fetch(window.SERVICE_CONFIG.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),signal:controller.signal});
  const summary=document.getElementById('sentSummary');summary.replaceChildren();for(const text of [`ผู้ติดต่อ: ${payload.name}`,`เบอร์โทร: ${payload.phone}`,`บริการ: ${payload.services}`]){const line=document.createElement('p');line.textContent=text;summary.appendChild(line);}
  serviceForm.hidden=true;const success=document.getElementById('successMsg');success.hidden=false;success.tabIndex=-1;success.focus();
 }catch(error){formError.textContent=error.name==='AbortError'?'ยังยืนยันผลการส่งไม่ได้ กรุณาติดต่อทีมงานก่อนส่งซ้ำ ข้อมูลที่กรอกยังอยู่ครบ':'ยังส่งคำขอไม่ได้ กรุณาลองใหม่หรือติดต่อทีมงาน ข้อมูลที่กรอกยังอยู่ครบ';formError.hidden=false;formError.tabIndex=-1;formError.focus();}
 finally{clearTimeout(timeout);submitButton.disabled=false;submitButton.textContent='ส่งคำขอแจ้งบริการ →';serviceForm.removeAttribute('aria-busy');}
});
document.getElementById('newRequest').addEventListener('click',()=>{serviceForm.reset();document.getElementById('successMsg').hidden=true;serviceForm.hidden=false;clearServiceLocation();document.getElementById('s1').focus();});
let serviceMap,serviceMarker,leafletLoading;
const locationMessage=document.getElementById('locationDisplay');
function clearServiceLocation(){for(const id of ['lat','lng','mapLink'])document.getElementById(id).value='';if(serviceMarker&&serviceMap){serviceMap.removeLayer(serviceMarker);serviceMarker=null;}document.getElementById('clearLocation').hidden=true;locationMessage.textContent='กรอกที่อยู่และส่งคำขอได้โดยไม่ต้องปักหมุด';}
function placeServiceMarker(position){
 const lat=Number(position.lat),lng=Number(position.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return;
 if(serviceMarker)serviceMarker.setLatLng([lat,lng]);else{serviceMarker=L.marker([lat,lng],{draggable:true,autoPan:true,title:'สถานที่รับบริการ'}).addTo(serviceMap);serviceMarker.on('dragend',()=>placeServiceMarker(serviceMarker.getLatLng()));}
 document.getElementById('lat').value=lat.toFixed(6);document.getElementById('lng').value=lng.toFixed(6);
 document.getElementById('mapLink').value=`https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=17/${lat.toFixed(6)}/${lng.toFixed(6)}`;
 document.getElementById('clearLocation').hidden=false;locationMessage.textContent=`เลือกตำแหน่งแล้ว: ${lat.toFixed(6)}, ${lng.toFixed(6)} (ลากหมุดเพื่อปรับได้)`;
}
function loadLeaflet(){
 if(window.L)return Promise.resolve();if(leafletLoading)return leafletLoading;
 leafletLoading=new Promise((resolve,reject)=>{
  let style=document.getElementById('leafletStyle');if(!style){style=document.createElement('link');style.id='leafletStyle';style.rel='stylesheet';style.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';style.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';style.crossOrigin='anonymous';document.head.appendChild(style);}
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';script.crossOrigin='anonymous';
  const timer=setTimeout(()=>{script.remove();reject(new Error('Map library timeout'));},15000);
  script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('Map library unavailable'));};document.head.appendChild(script);
 }).catch(error=>{leafletLoading=null;throw error;});return leafletLoading;
}
document.getElementById('loadMap').addEventListener('click',async()=>{
 const button=document.getElementById('loadMap');if(button.disabled)return;
 document.getElementById('map').hidden=false;if(serviceMap){serviceMap.invalidateSize();return;}
 button.disabled=true;locationMessage.textContent='กำลังเปิดแผนที่ OpenStreetMap…';
 try{await loadLeaflet();serviceMap=L.map('map',{scrollWheelZoom:false}).setView([13.7563,100.5018],12);const tiles=L.tileLayer(window.SERVICE_CONFIG.tileUrl,{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(serviceMap);tiles.on('tileerror',()=>{locationMessage.textContent='ภาพแผนที่บางส่วนโหลดไม่ได้ ลองเปิดใหม่ หรือส่งคำขอโดยกรอกที่อยู่ได้';});serviceMap.on('click',event=>placeServiceMarker(event.latlng));document.getElementById('btnGPS').disabled=false;button.hidden=true;locationMessage.textContent='คลิกบนแผนที่เพื่อปักหมุด หรือใช้ตำแหน่งปัจจุบัน';serviceMap.invalidateSize();}
 catch{locationMessage.textContent='แผนที่โหลดไม่ได้ ลองเปิดอีกครั้ง หรือกรอกที่อยู่และส่งคำขอได้';}
 finally{button.disabled=false;}
});
document.querySelector('.request-map-details').addEventListener('toggle',event=>{if(event.target.open&&serviceMap)requestAnimationFrame(()=>serviceMap.invalidateSize());});
document.getElementById('btnGPS').addEventListener('click',()=>{
 if(!serviceMap)return;if(!navigator.geolocation){locationMessage.textContent='เบราว์เซอร์นี้ใช้ตำแหน่งไม่ได้ กรุณาปักหมุดเอง';return;}
 const button=document.getElementById('btnGPS');button.disabled=true;locationMessage.textContent='กำลังค้นหาตำแหน่งปัจจุบัน…';
 navigator.geolocation.getCurrentPosition(position=>{const point={lat:position.coords.latitude,lng:position.coords.longitude};serviceMap.setView([point.lat,point.lng],17);placeServiceMarker(point);button.disabled=false;},()=>{locationMessage.textContent='ยังระบุตำแหน่งไม่ได้ กรุณาปักหมุดเอง';button.disabled=false;},{timeout:10000,maximumAge:60000});
});
document.getElementById('clearLocation').addEventListener('click',clearServiceLocation);
document.getElementById('address').addEventListener('input',()=>{if(document.getElementById('lat').value){clearServiceLocation();locationMessage.textContent='ที่อยู่เปลี่ยนแล้ว กรุณาปักหมุดใหม่หากต้องการแนบตำแหน่ง';}});
