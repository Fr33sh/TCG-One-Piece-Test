// Icônes de profil : des jetons ronds, dessinés pour le jeu, que le joueur choisit dans l'onglet Profil.
// Série « Icône de Base » : un soldat de la Marine et un pirate. Le choix est gardé dans le navigateur
// (et en ligne avec sauvegarde.js). Styles : icones-profil.css.

const CLE_ICONE = "tcg-one-piece/icone";

// Contour commun des dessins
const TRAIT = `stroke="#1f1610" stroke-linejoin="round" stroke-linecap="round"`;

const ICONES_PROFIL = [
  {
    id: "marine",
    serie: "Icône de Base",
    nom: "Soldat de la Marine",
    // Fond ciel, mouette ; casquette blanche à bande bleue, col marin bleu à liseré blanc
    dessin: `
      <defs>
        <radialGradient id="icone-fond-marine" cx="50%" cy="30%" r="80%">
          <stop offset="0" stop-color="#d6edfb" />
          <stop offset="1" stop-color="#4f97d1" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#icone-fond-marine)" />
      <path d="M13 25q3.5-3.5 7 0q3.5-3.5 7 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
      <path d="M74 18q2.5-2.5 5 0q2.5-2.5 5 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.8" />
      <path d="M14 100C16 82 31 74 50 74S84 82 86 100Z" fill="#fbfbf7" ${TRAIT} stroke-width="2.5" />
      <path d="M33 76 50 97 67 76 59 74 50 87 41 74Z" fill="#2d5fae" ${TRAIT} stroke-width="2" />
      <path d="M37.5 79 50 93.5 62.5 79" fill="none" stroke="#fff" stroke-width="1.3" />
      <path d="M43 64v11q7 4 14 0V64z" fill="#e9b98f" ${TRAIT} stroke-width="2" />
      <ellipse cx="32.5" cy="55" rx="3.6" ry="5" fill="#f3c9a0" ${TRAIT} stroke-width="2" />
      <ellipse cx="67.5" cy="55" rx="3.6" ry="5" fill="#f3c9a0" ${TRAIT} stroke-width="2" />
      <path d="M33 48C33 37 67 37 67 48v6c0 12-8 19-17 19s-17-7-17-19z" fill="#f3c9a0" ${TRAIT} stroke-width="2.5" />
      <path d="M29.5 46.5C29.5 25 70.5 25 70.5 46.5Z" fill="#fbfbf7" ${TRAIT} stroke-width="2.5" />
      <path d="M30 40.5h40v6H30z" fill="#2d5fae" ${TRAIT} stroke-width="2" />
      <path d="M38.5 52.5l6 1.2M61.5 52.5l-6 1.2" fill="none" ${TRAIT} stroke-width="2.2" />
      <circle cx="43.5" cy="58" r="2.1" fill="#1f1610" />
      <circle cx="56.5" cy="58" r="2.1" fill="#1f1610" />
      <circle cx="39" cy="63.5" r="2.6" fill="#e8846b" opacity="0.35" />
      <circle cx="61" cy="63.5" r="2.6" fill="#e8846b" opacity="0.35" />
      <path d="M45.5 66.5q4.5 2.6 9 0" fill="none" ${TRAIT} stroke-width="2" />`,
  },
  {
    id: "pirate",
    serie: "Icône de Base",
    nom: "Pirate",
    // Fond coucher de soleil ; bandana rouge à pois noué sur le côté, bandeau sur l'œil, anneau doré,
    // barbe de trois jours, gilet rouge sur chemise rayée
    dessin: `
      <defs>
        <radialGradient id="icone-fond-pirate" cx="50%" cy="30%" r="80%">
          <stop offset="0" stop-color="#fde7ae" />
          <stop offset="1" stop-color="#df8c3c" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#icone-fond-pirate)" />
      <path d="M14 100C16 82 31 74 50 74S84 82 86 100Z" fill="#fbfbf7" ${TRAIT} stroke-width="2.5" />
      <path d="M41 83h18M42 90.5h16M43 98h14" fill="none" stroke="#2d5fae" stroke-width="3" />
      <path d="M14 100C16 84 27 77 39 75l5 25Z" fill="#b8322a" ${TRAIT} stroke-width="2.2" />
      <path d="M86 100C84 84 73 77 61 75l-5 25Z" fill="#b8322a" ${TRAIT} stroke-width="2.2" />
      <path d="M43 64v11q7 4 14 0V64z" fill="#d9a06e" ${TRAIT} stroke-width="2" />
      <ellipse cx="32.5" cy="55" rx="3.6" ry="5" fill="#e8b07c" ${TRAIT} stroke-width="2" />
      <ellipse cx="67.5" cy="55" rx="3.6" ry="5" fill="#e8b07c" ${TRAIT} stroke-width="2" />
      <circle cx="68" cy="62.5" r="2.6" fill="none" stroke="#e3b02f" stroke-width="1.6" />
      <path d="M33 48C33 37 67 37 67 48v6c0 12-8 19-17 19s-17-7-17-19z" fill="#e8b07c" ${TRAIT} stroke-width="2.5" />
      <path d="M35.5 60c2 8 7 12.5 14.5 12.5S62.5 68 64.5 60c-3 4.5-8 6.5-14.5 6.5S38.5 64.5 35.5 60z" fill="#5b4a39" opacity="0.28" />
      <path d="M31 50.5C28.5 29 71.5 29 69 50.5 61.5 45.5 38.5 45.5 31 50.5Z" fill="#c8372d" ${TRAIT} stroke-width="2.5" />
      <g fill="#fbe3c0">
        <circle cx="41" cy="38.5" r="1.4" />
        <circle cx="51" cy="35" r="1.4" />
        <circle cx="60.5" cy="39" r="1.4" />
        <circle cx="46" cy="44" r="1.2" />
        <circle cx="56" cy="44" r="1.2" />
      </g>
      <path d="M31.5 48l-10.5 1.5 4.5 5.5Z" fill="#c8372d" ${TRAIT} stroke-width="2" />
      <path d="M31.5 49l-8 9.5 5 1.5Z" fill="#a82c24" ${TRAIT} stroke-width="2" />
      <path d="M38.5 53l6.5-.6" fill="none" ${TRAIT} stroke-width="2.2" />
      <circle cx="43.5" cy="58" r="2.1" fill="#1f1610" />
      <path d="M51.5 55.5 67 51.5M61.5 58.5 66.5 60" fill="none" stroke="#1f1610" stroke-width="1.6" stroke-linecap="round" />
      <ellipse cx="56.5" cy="58" rx="5" ry="4.4" fill="#1f1610" />
      <path d="M44.5 66.5q5.5 3.6 11-1" fill="none" ${TRAIT} stroke-width="2" />
      <path d="M52.6 66.3l.9 2.3 1.6-.9-.4-2.2z" fill="#f1d48c" stroke="#1f1610" stroke-width="0.8" />`,
  },
];

const ICONE_DE_BASE = "pirate";

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
  jeton.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${icone.dessin}</svg>`;
  return jeton;
}
