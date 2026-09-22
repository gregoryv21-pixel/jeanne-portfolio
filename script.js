document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const firstName = data.get("name").trim().split(" ")[0];

  status.textContent = `Merci ${firstName} ! Votre message est prêt à partir.`;
  form.reset();
});

const heroDino = document.querySelector(".hero-dino");
const dinoImage = heroDino?.querySelector("img");
const dinoNote = heroDino?.querySelector(".dino-note");
const dinoDebris = document.querySelector(".dino-debris");
const dinoPaint = document.getElementById("dino-paint");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let dinoProgress = reducedMotion ? 1 : 0;
let dinoUnlocked = reducedMotion;
let touchStartY = 0;
let paintContext;
let lastEraserPoint;

function renderDino(progress) {
  if (!heroDino || !dinoImage || !dinoNote) return;

  const shift = Math.round((1 - progress) * 260);
  const noteShift = Math.round((1 - progress) * 140);

  dinoImage.style.transform = `translateX(${shift}px) rotate(${14 - progress * 12}deg)`;
  dinoImage.style.clipPath = `inset(0 0 0 ${Math.round((1 - progress) * 100)}%)`;
  dinoImage.style.opacity = progress > 0 ? "1" : "0";
  dinoNote.style.transform = `translateX(${noteShift}px) rotate(${-10 + progress * 10}deg)`;
  dinoNote.style.opacity = String(Math.max(0, (progress - 0.48) * 1.92));
}

function unlockPage() {
  dinoUnlocked = true;
  document.documentElement.classList.remove("dino-locked");
  document.body.classList.remove("dino-locked");
}

function advanceDino(amount) {
  if (dinoUnlocked) return;

  dinoProgress = Math.min(1, Math.max(0, dinoProgress + amount));
  renderDino(dinoProgress);

  if (dinoProgress === 1) unlockPage();
}

function playExplosionSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audio = new AudioContext();
  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.55, now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

  const compressor = audio.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, now);
  compressor.knee.setValueAtTime(18, now);
  compressor.ratio.setValueAtTime(10, now);
  master.connect(compressor);
  compressor.connect(audio.destination);

  const boom = audio.createOscillator();
  const boomGain = audio.createGain();
  boom.type = "sawtooth";
  boom.frequency.setValueAtTime(96, now);
  boom.frequency.exponentialRampToValueAtTime(27, now + 0.7);
  boomGain.gain.setValueAtTime(0.7, now);
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
  boom.connect(boomGain);
  boomGain.connect(master);
  boom.start(now);
  boom.stop(now + 0.75);

  const noiseBuffer = audio.createBuffer(1, audio.sampleRate * 0.78, audio.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseData.length; index += 1) {
    const falloff = 1 - index / noiseData.length;
    noiseData[index] = (Math.random() * 2 - 1) * falloff * falloff;
  }

  const noise = audio.createBufferSource();
  const highPass = audio.createBiquadFilter();
  const lowPass = audio.createBiquadFilter();
  const noiseGain = audio.createGain();
  highPass.type = "highpass";
  highPass.frequency.setValueAtTime(85, now);
  lowPass.type = "lowpass";
  lowPass.frequency.setValueAtTime(2200, now);
  noiseGain.gain.setValueAtTime(0.9, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.76);
  noise.buffer = noiseBuffer;
  noise.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
  noise.stop(now + 0.8);

  const crack = audio.createOscillator();
  const crackGain = audio.createGain();
  crack.type = "square";
  crack.frequency.setValueAtTime(230, now);
  crack.frequency.exponentialRampToValueAtTime(55, now + 0.1);
  crackGain.gain.setValueAtTime(0.38, now);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
  crack.connect(crackGain);
  crackGain.connect(master);
  crack.start(now);
  crack.stop(now + 0.15);

  window.setTimeout(() => audio.close(), 1150);
}

