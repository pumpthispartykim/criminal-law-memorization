/* PC 목차 접기: 머리글 검색창 오른쪽에 '☰ 목차 접기' 버튼을 넣고, 누르거나 \ 키로 목차를 접고 편다.
   상태는 앱마다 따로 기억한다 (검찰실무 gs-tocfold, 형사재판실무 wk-tocfold). */
(function(){
  var KEY=/\/prosecution\//.test(location.pathname)?'gs-tocfold':'wk-tocfold';
  var topin=document.querySelector('header.top .topin');
  if(!topin||document.getElementById('tocfold'))return;

  var b=document.createElement('button');
  b.type='button';b.className='tocfoldbtn';b.id='tocfold';b.title='목차 접기/펴기 (\\ 키)';
  // 검색창 바로 뒤(글자 크기·목차 버튼 앞)에 둔다 → 제목 위치는 그대로
  var search=topin.querySelector('.search');
  topin.insertBefore(b,search?search.nextSibling:null);

  var f=false;
  try{f=JSON.parse(localStorage.getItem(KEY))===true}catch(e){}
  function ap(){
    document.body.classList.toggle('tocfold',f);
    b.setAttribute('aria-pressed',String(f));
    b.textContent=f?'☰ 목차 펴기':'☰ 목차 접기';
    try{localStorage.setItem(KEY,JSON.stringify(f))}catch(e){}
  }
  b.addEventListener('click',function(){f=!f;ap()});
  document.addEventListener('keydown',function(e){
    if(e.key!=='\\'||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
    if(document.body.classList.contains('outside'))return;
    f=!f;ap();
  });
  ap();
})();
