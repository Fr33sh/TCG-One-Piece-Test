// Page Profil : le pseudo (avec son # et ses 4 chiffres si le compte est lié à Discord), le changement de
// pseudo à tout moment, et la liaison à Discord pour un joueur qui a choisi de jouer sans compte.

function afficherProfil() {
  const compte = lireCompte();
  const lie = compteLie();
  const joueur = lie ? compte : { pseudo: lirePseudoLocal() || "Sans pseudo" };
  document.querySelector("[data-identifiant]").replaceChildren(creerNomJoueur(joueur));
  document.querySelector("[data-texte-profil]").textContent = lie
    ? `Compte lié à Discord${compte.discord ? ` (${compte.discord})` : ""}. Donne ton identifiant à tes amis pour qu'ils t'ajoutent depuis l'onglet Social.`
    : "Compte non lié : ce pseudo n'existe que sur cet appareil.";
  document.querySelector('[data-vue="sans-lien"]').hidden = lie;
}

function afficherMessage(nom, texte, erreur = false) {
  const message = document.querySelector(`[data-message="${nom}"]`);
  message.textContent = texte;
  message.classList.toggle("message-page--erreur", erreur);
}

// Changement de pseudo : sur le serveur si le compte est lié (le # est gardé, sauf si quelqu'un a déjà le
// nouveau pseudo avec les mêmes chiffres), sinon dans ce navigateur seulement
const formulaire = document.querySelector('[data-formulaire="pseudo"]');
formulaire.addEventListener("submit", async evenement => {
  evenement.preventDefault();
  const bouton = formulaire.querySelector("button");
  const pseudo = formulaire.elements.pseudo.value.trim();
  bouton.disabled = true;
  try {
    verifierPseudoSaisi(pseudo);
    if (compteLie()) {
      const ancien = lireCompte();
      const { pseudo: nouveau, tag } = await appelerServeur("compte/pseudo", { pseudo });
      enregistrerCompte({ ...ancien, pseudo: nouveau, tag });
      enregistrerPseudoLocal(nouveau);
      afficherMessage("pseudo", tag === ancien.tag || !ancien.tag
        ? "Pseudo changé !"
        : `Pseudo changé ! Tes 4 chiffres ont changé, car ${nouveau}#${ancien.tag} était déjà pris.`);
    } else {
      enregistrerPseudoLocal(pseudo);
      afficherMessage("pseudo", "Pseudo changé !");
    }
    formulaire.reset();
    afficherProfil();
  } catch (erreur) {
    afficherMessage("pseudo", erreur.message, true);
  } finally {
    bouton.disabled = false;
  }
});

document.querySelector("[data-lier-discord]").addEventListener("click", () => {
  try {
    lancerConnexionDiscord();
  } catch (erreur) {
    afficherMessage("discord", erreur.message, true);
  }
});

afficherProfil();

// Le pseudo a pu changer depuis un autre appareil : on le met à jour
if (compteLie()) {
  appelerServeur("compte").then(compte => {
    enregistrerCompte({ ...lireCompte(), ...compte });
    if (compte.pseudo) enregistrerPseudoLocal(compte.pseudo);
    afficherProfil();
  }).catch(() => {});
}
