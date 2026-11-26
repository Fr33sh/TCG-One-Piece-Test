// Collection : les séries (un onglet par série de donnees/series.js, avec son illustration), puis les cartes de la
// série choisie en lignes de 3.
// Une carte pas encore obtenue est une case vide portant son numéro. Toucher une carte possédée l'agrandit
// (le reste s'efface), la toucher à nouveau la retourne, la flèche la renvoie à sa place dans la grille.
// Sous la carte agrandie, ses doublons peuvent être recyclés en Animas (animas.js) ; on en garde toujours un.

const DUREE_ZOOM = 550;
const DUREE_RETOURNEMENT = 700;
const COURBE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const series = document.querySelector(".series");
const retourSeries = document.querySelector(".barre-collection__retour");
const grille = document.querySelector(".apercu__grille");
const zoom = document.querySelector(".zoom");
const fond = document.querySelector(".zoom__fond");
const boutonRetour = document.querySelector(".zoom__retour");
const carteZoom = document.querySelector(".zoom__carte");
const retournable = document.querySelector(".zoom__retournable");
const faceAvant = document.querySelector(".zoom__face--avant");
const panneauRecyclage = document.querySelector(".recyclage");
const indiceVideo = document.querySelector(".zoom__indice");

let vignetteOuverte = null;
let carteOuverte = null;
let retournee = false;
let enMouvement = false;
let nombreARecycler = 1;

// Affiche la grille d'une série (ou revient à la liste des séries si serie est nul)
function afficherSerie(serie) {
  series.hidden = Boolean(serie);
  grille.hidden = !serie;
  retourSeries.hidden = !serie;
  window.scrollTo(0, 0);
  if (!serie) return;
  remplirGrille(serie);
  ajusterProprietes(grille);
}

// Un onglet par série
for (const serie of SERIES) {
  const onglet = element("button", "serie");
  onglet.type = "button";
  onglet.setAttribute("aria-label", `Ouvrir la série ${serie.nom}`);
  const image = element("img", `serie__image${serie.image.endsWith(".svg") ? " serie__image--logo" : ""}`);
  image.src = serie.image;
  image.alt = "";
  const possedees = lireCollection();
  const obtenues = serie.cartes.filter(carte => possedees[carte.id]).length;
  onglet.append(image, element("span", "serie__nom", serie.nom), element("span", "serie__compte", `${obtenues} / ${serie.cartes.length}`));
  onglet.addEventListener("click", () => afficherSerie(serie));
  series.append(onglet);
}
retourSeries.addEventListener("click", () => afficherSerie(null));

function remplirGrille(serie) {
  const possedees = lireCollection();
  grille.replaceChildren(...serie.cartes.map(carte => creerEmplacement(carte, possedees[carte.id] || 0)));
}

function creerEmplacement(carte, exemplaires) {
  const emplacement = element("div", "emplacement");

  if (!exemplaires) {
    const caseVide = element("div", "case-vide", carte.id.split("-")[1]);
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
  return emplacement;
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
  carteOuverte = carte;
  retournee = false;
  enMouvement = true;
  nombreARecycler = 1;
  document.querySelector("[data-recyclage-message]").textContent = "";
  afficherRecyclage();

  // La carte laisse de la place en bas pour le panneau de recyclage
  const largeur = Math.min(360, window.innerWidth * 0.86, (window.innerHeight - 260) * 1260 / 1760);
  carteZoom.style.setProperty("--largeur-zoom", `${largeur}px`);
  faceAvant.replaceChildren(creerCarte(carte));
  faceAvant.style.visibility = "";
  indiceVideo.hidden = !carte.video;
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
  panneauRecyclage.animate([{ opacity: 0, translate: "-50% 12px" }, { opacity: 1, translate: "-50% 0" }], { duration: 300, delay: DUREE_ZOOM * 0.6, fill: "backwards" });
  if (carte.video) indiceVideo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: DUREE_ZOOM * 0.6, fill: "backwards" });
  carteZoom.focus({ preventScroll: true });
}

// ── Recyclage des doublons de la carte agrandie ──

function afficherRecyclage() {
  const exemplaires = lireCollection()[carteOuverte.id] || 0;
  const disponibles = doublons(carteOuverte);
  nombreARecycler = Math.min(Math.max(1, nombreARecycler), Math.max(1, disponibles));
  const valeur = VALEUR_RECYCLAGE[carteOuverte.rang];

  panneauRecyclage.hidden = false;
  document.querySelector("[data-recyclage-info]").textContent = disponibles
    ? `${exemplaires} exemplaires · ${disponibles} doublon${disponibles > 1 ? "s" : ""} à recycler (${nomAnimas(valeur)} chacun)`
    : "Exemplaire unique : rien à recycler.";
  document.querySelector("[data-recyclage-choix]").hidden = !disponibles;
  document.querySelector("[data-recyclage-nombre]").textContent = nombreARecycler;
  document.querySelector("[data-recyclage-gain]").textContent = nombreARecycler * valeur;
  document.querySelector('[data-recyclage-pas="-1"]').disabled = nombreARecycler <= 1;
  document.querySelector('[data-recyclage-pas="1"]').disabled = nombreARecycler >= disponibles;
}

