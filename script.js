// ---------- DATA ----------
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
  "O_Radhe_Radhe.mp3",
  "Nazar_Na.mp3",
  "Tum_Hi_Ho.mp3",
];

const allImages = [favorite, ...images];

// Unique quotes per last 4 cards
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

// ---------- RENDER ----------
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

// ---------- CARD SETUP ----------
function setupCard(node, idx, side){
  const frame = node.querySelector(".frame");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");
  const range = node.querySelector(".seek-range");
  const elaps = node.querySelector(".elapsed");
  const dur = node.querySelector(".duration");
  const media = node.querySelector(".media");
  const viz = node.querySelector(".viz");

  // Flip parts
  const flipInner = node.querySelector(".flip-inner");
  const noteText = node.querySelector(".note-text");
  const flipBtn = node.querySelector(".flip-btn");
  const frontImg = node.querySelector(".flip-front .card-img");
  const noteBox = node.querySelector(".note");

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
    // turn the note into multi-line poem with smooth animation
    noteBox.classList.add('note-poem');
    // remove any scrollbars in the favorite note
    noteBox.style.overflow = 'visible';
    noteBox.style.maxHeight = 'none';

    noteText.innerHTML = favoriteNoteLines
      .map(l => `<span class="poem-line">${l}</span>`)
      .join("");

    const onFlip = (e) => { e.stopPropagation(); flipInner.classList.toggle('flipped'); };
    flipBtn.addEventListener('click', onFlip);
    flipBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    flipBtn.addEventListener('keydown', (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); e.stopPropagation(); onFlip(e); }
    });
  } else {
    flipBtn.style.display = "none";
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

// ---------- INIT ----------
renderFeatured();
renderGalleries();

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

/* ===== Scroll-reveal ===== */
(function revealOnScroll(){
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {rootMargin: "0px 0px -10% 0px", threshold: 0.15});
  items.forEach(el => io.observe(el));
})();

/* ===== Footer artist card alignment (JS-only precise corner match) ===== */
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

/* ===== Favorite poem styles (injected, no scrollbars, visible animation) ===== */
(function injectPoemStyles(){
  const css = `
    /* remove any scrollbar from favorite note */
    .note-poem{ overflow: hidden !important; }
    .note-poem::-webkit-scrollbar{ width:0; height:0; }

    .note-poem { text-align:center; }
    .note-poem .note-text{
      display:flex; flex-direction:column; align-items:center; gap:10px;
    }

    /* soothing serif + gradient flow */
    .note-poem .poem-line{
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
      font-style: italic;
      font-weight: 700;
      font-size: clamp(20px, 2.6vw, 30px);
      line-height: 1.35;
      letter-spacing: .2px;
      background: linear-gradient(90deg, #e8f0ff, #d7c8ff, #bfefff, #e8f0ff);
      background-size: 200% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent;
      text-shadow: 0 1px 0 rgba(0,0,0,.25);
      opacity: 0;
      transform: translateY(10px) scale(.98);
      filter: blur(4px);
    }

    /* appear + gentle shimmer */
    .flip-inner.flipped .note-poem .poem-line{
      animation:
        poemLineIn .7s cubic-bezier(.2,.7,.2,1) forwards,
        gradientShift 16s linear infinite 1s;
    }
    .flip-inner.flipped .note-poem .poem-line:nth-child(1){ animation-delay: .05s, 1s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(2){ animation-delay: .18s, 1s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(3){ animation-delay: .32s, 1s; }
    .flip-inner.flipped .note-poem .poem-line:nth-child(4){ animation-delay: .50s, 1s; }

    /* decorative quotes */
    .note-poem::before, .note-poem::after{
      content: "“";
      position: absolute;
      color: rgba(255,255,255,.12);
      font-size: clamp(48px, 6vw, 72px);
      line-height: 1;
      pointer-events: none;
      filter: drop-shadow(0 2px 0 rgba(0,0,0,.25));
    }
    .note-poem::before{ left: 6px; top: 2px; }
    .note-poem::after{ content:"”"; right: 6px; bottom: 2px; }

    @keyframes poemLineIn{
      from{ opacity:0; transform: translateY(10px) scale(.98); filter: blur(4px); }
      to  { opacity:1; transform: translateY(0)    scale(1);   filter: blur(0);  }
    }
    @keyframes gradientShift{ 0%{ background-position: 0% 0 } 100%{ background-position: 200% 0 } }
  `;
  const tag = document.createElement('style');
  tag.appendChild(document.createTextNode(css));
  document.head.appendChild(tag);
})();
