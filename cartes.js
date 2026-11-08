// Collection : les séries (onglet East Blue, avec l'illustration de son booster), puis les cartes de la série en lignes de 3.
// Une carte pas encore obtenue est une case vide portant son numéro. Toucher une carte possédée l'agrandit
// (le reste s'efface), la toucher à nouveau la retourne, la flèche la renvoie à sa place dans la grille.

const DUREE_ZOOM = 550;
const DUREE_RETOURNEMENT = 700;
const COURBE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const series = document.querySelector(".series");
const boutonSerie = document.querySelector(".serie");
const retourSeries = document.querySelector(".barre-collection__retour");
const grille = document.querySelector(".apercu__grille");
const zoom = document.querySelector(".zoom");
const fond = document.querySelector(".zoom__fond");
const boutonRetour = document.querySelector(".zoom__retour");
const carteZoom = document.querySelector(".zoom__carte");
const retournable = document.querySelector(".zoom__retournable");
const faceAvant = document.querySelector(".zoom__face--avant");

let vignetteOuverte = null;
let retournee = false;
let enMouvement = false;

function afficherSerie(visible) {
  series.hidden = visible;
  grille.hidden = !visible;
  retourSeries.hidden = !visible;
  window.scrollTo(0, 0);
  if (visible) ajusterProprietes(grille);
}

boutonSerie.addEventListener("click", () => afficherSerie(true));
retourSeries.addEventListener("click", () => afficherSerie(false));

const possedees = lireCollection();
for (const carte of CARTES) {
  const emplacement = element("div", "emplacement");
  const exemplaires = possedees[carte.id] || 0;

  if (!exemplaires) {
    const caseVide = element("div", "case-vide", carte.id.replace("EB-", ""));
    caseVide.setAttribute("role", "img");
    caseVide.setAttribute("aria-label", `Carte ${carte.id} pas encore obtenue`);
    emplacement.append(caseVide);
  } else {
    const vignette = creerCarte(carte);
    vignette.tabIndex = 0;
    vignette.setAttribute("role", "button");
    vignette.setAttribute("aria-label", `Agrandir ${carte.nom}`);
    vignette.addEventListener("click", () => ouvrirZoom(carte, vignette));
    vignette.addEventListener("keydown", evenement => {
      if (evenement.key === "Enter" || evenement.key === " ") {
        evenement.preventDefault();
        ouvrirZoom(carte, vignette);
      }
    });
    emplacement.append(vignette);
    if (exemplaires > 1) emplacement.append(element("span", "exemplaires", `×${exemplaires}`));
  }
  grille.append(emplacement);
}

document.fonts.ready.then(() => ajusterProprietes(grille));
window.addEventListener("resize", () => ajusterProprietes(grille));

// Transformation qui superpose l'élément situé en « vers » au rectangle « depuis »
function superposer(depuis, vers) {
  const dx = depuis.left + depuis.width / 2 - (vers.left + vers.width / 2);
  const dy = depuis.top + depuis.height / 2 - (vers.top + vers.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${depuis.width / vers.width})`;
}

function ouvrirZoom(carte, vignette) {
  if (vignetteOuverte) return;
  vignetteOuverte = vignette;
  retournee = false;
  enMouvement = true;

  const largeur = Math.min(360, window.innerWidth * 0.86, (window.innerHeight - 110) * 1260 / 1760);
  carteZoom.style.setProperty("--largeur-zoom", `${largeur}px`);
  faceAvant.replaceChildren(creerCarte(carte));
  retournable.style.transform = "";
  zoom.hidden = false;
  document.body.classList.add("zoom-actif");
  ajusterProprietes(faceAvant);

  // La carte part de sa place dans la grille et grandit jusqu'au centre de l'écran
  const depart = vignette.getBoundingClientRect();
  const arrivee = carteZoom.getBoundingClientRect();
  vignette.style.visibility = "hidden";
  carteZoom.animate([{ transform: superposer(depart, arrivee) }, { transform: "none" }], { duration: DUREE_ZOOM, easing: COURBE });
  setTimeout(() => { enMouvement = false; }, DUREE_ZOOM);
  fond.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUREE_ZOOM, easing: "ease" });
  boutonRetour.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: DUREE_ZOOM * 0.6, fill: "backwards" });
  carteZoom.focus({ preventScroll: true });
}

function fermerZoom() {
  if (!vignetteOuverte || enMouvement) return;
  const vignette = vignetteOuverte;
  enMouvement = true;
  document.body.classList.remove("zoom-actif");
  if (retournee) retourner(true);

  // La carte redescend à sa place dans la grille
  const depart = carteZoom.getBoundingClientRect();
  const arrivee = vignette.getBoundingClientRect();
  const animations = [
    carteZoom.animate([{ transform: "none" }, { transform: superposer(arrivee, depart) }], { duration: DUREE_ZOOM, easing: COURBE, fill: "forwards" }),
    fond.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DUREE_ZOOM, easing: "ease", fill: "forwards" }),
    boutonRetour.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }),
  ];
  setTimeout(() => {
    vignette.style.visibility = "";
    zoom.hidden = true;
    animations.forEach(animation => animation.cancel());
    vignetteOuverte = null;
    enMouvement = false;
    vignette.focus({ preventScroll: true });
  }, DUREE_ZOOM);
}

// Retournement : la carte pivote sur elle-même en se soulevant légèrement, comme prise en main
function retourner(pendantFermeture = false) {
  if (enMouvement && !pendantFermeture) return;
  const depart = retournee ? 180 : 0;
  const arrivee = depart + 180;
  retournee = !retournee;
  if (!pendantFermeture) enMouvement = true;
  retournable.animate([
    { transform: `rotateY(${depart}deg) scale(1)` },
    { transform: `rotateY(${depart + 90}deg) scale(1.08)`, offset: 0.5 },
    { transform: `rotateY(${arrivee}deg) scale(1)` },
  ], { duration: pendantFermeture ? DUREE_ZOOM : DUREE_RETOURNEMENT, easing: "cubic-bezier(0.45, 0.05, 0.35, 1)" });
  retournable.style.transform = `rotateY(${arrivee % 360}deg)`;
  if (!pendantFermeture) setTimeout(() => { enMouvement = false; }, DUREE_RETOURNEMENT);
}

carteZoom.addEventListener("click", () => retourner());
carteZoom.addEventListener("keydown", evenement => {
  if (evenement.key === "Enter" || evenement.key === " ") {
    evenement.preventDefault();
    retourner();
  }
});
boutonRetour.addEventListener("click", fermerZoom);
document.addEventListener("keydown", evenement => {
  if (evenement.key === "Escape") fermerZoom();
});
