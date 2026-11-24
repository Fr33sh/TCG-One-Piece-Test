// Fabrique les modèles de dos de carte d'Anima TCG (format des cartes : 1260 × 1760, coins arrondis) et une page
// d'aperçu pour les comparer. Briques du logo : anima.mjs.
//
// Lancer depuis le dossier outils :  node dos.mjs
// Produit : assets/cartes/dos-modeles/dos-1.svg … dos-6.svg et apercu-dos.html (page temporaire)

import { writeFileSync, mkdirSync } from "node:fs";
import { chemin, cheminCentre, degradePrisma, kanji, mot, symbole } from "./anima.mjs";

const L = 1260;
const H = 1760;
const CX = L / 2;
const NOIR = "#0b0b0d";

const carte = (defs, contenu) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}">
  <defs>
    <clipPath id="coins"><rect width="${L}" height="${H}" rx="70" /></clipPath>
    ${degradePrisma("prisma")}
    ${degradePrisma("prisma-h", { y2: 0 })}
    ${defs}
  </defs>
  <g clip-path="url(#coins)">${contenu}
  </g>
</svg>
`;

// Double cadre fin, à l'intérieur du bord de la carte
const cadre = (couleur, opacite = 1) => `
    <rect x="58" y="58" width="${L - 116}" height="${H - 116}" rx="42" fill="none" stroke="${couleur}" stroke-opacity="${opacite}" stroke-width="7" />
    <rect x="84" y="84" width="${L - 168}" height="${H - 168}" rx="26" fill="none" stroke="${couleur}" stroke-opacity="${opacite * 0.35}" stroke-width="2.5" />`;

// Petits symboles 魂 dans deux coins opposés (le dos se lit dans les deux sens)
const coins = couleur => [[150, 150], [L - 150, H - 150]].map(([x, y]) =>
  `<path d="${cheminCentre(kanji, "魂", 70, x, y)}" fill="${couleur}" />`).join("");

const MODELES = [
  {
    nom: "Blanc épuré",
    texte: "Carte blanche, double cadre noir fin, le logo au centre en noir avec son anneau prisma. Simple et élégant.",
    svg: carte("", `
    <rect width="${L}" height="${H}" fill="#fff" />${cadre(NOIR)}${coins(NOIR)}
    ${symbole(CX, 790, 300, "prisma", { encre: NOIR, cercle: NOIR, opaciteCercle: 0.2 })}
    ${mot("ANIMA", CX, 1250, 110, NOIR)}
    ${mot("TCG", CX, 1370, 46, NOIR, 30)}`),
  },
  {
    nom: "Blanc irisé",
    texte: "Carte blanche traversée de reflets pastel irisés, comme une carte holographique ; cadre prisma.",
    svg: carte(`
    ${degradePrisma("pastel", { opacite: 0.45 })}
    <linearGradient id="reflet" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.3" stop-color="#fff" stop-opacity="0" /><stop offset="0.45" stop-color="#fff" stop-opacity="0.9" />
      <stop offset="0.55" stop-color="#fff" stop-opacity="0" />
    </linearGradient>`, `
    <rect width="${L}" height="${H}" fill="#fff" />
    <rect width="${L}" height="${H}" fill="url(#pastel)" />
    <rect width="${L}" height="${H}" fill="url(#reflet)" />
    <rect x="58" y="58" width="${L - 116}" height="${H - 116}" rx="42" fill="none" stroke="url(#prisma)" stroke-width="12" />
    <rect x="90" y="90" width="${L - 180}" height="${H - 180}" rx="24" fill="none" stroke="#fff" stroke-width="4" />
    ${symbole(CX, 790, 300, "prisma", { encre: NOIR, cercle: NOIR, opaciteCercle: 0.2 })}
    ${mot("ANIMA", CX, 1250, 110, NOIR)}`),
  },
  {
    nom: "Noir prisma",
    texte: "Carte noire comme l'appli, lueur douce au centre, logo blanc, cadre blanc et liseré prisma.",
    svg: carte(`
    <radialGradient id="lueur" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#26262f" /><stop offset="1" stop-color="${NOIR}" /></radialGradient>`, `
    <rect width="${L}" height="${H}" fill="url(#lueur)" />
    <rect x="58" y="58" width="${L - 116}" height="${H - 116}" rx="42" fill="none" stroke="#fff" stroke-width="6" />
    <rect x="84" y="84" width="${L - 168}" height="${H - 168}" rx="26" fill="none" stroke="url(#prisma)" stroke-width="5" />${coins("rgb(255 255 255 / 25%)")}
    ${symbole(CX, 790, 300, "prisma")}
    ${mot("ANIMA", CX, 1250, 110, "#fff")}
    ${mot("TCG", CX, 1370, 46, "#a9a9b3", 30)}`),
  },
  {
    nom: "Motif 魂",
    texte: "Carte blanche couverte d'un motif discret de petits 魂 en biais, grand médaillon noir au centre.",
    svg: carte(`
    <pattern id="motif" width="150" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
      <path d="${cheminCentre(kanji, "魂", 62, 75, 75)}" fill="${NOIR}" fill-opacity="0.07" />
    </pattern>`, `
    <rect width="${L}" height="${H}" fill="#fff" />
    <rect width="${L}" height="${H}" fill="url(#motif)" />${cadre(NOIR)}
    <circle cx="${CX}" cy="${H / 2}" r="380" fill="${NOIR}" />
    <circle cx="${CX}" cy="${H / 2}" r="380" fill="none" stroke="#fff" stroke-width="14" />
    ${symbole(CX, H / 2 - 40, 250, "prisma")}
    ${mot("ANIMA", CX, H / 2 + 270, 70, "#fff", 22)}`),
  },
  {
    nom: "Rayons",
    texte: "Carte blanche à rayons gris très clairs, comme une explosion de manga, grand anneau prisma autour du logo.",
    svg: carte("", `
    <rect width="${L}" height="${H}" fill="#fff" />
    <g fill="#f0f0f3">${Array.from({ length: 36 }, (_, i) => {
      const a1 = (i * 10 * Math.PI) / 180, a2 = ((i * 10 + 5) * Math.PI) / 180, R = 1500;
      return `<path d="M${CX} 820L${(CX + R * Math.cos(a1)).toFixed(1)} ${(820 + R * Math.sin(a1)).toFixed(1)}L${(CX + R * Math.cos(a2)).toFixed(1)} ${(820 + R * Math.sin(a2)).toFixed(1)}Z" />`;
    }).join("")}</g>${cadre(NOIR)}
    <circle cx="${CX}" cy="820" r="420" fill="#fff" stroke="url(#prisma)" stroke-width="16" />
    ${symbole(CX, 820, 300, "prisma", { encre: NOIR, cercle: NOIR, opaciteCercle: 0.2 })}
    ${mot("ANIMA", CX, 1400, 100, NOIR)}`),
  },
  {
    nom: "Diagonale",
    texte: "Moitié blanche, moitié noire, séparées par un trait prisma ; le logo au centre, à cheval sur les deux.",
    svg: carte("", `
    <rect width="${L}" height="${H}" fill="#fff" />
    <path d="M${L} 300V${H}H0V${H - 300}Z" fill="${NOIR}" />
    <path d="M${L} 300L0 ${H - 300}" stroke="url(#prisma-h)" stroke-width="18" />
    <rect x="58" y="58" width="${L - 116}" height="${H - 116}" rx="42" fill="none" stroke="#888" stroke-width="6" />
    <circle cx="${CX}" cy="${H / 2}" r="330" fill="#fff" stroke="${NOIR}" stroke-width="10" />
    ${symbole(CX, H / 2, 280, "prisma", { encre: NOIR, cercle: NOIR, opaciteCercle: 0.2 })}
    ${mot("ANIMA", 330, 230, 80, NOIR, 24)}
    ${mot("ANIMA", L - 330, H - 230, 80, "#fff", 24)}`),
  },
];

mkdirSync(chemin("assets/cartes/dos-modeles/"), { recursive: true });
MODELES.forEach((modele, i) => writeFileSync(chemin(`assets/cartes/dos-modeles/dos-${i + 1}.svg`), modele.svg));

// Page d'aperçu (temporaire) : chaque dos en grand, sur fond noir
writeFileSync(chemin("apercu-dos.html"), `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Aperçu : dos des cartes</title>
  <!-- Page TEMPORAIRE, fabriquée par outils/dos.mjs : modèles de dos de carte. À supprimer après le choix. -->
  <link rel="stylesheet" href="theme.css">
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { padding: max(env(safe-area-inset-top), 24px) 14px 40px; background: var(--fond-eclaire) fixed; color: var(--texte); font-family: var(--police-texte); }
    h1 { font: 400 24px var(--police-titre); text-align: center; }
    .aide { margin: 6px 0 22px; color: var(--texte-doux); font-size: 14px; text-align: center; }
    .modeles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px 14px; max-width: 520px; margin: 0 auto; }
    figure { margin: 0; }
    figure img { display: block; width: 100%; border-radius: 6%/4.3%; box-shadow: 0 10px 24px rgb(0 0 0 / 60%); }
    figcaption { margin-top: 8px; color: var(--texte-doux); font-size: 12px; line-height: 1.3; }
    figcaption b { display: block; color: var(--texte); font: 400 17px var(--police-titre); }
  </style>
</head>
<body>
  <h1>Dos des cartes : ${MODELES.length} modèles</h1>
  <p class="aide">Réponds avec un numéro (ou une combinaison).</p>
  <div class="modeles">
${MODELES.map((m, i) => `    <figure><img src="assets/cartes/dos-modeles/dos-${i + 1}.svg" alt=""><figcaption><b>${i + 1}. ${m.nom}</b>${m.texte}</figcaption></figure>`).join("\n")}
  </div>
</body>
</html>
`);

console.log(`${MODELES.length} modèles de dos créés.`);