function drawRedPaint() {
  if (!dinoPaint) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  dinoPaint.width = Math.round(window.innerWidth * pixelRatio);
  dinoPaint.height = Math.round(window.innerHeight * pixelRatio);
  paintContext = dinoPaint.getContext("2d");
  paintContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const splats = [
    [0.07, 0.12, 102], [0.32, 0.07, 72], [0.66, 0.15, 128], [0.91, 0.34, 88],
    [0.12, 0.55, 115], [0.45, 0.47, 68], [0.76, 0.62, 132], [0.29, 0.86, 64],
    [0.57, 0.9, 96], [0.94, 0.88, 78],
  ];

  function paintSplat(x, y, radius, rotation) {
    const points = 17;
    paintContext.save();
    paintContext.translate(x, y);
    paintContext.rotate(rotation);
    paintContext.fillStyle = "rgba(209, 22, 40, .82)";
    paintContext.beginPath();

    for (let index = 0; index <= points; index += 1) {
      const angle = (Math.PI * 2 * index) / points;
      const wobble = 0.72 + ((index * 37) % 29) / 80;
      const pointX = Math.cos(angle) * radius * wobble;
      const pointY = Math.sin(angle) * radius * wobble;
      if (index === 0) paintContext.moveTo(pointX, pointY);
      else paintContext.lineTo(pointX, pointY);
    }

    paintContext.fill();
    for (let index = 0; index < 5; index += 1) {
      const angle = rotation + index * 1.21;
      const distance = radius * (1.1 + index * 0.25);
      paintContext.beginPath();
      paintContext.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, radius * (0.08 + (index % 3) * 0.035), 0, Math.PI * 2);
      paintContext.fill();
    }
    paintContext.restore();
  }

  splats.forEach(([x, y, radius], index) => {
    paintSplat(window.innerWidth * x, window.innerHeight * y, radius, index * 0.71);
  });
}

function eraseRedPaint(event) {
  if (!document.body.classList.contains("dino-exploded") || !paintContext) return;

  const currentPoint = { x: event.clientX, y: event.clientY };
  paintContext.save();
  paintContext.globalCompositeOperation = "destination-out";
  paintContext.lineWidth = 58;
  paintContext.lineCap = "round";
  paintContext.beginPath();
  if (lastEraserPoint) {
    paintContext.moveTo(lastEraserPoint.x, lastEraserPoint.y);
    paintContext.lineTo(currentPoint.x, currentPoint.y);
    paintContext.stroke();
  } else {
    paintContext.arc(currentPoint.x, currentPoint.y, 29, 0, Math.PI * 2);
    paintContext.fill();
  }
  paintContext.restore();
  lastEraserPoint = currentPoint;
}

window.addEventListener("pointermove", eraseRedPaint, { passive: true });
window.addEventListener("blur", () => { lastEraserPoint = undefined; });

if (heroDino && dinoImage && dinoNote) {
  renderDino(dinoProgress);

  if (!dinoUnlocked) {
    document.documentElement.classList.add("dino-locked");
    document.body.classList.add("dino-locked");

    window.addEventListener("wheel", (event) => {
      if (dinoUnlocked) return;
      event.preventDefault();
      advanceDino(event.deltaY / 500);
    }, { passive: false });

    window.addEventListener("touchstart", (event) => {
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchmove", (event) => {
      if (dinoUnlocked) return;
      event.preventDefault();
      const movement = touchStartY - event.touches[0].clientY;
      touchStartY = event.touches[0].clientY;
      advanceDino(movement / 320);
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      const scrollingKeys = ["ArrowDown", "PageDown", " ", "End"];
      if (!dinoUnlocked && scrollingKeys.includes(event.key)) {
        event.preventDefault();
        advanceDino(0.2);
      }
    });
  }

  function explodeDino() {
    if (heroDino.classList.contains("is-exploded")) return;

    playExplosionSound();
    drawRedPaint();
    const box = heroDino.getBoundingClientRect();
    const colors = ["#40aebe", "#f58220", "#fff4e5", "#0c3155", "#f2ac36"];

    for (let index = 0; index < 72; index += 1) {
      const angle = (Math.PI * 2 * index) / 72 + (Math.random() - 0.5) * 0.42;
      const distance = 100 + Math.random() * 440;
      const shard = document.createElement("i");
      const startX = box.left + box.width * (0.22 + Math.random() * 0.55);
      const startY = box.top + box.height * (0.18 + Math.random() * 0.64);

      shard.className = "dino-shard";
      shard.style.setProperty("--start-x", `${startX}px`);
      shard.style.setProperty("--start-y", `${startY}px`);
      shard.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      shard.style.setProperty("--dy", `${Math.sin(angle) * distance + 90}px`);
      shard.style.setProperty("--size", `${10 + Math.round(Math.random() * 26)}px`);
      shard.style.setProperty("--turn", `${Math.round((Math.random() - 0.5) * 1080)}deg`);
      shard.style.setProperty("--duration", `${1.05 + Math.random() * 0.85}s`);
      shard.style.setProperty("--delay", `${Math.random() * 0.12}s`);
      shard.style.setProperty("--shard-color", colors[index % colors.length]);
      dinoDebris?.append(shard);
    }

    heroDino.classList.add("is-exploded");
    heroDino.setAttribute("aria-label", "Le dinosaure a explosé en taches rouges graphiques");
    document.body.classList.add("dino-exploded");
  }

  heroDino.addEventListener("click", explodeDino);
  heroDino.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      explodeDino();
    }
  });
}
