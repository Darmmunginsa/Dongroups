(async()=>{
 const q=new URLSearchParams(location.search),id=q.get('id'),serial=DonnetReport.serial(q.get('serial')),message=document.getElementById('message'),frame=document.getElementById('report');
 try{
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(id||'')||!serial)throw Error();
  const config=window.WARRANTY_API_CONFIG;if(!config?.enabled||!config.endpoint)throw Error();
  const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({serial,reportId:id}),signal:AbortSignal.timeout(20000),credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error();const data=await response.json();if(data.ok!==true||!data.found||data.report?.fields?.serial!==serial||!data.report.signedAt)throw Error();
  const r=DonnetReport.publicCopy(data.report);frame.srcdoc=DonnetReport.render(r);frame.hidden=false;message.hidden=true;document.getElementById('print').disabled=false;document.getElementById('print').onclick=()=>frame.contentWindow.print();
 }catch{message.textContent='ไม่พบรายงานที่เผยแพร่ หรือรายงานถูกหยุดเผยแพร่แล้ว กรุณาติดต่อทีมงาน D On Net';}
})();
