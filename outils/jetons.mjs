// Fabrique les jetons de profil de base et la monnaie d'Anima TCG, avec le kanji 魂 converti en dessin (rendu
// identique sur tous les appareils). Briques du logo : anima.mjs. Choix du 24/11/2026.
//
// Lancer depuis le dossier outils :  node jetons.mjs
// Produit :
//   assets/icones-profil/ame-blanche.svg et ame-noire.svg : les deux jetons de profil de base
//   assets/monnaie/anima.svg : la monnaie du jeu, les « Animas » (pièce d'or au 魂, liseré prisma)
//   assets/icones/sceau.svg : les Sceaux (sceau rouge au 魂), qui font gagner du temps de recharge des boosters
//   outils/reserve/ : une monnaie gardée de côté (jeton hexagonal), non mise en ligne

import { writeFileSync, mkdirSync } from "node:fs";
import { chemin, cheminCentre, degradePrisma, kanji } from "./anima.mjs";

const tamashii = (taille, cx, cy) => cheminCentre(kanji, "魂", taille, cx, cy);
const svg = (contenu, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>${defs}</defs>${contenu}
</svg>
`;
const fondRadial = (id, centre, bord) =>
  `<radialGradient id="${id}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${centre}" /><stop offset="1" stop-color="${bord}" /></radialGradient>`;

mkdirSync(chemin("assets/icones-profil/"), { recursive: true });
mkdirSync(chemin("assets/monnaie/"), { recursive: true });
mkdirSync(new URL("reserve/", import.meta.url), { recursive: true });

// ── Jetons de profil de base : Âme blanche (noir sur blanc) et Âme noire (blanc sur noir) ──

writeFileSync(chemin("assets/icones-profil/ame-blanche.svg"), svg(`
  <rect width="100" height="100" fill="url(#fond)" />
  <path d="${tamashii(56, 50, 51)}" fill="#0b0b0d" />`, fondRadial("fond", "#ffffff", "#e3e3ea")));

writeFileSync(chemin("assets/icones-profil/ame-noire.svg"), svg(`
  <rect width="100" height="100" fill="url(#fond)" />
  <path d="${tamashii(56, 50, 51)}" fill="#ffffff" />`, fondRadial("fond", "#2a2a33", "#0b0b0d")));

// ── Monnaie : les Animas, pièce d'or frappée du 魂, liseré prisma ──

writeFileSync(chemin("assets/monnaie/anima.svg"), svg(`
  <circle cx="50" cy="50" r="44" fill="url(#or)" stroke="url(#prisma)" stroke-width="4" />
  <circle cx="50" cy="50" r="35" fill="none" stroke="#a8761a" stroke-width="2" />
  <path d="${tamashii(44, 50, 51)}" fill="#8a5a10" />`,
  `<radialGradient id="or" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff2b0" /><stop offset="0.6" stop-color="#e8b43a" /><stop offset="1" stop-color="#a8761a" /></radialGradient>
  ${degradePrisma("prisma")}`));

// ── Monnaie gardée de côté (non mise en ligne), puis le Sceau ──

writeFileSync(new URL("reserve/monnaie-jeton-hexagonal.svg", import.meta.url), svg(`
  <path d="M50 4l40 23v46L50 96 10 73V27z" fill="url(#argent)" stroke="#4a4f57" stroke-width="2.5" stroke-linejoin="round" />
  <path d="M50 14l31 18v36L50 86 19 68V32z" fill="#2a2d33" />
  <path d="${tamashii(38, 50, 51)}" fill="#f4f6f8" />`,
  `<linearGradient id="argent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8" /><stop offset="0.5" stop-color="#9aa1ab" /><stop offset="1" stop-color="#e3e7ec" /></linearGradient>`));

// Le sceau rouge : il remplace le sablier (temps de recharge des boosters, 1 Sceau = 1 heure)
writeFileSync(chemin("assets/icones/sceau.svg"), svg(`
  <rect x="8" y="8" width="84" height="84" rx="14" fill="url(#rouge)" stroke="#6e1410" stroke-width="2.5" />
  <rect x="16" y="16" width="68" height="68" rx="8" fill="none" stroke="#ffe6e0" stroke-width="3" />
  <path d="${tamashii(48, 50, 51)}" fill="#ffe6e0" />`,
  `<radialGradient id="rouge" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ff6b5a" /><stop offset="1" stop-color="#a8231a" /></radialGradient>`));

console.log("Jetons de profil, monnaie et monnaies de réserve créés.");
