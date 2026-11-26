// Classeurs : le joueur y réunit les cartes qu'il veut montrer, jusqu'à 20 par classeur (onglet « Classeurs » de la
// Collection, classeurs-page.js). Gardés dans le navigateur (et en ligne avec sauvegarde.js) :
// { liste: [{ id, nom, cartes: ["EB-057", …], couverture }], _version } ; les numéros des cartes suivent les
// renumérotations (collection.js, à charger avant).

const CLE_CLASSEURS = "tcg-one-piece/classeurs";
const TAILLE_CLASSEUR = 20;
const NOM_CLASSEUR_MAX = 24;

function lireClasseurs() {
  let sauvegarde;
  try {
    sauvegarde = JSON.parse(localStorage.getItem(CLE_CLASSEURS)) || {};
  } catch {
    sauvegarde = {};
  }
  const liste = Array.isArray(sauvegarde.liste) ? sauvegarde.liste : [];
  const version = Number.isInteger(sauvegarde._version) ? sauvegarde._version : 0;
  return liste.map(classeur => ({
    ...classeur,
    cartes: (classeur.cartes || []).map(id => convertirIdentifiant(id, version)),
  }));
}

function enregistrerClasseurs(liste) {
  try {
    localStorage.setItem(CLE_CLASSEURS, JSON.stringify({ liste, _version: VERSION_COLLECTION }));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

const nomPropre = nom => String(nom || "").trim().slice(0, NOM_CLASSEUR_MAX);

// Crée un classeur vide et renvoie-le
function creerClasseur(nom) {
  const liste = lireClasseurs();
  const classeur = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    nom: nomPropre(nom) || `Classeur ${liste.length + 1}`,
    cartes: [],
    couverture: "base",
  };
  enregistrerClasseurs([...liste, classeur]);
  return classeur;
}

const trouverClasseur = id => lireClasseurs().find(classeur => classeur.id === id);

function modifierClasseur(id, changements) {
  enregistrerClasseurs(lireClasseurs().map(classeur => (classeur.id === id ? { ...classeur, ...changements } : classeur)));
}

function renommerClasseur(id, nom) {
  if (nomPropre(nom)) modifierClasseur(id, { nom: nomPropre(nom) });
}

function supprimerClasseur(id) {
  enregistrerClasseurs(lireClasseurs().filter(classeur => classeur.id !== id));
}

// Ajoute ou retire une carte ; renvoie faux si le classeur est déjà plein
function basculerCarteClasseur(id, carteId) {
  const classeur = trouverClasseur(id);
  if (!classeur) return false;
  if (classeur.cartes.includes(carteId)) {
    modifierClasseur(id, { cartes: classeur.cartes.filter(c => c !== carteId) });
    return true;
  }
  if (classeur.cartes.length >= TAILLE_CLASSEUR) return false;
  modifierClasseur(id, { cartes: [...classeur.cartes, carteId] });
  return true;
}
