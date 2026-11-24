// Fond animé d'Anima TCG (styles dans fond-anima.css), commun à l'écran de chargement et à l'écran de création
// du compte : remplit chaque élément .fond-anima de la page.

const NOMBRE_PARTICULES = 34;
const COULEURS_PARTICULES = ["#ffffff", "#ffffff", "#ffffff", "#ff7eb6", "#fff07a", "#7dffc4", "#7cc8ff", "#b98cff"];

const auHasard = (min, max) => min + Math.random() * (max - min);

function remplirFondAnima(fond) {
  fond.setAttribute("aria-hidden", "true");
  fond.innerHTML = '<span class="fond-anima__halo"></span><span class="fond-anima__reflet"></span>';

  // Délais négatifs : l'écran s'ouvre avec des particules déjà en mouvement
  fond.append(...Array.from({ length: NOMBRE_PARTICULES }, () => {
    const particule = document.createElement("span");
    particule.className = "fond-anima__particule";
    const variables = {
      x: `${auHasard(0, 100)}%`,
      taille: `${auHasard(1.5, 3.5)}px`,
      derive: `${auHasard(-40, 40)}px`,
      duree: `${auHasard(9, 18)}s`,
      delai: `${-auHasard(0, 18)}s`,
      couleur: COULEURS_PARTICULES[Math.floor(Math.random() * COULEURS_PARTICULES.length)],
    };
    for (const [nom, valeur] of Object.entries(variables)) particule.style.setProperty(`--${nom}`, valeur);
    return particule;
  }));
}

document.querySelectorAll(".fond-anima").forEach(remplirFondAnima);
