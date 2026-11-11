// Écran de création du compte, au premier lancement (après « Touchez ») : le joueur choisit son pseudo et
// lie son compte Discord, ou continue sans compte après un avertissement sur le risque de perte des données.
// Discord renvoie ensuite le joueur ici (adresse « #discord-session=… » ou « #discord-erreur=… »).

const DELAI_BIENVENUE = 1400; // ms avant d'entrer dans le jeu

const formulaire = document.querySelector('[data-formulaire="creation"]');
const champPseudo = formulaire.elements.pseudo;
const avertissement = document.querySelector("[data-avertissement]");

function afficherMessage(texte) {
  document.querySelector("[data-message]").textContent = texte;
}

const entrerDansLeJeu = () => { location.href = "accueil.html"; };

function lierDiscord() {
  try {
    lancerConnexionDiscord();
  } catch (erreur) {
    avertissement.hidden = true;
    afficherMessage(erreur.message);
  }
}

// Les deux choix demandent d'abord un pseudo valide
formulaire.addEventListener("submit", evenement => {
  evenement.preventDefault();
  const pseudo = champPseudo.value.trim();
  try {
    verifierPseudoSaisi(pseudo);
  } catch (erreur) {
    afficherMessage(erreur.message);
    champPseudo.focus();
    return;
  }
  enregistrerPseudoLocal(pseudo);
  if (evenement.submitter?.dataset.choix === "sans-compte") avertissement.hidden = false;
  else lierDiscord();
});

document.querySelector('[data-avertissement-choix="discord"]').addEventListener("click", lierDiscord);
document.querySelector('[data-avertissement-choix="sans-compte"]').addEventListener("click", () => {
  choisirSansCompte();
  entrerDansLeJeu();
});

// Retour de Discord : session enregistrée, pseudo appliqué, sauvegarde récupérée, puis entrée dans le jeu
async function revenirDeDiscord(session) {
  document.querySelector('[data-etape="creation"]').hidden = true;
  document.querySelector('[data-etape="retour"]').hidden = false;
  try {
    const compte = await terminerConnexionDiscord(session);
    await recupererSauvegarde();
    document.querySelector("[data-titre-retour]").textContent = "Compte lié !";
    const texte = document.querySelector("[data-texte-retour]");
    texte.replaceChildren("Bienvenue, ", creerNomJoueur(compte), " !");
    setTimeout(entrerDansLeJeu, DELAI_BIENVENUE);
  } catch (erreur) {
    enregistrerCompte(null);
    document.querySelector('[data-etape="creation"]').hidden = false;
    document.querySelector('[data-etape="retour"]').hidden = true;
    afficherMessage(erreur.message);
  }
}

const retour = new URLSearchParams(location.hash.slice(1));
history.replaceState(null, "", location.pathname);
champPseudo.value = lirePseudoLocal() || "";

if (retour.get("discord-session")) revenirDeDiscord(retour.get("discord-session"));
else if (retour.get("discord-erreur")) afficherMessage(retour.get("discord-erreur"));
