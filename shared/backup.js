/* 학습 기록 통합 백업·복원 (형사재판실무 wk-* + 검찰실무 gs-*)
   두 앱은 같은 주소(origin)의 localStorage를 쓰므로, 어느 앱에서 눌러도 두 과목 기록을 한 번에 다룬다.

   백업 코드 형식  HBK2.<방식>.<본문>
     방식 z: 본문 = base64url( deflate-raw( UTF-8 JSON ) )   ← 기본 (브라우저 내장 압축)
     방식 p: 본문 = base64url( UTF-8 JSON )                  ← 압축을 지원하지 않는 브라우저
     JSON = {v:2, at:ISO시각, j:{키:값(JSON으로 풀어 둔 것)}, s:{키:문자열(JSON이 아닌 값)}}
     → 값마다 JSON 문자열을 한 번 더 감싸던 '이중 포장'을 없애 따옴표 이스케이프가 붙지 않는다.
   예전 형식도 읽는다: 형사재판실무 'WKBK1:<base64>', 검찰실무 JSON {v:1,data:{...}} (글·파일 모두). */
(function(){
  'use strict';
  var PREFIX=/^(wk|gs)-/, SKIP={'wk-test':1};          // wk-test는 저장 가능 여부 검사용 임시 키
  var MEMO={'wk-memos':'updated','gs-memo':'t'};      // 메모: 항목마다 더 최근 것을 남긴다 (값 = 시각 필드 이름)

  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

  /* ---------- 읽기·쓰기 ---------- */
  function collect(){
    var j={},s={},n=0;
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(!k||!PREFIX.test(k)||SKIP[k])continue;
      var raw=localStorage.getItem(k);
      try{j[k]=JSON.parse(raw)}catch(e){s[k]=raw}
      n++;
    }
    return {v:2,at:new Date().toISOString(),j:j,s:s,n:n};
  }
  // 예전 형식까지 모두 {키: 저장할 문자열} 로 맞춘다
  function normalize(o){
    var out={};
    if(o&&o.v===2){
      for(var k in o.j||{})out[k]=JSON.stringify(o.j[k]);
      for(k in o.s||{})if(typeof o.s[k]==='string')out[k]=o.s[k];
    }else{
      var d=(o&&o.data&&typeof o.data==='object')?o.data:o;       // 검찰실무 v1 또는 형사재판실무 WKBK1 본문
      for(k in d||{})out[k]=typeof d[k]==='string'?d[k]:JSON.stringify(d[k]);
    }
    for(k in out)if(!PREFIX.test(k)||SKIP[k])delete out[k];
    return out;
  }
  function apply(map){
    var n=0;
    for(var k in map){
      var v=map[k];
      if(MEMO[k]){
        var f=MEMO[k],cur={},inc={};
        try{cur=JSON.parse(localStorage.getItem(k))||{}}catch(e){}
        try{inc=JSON.parse(v)||{}}catch(e){}
        for(var id in inc){if(!cur[id]||(+(inc[id]||{})[f]||0)>=(+(cur[id]||{})[f]||0))cur[id]=inc[id]}
        v=JSON.stringify(cur);
      }
      localStorage.setItem(k,v);n++;
    }
    return n;
  }

  /* ---------- 인코딩 ---------- */
  var canZip=typeof CompressionStream==='function'&&typeof DecompressionStream==='function';
  function b64u(bytes){
    var bin='',CH=0x8000;
    for(var i=0;i<bytes.length;i+=CH)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function unb64u(str){
    var b=str.replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
    var bin=atob(b),u=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    return u;
  }
  function pipe(bytes,stream){
    return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function(b){return new Uint8Array(b)});
  }
  function encode(obj){
    var bytes=new TextEncoder().encode(JSON.stringify(obj));
    if(!canZip)return Promise.resolve('HBK2.p.'+b64u(bytes));
    return pipe(bytes,new CompressionStream('deflate-raw')).then(function(z){return 'HBK2.z.'+b64u(z)});
  }
  function decode(text){
    var t=(text||'').replace(/^﻿/,'').trim();
    if(!t)return Promise.reject(new Error('empty'));
    var m=/^HBK2\.([zp])\.([A-Za-z0-9_-]+)$/.exec(t.replace(/\s+/g,''));
    if(m){
      var u=unb64u(m[2]);
      if(m[1]==='p')return Promise.resolve(JSON.parse(new TextDecoder().decode(u)));
      if(!canZip)return Promise.reject(new Error('nozip'));
      return pipe(u,new DecompressionStream('deflate-raw')).then(function(b){return JSON.parse(new TextDecoder().decode(b))});
    }
    if(/^WKBK1:/.test(t)){
      return Promise.resolve(JSON.parse(new TextDecoder().decode(unb64u(t.slice(6).replace(/\s+/g,'')))));
    }
    if(t.charAt(0)==='{')return Promise.resolve(JSON.parse(t));
    return Promise.reject(new Error('format'));
  }

  /* ---------- 화면 ---------- */
  function build(box){
    box.innerHTML=
      '<summary>학습 기록 백업 · 다른 기기로 옮기기</summary>'+
      '<ol class="bk-steps">'+
        '<li><b>형사재판실무와 검찰실무 기록을 한 번에</b> 백업합니다. 메모, 형광펜, 별점, 카드, OX·Drill 기록, 읽던 곳이 들어갑니다.</li>'+
        '<li><b>기록 복사</b>를 누르고, 복사된 글을 카카오톡 나와의 채팅 등으로 다른 기기에 보냅니다.</li>'+
        '<li>다른 기기에서 이 페이지를 열고, 아래 칸에 붙여 넣은 뒤 <b>불러오기</b>를 누릅니다.</li>'+
        '<li>기록이 많으면 <b>파일로 저장</b> → <b>파일 불러오기</b>가 편합니다.</li>'+
      '</ol>'+
      '<div class="bk-row"><button type="button" class="bk-primary" data-bk="copy">기록 복사</button><button type="button" data-bk="save">파일로 저장</button>'+
        '<span class="bk-st" data-bk="st" aria-live="polite"></span></div>'+
      '<label class="hide" for="bk-in">백업한 기록 붙여넣기</label>'+
      '<textarea id="bk-in" rows="3" placeholder="여기에 복사한 기록을 붙여 넣으세요" spellcheck="false" autocomplete="off"></textarea>'+
      '<div class="bk-row"><button type="button" class="bk-primary" data-bk="load">불러오기</button><button type="button" data-bk="open">파일 불러오기</button>'+
        '<input type="file" data-bk="file" accept=".txt,.json,text/plain,application/json" hidden></div>'+
      '<p class="bk-note">메모는 판례·법리마다 더 최근 것이 남고, 나머지 기록은 불러온 것으로 바뀝니다. 예전 방식으로 만든 백업(두 과목 각각)도 불러올 수 있습니다.</p>';

    var q=function(n){return box.querySelector('[data-bk="'+n+'"]')};
    var ta=box.querySelector('textarea'),stEl=q('st');
    var st=function(t){stEl.textContent=t};
    var fmt=function(n){return n.toLocaleString('ko-KR')};

    function make(){
      var o;try{o=collect()}catch(e){st('이 브라우저에서는 기록을 읽을 수 없습니다.');return Promise.reject(e)}
      if(!o.n){st('아직 저장된 기록이 없습니다.');return Promise.reject(new Error('none'))}
      delete o.n;
      return encode(o).catch(function(e){st('백업을 만들지 못했습니다.');throw e});
    }
    q('copy').addEventListener('click',function(){
      make().then(function(code){
        ta.value=code;
        var done=function(){st('복사했습니다 ('+fmt(code.length)+'자). 다른 기기에 붙여 넣으세요.')};
        var manual=function(){ta.focus();ta.select();st('아래 칸의 글 전체를 직접 복사해 주세요 ('+fmt(code.length)+'자).')};
        try{navigator.clipboard.writeText(code).then(done,manual)}catch(e){manual()}
      },function(){});
    });
    q('save').addEventListener('click',function(){
      make().then(function(code){
        var a=document.createElement('a');
        a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));
        a.download='law-study-backup-'+new Date().toISOString().slice(0,10)+'.txt';  // 한글 이름은 일부 브라우저에서 'download'로 바뀌어 영문으로
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(function(){URL.revokeObjectURL(a.href)},4000);
        st('파일을 저장했습니다.');
      },function(){});
    });

    function restore(text){
      decode(text).then(function(obj){
        var map=normalize(obj),keys=Object.keys(map);
        if(!keys.length){st('불러올 기록이 없습니다.');return}
        var has={wk:0,gs:0};keys.forEach(function(k){has[k.slice(0,2)]++});
        var what=[has.wk?'형사재판실무':'',has.gs?'검찰실무':''].filter(Boolean).join('·');
        if(!confirm(what+' 기록을 불러옵니다.\n이 기기의 같은 기록은 바뀝니다(메모는 더 최근 것이 남습니다). 계속할까요?'))return;
        try{apply(map)}catch(e){st('저장하지 못했습니다. 저장 공간이나 시크릿 모드 여부를 확인해 주세요.');return}
        st('불러왔습니다. 화면을 새로 고칩니다…');
        // 두 과목 화면을 모두 새로 읽어야, 열려 있던 다른 과목이 옛 기록으로 덮어쓰지 않는다
        setTimeout(function(){
          var top=window;try{if(window.top.location.origin===location.origin)top=window.top}catch(e){}
          top.location.reload();
        },600);
      },function(e){
        st(e&&e.message==='nozip'?'이 브라우저는 압축된 백업을 읽지 못합니다. 최신 브라우저에서 열어 주세요.':
           e&&e.message==='empty'?'붙여 넣은 기록이 없습니다.':
           '형식이 맞지 않거나 글이 잘렸습니다. 백업한 글 전체를 다시 붙여 넣어 주세요.');
      });
    }
    q('load').addEventListener('click',function(){restore(ta.value)});
    q('open').addEventListener('click',function(){q('file').click()});
    q('file').addEventListener('change',function(){
      var f=this.files&&this.files[0];this.value='';
      if(!f)return;
      f.text().then(restore,function(){st('파일을 읽지 못했습니다.')});
    });
  }

  function mount(){
    var box=document.getElementById('bk');
    if(box&&!box.dataset.ready){box.dataset.ready='1';build(box);return true}
    return !!box;
  }
  if(!mount()){
    var mo=new MutationObserver(function(){if(mount())mo.disconnect()});
    mo.observe(document.body,{childList:true,subtree:true});
  }
})();
