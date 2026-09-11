/* ============================================================
   VOLVAMOS A CONOCERNOS v2 — logica
   ============================================================ */

/* ---------- FECHA EXACTA DE LA RELACION ----------
   24 de febrero de 2024, 9:00 PM  (mes es 0-11, asi que febrero = 1) */
const START_DATE = new Date(2024, 1, 24, 21, 0, 0);

/* ---------- Almacen de respuestas (localStorage) ---------- */
const STORE_KEY = 'nuestrasRespuestas';
function loadStore(){
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveAnswer(section, question, answer, extra){
  const store = loadStore();
  if(!store[section]) store[section] = [];
  store[section].push({
    q: question,
    a: answer,
    extra: extra || '',
    t: new Date().toISOString()
  });
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/* ---------- Toast ---------- */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 2200);
}

/* =========================================================
   NAVEGACION
   ========================================================= */
const screens = document.querySelectorAll('.screen');
function go(id){
  screens.forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
  if(id === 'vault') renderVault();
}
document.querySelectorAll('[data-go]').forEach(el=>{
  el.addEventListener('click',()=>go(el.dataset.go));
});

/* =========================================================
   INTRO -> MENU
   ========================================================= */
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('partnerName');
// recordar nombre si ya lo puso antes
const savedName = localStorage.getItem('partnerName');
if(savedName) nameInput.value = savedName;

startBtn.addEventListener('click',()=>{
  const name = nameInput.value.trim();
  if(name) localStorage.setItem('partnerName', name);
  document.getElementById('helloName').textContent = name ? `Hola, ${name}.` : 'Hola.';
  go('menu');
});
nameInput.addEventListener('keydown',e=>{ if(e.key==='Enter') startBtn.click(); });

/* =========================================================
   CONTADOR EN VIVO (anos, meses, dias, horas, min, seg)
   ========================================================= */
const unitsBox = document.getElementById('counterUnits');
const totalBox = document.getElementById('counterTotal');
let tlClockBox = null; // se llena cuando se construye "Nuestra historia"

function diffBreakdown(from, to){
  let y = to.getFullYear() - from.getFullYear();
  let mo = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  let h = to.getHours() - from.getHours();
  let mi = to.getMinutes() - from.getMinutes();
  let s = to.getSeconds() - from.getSeconds();
  if(s < 0){ s += 60; mi--; }
  if(mi < 0){ mi += 60; h--; }
  if(h < 0){ h += 24; d--; }
  if(d < 0){
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    d += prevMonth; mo--;
  }
  if(mo < 0){ mo += 12; y--; }
  return {y,mo,d,h,mi,s};
}

function buildUnitsHTML(b){
  const units = [
    [b.y,'a\u00F1os'],[b.mo,'meses'],[b.d,'d\u00EDas'],
    [b.h,'horas'],[b.mi,'min'],[b.s,'seg']
  ];
  return units.map(([n,l])=>
    `<div class="cu"><span class="cu-num">${n}</span><span class="cu-label">${l}</span></div>`
  ).join('');
}
function renderCounter(){
  const now = new Date();
  const b = diffBreakdown(START_DATE, now);
  const html = buildUnitsHTML(b);
  unitsBox.innerHTML = html;

  const totalDays = Math.floor((now - START_DATE)/86400000);
  const totalHours = Math.floor((now - START_DATE)/3600000);
  totalBox.innerHTML = `Son <strong>${totalDays.toLocaleString('es-MX')}</strong> d\u00EDas juntos &middot; <strong>${totalHours.toLocaleString('es-MX')}</strong> horas eligi\u00E9ndonos`;

  // mismo reloj dentro de "Nuestra historia > Hoy"
  if(tlClockBox){
    tlClockBox.innerHTML = html;
  }
}
renderCounter();
setInterval(renderCounter, 1000);

/* =========================================================
   PREGUNTAS POR NIVEL
   ========================================================= */
