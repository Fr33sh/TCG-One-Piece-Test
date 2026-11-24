// Cartes possédées par le joueur : { "EB-001": nombre d'exemplaires, ... }, gardées dans le navigateur.

const CLE_COLLECTION = "tcg-one-piece/collection";

function lireCollection() {
  try {
    return JSON.parse(localStorage.getItem(CLE_COLLECTION)) || {};
  } catch {
    return {};
  }
}

function enregistrerCollection(collection) {
  try {
    localStorage.setItem(CLE_COLLECTION, JSON.stringify(collection));
  } catch {
    // Stockage indisponible (navigation privée…) : les cartes ne sont pas gardées
  }
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

function ajouterALaCollection(cartes) {
  const collection = lireCollection();
  for (const carte of cartes) collection[carte.id] = (collection[carte.id] || 0) + 1;
  enregistrerCollection(collection);
}

// Retire des exemplaires d'une carte (recyclage des doublons, animas.js) ; il en reste toujours au moins un
function retirerDeLaCollection(id, nombre) {
  const collection = lireCollection();
  collection[id] = Math.max(1, (collection[id] || 0) - nombre);
  enregistrerCollection(collection);
}
