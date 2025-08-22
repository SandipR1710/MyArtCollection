// ---------- DATA (base gallery) ----------
const favorite = { src: "img7.jpeg", alt: "Favorite portrait" };
const images = [
  { src: "img1.jpeg", alt: "Portrait 1" },
  { src: "img2.jpeg", alt: "Portrait 2" },
  { src: "img3.jpeg", alt: "Portrait 3" },
  { src: "img4.jpeg", alt: "Portrait 4" },
  { src: "img5.jpeg", alt: "Portrait 5" },
  { src: "img6.jpeg", alt: "Portrait 6" },
  { src: "img8.jpeg", alt: "Portrait 7" },
];

// Update these paths to your 8 songs (favorite first)
const songs = [
  "Kahani_Suno_2.0.mp3",
  "I_Love_You.mp3",
  "Enna_Sona.mp3",
  "Kaun_Tujhe.mp3",
  "Humnava.mp3",
  "Maand.mp3",
  "Nazar_Na.mp3",
  "Tum_Hi_Ho.mp3",
];

// Lightbox list: start with base images
const allImages = [favorite, ...images];

// ---------- DUETS DATA (keep exactly as requested) ----------
const duetsData = [
  {
    flowerName: "Wild Rose",
    flowerSrc: "Wild_Rose.jpg",
    portraitSrc: "img.jpeg",
    song: "Tum_Ho_Toh.mp3",
    altFlower: "Close-up of a wild rose bloom",
    altPortrait: "Portrait inspired by a wild rose"
  },
  {
    flowerName: "Pink Rose",
    flowerSrc: "Pink_Rose.jpg",
    portraitSrc: "img12.jpeg",
    song: "Raat_Akeli_Thi.mp3",
    altFlower: "Pink rose petals",
    altPortrait: "Portrait inspired by a pink rose"
  },
  {
    flowerName: "Monkey Flower",
    flowerSrc: "Monkey_Flower.jpeg",
    portraitSrc: "img13.jpeg",
    song: "Dhun.mp3",
    altFlower: "Monkey flower with speckled petals",
    altPortrait: "Portrait inspired by the monkey flower"
  },
  {
    flowerName: "Jasmine",
    flowerSrc: "Jasmine.jpg",
    portraitSrc: "img9.jpeg",
    song: "Samjhawan.mp3",
    altFlower: "White jasmine blossoms",
    altPortrait: "Portrait inspired by jasmine"
  },
  {
    flowerName: "Lavender",
    flowerSrc: "Lavender.jpg",
    portraitSrc: "img10.jpeg",
    song: "Jab_Tak.mp3",
    altFlower: "Lavender spikes in bloom",
    altPortrait: "Portrait inspired by lavender"
  },
  {
    flowerName: "Sunflower",
    flowerSrc: "Sunflower.jpg",
    portraitSrc: "img11.jpeg",
    song: "Pehli_Nazar_Mein_Race.mp3",
    altFlower: "Sunflower facing the light",
    altPortrait: "Portrait inspired by a sunflower"
  }
];

// Unique quotes per last 4 base cards
const scrollQuotesByIndex = {
  4: ["You arrived like quiet rain.", "My storms learned to rest."],
  5: ["Moonlight learns your name.", "Softly, the night agrees."],
  6: ["When you breathe, rooms soften.", "Even clocks keep gentler time."],
  7: ["Every street hums lighter.", "You fold distance into nearness."]
};

// Footer messages (looped)
const artistMessages = [
  "These portraits carry a quiet piece of my peace, and I’ve tucked a song beside each one so that when you look there’s also something to hear—a small world I made for you; I hope it finds you gently, and know that I will always love you. — Sandip"
];

/* ===== FAVORITE FLIP NOTE (multi-line) ===== */
const favoriteNoteLines = [
  "Maine khoya hai har pyari chiz ko apne,",
  "Mai phirbi apni kismat ajmaunga,",
  "tujhe apni dulhan banaunga.",
  "— Sandip"
];

