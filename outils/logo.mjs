// Fabrique le logo d'Anima TCG et les icônes de l'appli : le kanji 魂 (« l'âme ») blanc dans un cercle à liseré
// prisma, et le mot ANIMA. Les lettres sont converties en dessins (chemins SVG), pour un rendu identique sur tous
// les appareils (briques communes : anima.mjs).
//
// Lancer depuis le dossier outils :  node logo.mjs
// Produit : assets/logo/anima-symbole.svg, assets/logo/anima.svg, assets/icones/*.png

import { writeFileSync, mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { chemin, degradePrisma, mot, symbole } from "./anima.mjs";

mkdirSync(chemin("assets/logo/"), { recursive: true });

// 1. Le symbole seul, fond transparent
writeFileSync(chemin("assets/logo/anima-symbole.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>${degradePrisma("prisma")}</defs>${symbole(64, 64, 58, "prisma")}
</svg>
`);

// 2. Le logo complet : symbole et mot ANIMA dessous, fond transparent
writeFileSync(chemin("assets/logo/anima.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170">
  <defs>${degradePrisma("prisma")}</defs>${symbole(80, 64, 56, "prisma")}
  ${mot("ANIMA", 80, 150, 24, "#fff", 7)}
</svg>
`);

// 3. Les icônes de l'appli : fond noir légèrement éclairé au centre, symbole au centre (zone sûre des icônes rondes)
function icone(taille) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${taille}" height="${taille}">
    <defs>${degradePrisma("prisma")}
      <radialGradient id="fond" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#22222a" /><stop offset="1" stop-color="#0b0b0d" /></radialGradient>
    </defs>
    <rect width="512" height="512" fill="url(#fond)" />${symbole(256, 256, 165, "prisma")}
  </svg>`;
  return new Resvg(svg, { fitTo: { mode: "width", value: taille } }).render().asPng();
}

for (const [nom, taille] of [["icone-1024.png", 1024], ["icone-512.png", 512], ["icone-192.png", 192], ["apple-touch-icon.png", 180]]) {
  writeFileSync(chemin(`assets/icones/${nom}`), icone(taille));
}

console.log("Logo et icônes Anima TCG créés.");
