// Boutique : les bordures de cartes (bordures.js), une colonne par catégorie d'animation, chacune montrée sur la
// même carte du jeu. Les joueurs votent pour leurs cadres préférés : 5 au plus par catégorie, enregistrés par le
// serveur (compte Discord nécessaire). L'achat ouvrira quand le prix et l'application aux cartes seront décidés.

const VOTES_PAR_CATEGORIE = 5;
const carteVitrine = CARTES.find(carte => carte.rang === 4 && carte.illustration) || CARTES[0];
const vitrine = document.querySelector("[data-bordures]");
const messageVotes = document.querySelector("[data-message-votes]");
let mesVotes = new Set();
let voteEnCours = false;

function creerArticleBordure(bordure) {
  const article = element("article", "article-bordure");
  const carte = creerCarte(carteVitrine);
  carte.classList.add(`bordure--${bordure.id}`);
  const vote = element("button", "bouton-vote", "Voter");
  vote.type = "button";
  vote.dataset.vote = bordure.id;
  vote.addEventListener("click", () => voter(bordure));
  article.append(carte, element("h3", "article-bordure__nom", bordure.nom),
    element("p", "article-bordure__description", bordure.description), vote);
  return article;
}

vitrine.replaceChildren(...CATEGORIES_BORDURES.map(categorie => {
  const colonne = element("section", "colonne-bordures");
  colonne.dataset.categorie = categorie.id;
  const entete = element("header", "colonne-bordures__entete");
  entete.append(element("h3", "colonne-bordures__titre", categorie.nom), element("span", "colonne-bordures__votes"));
  const liste = element("div", "colonne-bordures__liste");
  liste.append(...BORDURES.filter(bordure => bordure.categorie === categorie.id).map(creerArticleBordure));
  colonne.append(entete, liste);
  return colonne;
}));

// Boutons « Voter » / « ✓ Voté » et compteur « 2 / 5 » de chaque colonne
function afficherVotes() {
  for (const bouton of vitrine.querySelectorAll("[data-vote]")) {
    const vote = mesVotes.has(bouton.dataset.vote);
    bouton.textContent = vote ? "✓ Voté" : "Voter";
    bouton.classList.toggle("bouton-vote--vote", vote);
  }
  for (const colonne of vitrine.querySelectorAll("[data-categorie]")) {
    const nombre = BORDURES.filter(b => b.categorie === colonne.dataset.categorie && mesVotes.has(b.id)).length;
    colonne.querySelector(".colonne-bordures__votes").textContent = `${nombre} / ${VOTES_PAR_CATEGORIE} votes`;
  }
}

function direVotes(texte, erreur = false) {
  messageVotes.textContent = texte;
  messageVotes.classList.toggle("message-page--erreur", erreur);
}

async function voter(bordure) {
  if (voteEnCours) return;
  if (!compteLie()) {
    direVotes("Lie ton compte Discord dans ton Profil pour voter.", true);
    return;
  }
  // Limite vérifiée tout de suite (le serveur la vérifie aussi)
  const dansCategorie = BORDURES.filter(b => b.categorie === bordure.categorie && mesVotes.has(b.id)).length;
  if (!mesVotes.has(bordure.id) && dansCategorie >= VOTES_PAR_CATEGORIE) {
    direVotes(`Tu as déjà ${VOTES_PAR_CATEGORIE} votes dans cette catégorie : retire un vote pour en donner un autre.`, true);
    return;
  }
  voteEnCours = true;
  try {
    const { votes } = await appelerServeur("votes", { cadre: bordure.id });
    mesVotes = new Set(votes);
    direVotes(mesVotes.has(bordure.id) ? `Vote enregistré pour ${bordure.nom} !` : `Vote retiré pour ${bordure.nom}.`);
    afficherVotes();
  } catch (erreur) {
    direVotes(erreur.message, true);
  } finally {
    voteEnCours = false;
  }
}

afficherVotes();
if (compteLie()) {
  appelerServeur("votes").then(({ votes }) => {
    mesVotes = new Set(votes);
    afficherVotes();
  }).catch(() => {});
}

document.fonts.ready.then(() => ajusterProprietes(vitrine));

// ── Onglets : la monnaie en haut (Animas, Tokens), le rayon en bas (Décorations, Événements) ──
// Chaque rayon a son panneau data-rayon="<monnaie>-<rayon>" ; sans panneau, le rayon affiche « Bientôt ».

const choixBoutique = { monnaie: "animas", rayon: "decorations" };

function afficherRayon() {
  for (const bouton of document.querySelectorAll("[data-monnaie]")) {
    bouton.setAttribute("aria-selected", String(bouton.dataset.monnaie === choixBoutique.monnaie));
  }
  for (const bouton of document.querySelectorAll("[data-rayon-onglet]")) {
    bouton.setAttribute("aria-selected", String(bouton.dataset.rayonOnglet === choixBoutique.rayon));
  }
  const cle = `${choixBoutique.monnaie}-${choixBoutique.rayon}`;
  let trouve = false;
  for (const panneau of document.querySelectorAll("[data-rayon]")) {
    panneau.hidden = panneau.dataset.rayon !== cle;
    trouve ||= !panneau.hidden;
  }
  document.querySelector("[data-rayon-vide]").hidden = trouve;
  window.scrollTo(0, 0);
}

for (const bouton of document.querySelectorAll("[data-monnaie]")) {
  bouton.addEventListener("click", () => {
    choixBoutique.monnaie = bouton.dataset.monnaie;
    afficherRayon();
  });
}
for (const bouton of document.querySelectorAll("[data-rayon-onglet]")) {
  bouton.addEventListener("click", () => {
    choixBoutique.rayon = bouton.dataset.rayonOnglet;
    afficherRayon();
  });
}
afficherRayon();
