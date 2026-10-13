'use strict';
const search=document.getElementById('faqSearch');
const filters=[...document.querySelectorAll('.faq-filters button')];
const topics=[...document.querySelectorAll('.faq-topic')];
const questions=[...document.querySelectorAll('.faq-item')];
const countLabel=document.getElementById('faqCount');
const empty=document.querySelector('.faq-empty');
let selectedCategory='all';
function normalizeFaq(value){return value.normalize('NFC').toLocaleLowerCase('th-TH').replace(/\s+/g,' ').trim();}
function matchesFaq(text,category,query,selected){return (selected==='all'||category===selected)&&normalizeFaq(query).split(' ').filter(Boolean).every(word=>normalizeFaq(text).includes(word));}
function filterFaq(){
 let count=0;
 for(const question of questions){const visible=matchesFaq(question.textContent,question.dataset.category,search.value,selectedCategory);question.hidden=!visible;if(visible)count++;}
 for(const topic of topics)topic.hidden=![...topic.querySelectorAll('.faq-item')].some(question=>!question.hidden);
 empty.hidden=count>0;
 const filtered=search.value.trim()!==''||selectedCategory!=='all';countLabel.textContent=filtered?`พบ ${count} คำถาม จากทั้งหมด ${questions.length} คำถาม`:`${questions.length} คำถาม ใน ${topics.length} หมวด`;
 for(const filter of filters)filter.setAttribute('aria-pressed',String(filter.dataset.category===selectedCategory));
}
search.addEventListener('input',filterFaq);
for(const filter of filters)filter.addEventListener('click',()=>{selectedCategory=filter.dataset.category;filterFaq();});
document.getElementById('faqReset').addEventListener('click',()=>{selectedCategory='all';search.value='';filterFaq();search.focus();});
filterFaq();
