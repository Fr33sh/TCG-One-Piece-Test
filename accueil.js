// Accueil : toucher le booster le met en avant (zoom, le reste s'efface) et affiche les choix d'ouverture ;
// la flèche de retour revient à l'accueil.

const zoneBooster = document.querySelector(".zone-booster");
const choixBooster = document.querySelector(".choix-booster");
zoneBooster.append(creerPack());
// La barre de recharge (languette du bas) et les boosters disponibles (languette du haut)
// suivent le booster et son flottement
zoneBooster.querySelector(".booster").append(document.querySelector(".reserve-boosters"), document.querySelector(".recharge"));

function afficherChoixBooster(visible) {
  document.body.classList.toggle("mode-booster", visible);
  choixBooster.inert = !visible;
  zoneBooster.tabIndex = visible ? -1 : 0;
}

// Pendant l'ouverture d'un booster, le paquet sert à glisser le doigt : il n'affiche plus les choix
const enOuverture = () => document.body.classList.contains("mode-ouverture");

zoneBooster.addEventListener("click", () => {
  if (!enOuverture()) afficherChoixBooster(true);
});
zoneBooster.addEventListener("keydown", evenement => {
  if (!enOuverture() && (evenement.key === "Enter" || evenement.key === " ")) {
    evenement.preventDefault();
    afficherChoixBooster(true);
  }
});
document.querySelector(".bulle-retour").addEventListener("click", () => afficherChoixBooster(false));

afficherChoixBooster(false);
