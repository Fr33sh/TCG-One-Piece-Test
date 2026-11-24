// Fabrique le logo d'Anima TCG et les icônes de l'appli : le kanji 魂 (« l'âme ») blanc dans un cercle à liseré
// prisma, et le mot ANIMA. Les lettres sont converties en dessins (chemins SVG), pour un rendu identique sur tous
// les appareils. Polices : Noto Serif JP Bold et Lato Bold (licence OFL), réduites aux seuls signes utiles.
//
// Lancer depuis le dossier outils :  node logo.mjs
// Produit : assets/logo/anima-symbole.svg, assets/logo/anima.svg, assets/icones/*.png

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";

const RACINE = new URL("../", import.meta.url);
const chemin = relatif => new URL(relatif, RACINE);

// Un Buffer de Node partage parfois sa mémoire : on n'en garde que la partie du fichier
function lirePolice(nom) {
  const octets = readFileSync(new URL(nom, import.meta.url));
  return opentype.parse(octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength));
}

const kanji = lirePolice("noto-serif-jp-tamashii.ttf");
const lato = lirePolice("lato-700-anima.ttf");

const PRISMA = ["#ff7eb6", "#ffb86b", "#fff07a", "#7dffc4", "#7cc8ff", "#b98cff"];
const degradePrisma = id => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    ${PRISMA.map((couleur, i) => `<stop offset="${i / (PRISMA.length - 1)}" stop-color="${couleur}" />`).join("")}
  </linearGradient>`;

// Chemin d'un texte, centré horizontalement sur cx et verticalement sur cy (boîte englobante réelle)
function cheminCentre(police, texte, taille, cx, cy, espacement = 0) {
  let x = 0;
  const morceaux = [];
  for (const glyphe of police.stringToGlyphs(texte)) {
    morceaux.push(glyphe.getPath(x, 0, taille));
    x += (glyphe.advanceWidth / police.unitsPerEm) * taille + espacement;
  }
  const boites = morceaux.map(m => m.getBoundingBox());
  const x1 = Math.min(...boites.map(b => b.x1)), x2 = Math.max(...boites.map(b => b.x2));
  const y1 = Math.min(...boites.map(b => b.y1)), y2 = Math.max(...boites.map(b => b.y2));
  const dx = cx - (x1 + x2) / 2, dy = cy - (y1 + y2) / 2;
  return morceaux.map(m => {
    for (const c of m.commands) {
      for (const [kx, ky] of [["x", "y"], ["x1", "y1"], ["x2", "y2"]]) {
        if (kx in c) { c[kx] += dx; c[ky] += dy; }
      }
    }
    return m.toPathData(2);
  }).join(" ");
}

// Le symbole : cercle prisma, cercle blanc fin, kanji 魂 ; centré en (cx, cy), rayon r
function symbole(cx, cy, r, idDegrade) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${idDegrade})" stroke-width="${(r * 0.077).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.865).toFixed(2)}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="${(r * 0.02).toFixed(2)}" />
    <path d="${cheminCentre(kanji, "魂", r * 1.15, cx, cy)}" fill="#fff" />`;
}

mkdirSync(chemin("assets/logo/"), { recursive: true });

// 1. Le symbole seul, fond transparent
writeFileSync(chemin("assets/logo/anima-symbole.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>${degradePrisma("prisma")}</defs>${symbole(64, 64, 58, "prisma")}
</svg>
`);

// 2. Le logo complet : symbole et mot ANIMA dessous, fond transparent
writeFileSync(chemin("assets/logo/anima.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170">
  <defs>${degradePrisma("prisma")}</defs>${symbole(80, 64, 56, "prisma")}
  <path d="${cheminCentre(lato, "ANIMA", 24, 80, 150, 7)}" fill="#fff" />
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
