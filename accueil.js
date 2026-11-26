// Accueil : un booster par série, en file qui défile d'un glissement du doigt (le booster du milieu est centré au
// départ, la file se cale sur le booster le plus proche). Toucher un booster le met en avant (il vient au centre,
// grandit, le reste s'efface) et affiche les choix d'ouverture ; la flèche de retour revient à l'accueil.
// zoneBooster désigne le booster choisi : ouverture.js l'utilise pour l'ouverture.

// Mission quotidienne « Se connecter au jeu »
progresserMission("connexion");

// Le bouton du profil montre l'icône choisie par le joueur
document.querySelector(".profil").replaceChildren(creerIconeProfil());

const choixBooster = document.querySelector(".choix-booster");
const piste = document.querySelector(".boosters");
const enOuverture = () => document.body.classList.contains("mode-ouverture");
const enChoix = () => document.body.classList.contains("mode-booster");

// Un booster par série dont le booster est prêt (donnees/series.js)
const zonesBoosters = seriesAvecBooster().map(serie => {
  const zone = element("div", "zone-booster");
  zone.dataset.serie = serie.id;
  zone.tabIndex = 0;
  zone.setAttribute("role", "button");
  zone.setAttribute("aria-label", `Choisir comment ouvrir le booster ${serie.nom}`);
  zone.append(creerPack(serie));
  zone.addEventListener("click", () => {
    if (!glissementRecent) choisirBooster(zone);
  });
  zone.addEventListener("keydown", evenement => {
    if (evenement.key === "Enter" || evenement.key === " ") {
      evenement.preventDefault();
      choisirBooster(zone);
    }
  });
  piste.append(zone);
  return zone;
});
let zoneBooster = zonesBoosters[0];

// ── Défilement de la file des boosters ──
// Les mesures offset ignorent les transformations : elles donnent la place des boosters, file non décalée.

let defilement = 0;
let glissement = null;
let glissementRecent = false;

// Décalage de la file qui centre un booster à l'écran
function decalagePour(zone) {
  return piste.offsetParent.clientWidth / 2 - (zone.offsetLeft + zone.offsetWidth / 2);
}

function borner(valeur) {
  const extremes = [decalagePour(zonesBoosters[0]), decalagePour(zonesBoosters[zonesBoosters.length - 1])];
  return Math.min(Math.max(valeur, Math.min(...extremes)), Math.max(...extremes));
}

function placerFile(valeur, anime = true) {
  defilement = valeur;
  piste.classList.toggle("boosters--glisse", !anime);
  piste.style.setProperty("--defilement", `${valeur}px`);
}

// Se cale sur le booster le plus proche du centre
function caler() {
  const proche = zonesBoosters.reduce((meilleure, zone) =>
    Math.abs(decalagePour(zone) - defilement) < Math.abs(decalagePour(meilleure) - defilement) ? zone : meilleure);
  placerFile(borner(decalagePour(proche)));
}

piste.addEventListener("pointerdown", evenement => {
  if (enOuverture() || enChoix()) return;
  glissement = { x: evenement.clientX, depart: defilement, pointeur: evenement.pointerId, bouge: false };
});

addEventListener("pointermove", evenement => {
  if (!glissement || evenement.pointerId !== glissement.pointeur) return;
  const dx = evenement.clientX - glissement.x;
  if (Math.abs(dx) > 8) glissement.bouge = true;
  if (glissement.bouge) placerFile(borner(glissement.depart + dx), false);
});

function finirGlissement(evenement) {
  if (!glissement || evenement.pointerId !== glissement.pointeur) return;
  // Un glissement n'est pas un toucher : le clic qui suit est ignoré
  if (glissement.bouge) {
    glissementRecent = true;
    setTimeout(() => { glissementRecent = false; }, 0);
  }
  glissement = null;
  caler();
}

addEventListener("pointerup", finirGlissement);
addEventListener("pointercancel", finirGlissement);
addEventListener("resize", caler);

// ── Choix d'un booster ──

function afficherChoixBooster(visible) {
  document.body.classList.toggle("mode-booster", visible);
  choixBooster.inert = !visible;
  for (const zone of zonesBoosters) zone.tabIndex = visible ? -1 : 0;
  // Retour à l'accueil : la file se recale sur le booster choisi
  if (!visible) placerFile(borner(decalagePour(zoneBooster)));
}

// Le booster touché vient au centre de l'écran, les autres s'effacent. La file revient à sa place d'origine
// pendant que le booster se décale : le calcul se fait donc sans le défilement.
function choisirBooster(zone) {
  if (enOuverture() || enChoix()) return;
  zoneBooster = zone;
  for (const autre of zonesBoosters) autre.classList.toggle("zone-booster--choisie", autre === zone);
  zone.style.setProperty("--decalage-x", `${decalagePour(zone)}px`);
  placerFile(0);
  afficherChoixBooster(true);
}

document.querySelector(".bulle-retour").addEventListener("click", () => afficherChoixBooster(false));

afficherChoixBooster(false);
// Au départ, le booster du milieu est centré
placerFile(borner(decalagePour(zonesBoosters[Math.floor((zonesBoosters.length - 1) / 2)])), false);
