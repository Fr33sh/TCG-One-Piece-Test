// Accueil : les boosters des séries sur une roue. Celui du centre est grand, au premier plan ; ses voisins, plus
// petits, dépassent derrière lui sur les côtés. Un glissement du doigt fait tourner la roue (en boucle) et elle se
// cale sur le booster le plus proche. Toucher un booster de côté l'amène au centre ; toucher celui du centre le met
// en avant (il monte et grandit, le reste s'efface) et affiche les choix d'ouverture.
// zoneBooster désigne le booster choisi : ouverture.js l'utilise pour l'ouverture.

// Mission quotidienne « Se connecter au jeu »
progresserMission("connexion");

// Le bouton du profil montre l'icône choisie par le joueur
document.querySelector(".profil").replaceChildren(creerIconeProfil());

const choixBooster = document.querySelector(".choix-booster");
const roue = document.querySelector(".boosters");
const enOuverture = () => document.body.classList.contains("mode-ouverture");
const enChoix = () => document.body.classList.contains("mode-booster");

const ECART_ROUE = 0.62; // décalage d'un voisin, en part de la largeur d'un booster
const REDUCTION_ROUE = 0.22; // un voisin est 22 % plus petit

// Un booster par série dont le booster est prêt (donnees/series.js)
const zonesBoosters = seriesAvecBooster().map((serie, index) => {
  const zone = element("div", "zone-booster");
  zone.dataset.serie = serie.id;
  zone.setAttribute("role", "button");
  zone.setAttribute("aria-label", `Booster ${serie.nom}`);
  zone.append(creerPack(serie));
  zone.addEventListener("click", () => {
    if (!glissementRecent) toucherBooster(index);
  });
  zone.addEventListener("keydown", evenement => {
    if (evenement.key === "Enter" || evenement.key === " ") {
      evenement.preventDefault();
      toucherBooster(index);
    }
  });
  roue.append(zone);
  return zone;
});
let zoneBooster = zonesBoosters[0];

// ── La roue ──

let position = 0; // index du booster au centre (décimal pendant un glissement)
let glissement = null;
let glissementRecent = false;
const nombre = zonesBoosters.length;
const indexCentral = () => ((Math.round(position) % nombre) + nombre) % nombre;

// Écart (en boosters) entre un booster et le centre, par le plus court chemin autour de la roue
function ecartAuCentre(index) {
  const brut = index - position;
  return ((((brut + nombre / 2) % nombre) + nombre) % nombre) - nombre / 2;
}

function placerRoue(anime = true) {
  roue.classList.toggle("boosters--glisse", !anime);
  zonesBoosters.forEach((zone, index) => {
    const ecart = nombre > 1 ? ecartAuCentre(index) : 0;
    const distance = Math.abs(ecart);
    const echelle = 1 - REDUCTION_ROUE * Math.min(distance, 1.5);
    zone.style.setProperty("--roue", `translateX(${ecart * ECART_ROUE * 100}%) scale(${echelle})`);
    // Les boosters au-delà des voisins directs s'effacent (ils passent de l'autre côté de la roue)
    zone.style.opacity = Math.max(0, Math.min(1, 1 - (distance - 1) * 2));
    zone.style.zIndex = String(10 - Math.round(distance * 2));
    const central = index === indexCentral();
    zone.tabIndex = central && !enChoix() ? 0 : -1;
    zone.classList.toggle("zone-booster--centre", central);
  });
}

// Toucher : un booster de côté vient au centre, celui du centre est choisi
function toucherBooster(index) {
  if (enOuverture() || enChoix()) return;
  if (index !== indexCentral()) {
    position = Math.round(position) + ecartAuCentre(index);
    placerRoue();
    return;
  }
  choisirBooster(zonesBoosters[index]);
}

roue.addEventListener("pointerdown", evenement => {
  if (enOuverture() || enChoix()) return;
  glissement = { x: evenement.clientX, depart: position, pointeur: evenement.pointerId, bouge: false };
});

addEventListener("pointermove", evenement => {
  if (!glissement || evenement.pointerId !== glissement.pointeur) return;
  const dx = evenement.clientX - glissement.x;
  if (Math.abs(dx) > 8) glissement.bouge = true;
  if (!glissement.bouge) return;
  // Glisser vers la gauche fait avancer la roue (le booster de droite arrive au centre)
  const largeur = zonesBoosters[0].offsetWidth * ECART_ROUE;
  position = glissement.depart - dx / largeur;
  placerRoue(false);
});

function finirGlissement(evenement) {
  if (!glissement || evenement.pointerId !== glissement.pointeur) return;
  // Un glissement n'est pas un toucher : le clic qui suit est ignoré
  if (glissement.bouge) {
    glissementRecent = true;
    setTimeout(() => { glissementRecent = false; }, 0);
    position = Math.round(position);
    placerRoue();
  }
  glissement = null;
}

addEventListener("pointerup", finirGlissement);
addEventListener("pointercancel", finirGlissement);

// ── Choix d'un booster ──

function afficherChoixBooster(visible) {
  document.body.classList.toggle("mode-booster", visible);
  choixBooster.inert = !visible;
  placerRoue();
}

function choisirBooster(zone) {
  zoneBooster = zone;
  for (const autre of zonesBoosters) autre.classList.toggle("zone-booster--choisie", autre === zone);
  afficherChoixBooster(true);
}

document.querySelector(".bulle-retour").addEventListener("click", () => afficherChoixBooster(false));

afficherChoixBooster(false);
