'use strict';
const brandSelect=document.getElementById('brand'),modelSelect=document.getElementById('model'),modelSearch=document.getElementById('modelSearch');
const brandCustom=document.getElementById('brandCustom'),modelCustom=document.getElementById('modelCustom');
const catalog=window.UPS_CATALOG||[];
function catalogModels(entry,query=''){const normalized=query.toLowerCase().replace(/\s+/g,'').trim();return [...(entry?.models||[]).map(name=>({value:name,label:name})),...(entry?.series||[]).map(name=>({value:`${name} (ซีรีส์)`,label:`${name} — ซีรีส์ (ยังไม่ระบุรหัสรุ่น)`}))].filter(model=>model.label.toLowerCase().replace(/\s+/g,'').includes(normalized));}
function addPickerOption(select,value,label){const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option);}
for(const entry of catalog)addPickerOption(brandSelect,entry.brand,entry.brand);
addPickerOption(brandSelect,'__other__','ยี่ห้ออื่น — ระบุเอง');
function refreshModels(keepSelection=false){
 const previous=keepSelection?modelSelect.value:'';const entry=catalog.find(entry=>entry.brand===brandSelect.value);const models=catalogModels(entry,modelSearch.value);
 modelSelect.replaceChildren();addPickerOption(modelSelect,'','ไม่ทราบรุ่น / ให้ทีมงานช่วยตรวจสอบ');
 for(const model of models)addPickerOption(modelSelect,model.value,model.label);
 if(previous&&previous!=='__other__'&&!models.some(model=>model.value===previous)){
  const selected=catalogModels(entry).find(model=>model.value===previous);
  if(selected)addPickerOption(modelSelect,selected.value,selected.label+' (ที่เลือกไว้)');
 }
 addPickerOption(modelSelect,'__other__','รุ่นอื่น / ระบุรหัสรุ่นเอง');
 if(previous&&[...modelSelect.options].some(option=>option.value===previous))modelSelect.value=previous;
 modelCustom.closest('.request-field').hidden=modelSelect.value!=='__other__';modelCustom.disabled=modelSelect.value!=='__other__';
 const help=document.getElementById('modelCatalogHelp');help.textContent=entry?`พบ ${models.length} รุ่น / ซีรีส์ในรายการนี้ หากไม่มีรุ่นของคุณ เลือกระบุเองได้`:'เลือกยี่ห้อเพื่อดูรุ่น หรือเลือกให้ทีมงานช่วยตรวจสอบ';
 const source=document.getElementById('modelSource');source.hidden=!entry;if(entry)source.href=entry.source;
 modelSearch.disabled=!entry;
}
brandSelect.addEventListener('change',()=>{const other=brandSelect.value==='__other__';brandCustom.closest('.request-field').hidden=!other;brandCustom.disabled=!other;brandCustom.value='';modelCustom.value='';modelSearch.value='';refreshModels();});
modelSelect.addEventListener('change',()=>{const other=modelSelect.value==='__other__';modelCustom.closest('.request-field').hidden=!other;modelCustom.disabled=!other;modelCustom.value='';if(other)modelCustom.focus();});
modelSearch.addEventListener('input',()=>refreshModels(true));
document.getElementById('serviceForm').addEventListener('reset',()=>{setTimeout(()=>{modelSearch.value='';brandCustom.closest('.request-field').hidden=true;brandCustom.disabled=true;refreshModels();},0);});
refreshModels();