// ---------- ELEMENTS ----------
const featuredWrap = document.getElementById("featured");
const g1 = document.getElementById("gallery-1");
const g2 = document.getElementById("gallery-2");
const g3 = document.getElementById("gallery-3");
const duetsGrid = document.getElementById("duets-grid");
const tpl = document.getElementById("card-template");

const supportsHover = matchMedia("(hover: hover)").matches && matchMedia("(pointer: fine)").matches;
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lightbox refs
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = lightbox.querySelector(".close-btn");
const prevBtn = lightbox.querySelector(".prev");
const nextBtn = lightbox.querySelector(".next");

let currentIndex = 0;
const audioRefs = new Set();
let currentAudio = null;

// ===== Web Audio visualizer (global) =====
let audioCtx = null;
const analyserByAudio = new WeakMap();
let vizRAF = null;
let vizTarget = null;

function splitBands(total, bars){
  const size = Math.floor(total / bars);
  const res = [];
  let s = 0;
  for (let i = 0; i < bars; i++){
    const e = (i === bars - 1) ? total : s + size;
    res.push([s, e]);
    s = e;
  }
  return res;
}
function stopVisualizer(){
  if (vizRAF){ cancelAnimationFrame(vizRAF); vizRAF = null; }
  if (vizTarget){
    vizTarget.querySelectorAll('span').forEach(s => { s.style.height = '4px'; s.style.opacity = '.8'; });
    vizTarget = null;
  }
}
function useVisualizer(audio, vizEl, controls){
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx){ vizEl.classList.add('fallback'); return; }
  vizEl.classList.remove('fallback');

  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended'){ audioCtx.resume().catch(()=>{}); }

  if (!analyserByAudio.has(audio)){
    try{
      const src = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser); analyser.connect(audioCtx.destination);
      analyserByAudio.set(audio, { src, analyser });
    } catch { vizEl.classList.add('fallback'); return; }
  }

  const { analyser } = analyserByAudio.get(audio);
  const bars = Array.from(vizEl.querySelectorAll('span'));
  const data = new Uint8Array(analyser.frequencyBinCount);
  const bands = splitBands(data.length, bars.length);

  stopVisualizer();
  vizTarget = vizEl;

  (function tick(){
    analyser.getByteFrequencyData(data);
    for (let i = 0; i < bars.length; i++){
      const [s, e] = bands[i];
      let sum = 0, c = 0;
      for (let j = s; j < e; j++){ sum += data[j]; c++; }
      const avg = c ? sum / c : 0;
      const h = 4 + (avg / 255) * 18;
      bars[i].style.height = `${h.toFixed(1)}px`;
      bars[i].style.opacity = `${0.65 + (avg/255)*0.35}`;
    }
    vizRAF = requestAnimationFrame(tick);
  })();

  controls.classList.add('playing');
}

// ---------- RENDER: Base ----------
function renderFeatured(){
  const node = tpl.content.firstElementChild.cloneNode(true);
  setupCard(node, 0, null);
  node.classList.add('is-favorite'); // for CSS: show flip button
  featuredWrap.appendChild(node);
}
function renderGalleries(){
  const groups = [
    { el: g1, items: images.slice(0, 3), offset: 1, sides: [] },
    { el: g2, items: images.slice(3, 5), offset: 1 + 3, sides: ["left","right"] },
    { el: g3, items: images.slice(5, 7), offset: 1 + 5, sides: ["left","right"] }
  ];
  groups.forEach(group => {
    group.items.forEach((_, j) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const idx = group.offset + j;
      const side = group.sides[j] || null;
      setupCard(node, idx, side);
      group.el.appendChild(node);
    });
  });
}

