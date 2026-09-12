'use client';
import {useEffect,useState} from 'react';
import {translate} from './i18n';

export default function LocaleBridge(){
  const [locale,setLocale]=useState<'en'|'zh'>('en');
  useEffect(()=>{
    const requested=new URLSearchParams(location.search).get('lang');
    const value=requested==='zh'||(!requested&&localStorage.getItem('eai-course-language')==='zh')?'zh':'en';
    setLocale(value);document.documentElement.lang=value==='zh'?'zh-CN':'en';
    if(value!=='zh')return;
    const apply=()=>{
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
      while(node=walker.nextNode()){const raw=node.nodeValue??'';const key=raw.trim();if(!key)continue;const next=translate(key,'zh');if(next!==key)node.nodeValue=raw.replace(key,next);}
      document.querySelectorAll<HTMLAnchorElement>('a[href="/microduck-lab/hardware.html"]').forEach(a=>a.href='/microduck-lab/hardware-zh.html');
      document.querySelectorAll<HTMLAnchorElement>('a[href="/microduck-lab/software.html"]').forEach(a=>a.href='/microduck-lab/software-zh.html');
      document.querySelectorAll<HTMLAnchorElement>('a[href="/microduck-lab/training.html"]').forEach(a=>a.href='/microduck-lab/training-zh.html');
    };apply();const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();
  },[]);
  const switchLanguage=()=>{const next=locale==='zh'?'en':'zh';localStorage.setItem('eai-course-language',next);const url=new URL(location.href);url.searchParams.set('lang',next);location.href=url.toString();};
  return <button className="duck-language" onClick={switchLanguage} aria-label={locale==='zh'?'Switch to English':'切换到中文'}>{locale==='zh'?'EN':'中文'}</button>;
}
