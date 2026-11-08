// Fabrique le booster East Blue (styles dans pack.css), utilisé par l'accueil et par la collection.

function creerPack() {
  const booster = document.createElement("div");
  booster.className = "booster";
  booster.innerHTML = `
    <div class="pack" role="img" aria-label="Booster de la collection East Blue">
      <div class="pack__entete">
        <span class="pack__logo"><img class="pack__logo-o" src="assets/packs/logo.png" alt="O">ne Piece</span>
        <span class="pack__sous-titre">Trading Card Game</span>
        <span class="pack__edition">Pocket</span>
        <span class="pack__code">EB</span>
      </div>
      <div class="pack__illustration">
        <img src="assets/packs/east-blue.jpg" alt="">
        <!-- Nom de la collection en arc de cercle, en relief, avec un reflet synchronisé sur celui du paquet -->
        <svg class="pack__titre" viewBox="0 0 300 120" aria-hidden="true">
          <defs>
            <path id="arc-titre" d="M 10 108 Q 150 18 290 108" />
            <linearGradient id="degrade-titre" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#5b9cf0" />
              <stop offset="0.45" stop-color="#2a6fd0" />
              <stop offset="1" stop-color="#1749a8" />
            </linearGradient>
            <linearGradient id="brillance-titre" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
              <stop offset="0.5" stop-color="#fff" stop-opacity="0.9" />
              <stop offset="0.65" stop-color="#fff" stop-opacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0; 1 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
            </linearGradient>
          </defs>
          <g class="pack__titre-texte">
            <text fill="#040f2b" transform="translate(0 7)"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
            <text fill="#071a46" transform="translate(0 5.5)"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
            <text fill="#0b2662" transform="translate(0 4)"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
            <text fill="#10347e" transform="translate(0 2.5)"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
            <text fill="url(#degrade-titre)" stroke="#040f2b" stroke-width="1.6" paint-order="stroke"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
            <text fill="url(#brillance-titre)"><textPath href="#arc-titre" startOffset="50%">EAST BLUE</textPath></text>
          </g>
        </svg>
      </div>
      <div class="pack__pied"></div>
      <span class="pack__reflet"></span>
    </div>`;
  return booster;
}
