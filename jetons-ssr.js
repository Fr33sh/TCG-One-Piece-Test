// Jetons SSR : chaque carte SSR obtenue permet de débloquer, dans l'onglet « Jetons SSR » des Missions, une icône
// de profil à son image (icones-profil.js). Les jetons débloqués sont gardés dans le navigateur (et en ligne avec
// sauvegarde.js) : { ids: ["EB-057", …], _version } ; les numéros suivent les renumérotations (collection.js).
// Utilise collection.js et les données des cartes (donnees/series.js), à charger avant.

const CLE_JETONS_SSR = "tcg-one-piece/jetons-ssr";

function lireJetonsSsr() {
  let sauvegarde;
  try {
    sauvegarde = JSON.parse(localStorage.getItem(CLE_JETONS_SSR)) || {};
  } catch {
    sauvegarde = {};
  }
  const ids = Array.isArray(sauvegarde.ids) ? sauvegarde.ids : [];
  // Anciens numéros : convertis comme ceux de la collection
  const version = Number.isInteger(sauvegarde._version) ? sauvegarde._version : 0;
  if (version >= VERSION_COLLECTION) return ids;
  const converti = convertirNumeros(Object.fromEntries(ids.map(id => [id, 1])));
  return Object.keys(converti).filter(id => id !== "_version");
}

function enregistrerJetonsSsr(ids) {
  try {
    localStorage.setItem(CLE_JETONS_SSR, JSON.stringify({ ids, _version: VERSION_COLLECTION }));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

// Toutes les SSR du jeu, série par série
const cartesSsr = () => CARTES.filter(carte => carte.rang === 4);

// « verrouille » (carte pas encore obtenue), « pret » (obtenue, jeton à débloquer) ou « debloque »
function etatJetonSsr(carte) {
  if (lireJetonsSsr().includes(carte.id)) return "debloque";
  return lireCollection()[carte.id] ? "pret" : "verrouille";
}

// Débloque le jeton d'une SSR obtenue ; renvoie vrai si c'est fait
function debloquerJetonSsr(carte) {
  if (carte.rang !== 4 || etatJetonSsr(carte) !== "pret") return false;
  enregistrerJetonsSsr([...lireJetonsSsr(), carte.id]);
  return true;
}
