// Accueil : un booster par série, côte à côte. Toucher un booster le met en avant (il vient au centre, grandit,
// le reste s'efface) et affiche les choix d'ouverture ; la flèche de retour revient à l'accueil.
// zoneBooster désigne le booster choisi : ouverture.js l'utilise pour l'ouverture.

// Mission quotidienne « Se connecter au jeu »
progresserMission("connexion");

// Le bouton du profil montre l'icône choisie par le joueur
document.querySelector(".profil").replaceChildren(creerIconeProfil());

const choixBooster = document.querySelector(".choix-booster");
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
  zone.addEventListener("click", () => choisirBooster(zone));
  zone.addEventListener("keydown", evenement => {
    if (evenement.key === "Enter" || evenement.key === " ") {
      evenement.preventDefault();
      choisirBooster(zone);
    }
  });
  document.querySelector(".boosters").append(zone);
  return zone;
});
let zoneBooster = zonesBoosters[0];

function afficherChoixBooster(visible) {
  document.body.classList.toggle("mode-booster", visible);
  choixBooster.inert = !visible;
  for (const zone of zonesBoosters) zone.tabIndex = visible ? -1 : 0;
}

// Le booster touché vient au centre de l'écran (décalage horizontal mesuré), les autres s'effacent
function choisirBooster(zone) {
  if (enOuverture() || enChoix()) return;
  zoneBooster = zone;
  for (const autre of zonesBoosters) autre.classList.toggle("zone-booster--choisie", autre === zone);
  const contenu = zone.offsetParent.getBoundingClientRect();
  const centre = contenu.left + zone.offsetLeft + zone.offsetWidth / 2;
  zone.style.setProperty("--decalage-x", `${window.innerWidth / 2 - centre}px`);
  afficherChoixBooster(true);
}

document.querySelector(".bulle-retour").addEventListener("click", () => afficherChoixBooster(false));

afficherChoixBooster(false);
