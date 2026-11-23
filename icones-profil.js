// Icônes de profil : des jetons ronds, que le joueur choisit dans l'onglet Profil. Images officielles
// (anime), découpées en carré sur le visage dans assets/icones-profil. Le choix est gardé dans le navigateur
// (et en ligne avec sauvegarde.js). Styles : icones-profil.css.

const CLE_ICONE = "tcg-one-piece/icone";

const ICONES_PROFIL = [
  // Série « Icône de Base » : des soldats de la Marine et des pirates sans grade
  { id: "soldat-marine", serie: "Icône de Base", nom: "Soldat de la Marine", image: "assets/icones-profil/soldat-marine.jpg" },
  { id: "ripper", serie: "Icône de Base", nom: "Ripper", image: "assets/icones-profil/ripper.jpg" },
  { id: "nezumi", serie: "Icône de Base", nom: "Nezumi", image: "assets/icones-profil/nezumi.jpg" },
  { id: "heppoko", serie: "Icône de Base", nom: "Heppoko", image: "assets/icones-profil/heppoko.jpg" },
  { id: "peppoko", serie: "Icône de Base", nom: "Peppoko", image: "assets/icones-profil/peppoko.jpg" },
  { id: "poppoko", serie: "Icône de Base", nom: "Poppoko", image: "assets/icones-profil/poppoko.jpg" },
];

const ICONE_DE_BASE = "soldat-marine";

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
