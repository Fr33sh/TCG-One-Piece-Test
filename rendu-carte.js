// Fabrique l'affichage complet d'une carte (modèles du jeu), utilisé par la galerie et par le combat.

const TITRES_CAMP = { pirate: "WANTED", marine: "MARINE", civil: "CIVIL" };
const LETTRES_RANG = { 1: "A", 2: "S", 3: "SR", 4: "SSR" };

function element(balise, classe, texte) {
  const el = document.createElement(balise);
  if (classe) el.className = classe;
  if (texte !== undefined) el.textContent = texte;
  return el;
}

function creerCapacite(pastille, nom, texte, degats, estTalent) {
  const ligne = element("p", estTalent ? "capacite capacite--talent" : "capacite");
  ligne.append(element("span", "capacite__pastille", pastille));

  const corps = element("span", "capacite__corps");
  corps.append(element("span", "capacite__nom", nom));
  if (texte) corps.append(" " + texte);
  ligne.append(corps);

  ligne.append(element("span", "capacite__degats", degats || ""));
  return ligne;
}

function creerCarte(carte) {
  const racine = element("article", `carte carte--${carte.camp} carte--rang-${carte.rang}`);
  const cadre = element("div", "carte__cadre");
  const interieur = element("div", "carte__interieur");

  const entete = element("header", "carte__entete");
  entete.append(element("h2", "carte__titre", TITRES_CAMP[carte.camp]));
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
    illustration.append(element("span", "carte__illustration-label",
      carte.rang === 4 ? "[ILLUSTRATION · PLEINE CARTE]" : "[ILLUSTRATION]"));
  }

  const nom = element("h3", "carte__nom", carte.nom);
  if (carte.nom.length > 22) nom.classList.add("carte__nom--tres-long");
  else if (carte.nom.length > 16) nom.classList.add("carte__nom--long");

  const capacites = element("div", "carte__capacites");
  if (carte.talent) {
    capacites.append(creerCapacite("TALENT", carte.talent.nom, carte.talent.texte, "", true));
  }
  for (const attaque of carte.attaques) {
    capacites.append(creerCapacite(`${attaque.pa} PA`, attaque.nom, attaque.texte, attaque.degats, false));
  }

  const pied = element("footer", "carte__pied");
  const proprietes = element("div", "carte__proprietes");
  proprietes.append(element("span", "carte__proprietes-label", "PROPRIÉTÉS"));
  proprietes.append(element("p", "carte__proprietes-texte", carte.proprietes));
  const ref = element("div", "carte__ref");
  ref.append(element("div", "carte__ref-ligne", [carte.equipe, carte.role].filter(Boolean).join(" · ")));
  ref.append(element("div", "", carte.id));
  pied.append(proprietes, ref);

  interieur.append(
    entete,
    illustration,
    nom,
    element("p", "carte__infos", `${carte.pv} PV · ${carte.type}`),
    element("hr", "carte__separateur"),
    capacites,
    pied,
  );
  cadre.append(interieur);
  racine.append(cadre);
  return racine;
}

// Les propriétés tiennent sur 2 lignes au plus : la police est réduite (jusqu'à 25 %) si besoin
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
