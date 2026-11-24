// Fabrique le booster d'une série (styles dans pack.css), utilisé par l'accueil. Chaque série a son apparence :
// East Blue (One Piece) et Naruto, qui porte pour l'instant le logo du jeu en illustration.

const APPARENCES_PACK = {
  "east-blue": {
    classe: "",
    entete: `<span class="pack__logo"><img class="pack__logo-o" src="assets/packs/logo.png" alt="O">ne Piece</span>`,
    edition: "Pocket",
    illustration: `<img src="assets/packs/east-blue.jpg" alt="">`,
    titre: "EAST BLUE",
    degrade: ["#5b9cf0", "#2a6fd0", "#1749a8"],
    relief: ["#040f2b", "#071a46", "#0b2662", "#10347e"],
  },
  naruto: {
    classe: "pack--naruto",
    entete: `<span class="pack__logo">Naruto</span>`,
    edition: "Anima",
    illustration: `<img class="pack__illustration-logo" src="assets/logo/anima.svg" alt="">`,
    titre: "PAYS DES VAGUES",
    degrade: ["#ffc277", "#f28c28", "#c2500f"],
    relief: ["#2b1104", "#3f1a07", "#56240a", "#6e300e"],
  },
};

function creerPack(serie = SERIES[0]) {
  const a = APPARENCES_PACK[serie.id] || APPARENCES_PACK["east-blue"];
  const id = serie.id; // identifiants propres à chaque booster (plusieurs sur la même page)
  const lignes = [
    ...a.relief.map((couleur, i) => `<text fill="${couleur}" transform="translate(0 ${7 - i * 1.5})"><textPath href="#arc-titre-${id}" startOffset="50%">${a.titre}</textPath></text>`),
    `<text fill="url(#degrade-titre-${id})" stroke="${a.relief[0]}" stroke-width="1.6" paint-order="stroke"><textPath href="#arc-titre-${id}" startOffset="50%">${a.titre}</textPath></text>`,
    `<text fill="url(#brillance-titre-${id})"><textPath href="#arc-titre-${id}" startOffset="50%">${a.titre}</textPath></text>`,
  ];
  const booster = document.createElement("div");
  booster.className = "booster";
  booster.innerHTML = `
    <div class="pack ${a.classe}" role="img" aria-label="Booster de la collection ${serie.nom}">
      <div class="pack__entete">
        ${a.entete}
        <span class="pack__sous-titre">Trading Card Game</span>
        <span class="pack__edition">${a.edition}</span>
        <span class="pack__code">${serie.code}</span>
      </div>
      <div class="pack__illustration">
        ${a.illustration}
        <!-- Nom de la collection en arc de cercle, en relief, avec un reflet synchronisé sur celui du paquet -->
        <svg class="pack__titre${a.titre.length > 10 ? " pack__titre--long" : ""}" viewBox="0 0 300 120" aria-hidden="true">
          <defs>
            <path id="arc-titre-${id}" d="M 10 108 Q 150 18 290 108" />
            <linearGradient id="degrade-titre-${id}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${a.degrade[0]}" />
              <stop offset="0.45" stop-color="${a.degrade[1]}" />
              <stop offset="1" stop-color="${a.degrade[2]}" />
            </linearGradient>
            <linearGradient id="brillance-titre-${id}" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
              <stop offset="0.5" stop-color="#fff" stop-opacity="0.9" />
              <stop offset="0.65" stop-color="#fff" stop-opacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0; 1 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
            </linearGradient>
          </defs>
          <g class="pack__titre-texte">${lignes.join("")}</g>
        </svg>
      </div>
      <div class="pack__pied"></div>
      <span class="pack__reflet"></span>
    </div>`;
  return booster;
}