const QUESTIONS = {
  0:[
    {q:"Si pudieramos repetir una cita nuestra, cual eliges?", o:["La primera","La mas random","La que nadie mas sabe","Una que aun no hemos tenido"]},
    {q:"Que cancion se siente 'nuestra' ultimamente?", o:["La de siempre","Una nueva","No tenemos una... aun","Depende del dia"]},
    {q:"Un domingo perfecto conmigo es:", o:["En cama sin hacer nada","Salir a la aventura","Cocinar juntos","Ver algo abrazados"]},
    {q:"Que mania mia te da mas ternura?", o:["Como como","Como duermo","Como hablo","Todas, la verdad"]},
    {q:"Si viajaramos manana sin planear, a donde?", o:["Playa","Montana","Ciudad nueva","Carretera sin destino"]},
  ],
  1:[
    {q:"Que sueno tuyo te gustaria que yo conociera mejor?", o:["Uno de trabajo","Uno de viaje","Uno sobre nosotros","Uno que no le he contado a nadie"]},
    {q:"Cuando te has sentido mas orgulloso/a de mi?", o:["Ultimamente","Al principio","En un momento dificil","Todo el tiempo, en calma"]},
    {q:"Que miedo cargas que no siempre dices?", o:["A perdernos","Al futuro","A no ser suficiente","A quedarme igual"]},
    {q:"En que momento supiste que esto iba en serio?", o:["Muy pronto","Poco a poco","Un dia especifico","Aun lo estoy sintiendo crecer"]},
    {q:"Si pudieras darle un consejo al 'tu' de hace 2 anos:", o:["Confia","No corras","Disfruta mas","Todo va a estar bien"]},
  ],
  2:[
    {q:"Que necesitas de mi que a veces no pides?", o:["Mas tiempo","Mas palabras","Mas calma","Que note sin que digas"]},
    {q:"Cuando te sientes mas cerca de mi?", o:["En silencio","Platicando","Al reir","Al despertar juntos"]},
    {q:"Que parte de ti sientes que solo yo he visto?", o:["La vulnerable","La boba","La insegura","La mas real"]},
    {q:"Hay algo que te gustaria que hicieramos mas?", o:["Hablar de todo","Abrazarnos mas","Sonar en voz alta","Estar sin prisa"]},
    {q:"Que te hace sentir elegido/a por mi?", o:["Los detalles","Como te miro","Que me quede","Que vuelva siempre"]},
  ],
  3:[
    {q:"Que te gustaria que supiera sobre como te hago sentir?", o:["Segura/o","Deseado/a","En casa","Todo eso junto"]},
    {q:"Que version de nuestro futuro te emociona mas?", o:["Vivir juntos","Viajar el mundo","Formar familia","Solo seguir asi, contigo"]},
    {q:"Que es lo mas honesto que sientes por mi ahora mismo?", o:["Lo dire abajo","Prefiero decirtelo hoy","No hay palabras","Te amo y ya"]},
    {q:"Que prometemos cuidar de aqui en adelante?", o:["Hablar mas","Escucharnos","No soltarnos","Seguir eligiendonos"]},
    {q:"Si esto fuera una carta de amor, diria:", o:["Te amo","Quedate","Gracias por todo","(lo escribo yo)"]},
  ]
};
const LEVEL_NAMES = ["Ligeras","Un poco mas","Intimas","Muy intimas"];

let curLevel = 0, curIndex = 0, curPicked = null;
const levelPicker = document.getElementById('levelPicker');
const quizPlay = document.getElementById('quizPlay');

document.querySelectorAll('.level').forEach(btn=>{
  btn.addEventListener('click',()=>{
    curLevel = +btn.dataset.level;
    curIndex = 0;
    levelPicker.classList.add('hidden');
    quizPlay.classList.remove('hidden');
    renderQuestion('next');
  });
});
document.getElementById('quizBack').addEventListener('click',()=>{
  quizPlay.classList.add('hidden');
  levelPicker.classList.remove('hidden');
});

