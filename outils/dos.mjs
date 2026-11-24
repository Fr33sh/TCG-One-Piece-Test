// Fabrique le dos des cartes d'Anima TCG (modèle « Blanc épuré », choisi le 24/11/2026) au format des cartes
// (1260 × 1760, coins arrondis) : carte blanche, double cadre noir fin, le logo 魂 noir à anneau prisma au centre,
// « ANIMA TCG » dessous et un petit 魂 dans deux coins opposés. Briques du logo : anima.mjs.
//
// Lancer depuis le dossier outils :  node dos.mjs
// Produit : assets/cartes/dos.svg

import { writeFileSync } from "node:fs";
import { chemin, cheminCentre, degradePrisma, kanji, mot, symbole } from "./anima.mjs";

const L = 1260;
const H = 1760;
const CX = L / 2;
const NOIR = "#0b0b0d";

// Petits symboles 魂 dans deux coins opposés (le dos se lit dans les deux sens)
const coins = [[150, 150], [L - 150, H - 150]].map(([x, y]) =>
  `<path d="${cheminCentre(kanji, "魂", 70, x, y)}" fill="${NOIR}" />`).join("");

writeFileSync(chemin("assets/cartes/dos.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}">
  <defs>
    <clipPath id="coins"><rect width="${L}" height="${H}" rx="70" /></clipPath>
    ${degradePrisma("prisma")}
  </defs>
  <g clip-path="url(#coins)">
    <rect width="${L}" height="${H}" fill="#fff" />
    <rect x="58" y="58" width="${L - 116}" height="${H - 116}" rx="42" fill="none" stroke="${NOIR}" stroke-width="7" />
    <rect x="84" y="84" width="${L - 168}" height="${H - 168}" rx="26" fill="none" stroke="${NOIR}" stroke-opacity="0.35" stroke-width="2.5" />
    ${coins}
    ${symbole(CX, 790, 300, "prisma", { encre: NOIR, cercle: NOIR, opaciteCercle: 0.2 })}
    ${mot("ANIMA", CX, 1250, 110, NOIR)}
    ${mot("TCG", CX, 1370, 46, NOIR, 30)}
  </g>
</svg>
`);

console.log("Dos des cartes créé.");
