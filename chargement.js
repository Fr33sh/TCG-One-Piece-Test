// Écran de chargement : crée les bulles qui remontent et les particules en suspension. Toucher l'écran
// plonge dedans (zoom) pendant que la musique d'aventure laisse place en fondu à celle du jeu, puis
// ouvre l'accueil.

const NOMBRE_BULLES = 26;
const NOMBRE_PARTICULES = 34;
const DUREE_PLONGEE = 1000; // ms, comme l'animation « plongee » de chargement.css

const ecranChargement = document.querySelector(".ecran-chargement");
let plongeeCommencee = false;

ecranChargement.addEventListener("click", evenement => {
  evenement.preventDefault();
  if (plongeeCommencee) return;
  plongeeCommencee = true;
  ecranChargement.classList.add("ecran-chargement--plongee");
  demanderMorceau("ambiance");
  setTimeout(() => { location.href = ecranChargement.href; }, DUREE_PLONGEE);
});

const hasard = (min, max) => min + Math.random() * (max - min);

function creerBulles() {
  const zone = document.querySelector(".bulles");
  for (let i = 0; i < NOMBRE_BULLES; i++) {
    const bulle = document.createElement("span");
    bulle.className = "bulle";
    bulle.style.setProperty("--x", `${hasard(2, 98)}%`);
    bulle.style.setProperty("--duree", `${hasard(7, 15)}s`);
    // Délai négatif : l'écran s'ouvre avec des bulles déjà en train de monter
    bulle.style.setProperty("--delai", `${-hasard(0, 15)}s`);
    const forme = document.createElement("i");
    forme.style.setProperty("--taille", `${hasard(4, 18)}px`);
    forme.style.setProperty("--derive", `${hasard(4, 14)}px`);
    bulle.append(forme);
    zone.append(bulle);
  }
}

function creerParticules() {
  const zone = document.querySelector(".particules");
  for (let i = 0; i < NOMBRE_PARTICULES; i++) {
    const particule = document.createElement("span");
    particule.className = "particule";
    particule.style.setProperty("--x", `${hasard(0, 100)}%`);
    particule.style.setProperty("--y", `${hasard(10, 100)}%`);
    particule.style.setProperty("--taille", `${hasard(1.5, 4)}px`);
    particule.style.setProperty("--dx", `${hasard(-30, 30)}px`);
    particule.style.setProperty("--dy", `${hasard(-40, 20)}px`);
    particule.style.setProperty("--duree", `${hasard(5, 11)}s`);
    particule.style.setProperty("--delai", `${-hasard(0, 11)}s`);
    zone.append(particule);
  }
}

creerBulles();
creerParticules();