function renderQuestion(dir){
  const set = QUESTIONS[curLevel];
  const item = set[curIndex];
  curPicked = null;
  const card = document.getElementById('quizCard');

  // contador "X de 5"
  document.getElementById('qLevel').textContent = LEVEL_NAMES[curLevel] + '  \u00B7  ' + (curIndex+1) + ' de ' + set.length;
  document.getElementById('qText').textContent = item.q;
  document.getElementById('quizProgress').style.width = (((curIndex+1)/set.length)*100)+'%';

  const optsBox = document.getElementById('qOptions');
  optsBox.innerHTML = '';
  item.o.forEach(text=>{
    const b = document.createElement('button');
    b.className = 'q-opt';
    b.textContent = text;
    b.addEventListener('click',()=>{
      optsBox.querySelectorAll('.q-opt').forEach(x=>x.classList.remove('picked'));
      b.classList.add('picked');
      curPicked = text;
    });
    optsBox.appendChild(b);
  });

  // el campo de escribir y los botones SIEMPRE visibles
  document.getElementById('qOpen').value = '';

  // botón "Anterior" solo si no es la primera
  document.getElementById('prevQ').style.visibility = curIndex === 0 ? 'hidden' : 'visible';
  // texto del botón siguiente: en la última dice "Terminar"
  document.getElementById('nextQ').textContent = (curIndex === set.length-1) ? 'Terminar \u2713' : 'Siguiente \u2192';

  // animación de entrada de la tarjeta
  card.classList.remove('slide-in-left','slide-in-right');
  void card.offsetWidth; // reiniciar animación
  card.classList.add(dir === 'prev' ? 'slide-in-left' : 'slide-in-right');
}

function saveCurrentAnswer(){
  const set = QUESTIONS[curLevel];
  const item = set[curIndex];
  const written = document.getElementById('qOpen').value.trim();
  if(curPicked || written){
    saveAnswer('Preguntas ('+LEVEL_NAMES[curLevel]+')', item.q, curPicked || '(escrito)', written);
  }
}

document.getElementById('nextQ').addEventListener('click',()=>{
  const set = QUESTIONS[curLevel];
  saveCurrentAnswer();
  curIndex++;
  if(curIndex >= set.length){
    document.getElementById('quizProgress').style.width = '100%';
    toast('Nivel terminado \u2713 respuestas guardadas');
    quizPlay.classList.add('hidden');
    levelPicker.classList.remove('hidden');
    curIndex = 0;
  } else {
    renderQuestion('next');
  }
});

document.getElementById('prevQ').addEventListener('click',()=>{
  if(curIndex === 0) return;
  saveCurrentAnswer();
  curIndex--;
  renderQuestion('prev');
});

/* =========================================================
   MEMORAMA
   ========================================================= */
const MEM_SYMBOLS = ['\u2726','\u2661','\u273A','\u25C8','\u2698','\u263E','\u2727','\u274B'];
let memFirst=null, memLock=false, memMoves=0, memMatched=0;
const memGrid = document.getElementById('memGrid');

