// Fond marin animé (styles dans fond-marin.css), commun à l'écran de chargement et à l'écran de création
// du compte : remplit chaque élément .fond-marin de la page.

const NOMBRE_BULLES = 26;
const NOMBRE_PARTICULES = 34;

// Rayons de lumière venant de la surface : position, largeur, inclinaison, durée de la lueur
const RAYONS = [
  { x: 18, l: 9, angle: 8, duree: 7 },
  { x: 34, l: 6, angle: 4, duree: 9 },
  { x: 52, l: 11, angle: -2, duree: 8 },
  { x: 68, l: 7, angle: -6, duree: 10 },
  { x: 84, l: 8, angle: -10, duree: 7.5 },
];

const hasard = (min, max) => min + Math.random() * (max - min);

function creerElement(classe, variables = {}) {
  const element = document.createElement("span");
  element.className = classe;
  for (const [nom, valeur] of Object.entries(variables)) element.style.setProperty(`--${nom}`, valeur);
  return element;
}

function remplirFondMarin(fond) {
  fond.setAttribute("aria-hidden", "true");
  fond.innerHTML = `
    <!-- Filtre d'ondulation de l'eau appliqué à l'image -->
    <svg class="fond-marin__filtres" width="0" height="0">
      <filter id="ondulation" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.010" numOctaves="2" seed="7" result="bruit">
          <animate attributeName="baseFrequency" dur="18s" values="0.004 0.010; 0.006 0.014; 0.004 0.010" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="bruit" scale="22" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    <div class="mer"><img class="mer__image" src="assets/fonds/fond-mer.jpg" alt=""></div>
    <div class="rayons"></div>
    <div class="particules"></div>
    <div class="bulles"></div>`;

  fond.querySelector(".rayons").append(...RAYONS.map(({ x, l, angle, duree }) =>
    creerElement("", { x: `${x}%`, l: `${l}%`, angle: `${angle}deg`, duree: `${duree}s` })));

  // Délais négatifs : l'écran s'ouvre avec des bulles et des particules déjà en mouvement
  fond.querySelector(".bulles").append(...Array.from({ length: NOMBRE_BULLES }, () => {
    const bulle = creerElement("bulle", { x: `${hasard(2, 98)}%`, duree: `${hasard(7, 15)}s`, delai: `${-hasard(0, 15)}s` });
    const forme = document.createElement("i");
    forme.style.setProperty("--taille", `${hasard(4, 18)}px`);
    forme.style.setProperty("--derive", `${hasard(4, 14)}px`);
    bulle.append(forme);
    return bulle;
  }));

  fond.querySelector(".particules").append(...Array.from({ length: NOMBRE_PARTICULES }, () => creerElement("particule", {
    x: `${hasard(0, 100)}%`,
    y: `${hasard(10, 100)}%`,
    taille: `${hasard(1.5, 4)}px`,
    dx: `${hasard(-30, 30)}px`,
    dy: `${hasard(-40, 20)}px`,
    duree: `${hasard(5, 11)}s`,
    delai: `${-hasard(0, 11)}s`,
  })));
}

document.querySelectorAll(".fond-marin").forEach(remplirFondMarin);
