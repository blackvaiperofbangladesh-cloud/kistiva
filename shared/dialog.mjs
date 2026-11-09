let active=null,previousFocus=null;
const focusable=modal=>[...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);
export function openDialog(modal){
 if(!modal)return;
 if(active&&active!==modal){active.classList.remove('show');active.removeAttribute('aria-modal');}
 if(!active)previousFocus=document.activeElement;
 active=modal;modal.classList.add('show');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
 if(!modal.hasAttribute('aria-label')&&!modal.hasAttribute('aria-labelledby')){const heading=modal.querySelector('h1,h2,h3');if(heading){heading.id||=modal.id+'-title';modal.setAttribute('aria-labelledby',heading.id);}}
 modal.tabIndex=-1;(focusable(modal)[0]||modal).focus();
}
export function closeDialog(modal){
 if(!modal)return;modal.classList.remove('show');modal.removeAttribute('aria-modal');
 if(active===modal){active=null;if(previousFocus?.isConnected)previousFocus.focus();previousFocus=null;}
}
document.addEventListener('keydown',event=>{
 if(!active)return;
 if(event.key==='Escape'){event.preventDefault();closeDialog(active);return;}
 if(event.key!=='Tab')return;
 const controls=focusable(active),first=controls[0],last=controls.at(-1);
 if(!first){event.preventDefault();active.focus();return;}
 if(event.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){event.preventDefault();first.focus();}
});
