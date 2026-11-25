/* Subject switcher: adds a ▾ dropdown next to each app's title (h1.brand).
   Inside the root shell (iframe) it asks the shell to swap panes, which keeps each
   app's place; opened on its own, it navigates to the shell at the chosen subject. */
(function(){
  var SUBJECTS=[{key:'trial',label:'형사재판실무'},{key:'prosecution',label:'검찰실무'}];
  var here=/\/prosecution\//.test(location.pathname)?'prosecution':'trial';
  var h1=document.querySelector('h1.brand');
  if(!h1||document.getElementById('subj-btn'))return;

  var css=document.createElement('style');
  css.textContent=
    '.subj{position:relative;display:inline-flex;align-items:center;flex:none}'+
    '.subj-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-left:4px;padding:0;'+
      'border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink);cursor:pointer}'+
    '.subj-btn:hover,.subj-btn[aria-expanded="true"]{background:var(--accent-soft);color:var(--ink)}'+
    '.subj-btn svg{width:16px;height:16px;transition:transform .15s}'+
    '.subj-btn[aria-expanded="true"] svg{transform:rotate(180deg)}'+
    '.subj-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:60;min-width:180px;margin:0;padding:4px;list-style:none;'+
      'background:var(--paper);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.14)}'+
    '.subj-menu[hidden]{display:none}'+
    '.subj-menu a{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;color:var(--ink);'+
      'text-decoration:none;font-family:var(--body);font-size:14px;font-weight:500;white-space:nowrap}'+
    '.subj-menu a:hover,.subj-menu a:focus-visible{background:var(--accent-soft);outline:none}'+
    '.subj-menu a .ck{width:14px;color:var(--accent);font-weight:700}'+
    '.subj-menu a[aria-current="page"]{font-weight:700}'+
    '.subj-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}';
  document.head.appendChild(css);

  var wrap=document.createElement('div');wrap.className='subj';
  var btn=document.createElement('button');
  btn.type='button';btn.id='subj-btn';btn.className='subj-btn';
  btn.setAttribute('aria-haspopup','menu');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','subj-menu');
  btn.title='과목 전환';
  btn.innerHTML='<span class="subj-sr">과목 전환</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" '+
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
  var menu=document.createElement('ul');menu.id='subj-menu';menu.className='subj-menu';menu.setAttribute('role','menu');menu.hidden=true;
  SUBJECTS.forEach(function(s){
    var li=document.createElement('li');li.setAttribute('role','none');
    var a=document.createElement('a');a.setAttribute('role','menuitem');a.href='../#'+s.key;a.dataset.key=s.key;a.tabIndex=-1;
    if(s.key===here)a.setAttribute('aria-current','page');
    a.innerHTML='<span class="ck" aria-hidden="true">'+(s.key===here?'✓':'')+'</span>'+s.label;
    li.appendChild(a);menu.appendChild(li);
  });
  wrap.appendChild(btn);wrap.appendChild(menu);
  h1.parentNode.insertBefore(wrap,h1.nextSibling);

  var items=[].slice.call(menu.querySelectorAll('a'));
  function open(focusIdx){
    menu.hidden=false;btn.setAttribute('aria-expanded','true');
    var i=typeof focusIdx==='number'?focusIdx:Math.max(0,items.findIndex(function(a){return a.dataset.key===here}));
    items[(i+items.length)%items.length].focus();
  }
  function close(refocus){
    if(menu.hidden)return;menu.hidden=true;btn.setAttribute('aria-expanded','false');if(refocus)btn.focus();
  }
  function go(key){
    close(false);
    if(key===here)return;
    if(window.parent!==window){ // inside the shell: let it swap panes (origin is "null" on file://)
      window.parent.postMessage({type:'subject-switch',to:key},location.origin==='null'?'*':location.origin);
    }else location.href='../#'+key;
  }
  btn.addEventListener('click',function(){menu.hidden?open():close(false)});
  btn.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();open(0)}else if(e.key==='ArrowUp'){e.preventDefault();open(items.length-1)}
  });
  menu.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a)return;e.preventDefault();go(a.dataset.key);
  });
  menu.addEventListener('keydown',function(e){
    var i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus()}
    else if(e.key==='Home'){e.preventDefault();items[0].focus()}
    else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}
    else if(e.key==='Tab'){close(false)}
  });
  document.addEventListener('pointerdown',function(e){if(!wrap.contains(e.target))close(false)});
  window.addEventListener('blur',function(){close(false)});
})();