function buildMemory(){
  memFirst=null; memLock=false; memMoves=0; memMatched=0;
  document.getElementById('memStats').textContent = 'Movimientos: 0';
  document.getElementById('memWin').classList.add('hidden');
  memGrid.innerHTML = '';
  const deck = [...MEM_SYMBOLS, ...MEM_SYMBOLS].sort(()=>Math.random()-0.5);
  deck.forEach(sym=>{
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.innerHTML = `<div class="mem-face mem-front">?</div><div class="mem-face mem-back">${sym}</div>`;
    card.dataset.sym = sym;
    card.addEventListener('click',()=>flipMem(card));
    memGrid.appendChild(card);
  });
}
function flipMem(card){
  if(memLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  if(!memFirst){ memFirst = card; return; }
  memMoves++;
  document.getElementById('memStats').textContent = 'Movimientos: '+memMoves;
  if(memFirst.dataset.sym === card.dataset.sym){
    memFirst.classList.add('matched'); card.classList.add('matched');
    memFirst=null; memMatched++;
    if(memMatched === MEM_SYMBOLS.length){
      document.getElementById('memMoves').textContent = memMoves;
      setTimeout(()=>document.getElementById('memWin').classList.remove('hidden'),500);
    }
  } else {
    memLock = true;
    const a = memFirst; memFirst=null;
    setTimeout(()=>{ a.classList.remove('flipped'); card.classList.remove('flipped'); memLock=false; },850);
  }
}
document.getElementById('memReset').addEventListener('click',buildMemory);
buildMemory();

/* =========================================================
   RULETA
   ========================================================= */
const WHEEL_Q = [
  "Que es lo primero que pensaste de mi?",
  "Dime un recuerdo nuestro que te haga sonreir solo/a.",
  "Que te gustaria que hicieramos esta semana?",
  "Un gesto mio que te enamora.",
  "Que extranarias de mi si un dia no estuviera?",
  "Nombra algo que quieres lograr conmigo.",
  "Cuando te sentiste mas amado/a por mi?",
  "Un lugar al que quieres que te lleve.",
];
const WHEEL_COLORS = ['rgba(143,180,255,.85)','rgba(255,158,196,.85)','rgba(199,156,255,.85)','rgba(143,230,180,.85)'];
const wheel = document.getElementById('wheel');
const seg = 360 / WHEEL_Q.length;

(function paintWheel(){
  let stops = [];
  WHEEL_Q.forEach((_,i)=>{
    const c = WHEEL_COLORS[i % WHEEL_COLORS.length];
    stops.push(`${c} ${i*seg}deg ${(i+1)*seg}deg`);
  });
  wheel.style.background = `conic-gradient(${stops.join(',')})`;
  const center = document.createElement('div');
  center.className = 'wheel-center'; center.textContent='\u273A';
  wheel.appendChild(center);
})();

let wheelAngle = 0, spinning=false, currentWheelQ='';
document.getElementById('spinBtn').addEventListener('click',()=>{
  if(spinning) return;
  spinning = true;
  document.getElementById('wheelResult').classList.add('hidden');
  const pick = Math.floor(Math.random()*WHEEL_Q.length);
  const spins = 5*360;
  const target = spins + (360 - (pick*seg + seg/2));
  wheelAngle += target;
  wheel.style.transform = `rotate(${wheelAngle}deg)`;
  setTimeout(()=>{
    currentWheelQ = WHEEL_Q[pick];
    document.getElementById('wheelQ').textContent = currentWheelQ;
    document.getElementById('wheelAnswer').value = '';
    document.getElementById('wheelResult').classList.remove('hidden');
    spinning = false;
  },4600);
});
document.getElementById('wheelSave').addEventListener('click',()=>{
  const ans = document.getElementById('wheelAnswer').value.trim();
  if(!ans){ toast('Escribe algo primero \u263A'); return; }
  saveAnswer('Ruleta', currentWheelQ, '(escrito)', ans);
  toast('Guardado \u2713');
  document.getElementById('wheelResult').classList.add('hidden');
});

/* =========================================================
   VERDADERO / FALSO
   ========================================================= */
const TF = [
  {t:"Nuestra primera conversacion duro mas de una hora.", a:true, s:"Si no te acuerdas... hay que revivirlo."},
  {t:"Recuerdo exactamente que llevabas puesto la primera vez.", a:true, s:"Vale doble si de verdad lo recuerdas."},
  {t:"Nos hicimos novios de noche, no de dia.", a:true, s:"9 de la noche del 24 de febrero. Nunca se me olvida."},
  {t:"Podria describir tu risa con los ojos cerrados.", a:true, s:"Es de mis sonidos favoritos."},
  {t:"Nunca hemos tenido nuestra primera pelea 'de verdad'.", a:false, s:"Y aprendimos de ella, no?"},
  {t:"Se cual es tu comida de consuelo cuando estas mal.", a:true, s:"Si no, me lo dices y te la preparo hoy."},
  {t:"Recuerdo el nombre de tu primera mascota.", a:true, s:"Detalles pequenos, cosas que importan."},
];
let tfIndex=0, tfRight=0, tfDone=0;
function renderTF(){
  const item = TF[tfIndex];
  document.getElementById('tfText').textContent = item.t;
  document.getElementById('tfFeedback').classList.add('hidden');
  document.getElementById('tfNext').classList.add('hidden');
  document.querySelectorAll('.tf-btn').forEach(b=>b.disabled=false);
}
document.querySelectorAll('.tf-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item = TF[tfIndex];
    const ans = btn.dataset.answer === 'true';
    const fb = document.getElementById('tfFeedback');
    tfDone++;
    if(ans === item.a){ tfRight++; fb.className='tf-feedback good'; fb.textContent = "Correcto \u2728 "+item.s; }
    else { fb.className='tf-feedback soft'; fb.textContent = "Mmm... "+item.s; }
    fb.classList.remove('hidden');
    document.getElementById('tfScore').textContent = `${tfRight} / ${tfDone}`;
    document.querySelectorAll('.tf-btn').forEach(b=>b.disabled=true);
    document.getElementById('tfNext').classList.remove('hidden');
    if(tfIndex >= TF.length-1) document.getElementById('tfNext').textContent='Reiniciar \u21BA';
  });
});
document.getElementById('tfNext').addEventListener('click',()=>{
  tfIndex++;
  if(tfIndex >= TF.length){ tfIndex=0; tfRight=0; tfDone=0; document.getElementById('tfScore').textContent='0 / 0'; document.getElementById('tfNext').textContent='Siguiente \u2192'; }
  renderTF();
});
renderTF();

