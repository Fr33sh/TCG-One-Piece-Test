// Réglages du joueur (page Paramètres), gardés dans le navigateur. Audio : volume de la musique et des effets
// sonores sur 10 crans, chacun activable ou non ; au départ tout est activé, au maximum.

const CLE_REGLAGES = "tcg-one-piece/parametres";
const MESSAGE_REGLAGES = "tcg-one-piece:reglages";
const REGLAGES_DE_BASE = {
  musique: { volume: 10, active: true },
  effets: { volume: 10, active: true },
};

function lireReglages() {
  const reglages = structuredClone(REGLAGES_DE_BASE);
  try {
    const sauvegarde = JSON.parse(localStorage.getItem(CLE_REGLAGES)) || {};
    for (const canal of Object.keys(reglages)) Object.assign(reglages[canal], sauvegarde[canal]);
  } catch {}
  return reglages;
}

// Enregistre, puis prévient le son de cette page et celui de l'émulateur (qui joue la musique)
function enregistrerReglages(reglages) {
  try {
    localStorage.setItem(CLE_REGLAGES, JSON.stringify(reglages));
  } catch {}
  document.dispatchEvent(new Event(MESSAGE_REGLAGES));
  if (window.parent !== window) window.parent.postMessage(MESSAGE_REGLAGES, "*");
}

// Volume d'un canal entre 0 et 1 ; les crans suivent l'oreille (le cran 5 sonne à peu près à moitié)
function niveauSon(canal) {
  const { volume, active } = lireReglages()[canal];
  return active ? (volume / 10) ** 2 : 0;
}

// Appelle « appliquer » à chaque changement de réglage, d'où qu'il vienne
function suivreReglages(appliquer) {
  document.addEventListener(MESSAGE_REGLAGES, appliquer);
  addEventListener("message", evenement => {
    if (evenement.data === MESSAGE_REGLAGES) appliquer();
  });
  addEventListener("storage", evenement => {
    if (evenement.key === CLE_REGLAGES) appliquer();
  });
}
