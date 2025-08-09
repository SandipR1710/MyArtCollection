// ---------- DATA ----------
// Favorite
const favorite = { src: "img7.jpeg", alt: "Favorite portrait" };

// Other drawings (7 left)
const images = [
  { src: "img1.jpeg", alt: "Portrait 1" },
  { src: "img2.jpeg", alt: "Portrait 2" },
  { src: "img3.jpeg", alt: "Portrait 3" },
  { src: "img4.jpeg", alt: "Portrait 4" },
  { src: "img5.jpeg", alt: "Portrait 5" },
  { src: "img6.jpeg", alt: "Portrait 6" },
  { src: "img8.jpeg", alt: "Portrait 7" },
];

// Audio sources (favorite first). Update these paths to your files.
const songs = [
  "Kahani_Suno_2.0.mp3",
  "I_Love_You.mp3",
  "audio/img2.mp3",
  "audio/img3.mp3",
  "audio/img4.mp3",
  "O_Radhe_Radhe.mp3",
  "audio/img6.mp3",
  "audio/img8.mp3",
];

// For the lightbox (favorite first)
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

// Lightbox refs (DECLARE ONCE)
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = lightbox.querySelector(".close-btn");
const prevBtn = lightbox.querySelector(".prev");
const nextBtn = lightbox.querySelector(".next");

// Keep references so only one plays at a time
const audioRefs = new Set();

let currentIndex = 0;

// ---------- RENDER ----------
function renderFeatured(){
  const node = tpl.content.firstElementChild.cloneNode(true);
  setupCard(node, 0); // index in allImages/songs
  featuredWrap.appendChild(node);
}

function renderGalleries(){
  // Split into 3 groups: 3, 2, 2
  const groups = [
    { el: g1, items: images.slice(0, 3), offset: 1 },
    { el: g2, items: images.slice(3, 5), offset: 1 + 3 },
    { el: g3, items: images.slice(5, 7), offset: 1 + 5 }
  ];

  groups.forEach(group => {
    group.items.forEach((_, j) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const idx = group.offset + j; // index into allImages/songs
      setupCard(node, idx);
      group.el.appendChild(node);
    });
  });
}

// Fill a cloned card with image & audio controls
function setupCard(node, idx){
  const img = node.querySelector(".card-img");
  const frame = node.querySelector(".frame");
  const controls = node.querySelector(".controls");
  const btn = node.querySelector(".play-btn");

  const { src, alt } = allImages[idx];
  img.src = src;
  img.alt = alt || "Artwork";

  if (supportsHover && !prefersReduced) addTilt(frame);

  // Create audio element for this card
  const audio = new Audio(songs[idx] || "");
  audio.preload = "none";
  audioRefs.add(audio);

  const setPlayingUI = (on) => {
    controls.classList.toggle("playing", on);
    btn.classList.toggle("playing", on);
    btn.setAttribute("aria-label", on ? "Pause" : "Play");
  };

  // —— Prevent lightbox when interacting with controls ——
  const stop = (e) => { e.stopPropagation(); };
  controls.addEventListener("pointerdown", stop);
  controls.addEventListener("click", stop);
  controls.addEventListener("touchstart", stop, { passive: true });

  btn.addEventListener("pointerdown", stop);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!audio.src) return;
    if (audio.paused) {
      // pause any other audio
      audioRefs.forEach(a => { if (a !== audio && !a.paused) a.pause(); });
      audio.play().catch(()=>{});
      setPlayingUI(true);
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });
  // Keyboard on the button: play/pause without opening lightbox
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      btn.click();
    }
  });

  // Reset UI when ended/paused
  audio.addEventListener("ended", () => setPlayingUI(false));
  audio.addEventListener("pause", () => setPlayingUI(false));
  audio.addEventListener("play", () => setPlayingUI(true));

  // Open lightbox (ignore clicks inside controls)
  node.addEventListener("click", (e) => {
    if (e.target.closest(".controls")) return;
    openLightbox(idx);
  });
  node.addEventListener("keydown", (e) => {
    if (e.target.closest(".controls")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(idx);
    }
  });
}

// ---------- INTERACTION ----------
function addTilt(el){
  const maxTilt = 6; // degrees
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

// Attach lightbox button listeners (only once)
closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

// ---------- INIT ----------
renderFeatured();
renderGalleries();
