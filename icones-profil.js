// Icônes de profil : des jetons ronds, que le joueur choisit dans l'onglet Profil (images dans
// assets/icones-profil). Le choix est gardé dans le navigateur (et en ligne avec sauvegarde.js).
// Styles : icones-profil.css.

const CLE_ICONE = "tcg-one-piece/icone";

const ICONES_PROFIL = [
  // Série « Icône de Base » : les deux jetons offerts à tous, le 魂 du logo (fabriqués par outils/jetons.mjs)
  { id: "ame-blanche", serie: "Icône de Base", nom: "Âme blanche", image: "assets/icones-profil/ame-blanche.svg" },
  { id: "ame-noire", serie: "Icône de Base", nom: "Âme noire", image: "assets/icones-profil/ame-noire.svg" },
];

const ICONE_DE_BASE = "ame-blanche";

function lireIcone() {
  try {
    const id = JSON.parse(localStorage.getItem(CLE_ICONE));
    if (ICONES_PROFIL.some(icone => icone.id === id)) return id;
  } catch {}
  return ICONE_DE_BASE;
}

function choisirIcone(id) {
  if (!ICONES_PROFIL.some(icone => icone.id === id)) return;
  try {
    localStorage.setItem(CLE_ICONE, JSON.stringify(id));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

// Le jeton rond d'une icône (celle du joueur par défaut)
function creerIconeProfil(id = lireIcone(), classe = "") {
  const icone = ICONES_PROFIL.find(i => i.id === id) || ICONES_PROFIL.find(i => i.id === ICONE_DE_BASE);
  const jeton = document.createElement("span");
  jeton.className = `icone-profil ${classe}`.trim();
  const image = document.createElement("img");
  image.src = icone.image;
  image.alt = "";
  jeton.append(image);
  return jeton;
}
