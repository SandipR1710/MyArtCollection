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

// Default quote pools (fallback if per-card not provided)
const scrollQuotes = {
  left:  ["In your eyes, calm seas.", "In your smile, I find home."],
  right: ["Bloom softly, always.", "You are my quiet star."]
};

// ✅ Unique quotes per card index (last 4 cards are idx 4..7)
const scrollQuotesByIndex = {
  4: ["You arrived like quiet rain.", "My storms learned to rest."],        // Section B, LEFT
  5: ["Moonlight learns your name.", "Softly, the night agrees."],          // Section B, RIGHT
  6: ["When you breathe, rooms soften.", "Even clocks keep gentler time."], // Section C, LEFT
  7: ["Every street hums lighter.", "You fold distance into nearness."]     // Section C, RIGHT
};

// Footer message
const artistMessage =
  "These portraits carry a quiet piece of my peace, and I’ve tucked a song beside each one so that when you look there’s also something to hear—a small world I made for you; I hope it finds you gently, and know that I will always love you. — Sandip";

// ---------- ELEMENTS ----------
const featuredWrap = document.getElementById("featured");
const g1 = document.getElementById("gallery-1");
const g2 = document.getElementById("gallery-2");
const g3 = document.getElementById("gallery-3");
const tpl = document.getElementById("card-template");

// Feature flags
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
let currentAudio = null; // ensure only one plays

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
  if (!Ctx){
    vizEl.classList.add('fallback');
    return;
  }
  vizEl.classList.remove('fallback');

  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended'){
    audioCtx.resume().catch(()=>{});
  }

  if (!analyserByAudio.has(audio)){
    try{
      const src = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // smooth bars
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserByAudio.set(audio, { src, analyser });
    } catch {
      vizEl.classList.add('fallback');
      return;
    }
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
      const h = 4 + (avg / 255) * 18;  // 4..22px
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
      const side = group.sides[j] || null; // last 4 cards get side (for panel direction)
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
  const img = node.querySelector(".card-img");
  const frame = node.querySelector(".frame");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");
  const range = node.querySelector(".seek-range");
  const elaps = node.querySelector(".elapsed");
  const dur = node.querySelector(".duration");
  const media = node.querySelector(".media");
  const viz = node.querySelector(".viz");

  const { src, alt } = allImages[idx];
  img.src = src;
  img.alt = alt || "Artwork";

  if (supportsHover && !prefersReduced) addTilt(frame);

  // Create audio element
  const audio = new Audio(songs[idx] || "");
  audio.preload = "metadata";
  audio.loop = true; // loop track by default
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

  // Toggle play/pause
  btn.addEventListener("click", () => {
    if (!audio.src) return;
    if (audio.paused) {
      if (currentAudio && currentAudio !== audio){
        currentAudio.pause(); // its pause handler will stop viz
      }
      currentAudio = audio;

      audio.play().then(() => {
        setUI(true);
        useVisualizer(audio, viz, controls);
      }).catch(()=>{});
    } else {
      audio.pause();
      setUI(false);
      if (currentAudio === audio) currentAudio = null;
    }
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); btn.click(); }
  });

  // Duration & time
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
  audio.addEventListener("play", () => { setUI(true); });
  audio.addEventListener("pause", () => {
    setUI(false);
    if (currentAudio === audio) currentAudio = null;
    stopVisualizer();
  });

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

    // Use per-card quotes first; otherwise fall back by side
    const quotes = scrollQuotesByIndex[idx] || (side === "left" ? scrollQuotes.left : scrollQuotes.right);

    const panel = document.createElement("div");
    panel.className = "scroll-panel";
    panel.dataset.side = side;
    panel.innerHTML = `
      <div class="scroll-body">
        <p class="quote">${quotes[0]}</p>
        <p class="quote">${quotes[1]}</p>
      </div>
    `;
    media.appendChild(panel);

    // Button controls opening/closing; multiple panels allowed; NOT opened on load
    const togglePanel = () => {
      if (panel.classList.contains("open")){
        panel.classList.remove("open");
        panel.classList.add("closing");
        setTimeout(() => panel.classList.remove("closing"), 420);
      } else {
        panel.classList.remove("closing");
        panel.classList.add("open");
      }
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
    const sb = node.querySelector(".scroll-btn");
    if (sb) sb.style.display = "none";
  }

  // Lightbox (ignore clicks on controls/scroll)
  node.addEventListener("click", (e) => {
    if (e.target.closest(".controls") || e.target.closest(".scroll-panel")) return;
    openLightbox(idx);
  });
  node.addEventListener("keydown", (e) => {
    if (e.target.closest(".controls") || e.target.closest(".scroll-panel")) return;
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

/* ===== Footer typewriter ===== */
(function runTypewriter(){
  const el = document.getElementById('artist-typed');
  if (!el) return;

  if (prefersReduced){
    el.textContent = artistMessage;
    return;
  }

  const text = artistMessage;
  let i = 0;

  function nextDelay(ch){
    if (ch === '.' || ch === '!' || ch === '?') return 220;
    if (ch === ',' || ch === ';') return 140;
    if (ch === ' ') return 50;
    return 26 + Math.random()*36; // natural jitter
  }

  function tick(){
    if (i <= text.length){
      el.textContent = text.slice(0, i);
      const ch = text[i-1] || '';
      setTimeout(() => requestAnimationFrame(tick), nextDelay(ch));
      i++;
    }
  }
  tick();
})();
