// Animas : la monnaie du jeu (pièce d'or au 魂, assets/monnaie/anima.svg). On les gagne en recyclant les cartes en
// double dans la Collection ; elles serviront à la Boutique. Le stock est gardé dans le navigateur (et en ligne
// avec sauvegarde.js). Utilise collection.js (à charger avant).

const CLE_ANIMAS = "tcg-one-piece/animas";

// Animas gagnés par exemplaire recyclé, selon la rareté (A, S, SR, SSR, Z ; valeur du Z PROVISOIRE, à confirmer)
const VALEUR_RECYCLAGE = { 1: 1, 2: 5, 3: 10, 4: 20, 5: 50 };

function lireAnimas() {
  try {
    const nombre = JSON.parse(localStorage.getItem(CLE_ANIMAS));
    return Number.isInteger(nombre) && nombre > 0 ? nombre : 0;
  } catch {
    return 0;
  }
}

function enregistrerAnimas(nombre) {
  try {
    localStorage.setItem(CLE_ANIMAS, JSON.stringify(Math.max(0, nombre)));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
  afficherSoldeAnimas();
}

function gagnerAnimas(nombre) {
  enregistrerAnimas(lireAnimas() + nombre);
}

// Renvoie faux s'il n'y en a pas assez
function depenserAnimas(nombre) {
  const stock = lireAnimas();
  if (nombre > stock) return false;
  if (nombre > 0) enregistrerAnimas(stock - nombre);
  return true;
}

// « 1 Anima », « 25 Animas »
const nomAnimas = nombre => `${nombre} Anima${nombre > 1 ? "s" : ""}`;

// Met à jour tous les soldes affichés dans la page (éléments [data-animas])
function afficherSoldeAnimas() {
  for (const solde of document.querySelectorAll("[data-animas]")) solde.textContent = lireAnimas();
}

// Doublons d'une carte : les exemplaires au-delà du premier (on en garde toujours un)
const doublons = carte => Math.max(0, (lireCollection()[carte.id] || 0) - 1);

// Recycle « nombre » doublons d'une carte ; renvoie les Animas gagnés (0 si impossible)
function recycler(carte, nombre) {
  if (!Number.isInteger(nombre) || nombre < 1 || nombre > doublons(carte)) return 0;
  retirerDeLaCollection(carte.id, nombre);
  const gain = nombre * VALEUR_RECYCLAGE[carte.rang];
  gagnerAnimas(gain);
  // Mission quotidienne « Recycler un doublon » (missions-quotidiennes.js, si la page le charge)
  if (typeof progresserMission === "function") progresserMission("recyclage");
  return gain;
}

afficherSoldeAnimas();
