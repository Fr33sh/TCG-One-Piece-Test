// Briques du logo d'Anima TCG, partagées par les outils (logo.mjs, dos.mjs) : polices réduites aux signes utiles,
// dégradé prisma, lettres converties en chemins SVG, symbole 魂 dans son cercle prisma.

import { readFileSync } from "node:fs";
import opentype from "opentype.js";

// Un Buffer de Node partage parfois sa mémoire : on n'en garde que la partie du fichier
function lirePolice(nom) {
  const octets = readFileSync(new URL(nom, import.meta.url));
  return opentype.parse(octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength));
}

export const kanji = lirePolice("noto-serif-jp-tamashii.ttf");
export const lato = lirePolice("lato-700-anima.ttf");

export const RACINE = new URL("../", import.meta.url);
export const chemin = relatif => new URL(relatif, RACINE);

export const PRISMA = ["#ff7eb6", "#ffb86b", "#fff07a", "#7dffc4", "#7cc8ff", "#b98cff"];

export const degradePrisma = (id, { x2 = 1, y2 = 1, opacite = 1 } = {}) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">
    ${PRISMA.map((couleur, i) => `<stop offset="${(i / (PRISMA.length - 1)).toFixed(2)}" stop-color="${couleur}" stop-opacity="${opacite}" />`).join("")}
  </linearGradient>`;

// Chemin d'un texte, centré horizontalement sur cx et verticalement sur cy (boîte englobante réelle)
export function cheminCentre(police, texte, taille, cx, cy, espacement = 0) {
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

// Le symbole : cercle prisma, cercle fin, kanji 魂 ; centré en (cx, cy), rayon r. Couleurs réglables pour les
// fonds clairs (kanji noir) comme pour les fonds sombres (kanji blanc).
export function symbole(cx, cy, r, idDegrade, { encre = "#fff", cercle = "#fff", opaciteCercle = 0.35 } = {}) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${idDegrade})" stroke-width="${(r * 0.077).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.865).toFixed(2)}" fill="none" stroke="${cercle}" stroke-opacity="${opaciteCercle}" stroke-width="${(r * 0.02).toFixed(2)}" />
    <path d="${cheminCentre(kanji, "魂", r * 1.15, cx, cy)}" fill="${encre}" />`;
}

// Le mot ANIMA (ou TCG…), en Lato Bold, centré en (cx, cy)
export const mot = (texte, cx, cy, taille, couleur, espacement = taille * 0.3) =>
  `<path d="${cheminCentre(lato, texte, taille, cx, cy, espacement)}" fill="${couleur}" />`;
