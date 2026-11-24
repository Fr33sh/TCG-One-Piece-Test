// Fabrique l'affichage complet d'une carte, utilisé par la collection et l'ouverture des boosters.
// Une carte montre : l'illustration en pleine carte, sa rareté, son nom, sa description (2 lignes au plus),
// son équipe, son rôle et son numéro. Les attaques, talents et PV des données ne sont plus affichés.

const LETTRES_RANG = { 1: "A", 2: "S", 3: "SR", 4: "SSR" };

function element(balise, classe, texte) {
  const el = document.createElement(balise);
  if (classe) el.className = classe;
  if (texte !== undefined) el.textContent = texte;
  return el;
}

function creerCarte(carte) {
  const racine = element("article", `carte carte--${carte.camp} carte--rang-${carte.rang}`);
  const cadre = element("div", "carte__cadre");
  const interieur = element("div", "carte__interieur");

  // En-tête : la rareté, en haut à droite
  const entete = element("header", "carte__entete");
  const rang = element("div", "carte__rang");
  rang.append(element("span", "carte__rang-label", "RANG"));
  rang.append(element("span", "carte__rang-lettre", LETTRES_RANG[carte.rang]));
  entete.append(rang);

  const illustration = element("div", "carte__illustration");
  if (carte.illustration) {
    // Une liste d'images (duos, trios) s'affiche côte à côte
    const images = element("div", "carte__images");
    for (const source of [].concat(carte.illustration)) {
      const image = element("img", "carte__image");
      image.src = source;
      image.alt = carte.nom;
      image.style.objectPosition = carte.cadrage || "50% 50%";
      images.append(image);
    }
    illustration.classList.add("carte__illustration--image");
    illustration.append(images);
  } else {
    illustration.append(element("span", "carte__illustration-label", "[ILLUSTRATION]"));
  }

  const nom = element("h3", "carte__nom", carte.nom);
  if (carte.nom.length > 22) nom.classList.add("carte__nom--tres-long");
  else if (carte.nom.length > 16) nom.classList.add("carte__nom--long");

  // Bas de la carte : la description, puis l'équipe, le rôle et le numéro
  const textes = element("div", "carte__texte");
  const pied = element("footer", "carte__pied");
  const description = element("div", "carte__proprietes");
  description.append(element("span", "carte__proprietes-label", "DESCRIPTION"));
  description.append(element("p", "carte__proprietes-texte", carte.proprietes));
  const ref = element("div", "carte__ref");
  ref.append(element("div", "carte__ref-ligne", [carte.equipe, carte.role].filter(Boolean).join(" · ")));
  ref.append(element("div", "", carte.id));
  pied.append(description, ref);
  textes.append(pied);

  interieur.append(entete, illustration, nom, textes);
  cadre.append(interieur);
  racine.append(cadre);
  return racine;
}

// La description tient sur 2 lignes au plus : la police est réduite (jusqu'à 25 %) si besoin
function ajusterProprietes(racine = document) {
  for (const texte of racine.querySelectorAll(".carte__proprietes-texte")) {
    texte.style.fontSize = "";
    let taille = parseFloat(getComputedStyle(texte).fontSize);
    const minimum = taille * 0.75;
    while (texte.getBoundingClientRect().height > taille * 1.2 * 2 + 0.5 && taille > minimum) {
      taille -= 0.25;
      texte.style.fontSize = `${taille}px`;
    }
  }
}
