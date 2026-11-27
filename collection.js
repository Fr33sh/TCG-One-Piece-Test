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
  // Version 2 (24/11/2026) : Ino, Shikamaru, Gôzu & Meizu, Sakura et Kakashi rejoignent la collection Naruto
  {
    "NA-004": "NA-006", "NA-005": "NA-007", "NA-006": "NA-008", "NA-007": "NA-009", "NA-008": "NA-011",
    "NA-009": "NA-012", "NA-010": "NA-013", "NA-011": "NA-015", "NA-012": "NA-016", "NA-013": "NA-017",
    "NA-014": "NA-018", "NA-015": "NA-019", "NA-016": "NA-021", "NA-017": "NA-022",
  },
  // Version 3 (24/11/2026) : Tazuna, Tsunami, Inari, Kaiza, Zôri & Waraji complètent la collection Naruto
  {
    "NA-002": "NA-007", "NA-003": "NA-008", "NA-004": "NA-009", "NA-005": "NA-010", "NA-006": "NA-011",
    "NA-007": "NA-012", "NA-008": "NA-013", "NA-009": "NA-014", "NA-010": "NA-015", "NA-011": "NA-016",
    "NA-012": "NA-017", "NA-013": "NA-018", "NA-014": "NA-019", "NA-015": "NA-020", "NA-016": "NA-021",
    "NA-017": "NA-022", "NA-018": "NA-023", "NA-019": "NA-024", "NA-020": "NA-025", "NA-021": "NA-026",
    "NA-022": "NA-027",
  },
  // Version 4 (27/11/2026) : Menos Grande devient BL-020, les SSR et la Z de Bleach avancent d'un numéro
  {
    "BL-020": "BL-021", "BL-021": "BL-022", "BL-022": "BL-023", "BL-023": "BL-024", "BL-024": "BL-025",
    "BL-025": "BL-026",
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

// Le numéro actuel d'une carte enregistrée sous une ancienne numérotation (classeurs.js)
function convertirIdentifiant(id, depuisVersion = 0) {
  return RENUMEROTATIONS.slice(depuisVersion).reduce((numero, correspondances) => correspondances[numero] || numero, id);
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
