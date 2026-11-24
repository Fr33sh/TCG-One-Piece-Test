// Sceaux : ils font gagner du temps de recharge des boosters (1 Sceau = 1 heure). Ils remplacent les anciens
// Sabliers : la clé de sauvegarde garde l'ancien nom, pour que les Sabliers déjà gagnés deviennent des Sceaux.
// Le stock est gardé dans le navigateur (et en ligne avec sauvegarde.js).

const CLE_SCEAUX = "tcg-one-piece/sabliers";
const DUREE_SCEAU = 60 * 60 * 1000; // ms

function lireSceaux() {
  try {
    const nombre = JSON.parse(localStorage.getItem(CLE_SCEAUX));
    return Number.isInteger(nombre) && nombre > 0 ? nombre : 0;
  } catch {
    return 0;
  }
}

function enregistrerSceaux(nombre) {
  try {
    localStorage.setItem(CLE_SCEAUX, JSON.stringify(Math.max(0, nombre)));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

function gagnerSceaux(nombre = 1) {
  enregistrerSceaux(lireSceaux() + nombre);
}

// Renvoie faux s'il n'y en a pas assez
function depenserSceaux(nombre) {
  const stock = lireSceaux();
  if (nombre > stock) return false;
  if (nombre > 0) enregistrerSceaux(stock - nombre);
  return true;
}

// « 1 Sceau », « 3 Sceaux »
const nomSceaux = nombre => `${nombre} Sceau${nombre > 1 ? "x" : ""}`;