/* =========================================================
   QUE PREFIERES
   ========================================================= */
const WOULD = [
  ["Un abrazo largo sin decir nada","Una platica hasta las 3 a.m."],
  ["Que te lleve el desayuno a la cama","Cocinar juntos en pijama"],
  ["Un viaje sorpresa","Planearlo todo juntos"],
  ["Bailar en la sala","Ver la lluvia abrazados"],
  ["Que te escriba una carta","Que te lo diga mirandote"],
  ["Envejecer viajando","Envejecer en nuestra casa"],
  ["Una noche de peliculas","Salir a ver las estrellas"],
];
let wouldIndex = 0;
const wA = document.getElementById('wouldA'), wB = document.getElementById('wouldB');
function renderWould(){
  const pair = WOULD[wouldIndex];
  wA.textContent = pair[0]; wB.textContent = pair[1];
  wA.classList.remove('chosen'); wB.classList.remove('chosen');
}
[wA,wB].forEach((btn)=>btn.addEventListener('click',()=>{
  wA.classList.remove('chosen'); wB.classList.remove('chosen');
  btn.classList.add('chosen');
  const pair = WOULD[wouldIndex];
  saveAnswer('Que prefieres', pair[0]+' / '+pair[1], btn.textContent, '');
}));
document.getElementById('wouldNext').addEventListener('click',()=>{
  wouldIndex = (wouldIndex+1) % WOULD.length;
  renderWould();
});
renderWould();

/* =========================================================
   NUESTRA HISTORIA (timeline) -- EDITA ESTO
   ========================================================= */
