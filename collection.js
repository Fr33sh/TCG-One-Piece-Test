// Cartes possédées par le joueur : { "EB-001": nombre d'exemplaires, ... }, gardées dans le navigateur.

const CLE_COLLECTION = "tcg-one-piece/collection";

function lireCollection() {
  try {
    return JSON.parse(localStorage.getItem(CLE_COLLECTION)) || {};
  } catch {
    return {};
  }
}

function ajouterALaCollection(cartes) {
  const collection = lireCollection();
  for (const carte of cartes) collection[carte.id] = (collection[carte.id] || 0) + 1;
  try {
    localStorage.setItem(CLE_COLLECTION, JSON.stringify(collection));
  } catch {
    // Stockage indisponible (navigation privée…) : les cartes ne sont pas gardées
  }
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}
