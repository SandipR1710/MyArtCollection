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
  "Nazar_Na.mp3",
  "O_Radhe_Radhe.mp3",
  "Humnava.mp3",
  "Tum_Hi_Ho.mp3",
];

const allImages = [favorite, ...images];

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
const audioRefs = new Set(); // keep references if needed
let currentAudio = null;     // <-- track the one that's playing

// ---------- RENDER ----------
function renderFeatured(){
  const node = tpl.content.firstElementChild.cloneNode(true);
  setupCard(node, 0);
  featuredWrap.appendChild(node);
}
function renderGalleries(){
  const groups = [
    { el: g1, items: images.slice(0, 3), offset: 1 },
    { el: g2, items: images.slice(3, 5), offset: 1 + 3 },
    { el: g3, items: images.slice(5, 7), offset: 1 + 5 }
  ];
  groups.forEach(group => {
    group.items.forEach((_, j) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const idx = group.offset + j;
      setupCard(node, idx);
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
function setupCard(node, idx){
  const img = node.querySelector(".card-img");
  const frame = node.querySelector(".frame");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");
  const range = node.querySelector(".seek-range");
  const elaps = node.querySelector(".elapsed");
  const dur = node.querySelector(".duration");

  const { src, alt } = allImages[idx];
  img.src = src;
  img.alt = alt || "Artwork";

  if (supportsHover && !prefersReduced) addTilt(frame);

  // Create audio element
  const audio = new Audio(songs[idx] || "");
  audio.preload = "metadata"; // so duration is available
  audio.loop = true;          // <-- loop this track
  audioRefs.add(audio);

  // Prevent lightbox on controls interaction
  const stop = (e) => e.stopPropagation();
  ["pointerdown", "click", "touchstart"].forEach(ev =>
    controls.addEventListener(ev, stop, { passive: ev === "touchstart" })
  );
  ["pointerdown", "click", "touchstart"].forEach(ev => {
    range.addEventListener(ev, stop, { passive: ev === "touchstart" });
    btn.addEventListener(ev, stop, { passive: ev === "touchstart" });
  });

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
      // pause any other currently playing audio
      if (currentAudio && currentAudio !== audio) currentAudio.pause();

      currentAudio = audio;
      audio.play().then(() => setUI(true)).catch(() => {});
    } else {
      audio.pause();
      setUI(false);
      if (currentAudio === audio) currentAudio = null;
    }
  });

  // Keyboard on the button
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

  // update buffered amount (for the faint track behind)
  audio.addEventListener("progress", () => {
    try {
      const b = audio.buffered;
      if (b.length) {
        const pct = audio.duration ? (b.end(b.length - 1) / audio.duration) * 100 : 0;
        range.style.setProperty("--buffer-pct", `${pct}%`);
      }
    } catch {}
  });

  // Keep UI in sync with actual audio state
  audio.addEventListener("play", () => {
    currentAudio = audio;
    setUI(true);
  });
  audio.addEventListener("pause", () => {
    setUI(false);
    if (currentAudio === audio) currentAudio = null;
  });
  // loop is handled by audio.loop=true; no "ended" stop

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
  range.addEventListener("change", () => {
    audio.currentTime = Number(range.value || 0);
  });

  // Lightbox (only when not clicking controls)
  node.addEventListener("click", (e) => {
    if (e.target.closest(".controls")) return;
    openLightbox(idx);
  });
  node.addEventListener("keydown", (e) => {
    if (e.target.closest(".controls")) return;
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
    const shineStrength = Math.min(1, Math.hypot(px, py) * 3);
    el.style.setProperty("--shine", shineStrength.toFixed(2));
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
