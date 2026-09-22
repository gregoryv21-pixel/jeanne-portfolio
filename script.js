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
