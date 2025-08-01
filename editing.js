const stripCanvas = document.getElementById("stripCanvas");
const ctx = stripCanvas.getContext("2d");
const frameOptions = document.querySelectorAll(".frame-preview");

let photos = [];
let dragTarget = null;
let dragStartX = 0;
let dragStartY = 0;
let initialX = [];
let initialY = [];
let selectedFrame = null;
let currentFilter = "none";
let frameImage = null;
let lastTouchDistance = null;
let needsRedraw = false;

const canvasWidth = 719;
const canvasHeight = 1732;
const photoHeight = 577.33;
const photoSpacing = 0;
const photoWidth = canvasWidth;

const devicePixelRatio = window.devicePixelRatio || 1;
stripCanvas.width = canvasWidth * devicePixelRatio;
stripCanvas.height = canvasHeight * devicePixelRatio;
stripCanvas.style.width = canvasWidth + "px";
stripCanvas.style.height = canvasHeight + "px";
ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

// Agar mobile tidak nge-lag karena scroll zoom browser
stripCanvas.style.touchAction = "none";

const savedPhotos = JSON.parse(sessionStorage.getItem("photostrip") || "[]");
console.log("Loaded from sessionStorage:", savedPhotos);
console.log("Jumlah foto ditemukan:", savedPhotos.length);

const loadedCount = Math.min(savedPhotos.length, 3);

savedPhotos.slice(0, loadedCount).forEach((dataUrl, index) => {
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    console.log("Gambar", index + 1, "berhasil dimuat. Dimensi:", img.width, "x", img.height);
    photos.push({
      img,
      x: 0,
      y: index * (photoHeight + photoSpacing) + photoSpacing,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    });
    if (photos.length === loadedCount) {
      drawStrip();
      generateFilterPreviews();
    }
  };
  img.onerror = () => {
    console.warn("Gambar", index + 1, "gagal dimuat.");
  };
});

function cropToFit(img, targetWidth, targetHeight) {
  const imgAspect = img.width / img.height;
  const targetAspect = targetWidth / targetHeight;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgAspect > targetAspect) {
    sw = img.height * targetAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetAspect;
    sy = (img.height - sh) / 2;
  }
  return { sx, sy, sw, sh };
}

function scheduleDraw() {
  if (!needsRedraw) {
    needsRedraw = true;
    requestAnimationFrame(() => {
      drawStrip();
      needsRedraw = false;
    });
  }
}

function drawStrip() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  photos.forEach(photo => {
    ctx.filter = currentFilter;
    const crop = cropToFit(photo.img, photoWidth, photoHeight);

    ctx.drawImage(
      photo.img,
      crop.sx + photo.offsetX,
      crop.sy + photo.offsetY,
      crop.sw / photo.scale,
      crop.sh / photo.scale,
      photo.x,
      photo.y,
      photoWidth,
      photoHeight
    );
  });

  ctx.filter = "none";
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, canvasWidth, canvasHeight);
  }
}

// Drag: Desktop
stripCanvas.addEventListener("mousedown", e => {
  const rect = stripCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    if (mx >= p.x && mx <= p.x + photoWidth && my >= p.y && my <= p.y + photoHeight) {
      dragTarget = i;
      dragStartX = mx;
      dragStartY = my;
      initialX[i] = p.offsetX;
      initialY[i] = p.offsetY;
      break;
    }
  }
});

stripCanvas.addEventListener("mousemove", e => {
  if (dragTarget === null) return;
  const rect = stripCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const p = photos[dragTarget];
  p.offsetX = initialX[dragTarget] + (mx - dragStartX);
  p.offsetY = initialY[dragTarget] + (my - dragStartY);

  scheduleDraw();
});

stripCanvas.addEventListener("mouseup", () => dragTarget = null);

// Drag: Mobile
stripCanvas.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    const rect = stripCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      if (mx >= p.x && mx <= p.x + photoWidth && my >= p.y && my <= p.y + photoHeight) {
        dragTarget = i;
        dragStartX = mx;
        dragStartY = my;
        initialX[i] = p.offsetX;
        initialY[i] = p.offsetY;
        break;
      }
    }
  }
}, { passive: false });

