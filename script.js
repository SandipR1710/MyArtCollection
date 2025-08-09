// Replace with your own image paths (4:5 if possible)
const images = [
    { src: "img1.jpeg", alt: "Portrait 1" },
    { src: "img2.jpeg", alt: "Portrait 1" },
    { src: "img3.jpeg", alt: "Portrait 1" },
    { src: "img4.jpeg", alt: "Portrait 1" },
    { src: "img5.jpeg", alt: "Portrait 1" },
    { src: "img6.jpeg", alt: "Portrait 1" },
    { src: "img7.jpeg", alt: "Portrait 1" },
    { src: "img8.jpeg", alt: "Portrait 1" },
  ];
  
  const galleryEl = document.getElementById("gallery");
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
  
  function renderGallery(){
    images.forEach((item, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const img = node.querySelector(".card-img");
      const frame = node.querySelector(".frame");
  
      img.src = item.src;
      img.alt = item.alt || `Artwork ${i+1}`;
  
      if (supportsHover && !prefersReduced) addTilt(frame);
  
      // Open lightbox on click / keyboard (on the whole card)
      node.addEventListener("click", () => openLightbox(i));
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(i);
        }
      });
  
      galleryEl.appendChild(node);
    });
  }
  
  function addTilt(el){
    const maxTilt = 6; // degrees
    const reset = () => {
      el.classList.remove("hovering");
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };
  
    el.addEventListener("pointerenter", () => {
      el.classList.add("hovering");
    });
  
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) - 0.5;
      const py = (y / rect.height) - 0.5;
  
      const rx = (-py * maxTilt).toFixed(2);
      const ry = ( px * maxTilt).toFixed(2);
  
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  
      // stronger shine reaction near edges
      const shineStrength = Math.min(1, Math.hypot(px, py) * 3);
      el.style.setProperty("--shine", shineStrength.toFixed(2));
    });
  
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointercancel", reset);
  }
  
  /* Lightbox */
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
    const { src, alt } = images[currentIndex];
    lightboxImg.src = src;
    lightboxImg.alt = alt || `Artwork ${currentIndex+1}`;
  }
  function next(){
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox();
  }
  function prev(){
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox();
  }
  
  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  renderGallery();
  