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