const TIMELINE = [
  {title:"24 de febrero, 2024", text:"El dia que te hiciste mi novia, como a las 9 de la noche. El inicio de todo esto."},
  {title:"Nuestro coqueteo", text:"Recuerdo cuando te hice circulitos en tu rodilla, mi amor. Y tambien cuando me ponias nervioso, cuando agarrabas mi mano y la ponias en tu pierna."},
  {title:"Nuestro primer beso", text:"Cuando todos estaban escribiendo en el salon y yo voltee a verte. Tu ya me estabas viendo, me agarraste y me besaste. Me puse muy nervioso y no supe como reaccionar."},
  {title:"Nuestra solucion de problemas", text:"Hemos pasado por muchas pruebas en nuestra relacion, hemos pasado casi de todo, mi amor. Pero yo sigo amandote y seguimos construyendo nuestra relacion, dejando atras lo que no tiene nada que ver con nosotros y enfocandonos solo en nosotros."},
  {title:"Hoy seguimos juntos", text:"__CLOCK__", clock:true},
];
const tlList = document.getElementById('timelineList');
const tlClockText = "Hoy seguimos juntos, y todo este tiempo te he amado y te seguire amando para toda la vida. Vamos a construir nuestra vida juntos, nuestros planes juntos, casarnos y tener una hermosa familia. Te amo, mi amor.";

TIMELINE.forEach(item=>{
  const el = document.createElement('div');
  el.className = 'tl-item';
  if(item.clock){
    el.innerHTML = `<span class="tl-star">\u2727</span><div class="tl-body"><p class="tl-title">${item.title}</p><div class="tl-text"><div class="tl-clock" id="tlClock"></div><p class="tl-clock-msg">${tlClockText}</p></div></div>`;
  } else {
    el.innerHTML = `<span class="tl-star">\u2727</span><div class="tl-body"><p class="tl-title">${item.title}</p><p class="tl-text">${item.text}</p></div>`;
  }
  el.addEventListener('click',()=>el.classList.toggle('open'));
  tlList.appendChild(el);
});
tlClockBox = document.getElementById('tlClock');

/* =========================================================
   RAZONES (tarjetas que se voltean) -- EDITA ESTO
   ========================================================= */
const REASONS = [
  "Tu risa. En serio, tu risa.",
  "Como te preocupas por los demas.",
  "La forma en que me miras cuando crees que no me doy cuenta.",
  "Tu fuerza cuando las cosas se ponen dificiles.",
  "Lo bien que se siente tu abrazo.",
  "Que me haces querer ser mejor.",
  "Tus locuras y ocurrencias.",
  "Como haces que un dia normal se sienta especial.",
  "Tu manera de amar sin condiciones.",
  "Simplemente por ser tu.",
];
const reasonsGrid = document.getElementById('reasonsGrid');
document.getElementById('reasonsCount').textContent = `(${REASONS.length})`;
REASONS.forEach((txt,i)=>{
  const card = document.createElement('div');
  card.className = 'reason';
  card.innerHTML = `<div class="reason-face reason-front">\u2661</div><div class="reason-face reason-back">${txt}</div>`;
  card.addEventListener('click',()=>card.classList.toggle('flipped'));
  reasonsGrid.appendChild(card);
});

/* =========================================================
   CARTA FINAL
   ========================================================= */
const envelope = document.getElementById('envelope');
envelope.addEventListener('click',()=>{
  envelope.classList.add('open');
  setTimeout(()=>{
    envelope.classList.add('hidden');
    document.getElementById('letterCard').classList.remove('hidden');
  },650);
});

/* =========================================================
   CARRUSEL DE FOTOS  --  EDITA ESTO
   Pon el nombre de cada foto en "src" y su texto en "caption".
   Las fotos deben estar en una carpeta "fotos" junto a index.html
   Ejemplo:  {src:"fotos/1.jpg", caption:"Nuestra primera foto juntos"}
   ========================================================= */
const PHOTOS = [
  {src:"fotos/1.jpg", caption:"Aqu\u00ED va nuestra primera foto \u2661"},
  {src:"fotos/2.jpg", caption:"Ese d\u00EDa fue especial"},
  {src:"fotos/3.jpg", caption:"Contigo hasta en las tonter\u00EDas"},
  {src:"fotos/4.jpg", caption:"Mi lugar favorito eres t\u00FA"},
  {src:"fotos/5.jpg", caption:"Y los que nos faltan..."},
];

