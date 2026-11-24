// Cartes possédées par le joueur : { "EB-001": nombre d'exemplaires, ..., _version: n }, gardées dans le
// navigateur (et en ligne avec sauvegarde.js).
//
// Quand une série est renumérotée (nouvelle carte insérée), les anciens numéros sont convertis automatiquement :
// chaque renumérotation est décrite dans RENUMEROTATIONS (ancien numéro → nouveau), et _version retient la
// dernière appliquée à la collection.

const CLE_COLLECTION = "tcg-one-piece/collection";

const RENUMEROTATIONS = [
  // Version 1 (24/11/2026) : Iruka devient NA-009, les cartes Naruto suivantes avancent d'un numéro
  {
    "NA-009": "NA-010", "NA-010": "NA-011", "NA-011": "NA-012", "NA-012": "NA-013",
    "NA-013": "NA-014", "NA-014": "NA-015", "NA-015": "NA-016", "NA-016": "NA-017",
  },
];
const VERSION_COLLECTION = RENUMEROTATIONS.length;

// Applique les renumérotations que la collection n'a pas encore reçues
function convertirNumeros(collection) {
  const version = Number.isInteger(collection._version) ? collection._version : 0;
  if (version >= VERSION_COLLECTION) return collection;
  let cartes = { ...collection };
  delete cartes._version;
  for (const correspondances of RENUMEROTATIONS.slice(version)) {
    const converties = {};
    for (const [id, nombre] of Object.entries(cartes)) {
      const nouveau = correspondances[id] || id;
      converties[nouveau] = (converties[nouveau] || 0) + nombre;
    }
    cartes = converties;
  }
  return { ...cartes, _version: VERSION_COLLECTION };
}

function lireCollection() {
  let collection;
  try {
    collection = JSON.parse(localStorage.getItem(CLE_COLLECTION)) || {};
  } catch {
    collection = {};
  }
  const convertie = convertirNumeros(collection);
  if (convertie !== collection && Object.keys(convertie).length > 1) enregistrerCollection(convertie);
  return convertie;
}

function enregistrerCollection(collection) {
  try {
    localStorage.setItem(CLE_COLLECTION, JSON.stringify({ ...collection, _version: VERSION_COLLECTION }));
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