// Le badge « ×3 » de la carte dans la grille suit le nombre d'exemplaires
function mettreAJourBadge(vignette, exemplaires) {
  const emplacement = vignette.parentElement;
  let badge = emplacement.querySelector(".exemplaires");
  if (exemplaires <= 1) {
    badge?.remove();
    return;
  }
  if (!badge) {
    badge = element("span", "exemplaires");
    emplacement.append(badge);
  }
  badge.textContent = `×${exemplaires}`;
}

for (const pas of document.querySelectorAll("[data-recyclage-pas]")) {
  pas.addEventListener("click", () => {
    nombreARecycler += Number(pas.dataset.recyclagePas);
    afficherRecyclage();
  });
}

document.querySelector("[data-recycler]").addEventListener("click", () => {
  const gain = recycler(carteOuverte, nombreARecycler);
  if (!gain) return;
  document.querySelector("[data-recyclage-message]").textContent = `+${nomAnimas(gain)} !`;
  if (typeof jouerCarillon === "function") jouerCarillon();
  mettreAJourBadge(vignetteOuverte, lireCollection()[carteOuverte.id]);
  nombreARecycler = 1;
  afficherRecyclage();
});

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
    panneauRecyclage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }),
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

// Retournement : la carte pivote sur elle-même en se soulevant légèrement, comme prise en main.
// À mi-chemin (carte de profil), la face avant est masquée ou réaffichée : sinon Safari laisse voir ses textes
// à travers le dos (ceux qui ont leurs propres effets, comme le nom vertical).
function retourner(pendantFermeture = false) {
  if (enMouvement && !pendantFermeture) return;
  const depart = retournee ? 180 : 0;
  const arrivee = depart + 180;
  const duree = pendantFermeture ? DUREE_ZOOM : DUREE_RETOURNEMENT;
  retournee = !retournee;
  if (!pendantFermeture) enMouvement = true;
  retournable.animate([
    { transform: `rotateY(${depart}deg) scale(1)` },
    { transform: `rotateY(${depart + 90}deg) scale(1.08)`, offset: 0.5 },
    { transform: `rotateY(${arrivee}deg) scale(1)` },
  ], { duration: duree, easing: "cubic-bezier(0.45, 0.05, 0.35, 1)" });
  retournable.style.transform = `rotateY(${arrivee % 360}deg)`;
  const dosVisible = retournee;
  setTimeout(() => { faceAvant.style.visibility = dosVisible ? "hidden" : ""; }, duree / 2);
  if (!pendantFermeture) setTimeout(() => { enMouvement = false; }, DUREE_RETOURNEMENT);
}

// Carte Z : un appui maintenu sur la carte agrandie lance sa vidéo en plein écran (video-carte.js). Elle part
// muette (le navigateur l'exige) et retrouve le son quand le doigt se lève.
const DUREE_APPUI_LONG = 450;
let minuterieAppui = null;
let departAppui = null;
let videoParAppui = false;
let ignorerClicJusqua = 0;

const sceneZoom = document.querySelector(".zoom__scene");
let eclatAppui = null; // la carte s'illumine pendant l'appui

// La carte reprend son éclat normal, puis l'animation est retirée
function eteindreCarte() {
  const eclat = eclatAppui;
  eclatAppui = null;
  if (!eclat) return;
  eclat.reverse();
  eclat.finished.then(() => eclat.cancel(), () => {});
}

carteZoom.addEventListener("pointerdown", evenement => {
  if (!carteOuverte?.video || enMouvement || eclatAppui) return;
  clearTimeout(minuterieAppui);
  departAppui = { x: evenement.clientX, y: evenement.clientY };
  eclatAppui = illuminerCarte(sceneZoom, DUREE_APPUI_LONG);
  minuterieAppui = setTimeout(async () => {
    minuterieAppui = null;
    videoParAppui = true;
    await lancerVideoCarte(carteOuverte.video, { muet: true, depuis: carteZoom });
    eteindreCarte();
  }, DUREE_APPUI_LONG);
});

function annulerAppui() {
  if (!minuterieAppui) return;
  clearTimeout(minuterieAppui);
  minuterieAppui = null;
  eteindreCarte();
}

document.addEventListener("pointermove", evenement => {
  if (minuterieAppui && Math.hypot(evenement.clientX - departAppui.x, evenement.clientY - departAppui.y) > 10) annulerAppui();
}, true);
document.addEventListener("pointercancel", annulerAppui, true);

// Le doigt se lève : ce geste permet de rétablir le son ; le clic qui suit ne retourne pas la carte
function finAppui() {
  annulerAppui();
  if (!videoParAppui) return;
  videoParAppui = false;
  ignorerClicJusqua = performance.now() + 500;
  activerSonVideoCarte();
}
document.addEventListener("pointerup", finAppui, true);
document.addEventListener("touchend", finAppui, true);

carteZoom.addEventListener("click", () => {
  if (performance.now() < ignorerClicJusqua) return;
  retourner();
});
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
