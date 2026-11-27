// Résultats des votes pour les cadres de la Boutique (outil local, non déployé) :
//   node outils/resultats-votes.mjs
// Lit les votes sur le serveur du jeu (GET /api/votes/resultats) et les classe, catégorie par catégorie,
// avec les noms de bordures.js.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://tcg-one-piece-test.rogerdylan83.workers.dev";
const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

// Le catalogue du jeu (bordures.js est un script de navigateur : on l'évalue dans une fonction)
const { CATEGORIES_BORDURES, BORDURES } = new Function(
  `${readFileSync(join(racine, "bordures.js"), "utf8")}; return { CATEGORIES_BORDURES, BORDURES };`,
)();

const reponse = await fetch(`${SITE}/api/votes/resultats`);
if (!reponse.ok) throw new Error(`Le serveur a répondu ${reponse.status}`);
const { votants, votes } = await reponse.json();

console.log(`Votants : ${votants}\n`);
for (const categorie of CATEGORIES_BORDURES) {
  console.log(`── ${categorie.nom} ──`);
  BORDURES.filter(bordure => bordure.categorie === categorie.id)
    .map(bordure => ({ nom: bordure.nom, n: votes[bordure.id] || 0 }))
    .sort((a, b) => b.n - a.n || a.nom.localeCompare(b.nom, "fr"))
    .forEach(({ nom, n }, rang) => console.log(`${String(rang + 1).padStart(2)}. ${nom} : ${n} vote${n > 1 ? "s" : ""}`));
  console.log("");
}
