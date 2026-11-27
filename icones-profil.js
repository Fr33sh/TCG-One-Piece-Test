// Icônes de profil : des jetons ronds, que le joueur choisit dans l'onglet Profil. Le choix est gardé dans le
// navigateur (et en ligne avec sauvegarde.js). Styles : icones-profil.css.
// - Série « Icône de Base » : les deux jetons offerts à tous (assets/icones-profil, fabriqués par outils/jetons.mjs).
// - Séries « Jetons SSR · … » : une icône à l'image de chaque carte SSR dont le jeton a été débloqué dans les
//   Missions (jetons-ssr.js ; seulement si la page charge les données des cartes).
// - Série « Jetons Z » : un jeton animé par carte Z obtenue.

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
    })));
  return [...ICONES_DE_BASE, ...jetons, ...jetonsZ()];
}

// Jetons Z : animés en permanence (image animée tirée de la boucle de 2 secondes de la carte), offerts dès que
// la carte Z est dans la collection
function jetonsZ() {
  if (typeof lireCollection !== "function") return [];
  const possedees = lireCollection();
  return SERIES.flatMap(serie => serie.cartes
    .filter(carte => carte.rang === 5 && possedees[carte.id])
    .map(carte => ({
      id: `z-${carte.id}`,
      serie: "Jetons Z",
      nom: carte.nom,
      image: carte.jeton || [].concat(carte.illustration)[0],
      cadrage: carte.jeton ? "" : carte.cadrage,
      anime: true,
    })));
}

// Choix gardé : { id, _version } ; un jeton de carte (« ssr-BL-024 », « z-EB-067 ») suit les renumérotations
// (collection.js). Les anciens choix, enregistrés seuls, datent de la numérotation 3.
function lireIcone() {
  try {
    const sauvegarde = JSON.parse(localStorage.getItem(CLE_ICONE));
    let id = typeof sauvegarde === "string" ? sauvegarde : sauvegarde?.id;
    const version = typeof sauvegarde === "string" ? 3 : sauvegarde?._version ?? 3;
    const jeton = /^(ssr|z)-(.+)$/.exec(id || "");
    if (jeton && typeof convertirIdentifiant === "function") id = `${jeton[1]}-${convertirIdentifiant(jeton[2], version)}`;
    if (iconesProfil().some(icone => icone.id === id)) return id;
  } catch {}
  return ICONE_DE_BASE;
}

function choisirIcone(id) {
  if (!iconesProfil().some(icone => icone.id === id)) return;
  try {
    const version = typeof VERSION_COLLECTION === "number" ? VERSION_COLLECTION : 3;
    localStorage.setItem(CLE_ICONE, JSON.stringify({ id, _version: version }));
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
  jeton.className = `icone-profil${icone.anime ? " icone-profil--animee" : ""} ${classe}`.trim();
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
