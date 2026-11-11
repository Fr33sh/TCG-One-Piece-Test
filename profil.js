// Page Profil : sans profil, le joueur choisit son pseudo (le serveur ajoute un # et 4 chiffres au hasard) ;
// avec un profil, il voit son identifiant à partager et peut changer de pseudo à tout moment.

const vueCreation = document.querySelector('[data-vue="creation"]');
const vueProfil = document.querySelector('[data-vue="profil"]');

function afficherProfil() {
  const compte = lireCompte();
  vueCreation.hidden = Boolean(compte);
  vueProfil.hidden = !compte;
  if (compte) document.querySelector("[data-identifiant]").replaceChildren(creerNomJoueur(compte));
}

function afficherMessage(nom, texte, erreur = false) {
  const message = document.querySelector(`[data-message="${nom}"]`);
  message.textContent = texte;
  message.classList.toggle("message-page--erreur", erreur);
}

// Envoie un formulaire au serveur ; le bouton reste grisé pendant l'échange
function brancherFormulaire(nom, action) {
  const formulaire = document.querySelector(`[data-formulaire="${nom}"]`);
  formulaire.addEventListener("submit", async evenement => {
    evenement.preventDefault();
    const bouton = formulaire.querySelector("button");
    const pseudo = formulaire.elements.pseudo.value.trim();
    bouton.disabled = true;
    try {
      verifierPseudoSaisi(pseudo);
      await action(pseudo);
      formulaire.reset();
    } catch (erreur) {
      afficherMessage(nom, erreur.message, true);
    } finally {
      bouton.disabled = false;
    }
  });
}

brancherFormulaire("creation", async pseudo => {
  const compte = await appelerServeur("compte", { pseudo });
  enregistrerCompte(compte);
  afficherProfil();
  afficherMessage("pseudo", "Ton profil est créé !");
});

// Le # est gardé, sauf si quelqu'un a déjà le nouveau pseudo avec les mêmes 4 chiffres
brancherFormulaire("pseudo", async pseudo => {
  const ancien = lireCompte();
  const { pseudo: nouveau, tag } = await appelerServeur("compte/pseudo", { pseudo });
  enregistrerCompte({ ...ancien, pseudo: nouveau, tag });
  afficherProfil();
  afficherMessage("pseudo", tag === ancien.tag
    ? "Pseudo changé !"
    : `Pseudo changé ! Tes 4 chiffres ont changé, car ${nouveau}#${ancien.tag} était déjà pris.`);
});

afficherProfil();
