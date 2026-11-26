// Onglets de la Collection : « Cartes » (cartes.js) et « Classeurs ». Un classeur réunit jusqu'à 20 cartes choisies
// par le joueur parmi celles qu'il possède (données : classeurs.js). Trois vues : la liste des classeurs, un
// classeur ouvert (ses 20 places, les cartes s'agrandissent comme dans la collection) et le choix de ses cartes.
// Utilise cartes.js (grille, retourSeries, ouvrirZoom), à charger avant.

const vuesClasseurs = document.querySelectorAll("[data-vue-classeurs]");
const messageSelection = () => document.querySelector("[data-selection-compte]");
let classeurOuvert = null;

// ── Onglets ──

function ouvrirOngletCollection(nom) {
  for (const bouton of document.querySelectorAll(".onglets--collection [data-onglet]")) {
    bouton.setAttribute("aria-selected", String(bouton.dataset.onglet === nom));
  }
  for (const panneau of document.querySelectorAll("[data-panneau]")) panneau.hidden = panneau.dataset.panneau !== nom;
  // La flèche du haut ne sert qu'à revenir aux séries
  retourSeries.hidden = nom !== "cartes" || grille.hidden;
  if (nom === "classeurs") afficherVueClasseurs("liste");
  window.scrollTo(0, 0);
}

for (const bouton of document.querySelectorAll(".onglets--collection [data-onglet]")) {
  bouton.addEventListener("click", () => ouvrirOngletCollection(bouton.dataset.onglet));
}

function afficherVueClasseurs(vue) {
  for (const section of vuesClasseurs) section.hidden = section.dataset.vueClasseurs !== vue;
  if (vue === "liste") afficherListeClasseurs();
  if (vue === "ouvert") afficherClasseur();
  if (vue === "selection") afficherSelection();
  window.scrollTo(0, 0);
}

// ── Couverture d'un classeur : « Cristal blanc », facettes claires et notre logo en noir ──

function creerCouvertureClasseur() {
  const couverture = element("div", "couverture-classeur");
  couverture.innerHTML = `<img class="couverture-classeur__logo" src="assets/logo/anima-noir.svg" alt="">`;
  return couverture;
}

// ── Liste des classeurs ──

function afficherListeClasseurs() {
  const liste = lireClasseurs();
  const tuiles = liste.map(classeur => {
    const tuile = element("button", "classeur-tuile");
    tuile.type = "button";
    tuile.append(creerCouvertureClasseur(), element("span", "classeur-tuile__nom", classeur.nom),
      element("span", "classeur-tuile__compte", `${classeur.cartes.length} / ${TAILLE_CLASSEUR}`));
    tuile.addEventListener("click", () => {
      classeurOuvert = classeur.id;
      afficherVueClasseurs("ouvert");
    });
    return tuile;
  });

  const nouveau = element("button", "classeur-tuile classeur-tuile--nouveau");
  nouveau.type = "button";
  nouveau.innerHTML = `<span class="classeur-tuile__plus">+</span><span class="classeur-tuile__nom">Nouveau classeur</span>`;
  nouveau.addEventListener("click", () => {
    const nom = prompt("Nom du nouveau classeur :", `Classeur ${liste.length + 1}`);
    if (nom === null) return;
    classeurOuvert = creerClasseur(nom).id;
    afficherVueClasseurs("ouvert");
  });

  document.querySelector('[data-vue-classeurs="liste"]').replaceChildren(...tuiles, nouveau);
}

// ── Un classeur ouvert : ses 20 places ──

