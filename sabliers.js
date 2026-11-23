// Sabliers : monnaie qui fait gagner du temps de recharge des boosters (1 Sablier = 1 heure).
// On en gagne 1 par combat en ligne gagné. Le stock est gardé dans le navigateur (et en ligne avec sauvegarde.js).

const CLE_SABLIERS = "tcg-one-piece/sabliers";
const DUREE_SABLIER = 60 * 60 * 1000; // ms

function lireSabliers() {
  try {
    const nombre = JSON.parse(localStorage.getItem(CLE_SABLIERS));
    return Number.isInteger(nombre) && nombre > 0 ? nombre : 0;
  } catch {
    return 0;
  }
}

function enregistrerSabliers(nombre) {
  try {
    localStorage.setItem(CLE_SABLIERS, JSON.stringify(Math.max(0, nombre)));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

// À appeler après chaque combat en ligne gagné
function gagnerSabliers(nombre = 1) {
  enregistrerSabliers(lireSabliers() + nombre);
}

// Renvoie faux s'il n'y en a pas assez
function depenserSabliers(nombre) {
  const stock = lireSabliers();
  if (nombre > stock) return false;
  if (nombre > 0) enregistrerSabliers(stock - nombre);
  return true;
}
