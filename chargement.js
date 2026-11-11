// Écran de chargement (fond marin : fond-marin.js). Toucher l'écran
// plonge dedans (zoom) pendant que la musique d'aventure laisse place en fondu à celle du jeu, puis
// ouvre l'écran de création du compte (premier lancement) ou l'accueil. Pendant la plongée, un compte lié
// à Discord récupère sa sauvegarde en ligne.

const DUREE_PLONGEE = 1000; // ms, comme l'animation « plongee » de chargement.css
const ATTENTE_MAX_SAUVEGARDE = 4000; // ms : sans réponse du serveur, on entre quand même dans le jeu

const ecranChargement = document.querySelector(".ecran-chargement");
let plongeeCommencee = false;

ecranChargement.addEventListener("click", async evenement => {
  evenement.preventDefault();
  if (plongeeCommencee) return;
  plongeeCommencee = true;
  ecranChargement.classList.add("ecran-chargement--plongee");
  demanderMorceau("ambiance");
  const attendre = duree => new Promise(fin => setTimeout(fin, duree));
  await Promise.all([
    attendre(DUREE_PLONGEE),
    Promise.race([recupererSauvegarde(), attendre(ATTENTE_MAX_SAUVEGARDE)]),
  ]);
  location.href = choixCompteFait() ? "accueil.html" : "connexion.html";
});
