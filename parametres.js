// Page Paramètres. Audio : une bulle pour la musique et une pour les effets sonores, chacune avec un
// haut-parleur et un interrupteur (activer / couper), et une barre de volume de 10 crans.
// « Réinitialiser ce paramètre » remet l'audio comme au départ : tout activé, au maximum.
// Les changements s'entendent tout de suite (la musique continue, seul son volume change).

const CANAUX_AUDIO = [
  { canal: "musique", nom: "Musique" },
  { canal: "effets", nom: "Effets sonores" },
];
const NOMBRE_CRANS = 10;

// Icônes Lucide « volume-2 » et « volume-x »
const ICONE_HAUT_PARLEUR = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />';
const ICONE_ONDES = '<path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.364 18.364a9 9 0 0 0 0-12.728" />';
const ICONE_COUPE = '<line x1="22" x2="16" y1="9" y2="15" /><line x1="16" x2="22" y1="9" y2="15" />';

const zoneAudio = document.querySelector('[data-reglages="audio"]');
const bornerCran = cran => Math.min(Math.max(cran, 1), NOMBRE_CRANS);

function modifierCanal(canal, changement) {
  const reglages = lireReglages();
  Object.assign(reglages[canal], changement);
  enregistrerReglages(reglages);
  afficherReglages();
}

function creerReglageSon({ canal, nom }) {
  const bulle = document.createElement("div");
  bulle.className = "reglage-son";
  bulle.dataset.canal = canal;
  bulle.innerHTML = `
    <div class="reglage-son__haut">
      <span class="reglage-son__nom" id="nom-${canal}">${nom}</span>
      <svg class="reglage-son__haut-parleur" viewBox="0 0 24 24" aria-hidden="true"></svg>
      <button class="interrupteur" type="button" role="switch" aria-labelledby="nom-${canal}">
        <span class="interrupteur__pastille"></span>
      </button>
    </div>
    <div class="crans" role="slider" tabindex="0" aria-label="Volume : ${nom}" aria-valuemin="1" aria-valuemax="${NOMBRE_CRANS}">
      ${Array.from({ length: NOMBRE_CRANS }, (_, rang) => `<span class="cran" style="--rang: ${rang}"></span>`).join("")}
    </div>`;

  bulle.querySelector(".interrupteur").addEventListener("click", () => {
    modifierCanal(canal, { active: !lireReglages()[canal].active });
  });

  // Choisir un cran : toucher ou glisser le long de la barre, ou flèches du clavier ; un petit clic à chaque cran
  const crans = bulle.querySelector(".crans");
  const choisirCran = volume => {
    if (volume === lireReglages()[canal].volume) return;
    modifierCanal(canal, { volume });
    jouerClic();
  };
  const cranSous = x => {
    const zone = crans.getBoundingClientRect();
    return bornerCran(Math.ceil(((x - zone.left) / zone.width) * NOMBRE_CRANS));
  };
  crans.addEventListener("pointerdown", evenement => {
    crans.setPointerCapture(evenement.pointerId);
    choisirCran(cranSous(evenement.clientX));
  });
  crans.addEventListener("pointermove", evenement => {
    if (crans.hasPointerCapture(evenement.pointerId)) choisirCran(cranSous(evenement.clientX));
  });
  crans.addEventListener("keydown", evenement => {
    const actuel = lireReglages()[canal].volume;
    const pas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[evenement.key];
    if (pas) choisirCran(bornerCran(actuel + pas));
    else if (evenement.key === "Home") choisirCran(1);
    else if (evenement.key === "End") choisirCran(NOMBRE_CRANS);
    else return;
    evenement.preventDefault();
  });
  return bulle;
}

function afficherReglages() {
  const reglages = lireReglages();
  for (const bulle of zoneAudio.children) {
    const { volume, active } = reglages[bulle.dataset.canal];
    bulle.classList.toggle("reglage-son--coupe", !active);
    bulle.querySelector(".reglage-son__haut-parleur").innerHTML = ICONE_HAUT_PARLEUR + (active ? ICONE_ONDES : ICONE_COUPE);
    bulle.querySelector(".interrupteur").setAttribute("aria-checked", active);
    const crans = bulle.querySelector(".crans");
    crans.setAttribute("aria-valuenow", volume);
    crans.setAttribute("aria-valuetext", `${volume} sur ${NOMBRE_CRANS}`);
    [...crans.children].forEach((cran, rang) => cran.classList.toggle("cran--plein", rang < volume));
  }
}

zoneAudio.append(...CANAUX_AUDIO.map(creerReglageSon));

document.querySelector('[data-reinitialiser="audio"]').addEventListener("click", () => {
  const reglages = lireReglages();
  for (const { canal } of CANAUX_AUDIO) reglages[canal] = structuredClone(REGLAGES_DE_BASE[canal]);
  enregistrerReglages(reglages);
  afficherReglages();
});

afficherReglages();