const carTrack = document.getElementById('carTrack');
const carDots = document.getElementById('carDots');
const carCaption = document.getElementById('carCaption');
let carIndex = 0;

// construir slides
PHOTOS.forEach((photo, i)=>{
  const slide = document.createElement('div');
  slide.className = 'car-slide';
  const img = new Image();
  img.src = photo.src;
  img.alt = photo.caption || '';
  // si la foto no carga (todavía no la subes), mostrar placeholder bonito
  img.onerror = ()=>{
    slide.classList.add('placeholder');
    slide.innerHTML = `<span class="ph-emoji">\u2661</span><span>Foto ${i+1}<br><small>(a\u00FAn no subida)</small></span>`;
  };
  slide.appendChild(img);
  slide.addEventListener('click',()=>{
    if(slide.classList.contains('placeholder')) return;
    openLightbox(photo.src);
  });
  carTrack.appendChild(slide);

  // punto indicador
  const dot = document.createElement('button');
  dot.className = 'car-dot' + (i===0?' active':'');
  dot.addEventListener('click',()=>goToSlide(i));
  carDots.appendChild(dot);
});

function goToSlide(i){
  carIndex = (i + PHOTOS.length) % PHOTOS.length;
  carTrack.style.transform = `translateX(-${carIndex*100}%)`;
  carDots.querySelectorAll('.car-dot').forEach((d,idx)=>d.classList.toggle('active', idx===carIndex));
  carCaption.textContent = PHOTOS[carIndex].caption || '';
}
document.getElementById('carNext').addEventListener('click',()=>goToSlide(carIndex+1));
document.getElementById('carPrev').addEventListener('click',()=>goToSlide(carIndex-1));
carCaption.textContent = PHOTOS[0].caption || '';

