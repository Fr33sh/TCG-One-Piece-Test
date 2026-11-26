// Icônes de profil : des jetons ronds, que le joueur choisit dans l'onglet Profil. Le choix est gardé dans le
// navigateur (et en ligne avec sauvegarde.js). Styles : icones-profil.css.
// - Série « Icône de Base » : les deux jetons offerts à tous (assets/icones-profil, fabriqués par outils/jetons.mjs).
// - Séries « Jetons SSR · … » : une icône à l'image de chaque carte SSR (ou Z, animée) dont le jeton a été
//   débloqué dans les Missions (jetons-ssr.js ; seulement si la page charge les données des cartes).

const CLE_ICONE = "tcg-one-piece/icone";

const ICONES_DE_BASE = [
  { id: "ame-blanche", serie: "Icône de Base", nom: "Âme blanche", image: "assets/icones-profil/ame-blanche.svg" },
  { id: "ame-noire", serie: "Icône de Base", nom: "Âme noire", image: "assets/icones-profil/ame-noire.svg" },
];

const ICONE_DE_BASE = "ame-blanche";

// Les icônes de base, puis les jetons SSR débloqués, dans l'ordre des séries et des numéros
function iconesProfil() {
  if (typeof lireJetonsSsr !== "function" || typeof SERIES === "undefined") return ICONES_DE_BASE;
  const debloques = lireJetonsSsr();
  const jetons = SERIES.flatMap(serie => serie.cartes
    .filter(carte => debloques.includes(carte.id))
    .map(carte => ({
      id: `ssr-${carte.id}`,
      serie: `Jetons SSR · ${serie.nom}`,
      nom: carte.nom,
      image: [].concat(carte.illustration)[0],
      cadrage: carte.cadrage,
      // Carte Z : jeton animé, avec la boucle de 2 secondes de la carte
      video: carte.boucle,
    })));
  return [...ICONES_DE_BASE, ...jetons];
}

function lireIcone() {
  try {
    const id = JSON.parse(localStorage.getItem(CLE_ICONE));
    if (iconesProfil().some(icone => icone.id === id)) return id;
  } catch {}
  return ICONE_DE_BASE;
}

function choisirIcone(id) {
  if (!iconesProfil().some(icone => icone.id === id)) return;
  try {
    localStorage.setItem(CLE_ICONE, JSON.stringify(id));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

// Le jeton rond d'une icône (celle du joueur par défaut). Une icône introuvable (page sans les données des
// cartes) est remplacée par celle de base.
function creerIconeProfil(id = lireIcone(), classe = "") {
  const icones = iconesProfil();
  const icone = icones.find(i => i.id === id) || icones.find(i => i.id === ICONE_DE_BASE);
  const jeton = document.createElement("span");
  jeton.className = `icone-profil${icone.video ? " icone-profil--animee" : ""} ${classe}`.trim();
  jeton.append(creerImageJeton(icone.image, icone.video, icone.cadrage));
  return jeton;
}

// Image ronde d'un jeton : une image fixe, ou une boucle vidéo muette (cartes Z) avec l'image en attente
function creerImageJeton(image, video, cadrage) {
  let media;
  if (video) {
    media = document.createElement("video");
    Object.assign(media, { src: video, poster: image, muted: true, loop: true, autoplay: true, playsInline: true });
    media.setAttribute("muted", "");
    media.setAttribute("playsinline", "");
  } else {
    media = document.createElement("img");
    media.src = image;
    media.alt = "";
  }
  if (cadrage) media.style.objectPosition = cadrage;
  return media;
}
