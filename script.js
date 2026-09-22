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
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let dinoProgress = reducedMotion ? 1 : 0;
let dinoUnlocked = reducedMotion;
let touchStartY = 0;

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