// deslizar con el dedo (swipe)
let touchX = null;
document.getElementById('carousel').addEventListener('touchstart',e=>{ touchX = e.touches[0].clientX; }, {passive:true});
document.getElementById('carousel').addEventListener('touchend',e=>{
  if(touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if(Math.abs(dx) > 40){ dx < 0 ? goToSlide(carIndex+1) : goToSlide(carIndex-1); }
  touchX = null;
});

// lightbox
const lightbox = document.getElementById('lightbox');
function openLightbox(src){
  document.getElementById('lightboxImg').src = src;
  lightbox.classList.add('show');
}
document.getElementById('lightboxClose').addEventListener('click',()=>lightbox.classList.remove('show'));
lightbox.addEventListener('click',e=>{ if(e.target === lightbox) lightbox.classList.remove('show'); });


/* =========================================================
   VAULT -- leer respuestas (SECRETO)
   Se abre tocando 7 veces la estrellita del fondo del menu
   ========================================================= */
let secretTaps = 0, secretTimer;
document.getElementById('secretHint').addEventListener('click',()=>{
  secretTaps++;
  clearTimeout(secretTimer);
  secretTimer = setTimeout(()=>secretTaps=0, 1500);
  if(secretTaps >= 7){
    secretTaps = 0;
    go('vault');
  } else if(secretTaps >= 4){
    toast('Sigue tocando... ('+secretTaps+'/7)');
  }
});

const SECTION_LABELS = {
  'Ruleta':'\u273A Ruleta',
  'Que prefieres':'\u2698 Que prefieres'
};
function renderVault(){
  const store = loadStore();
  const box = document.getElementById('vaultBox');
  const keys = Object.keys(store);
  if(keys.length === 0){
    box.innerHTML = '<p class="vault-empty">Todavia no hay respuestas guardadas. Cuando ella juegue, apareceran aqui.</p>';
    return;
  }
  let html = '';
  keys.forEach(section=>{
    html += `<div class="vault-group"><h4>${section}</h4>`;
    store[section].forEach(entry=>{
      const date = new Date(entry.t);
      const when = date.toLocaleDateString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      let answerHtml = '';
      if(entry.a && entry.a !== '(escrito)'){
        answerHtml += `<span class="picked-tag">Eligio:</span> ${entry.a}`;
      }
      if(entry.extra){
        answerHtml += (answerHtml ? '<br>' : '') + `&ldquo;${entry.extra}&rdquo;`;
      }
      html += `<div class="vault-qa"><p class="vault-q">${entry.q}</p><p class="vault-a">${answerHtml}</p><p class="vault-time">${when}</p></div>`;
    });
    html += `</div>`;
  });
  box.innerHTML = html;
}

/* generar texto plano para copiar / descargar */
function storeToText(){
  const store = loadStore();
  const name = localStorage.getItem('partnerName') || '';
  let out = 'NUESTRAS RESPUESTAS' + (name ? ' - '+name : '') + '\n';
  out += 'Generado: ' + new Date().toLocaleString('es-MX') + '\n';
  out += '========================================\n\n';
  Object.keys(store).forEach(section=>{
    out += '### ' + section + '\n';
    store[section].forEach(entry=>{
      out += '- ' + entry.q + '\n';
      if(entry.a && entry.a !== '(escrito)') out += '  Eligio: ' + entry.a + '\n';
      if(entry.extra) out += '  Escribio: "' + entry.extra + '"\n';
      out += '\n';
    });
    out += '\n';
  });
  return out;
}

document.getElementById('vaultCopy').addEventListener('click',()=>{
  const txt = storeToText();
  navigator.clipboard.writeText(txt).then(
    ()=>toast('Copiado al portapapeles \u2713'),
    ()=>{
      // fallback
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); toast('Copiado \u2713'); }catch(e){ toast('No se pudo copiar'); }
      document.body.removeChild(ta);
    }
  );
});
document.getElementById('vaultDownload').addEventListener('click',()=>{
  const txt = storeToText();
  const blob = new Blob([txt], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'nuestras-respuestas.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Descargando \u2713');
});
document.getElementById('vaultClear').addEventListener('click',()=>{
  if(confirm('Seguro que quieres borrar TODAS las respuestas guardadas? Esto no se puede deshacer.')){
    localStorage.removeItem(STORE_KEY);
    renderVault();
    toast('Borrado');
  }
});

/* =========================================================
   ESTRELLAS EN CANVAS
   ========================================================= */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

function initStars(){
  canvas.width = innerWidth; canvas.height = innerHeight;
  const count = Math.min(140, Math.floor(innerWidth*innerHeight/9000));
  stars = Array.from({length:count},()=>({
    x:Math.random()*canvas.width, y:Math.random()*canvas.height,
    r:Math.random()*1.4+0.3, a:Math.random(), sp:Math.random()*0.015+0.004
  }));
}
function drawStarsStatic(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill();});
}
function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    s.a += s.sp; const tw = 0.5+Math.abs(Math.sin(s.a))*0.5;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${tw*0.85})`; ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
initStars();
if(!reduce) drawStars(); else drawStarsStatic();
addEventListener('resize',()=>{ initStars(); if(reduce) drawStarsStatic(); });

/* =========================================================
   CORAZONES FLOTANTES
   ========================================================= */
const heartsBox = document.getElementById('hearts');
const HEART_CHARS = ['\u2661','\u2665','\u2764'];
function spawnHeart(){
  if(reduce) return;
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = HEART_CHARS[Math.floor(Math.random()*HEART_CHARS.length)];
  h.style.left = Math.random()*100 + 'vw';
  h.style.fontSize = (12 + Math.random()*16) + 'px';
  const dur = 8 + Math.random()*7;
  h.style.animationDuration = dur + 's';
  h.style.opacity = 0.4 + Math.random()*0.4;
  heartsBox.appendChild(h);
  setTimeout(()=>h.remove(), dur*1000);
}
if(!reduce) setInterval(spawnHeart, 2600);