stripCanvas.addEventListener("touchmove", e => {
  if (e.touches.length === 1 && dragTarget !== null) {
    const rect = stripCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    const p = photos[dragTarget];
    p.offsetX = initialX[dragTarget] + (mx - dragStartX);
    p.offsetY = initialY[dragTarget] + (my - dragStartY);

    scheduleDraw();
  }

  // Pinch zoom per foto
  if (e.touches.length === 2) {
    e.preventDefault();
    const currentDistance = getTouchDistance(e.touches);
    if (lastTouchDistance) {
      const delta = currentDistance - lastTouchDistance;
      const zoomFactor = delta > 0 ? 1.03 : 0.97;

      const rect = stripCanvas.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        if (
          midX >= p.x && midX <= p.x + photoWidth &&
          midY >= p.y && midY <= p.y + photoHeight
        ) {
          p.scale = Math.min(3, Math.max(0.5, p.scale * zoomFactor));
          break;
        }
      }

      scheduleDraw();
    }
    lastTouchDistance = currentDistance;
  }
}, { passive: false });

stripCanvas.addEventListener("touchend", e => {
  if (e.touches.length < 2) {
    lastTouchDistance = null;
  }
  dragTarget = null;
});

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Zoom: Desktop scroll
stripCanvas.addEventListener("wheel", e => {
  e.preventDefault();
  const rect = stripCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    if (mx >= p.x && mx <= p.x + photoWidth && my >= p.y && my <= p.y + photoHeight) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      p.scale = Math.min(3, Math.max(0.5, p.scale * delta));
      break;
    }
  }

  scheduleDraw();
}, { passive: false });

// Frame
frameOptions.forEach(option => {
  option.addEventListener("click", () => {
    frameOptions.forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");

    selectedFrame = option.getAttribute("data-frame");
    frameImage = new Image();
    frameImage.src = selectedFrame;
    frameImage.onload = () => drawStrip();
  });
});

function saveArchive() {
    console.log("Fungsi saveArchive dipanggil!");
    const canvas = document.getElementById('stripCanvas');
    const dataURL = canvas.toDataURL('image/png'); // Konversi canvas jadi base64 PNG

    fetch('save_archive.php', {
        method: 'POST',
        body: JSON.stringify({ image: dataURL }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === 'success') {
            window.location.href = 'arsip.html'; // Arahkan ke galeri
        } else {
            alert('Gagal menyimpan gambar: ' + response.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("saveBtn");
    if (btn) {
        btn.addEventListener("click", saveArchive);
    }
});

// Download
function downloadImage() {
  const link = document.createElement("a");
  link.download = "tmc_photobooth.png";
  link.href = stripCanvas.toDataURL("image/png");
  link.click();
}

// Filter preview
function generateFilterPreviews() {
  const container = document.getElementById("filterPreviewContainer");
  if (!container) return;
  container.innerHTML = "";

  const filters = [
    { name: "Normal", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sephia", value: "sepia(80%)" },
    { name: "Contrast", value: "contrast(150%)" },
    { name: "Bright", value: "brightness(120%)" }
  ];

  const img = photos[0]?.img;
  if (!img) return;

  filters.forEach(filter => {
    const thumb = document.createElement("canvas");
    thumb.width = 120;
    thumb.height = 90;
    const tctx = thumb.getContext("2d");

    tctx.filter = filter.value;
    tctx.drawImage(img, 0, 0, 120, 90);
    thumb.classList.add("filter-thumb");
    thumb.title = filter.name;

    thumb.addEventListener("click", () => {
      currentFilter = filter.value;
      document.querySelectorAll(".filter-thumb").forEach(el => el.classList.remove("selected"));
      thumb.classList.add("selected");
      drawStrip();
    });

    container.appendChild(thumb);
  });
}
