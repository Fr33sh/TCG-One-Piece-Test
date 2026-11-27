// Boutique : les bordures de cartes (bordures.js), chacune montrée sur la même carte du jeu.
// L'achat ouvrira quand le prix et l'application aux cartes seront décidés.

const carteVitrine = CARTES.find(carte => carte.rang === 4 && carte.illustration) || CARTES[0];
const vitrine = document.querySelector("[data-bordures]");

vitrine.replaceChildren(...BORDURES.map(bordure => {
  const article = element("article", "article-bordure");
  const carte = creerCarte(carteVitrine);
  carte.classList.add(`bordure--${bordure.id}`);
  const achat = element("button", "petite-bulle article-bordure__achat", "Bientôt");
  achat.type = "button";
  achat.disabled = true;
  article.append(carte, element("h3", "article-bordure__nom", bordure.nom),
    element("p", "article-bordure__description", bordure.description), achat);
  return article;
}));

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
