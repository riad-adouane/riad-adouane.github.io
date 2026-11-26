/* Shared behaviour for the Arabic (/) and English (/en/) pages. Strings follow <html lang>. */
(function(){
  var root=document.documentElement, en=root.lang==='en', rtl=root.dir==='rtl', base=root.getAttribute('data-base')||'';
  var T=en?{voteDay:'Polling day is today',done:'Done',today:'Today',next:'Upcoming',copied:'Text copied.',selected:'Text selected — copy it from your device menu.',locale:'en-US'}
          :{voteDay:'اليوم يوم الاقتراع',done:'تمّ',today:'اليوم',next:'قادم',copied:'تم نسخ النص.',selected:'النص محدّد، انسخه من قائمة جهازك.',locale:'fr-FR'};

  // countdown to polls opening, Algeria time (UTC+1)
  var target=Date.parse('2026-11-28T08:00:00+01:00');
  var el={d:document.getElementById('cd-d'),h:document.getElementById('cd-h'),m:document.getElementById('cd-m'),s:document.getElementById('cd-s')};
  function pad(n){return (n<10?'0':'')+n}
  function tick(){
    var ms=target-Date.now();
    if(ms<=0){document.getElementById('cd').innerHTML='<div style="min-width:auto;padding:4px 14px 6px"><strong style="font-size:17px">'+T.voteDay+'</strong></div>';return false}
    var s=Math.floor(ms/1000);
    el.d.textContent=Math.floor(s/86400); el.h.textContent=pad(Math.floor(s%86400/3600)); el.m.textContent=pad(Math.floor(s%3600/60)); el.s.textContent=pad(s%60);
    return true;
  }
  if(el.d&&tick()){var iv=setInterval(function(){if(!tick())clearInterval(iv)},1000)}

  // schedule status from today's date in Algeria
  var today=new Date(Date.now()+60*60*1000).toISOString().slice(0,10);
  document.querySelectorAll('#tl .ev').forEach(function(li){
    var d=li.getAttribute('data-date'), st=li.querySelector('.st');
    if(d<today){st.textContent=T.done;st.className='st done'}
    else if(d===today){st.textContent=T.today;st.className='st today'}
    else{st.textContent=T.next;st.className='st next'}
  });

  // tabs (arrow keys follow reading direction)
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  function sel(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on})}
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){sel(t)});
    t.addEventListener('keydown',function(e){
      var fwd=rtl?'ArrowLeft':'ArrowRight', back=rtl?'ArrowRight':'ArrowLeft', j;
      if(e.key===fwd)j=(i+1)%tabs.length;else if(e.key===back)j=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;
      e.preventDefault();sel(tabs[j]);tabs[j].focus()})
  });

  // share
  var st=document.getElementById('sharetext');
  if(st){
    var txt=st.textContent.trim()+'\n'+location.origin+location.pathname;
    document.getElementById('wa').href='https://wa.me/?text='+encodeURIComponent(txt);
    var msg=document.getElementById('cpmsg');
    document.getElementById('cp').addEventListener('click',function(){
      function fallback(){var r=document.createRange();r.selectNodeContents(st);var s=window.getSelection();s.removeAllRanges();s.addRange(r);msg.textContent=T.selected}
      try{navigator.clipboard.writeText(txt).then(function(){msg.textContent=T.copied},fallback)}catch(e){fallback()}
    });
  }

  // interview video: native HLS where supported, hls.js elsewhere
  var v=document.getElementById('liqaa-v'),src=base+'video/master.m3u8';
  if(v){ if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=src}
    else{var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      sc.onload=function(){if(window.Hls&&Hls.isSupported()){var h=new Hls({capLevelToPlayerSize:true,abrEwmaDefaultEstimate:3000000});h.loadSource(src);h.attachMedia(v)}else{v.src=src}};
      document.head.appendChild(sc)}}

  // visit counter: one count per browser session, shared by both languages (abacus.jasoncameron.dev, no account)
  var B='https://abacus.jasoncameron.dev',P='riad-adouane-site/visits',seen=false;
  try{seen=sessionStorage.getItem('rv')==='1'}catch(e){}
  fetch(B+'/'+(seen?'get':'hit')+'/'+P,{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(d){
    var n=d&&d.value; if(typeof n!=='number'||n<0)return;
    try{sessionStorage.setItem('rv','1')}catch(e){}
    var t=n.toLocaleString(T.locale);
    document.querySelectorAll('[data-visits]').forEach(function(e){e.querySelector('b').textContent=t;e.hidden=false});
  }).catch(function(){});

  // footer year
  document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
})();