// ---------- UTIL ----------
const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2,"0")}`;
};

// ---------- CARD SETUP (Base gallery cards) ----------
function setupCard(node, idx, side){
  const frame = node.querySelector(".frame");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");
  const range = node.querySelector(".seek-range");
  const elaps = node.querySelector(".elapsed");
  const dur = node.querySelector(".duration");
  const media = node.querySelector(".media");
  const viz = node.querySelector(".viz");
  const flipInner = node.querySelector(".flip-inner");
  const noteText = node.querySelector(".note-text");
  const flipBtn = node.querySelector(".flip-btn");
  const frontImg = node.querySelector(".flip-front .card-img");

  // set image
  const { src, alt } = allImages[idx];
  frontImg.src = src; frontImg.alt = alt || "Artwork";

  if (supportsHover && !prefersReduced) addTilt(frame);

  // Create audio element
  const audio = new Audio(songs[idx] || "");
  audio.preload = "metadata";
  audio.loop = true;
  audioRefs.add(audio);

  // Prevent lightbox on controls interaction
  const stop = (e) => e.stopPropagation();
  ["pointerdown","click"].forEach(ev => controls.addEventListener(ev, stop));
  controls.addEventListener("touchstart", stop, { passive: true });
  ["pointerdown","click"].forEach(ev => range.addEventListener(ev, stop));
  range.addEventListener("touchstart", stop, { passive: true });
  btn.addEventListener("pointerdown", stop);

  // Play/Pause UI
  const setUI = (on) => {
    controls.classList.toggle("playing", on);
    btn.classList.toggle("playing", on);
    btn.setAttribute("aria-label", on ? "Pause" : "Play");
  };

  btn.addEventListener("click", () => {
    if (!audio.src) return;
    if (audio.paused) {
      if (currentAudio && currentAudio !== audio){ currentAudio.pause(); }
      currentAudio = audio;
      audio.play().then(() => { setUI(true); useVisualizer(audio, viz, controls); }).catch(()=>{});
    } else {
      audio.pause(); setUI(false);
      if (currentAudio === audio) currentAudio = null;
    }
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); btn.click(); }
  });

  audio.addEventListener("loadedmetadata", () => {
    dur.textContent = fmt(audio.duration);
    range.max = audio.duration || 0;
  });
  audio.addEventListener("timeupdate", () => {
    elaps.textContent = fmt(audio.currentTime);
    if (!range.matches(":active")) {
      range.value = audio.currentTime || 0;
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      range.style.setProperty("--seek-pct", `${pct}%`);
    }
  });
  audio.addEventListener("progress", () => {
    try {
      const b = audio.buffered;
      if (b.length) {
        const pct = audio.duration ? (b.end(b.length - 1) / audio.duration) * 100 : 0;
        range.style.setProperty("--buffer-pct", `${pct}%`);
      }
    } catch {}
  });
  audio.addEventListener("pause", () => { setUI(false); if (currentAudio === audio) currentAudio = null; stopVisualizer(); });
  audio.addEventListener("play", () => setUI(true));

  // Seeking
  const updateSeekFill = () => {
    const pct = audio.duration ? (range.value / audio.duration) * 100 : 0;
    range.style.setProperty("--seek-pct", `${pct}%`);
  };
  range.addEventListener("input", () => {
    updateSeekFill();
    audio.currentTime = Number(range.value || 0);
    elaps.textContent = fmt(audio.currentTime);
  });
  range.addEventListener("change", () => { audio.currentTime = Number(range.value || 0); });

  // ---- SCROLL (last 4 cards only) ----
  if (side){
    node.classList.add("with-scroll");
    const scrollBtn = node.querySelector(".scroll-btn");
    scrollBtn.style.display = "grid";

    const quotes = scrollQuotesByIndex[idx];
    const panel = document.createElement("div");
    panel.className = "scroll-panel"; panel.dataset.side = side;
    panel.innerHTML = `<div class="scroll-body"><p class="quote">${quotes[0]}</p><p class="quote">${quotes[1]}</p></div>`;
    media.appendChild(panel);

    const togglePanel = () => {
      if (panel.classList.contains("open")){
        panel.classList.remove("open"); panel.classList.add("closing");
        setTimeout(() => panel.classList.remove("closing"), 420);
      } else { panel.classList.remove("closing"); panel.classList.add("open"); }
    };
    const stopScroll = (e) => e.stopPropagation();
    panel.addEventListener("pointerdown", stopScroll);
    panel.addEventListener("click", stopScroll);
    panel.addEventListener("touchstart", stopScroll, { passive: true });

    scrollBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePanel(); });
    scrollBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); e.stopPropagation(); togglePanel(); }
    });
  } else {
    const sb = node.querySelector(".scroll-btn"); if (sb) sb.style.display = "none";
  }

  // ---- FLIP (favorite only) ----
  if (idx === 0){
    const noteBox = node.querySelector('.note');
    noteBox.classList.add('note-poem');
    noteBox.style.overflow = 'visible';
    noteBox.style.maxHeight = 'none';

    const noteText = node.querySelector(".note-text");
    noteText.innerHTML = favoriteNoteLines
      .map(l => `<span class="poem-line">${l}</span>`)
      .join("");

    const onFlip = (e) => {
      e.stopPropagation();
      const inner = node.querySelector('.flip-inner');
      inner.classList.toggle('flipped');
      const flipBtn = node.querySelector('.flip-btn');
      flipBtn.setAttribute('aria-pressed', inner.classList.contains('flipped') ? 'true' : 'false');
    };
    const fbtn = node.querySelector(".flip-btn");
    fbtn.addEventListener('click', onFlip);
    fbtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    fbtn.addEventListener('keydown', (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); e.stopPropagation(); onFlip(e); }
    });
  } else {
    const fb = node.querySelector(".flip-btn");
    if (fb) fb.style.display = "none";
  }

  // Lightbox (ignore clicks on controls/scroll/flip)
  node.addEventListener("click", (e) => {
    if (e.target.closest(".controls") || e.target.closest(".scroll-panel") || e.target.closest(".flip-btn")) return;
    openLightbox(idx);
  });
  node.addEventListener("keydown", (e) => {
    if (e.target.closest(".controls") || e.target.closest(".scroll-panel") || e.target.closest(".flip-btn")) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(idx); }
  });

  if (supportsHover && !prefersReduced) addTilt(frame);
}

// ---------- INTERACTION ----------
function addTilt(el){
  const maxTilt = 6;
  const reset = () => {
    el.classList.remove("hovering");
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };
  el.addEventListener("pointerenter", () => el.classList.add("hovering"));
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const px = x / r.width - 0.5, py = y / r.height - 0.5;
    const rx = (-py * maxTilt).toFixed(2);
    const ry = ( px * maxTilt).toFixed(2);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  el.addEventListener("pointerleave", reset);
  el.addEventListener("pointercancel", reset);
}

// ---------- LIGHTBOX ----------
function openLightbox(index){
  currentIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("open"));
  document.addEventListener("keydown", onKey);
}
function closeLightbox(){
  lightbox.classList.remove("open");
  document.removeEventListener("keydown", onKey);
  setTimeout(() => { lightbox.hidden = true; }, 180);
}
function onKey(e){
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
}
function updateLightbox(){
  const { src, alt } = allImages[currentIndex];
  lightboxImg.src = src;
  lightboxImg.alt = alt || `Artwork ${currentIndex+1}`;
}
function next(){ currentIndex = (currentIndex + 1) % allImages.length; updateLightbox(); }
function prev(){ currentIndex = (currentIndex - 1 + allImages.length) % allImages.length; updateLightbox(); }

closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

/* ===== Footer looped typewriter ===== */
(function runTypewriterLoop(){
  const el = document.getElementById('artist-typed');
  if (!el) return;

  if (prefersReduced){ el.textContent = artistMessages[0]; return; }

  const texts = artistMessages.slice();
  let t = 0, i = 0, erasing = false;

  function delayFor(ch){
    if (ch === '.' || ch === '!' || ch === '?') return 280;
    if (ch === ',' || ch === ';') return 160;
    if (ch === ' ') return 55;
    return 26 + Math.random()*34;
  }

  function tick(){
    const text = texts[t];
    if (!erasing){
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length){ erasing = true; setTimeout(tick, 2000); return; }
      setTimeout(tick, delayFor(text[i-1]));
    } else {
      i--;
      el.textContent = text.slice(0, i);
      if (i <= 0){ erasing = false; t = (t+1) % texts.length; setTimeout(tick, 550); return; }
      setTimeout(tick, 14 + Math.random()*24);
    }
  }
  tick();
})();

/* ===== Reveal-on-scroll ===== */
function revealOnScroll(){
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {rootMargin: "0px 0px -10% 0px", threshold: 0.15});
  items.forEach(el => io.observe(el));
}

/* ===== Footer artist card alignment (extra polish) ===== */
(function fixFooterArtistCard(){
  const css = `
    .site-footer .artist-card .frame{
      --pad: 8px;
      padding: var(--pad) !important;
      overflow: hidden !important;
      border-radius: calc(var(--frame-radius) + 10px) !important;
    }
    .site-footer .artist-card .card-img{
      display: block !important;
      width: 100% !important;
      aspect-ratio: 4 / 5 !important;
      object-fit: cover !important;
      border-radius: calc((var(--frame-radius) + 10px) - var(--pad)) !important;
    }
    .site-footer .artist-card.card::before{
      inset: -8px !important;
      border-radius: calc(var(--frame-radius) + 18px) !important;
    }
  `;
  const tag = document.createElement('style');
  tag.appendChild(document.createTextNode(css));
  document.head.appendChild(tag);
})();

/* ===== Favorite poem styles (visual polish) ===== */
(function injectPoemStyles(){
  const css = `
    .is-favorite .flip-back{
      background:
        radial-gradient(120% 120% at 15% 5%, rgba(124,58,237,.18), transparent 58%),
        radial-gradient(110% 110% at 85% 95%, rgba(34,211,238,.14), transparent 60%),
        linear-gradient(180deg, rgba(14,20,31,.92), rgba(8,12,20,.94));
      border: 1px solid rgba(255,255,255,.06);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.03),
        0 18px 50px rgba(0,0,0,.45);
      backdrop-filter: blur(6px);
    }
    .note-poem{ overflow: hidden !important; text-align: center; padding: 8px 6px; }
    .note-poem::-webkit-scrollbar{ width:0; height:0; }
    .note-poem h3{
      margin: 2px 0 8px 0;
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
      font-weight: 800;
      font-style: italic;
      font-size: clamp(14px, 1.3vw, 18px);
      letter-spacing: .3px;
      color: #eaf2ff;
      opacity: .9;
      text-shadow: 0 1px 0 rgba(0,0,0,.28);
    }
    .note-poem .note-text{
      display:flex; flex-direction:column; align-items:center; gap:12px;
    }
    .note-poem .poem-line{
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
      font-style: italic;
      font-weight: 700;
      font-size: clamp(22px, 2.8vw, 34px);
      line-height: 1.35;
      letter-spacing: .25px;
      background: linear-gradient(90deg, #eaf2ff, #d7c8ff, #bfefff, #eaf2ff);
      background-size: 220% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent;
      text-shadow: 0 0 12px rgba(124,58,237,.18), 0 1px 0 rgba(0,0,0,.25);
      opacity: 0;
      transform: translateY(16px) scale(.965);
      filter: blur(6px);
    }
    .flip-inner.flipped .note-poem .poem-line{
      animation:
        poemLineIn .9s cubic-bezier(.2,.7,.2,1) forwards,
        gradientShift 14s linear infinite 1.2s;
    }
    .flip-inner.flipped .note-poem .poem-line:nth-child(1){ animation-delay: .06s, 1.2s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(2){ animation-delay: .22s, 1.2s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(3){ animation-delay: .40s, 1.2s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(4){ animation-delay: .62s, 1.2s; }

    @keyframes poemLineIn{
      0%   { opacity:0; transform: translateY(16px) scale(.965); filter: blur(6px); letter-spacing:.6px; }
      60%  { opacity:1; transform: translateY(0)    scale(1);     filter: blur(0);   letter-spacing:.2px; }
      100% { opacity:1; transform: translateY(0)    scale(1);     filter: blur(0);   letter-spacing:.2px; }
    }
    @keyframes gradientShift{ 0%{ background-position: 0% 0 } 100%{ background-position: 220% 0 } }
  `;
  const tag = document.createElement('style');
  tag.appendChild(document.createTextNode(css));
  document.head.appendChild(tag);
})();

// ---------- DUETS: helpers ----------
function makeArrowSVG(reverse=false){
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 100 100");
  svg.classList.add("arrow-svg");
  const defs = document.createElementNS(svg.namespaceURI, "defs");
  const grad = document.createElementNS(svg.namespaceURI, "linearGradient");
  grad.setAttribute("id","duetGrad"+Math.random().toString(36).slice(2));
  grad.setAttribute("x1","0%"); grad.setAttribute("x2","100%");
  grad.setAttribute("y1","0%"); grad.setAttribute("y2","100%");
  const s1 = document.createElementNS(svg.namespaceURI,"stop"); s1.setAttribute("offset","0%");  s1.setAttribute("stop-color","#7dd3fc");
  const s2 = document.createElementNS(svg.namespaceURI,"stop"); s2.setAttribute("offset","100%"); s2.setAttribute("stop-color","#10b981");
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const path = document.createElementNS(svg.namespaceURI, "path");
  const d = reverse ? "M90 10 L10 90" : "M10 10 L90 90";
  path.setAttribute("d", d);
  path.setAttribute("fill","none");
  path.setAttribute("stroke", `url(#${grad.id})`);
  path.setAttribute("stroke-width","1.4");
  path.setAttribute("class","arrow-line");
  svg.appendChild(path);

  const head = document.createElementNS(svg.namespaceURI, "path");
  head.setAttribute("d", reverse ? "M12 90 L10 90 L10 88" : "M88 90 L90 90 L90 88");
  head.setAttribute("stroke", `url(#${grad.id})`);
  head.setAttribute("stroke-width","1.4");
  head.setAttribute("fill","none");
  svg.appendChild(head);

  return svg;
}

function makeDuetCard({ imgSrc, alt, isFlower=false, flowerName="", song=null }){
  const node = tpl.content.firstElementChild.cloneNode(true);
  const frame = node.querySelector(".frame");
  const frontImg = node.querySelector(".flip-front .card-img");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");
  const range = node.querySelector(".seek-range");
  const elaps = node.querySelector(".elapsed");
  const dur = node.querySelector(".duration");
  const viz = node.querySelector(".viz");

  // Hide flip & quotes on duets
  const flipBtn = node.querySelector(".flip-btn");
  const scrollBtn = node.querySelector(".scroll-btn");
  if (flipBtn) flipBtn.style.display = "none";
  if (scrollBtn) scrollBtn.style.display = "none";

  // image
  frontImg.src = imgSrc;
  frontImg.alt = alt || "Artwork";

  // add to global lightbox list
  const lbIndex = allImages.push({ src: imgSrc, alt }) - 1;

  if (supportsHover && !prefersReduced) addTilt(frame);

  if (isFlower){
    node.classList.add("no-controls");
    const cap = document.createElement("div");
    cap.className = "flower-caption";
    cap.textContent = flowerName || "";
    frame.appendChild(cap);
  } else {
    // portrait with audio
    const audio = new Audio(song || "");
    audio.preload = "metadata";
    audio.loop = true;
    audioRefs.add(audio);

    const stop = (e) => e.stopPropagation();
    ["pointerdown","click"].forEach(ev => controls.addEventListener(ev, stop));
    controls.addEventListener("touchstart", stop, { passive: true });
    ["pointerdown","click"].forEach(ev => range.addEventListener(ev, stop));
    range.addEventListener("touchstart", stop, { passive: true });
    btn.addEventListener("pointerdown", stop);

    const setUI = (on) => {
      controls.classList.toggle("playing", on);
      btn.classList.toggle("playing", on);
      btn.setAttribute("aria-label", on ? "Pause" : "Play");
    };

    btn.addEventListener("click", () => {
      if (!audio.src) return;
      if (audio.paused) {
        if (currentAudio && currentAudio !== audio){ currentAudio.pause(); }
        currentAudio = audio;
        audio.play().then(() => { setUI(true); useVisualizer(audio, viz, controls); }).catch(()=>{});
      } else {
        audio.pause(); setUI(false);
        if (currentAudio === audio) currentAudio = null;
      }
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); btn.click(); }
    });

    audio.addEventListener("loadedmetadata", () => {
      dur.textContent = fmt(audio.duration);
      range.max = audio.duration || 0;
    });
    audio.addEventListener("timeupdate", () => {
      elaps.textContent = fmt(audio.currentTime);
      if (!range.matches(":active")) {
        range.value = audio.currentTime || 0;
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        range.style.setProperty("--seek-pct", `${pct}%`);
      }
    });
    audio.addEventListener("progress", () => {
      try {
        const b = audio.buffered;
        if (b.length) {
          const pct = audio.duration ? (b.end(b.length - 1) / audio.duration) * 100 : 0;
          range.style.setProperty("--buffer-pct", `${pct}%`);
        }
      } catch {}
    });
    audio.addEventListener("pause", () => { setUI(false); if (currentAudio === audio) currentAudio = null; stopVisualizer(); });
    audio.addEventListener("play", () => setUI(true));

    range.addEventListener("input", () => {
      const pct = audio.duration ? (range.value / audio.duration) * 100 : 0;
      range.style.setProperty("--seek-pct", `${pct}%`);
      audio.currentTime = Number(range.value || 0);
      elaps.textContent = fmt(audio.currentTime);
    });
    range.addEventListener("change", () => { audio.currentTime = Number(range.value || 0); });
  }

  // Lightbox handler (don’t trigger from controls)
  node.addEventListener("click", (e) => {
    if (e.target.closest(".controls")) return;
    openLightbox(lbIndex);
  });
  node.addEventListener("keydown", (e) => {
    if (e.target.closest(".controls")) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(lbIndex); }
  });

  return node;
}

function renderDuets(){
  if (!duetsGrid) return;
  duetsData.forEach((pair, i) => {
    const row = document.createElement("div");
    row.className = "duet-row reveal";
    row.setAttribute("aria-label", `${pair.flowerName} flower to ${pair.flowerName} portrait`);

    const arrowWrap = document.createElement("div");
    arrowWrap.className = "duet-arrow";
    const reverse = (i % 2 === 1); // odd rows: portrait ← flower
    arrowWrap.appendChild(makeArrowSVG(reverse));

    const flowerCard = makeDuetCard({
      imgSrc: pair.flowerSrc,
      alt: pair.altFlower || `${pair.flowerName} photo`,
      isFlower: true,
      flowerName: pair.flowerName
    });

    const portraitCard = makeDuetCard({
      imgSrc: pair.portraitSrc,
      alt: pair.altPortrait || `${pair.flowerName} portrait`,
      isFlower: false,
      song: pair.song
    });

    if (!reverse){
      row.appendChild(flowerCard);
      row.appendChild(arrowWrap);
      row.appendChild(portraitCard);
    } else {
      row.appendChild(portraitCard);
      row.appendChild(arrowWrap);
      row.appendChild(flowerCard);
    }

    duetsGrid.appendChild(row);
  });
}

// ---------- INIT ----------
renderFeatured();
renderGalleries();
renderDuets();
revealOnScroll();

/* ===== Birthday Intro Overlay Logic ===== */
(function birthdayIntro(){
  const overlay = document.getElementById('birthday-overlay');
  const btn = document.getElementById('open-surprise');
  const confettiWrap = document.getElementById('confetti');
  if (!overlay || !btn) return;

  // Show overlay on first load
  document.body.classList.add('intro-open');
  overlay.removeAttribute('aria-hidden');

  function burstConfetti(n = 140){
    const colors = ['#7dd3fc','#38bdf8','#10b981','#f472b6','#c4b5fd','#facc15','#fb923c'];
    for (let i = 0; i < n; i++){
      const p = document.createElement('i');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', `${(Math.random()*2-1)*260}px`);
      p.style.setProperty('--dy', `${- (Math.random()*220 + 120)}px`);
      p.style.setProperty('--rot', `${Math.random()*720-360}deg`);
      confettiWrap.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }

  function openSurprise(){
    burstConfetti();
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.remove('intro-open');
      overlay.setAttribute('aria-hidden','true');
    }, 600);
  }

  btn.addEventListener('click', openSurprise);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSurprise(); }
  });
})();