function afficherClasseur() {
  const classeur = trouverClasseur(classeurOuvert);
  if (!classeur) {
    afficherVueClasseurs("liste");
    return;
  }
  document.querySelector("[data-classeur-nom]").textContent = classeur.nom;
  document.querySelector("[data-classeur-compte]").textContent = `${classeur.cartes.length} / ${TAILLE_CLASSEUR} cartes`;

  const places = Array.from({ length: TAILLE_CLASSEUR }, (_, rang) => {
    const emplacement = element("div", "emplacement");
    const carte = CARTES.find(c => c.id === classeur.cartes[rang]);
    if (carte) {
      const vignette = creerCarte(carte);
      vignette.tabIndex = 0;
      vignette.setAttribute("role", "button");
      vignette.setAttribute("aria-label", `Agrandir ${carte.nom}`);
      vignette.addEventListener("click", () => ouvrirZoom(carte, vignette));
      emplacement.append(vignette);
    } else {
      // Place libre : la toucher mène au choix des cartes
      const libre = element("button", "case-vide case-vide--libre", "+");
      libre.type = "button";
      libre.setAttribute("aria-label", "Ajouter des cartes");
      libre.addEventListener("click", () => afficherVueClasseurs("selection"));
      emplacement.append(libre);
    }
    return emplacement;
  });
  const grilleClasseur = document.querySelector("[data-classeur-grille]");
  grilleClasseur.replaceChildren(...places);
  ajusterProprietes(grilleClasseur);
}

document.querySelector("[data-classeur-retour]").addEventListener("click", () => afficherVueClasseurs("liste"));
document.querySelector("[data-classeur-modifier]").addEventListener("click", () => afficherVueClasseurs("selection"));

document.querySelector("[data-classeur-renommer]").addEventListener("click", () => {
  const classeur = trouverClasseur(classeurOuvert);
  const nom = prompt("Nouveau nom du classeur :", classeur.nom);
  if (nom === null) return;
  renommerClasseur(classeur.id, nom);
  afficherClasseur();
});

document.querySelector("[data-classeur-supprimer]").addEventListener("click", () => {
  const classeur = trouverClasseur(classeurOuvert);
  if (!confirm(`Supprimer le classeur « ${classeur.nom} » ? Les cartes restent dans ta collection.`)) return;
  supprimerClasseur(classeur.id);
  afficherVueClasseurs("liste");
});

// ── Choix des cartes : toutes les cartes possédées, série par série ; toucher une carte l'ajoute ou la retire ──

function afficherCompteSelection(classeur, texte) {
  messageSelection().textContent = texte || `${classeur.cartes.length} / ${TAILLE_CLASSEUR} cartes`;
}

function afficherSelection() {
  const classeur = trouverClasseur(classeurOuvert);
  const possedees = lireCollection();
  const blocs = SERIES.map(serie => {
    const cartes = serie.cartes.filter(carte => possedees[carte.id]);
    if (!cartes.length) return null;
    const bloc = element("div", "selection__serie");
    const grilleSerie = element("div", "apercu__grille");
    grilleSerie.append(...cartes.map(carte => {
      const emplacement = element("div", "emplacement selection__carte");
      emplacement.classList.toggle("selection__carte--choisie", classeur.cartes.includes(carte.id));
      const vignette = creerCarte(carte);
      vignette.setAttribute("role", "button");
      vignette.setAttribute("aria-label", carte.nom);
      vignette.addEventListener("click", () => {
        if (!basculerCarteClasseur(classeur.id, carte.id)) {
          afficherCompteSelection(classeur, `Classeur plein : ${TAILLE_CLASSEUR} cartes au plus.`);
          return;
        }
        const aJour = trouverClasseur(classeur.id);
        emplacement.classList.toggle("selection__carte--choisie", aJour.cartes.includes(carte.id));
        afficherCompteSelection(aJour);
      });
      emplacement.append(vignette);
      return emplacement;
    }));
    bloc.append(element("h3", "selection__titre", serie.nom), grilleSerie);
    return bloc;
  }).filter(Boolean);

  const zone = document.querySelector("[data-selection-cartes]");
  if (blocs.length) zone.replaceChildren(...blocs);
  else zone.replaceChildren(element("p", "selection__vide", "Tu n'as encore aucune carte : ouvre des boosters pour remplir tes classeurs !"));
  afficherCompteSelection(classeur);
  ajusterProprietes(zone);
}

document.querySelector("[data-selection-terminer]").addEventListener("click", () => afficherVueClasseurs("ouvert"));
