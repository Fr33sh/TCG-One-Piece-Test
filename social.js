// Page Social (compte Discord obligatoire) : chercher un joueur par pseudo#1234 et lui demander d'être ami,
// répondre aux demandes reçues, voir et retirer ses amis, annuler ses demandes envoyées.
// La page se met à jour toute seule.

const ACTUALISATION_SOCIAL = 20000; // ms

// Boutons de chaque liste : texte, adresse du serveur, confirmation éventuelle
const ACTIONS_LISTES = {
  recues: [
    { texte: "Accepter", chemin: "demandes/accepter", principale: true },
    { texte: "Refuser", chemin: "demandes/refuser" },
  ],
  amis: [
    { texte: "Retirer", chemin: "amis/retirer", confirmation: nom => `Retirer ${nom} de tes amis ?` },
  ],
  envoyees: [
    { texte: "Annuler", chemin: "demandes/annuler" },
  ],
};

let actualisationEnCours = false;

function montrerVue(nom) {
  for (const vue of document.querySelectorAll("[data-vue]")) vue.hidden = vue.dataset.vue !== nom;
}

function afficherMessageAjout(texte, erreur = false) {
  const message = document.querySelector('[data-message="ajout"]');
  message.textContent = texte;
  message.classList.toggle("message-page--erreur", erreur);
}

function creerLigneJoueur(joueur, actions) {
  const ligne = document.createElement("li");
  ligne.className = "joueur";
  ligne.append(creerNomJoueur(joueur));
  for (const { texte, chemin, principale, confirmation } of actions) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = `petite-bulle${principale ? " petite-bulle--principale" : ""}`;
    bouton.textContent = texte;
    bouton.addEventListener("click", async () => {
      if (confirmation && !confirm(confirmation(`${joueur.pseudo}#${joueur.tag}`))) return;
      for (const autre of ligne.querySelectorAll("button")) autre.disabled = true;
      try {
        await appelerServeur(chemin, { id: joueur.id });
      } catch (erreur) {
        alert(erreur.message);
      }
      actualiser();
    });
    ligne.append(bouton);
  }
  return ligne;
}

function remplirListe(nom, joueurs) {
  const liste = document.querySelector(`[data-liste="${nom}"]`);
  document.querySelector(`[data-compteur="${nom}"]`).textContent = joueurs.length ? `(${joueurs.length})` : "";
  if (!joueurs.length) {
    const vide = document.createElement("li");
    vide.className = "liste-joueurs__vide";
    vide.textContent = liste.dataset.vide;
    liste.replaceChildren(vide);
    return;
  }
  liste.replaceChildren(...joueurs.map(joueur => creerLigneJoueur(joueur, ACTIONS_LISTES[nom])));
}

async function actualiser() {
  if (!compteLie()) {
    montrerVue("sans-profil");
    return;
  }
  if (actualisationEnCours) return;
  actualisationEnCours = true;
  try {
    const etat = await appelerServeur("social");
    // Le pseudo a pu changer depuis un autre appareil : on garde le compte à jour
    enregistrerCompte({ ...lireCompte(), ...etat.moi });
    document.querySelector("[data-identifiant]").replaceChildren(creerNomJoueur(etat.moi));
    for (const nom of Object.keys(ACTIONS_LISTES)) remplirListe(nom, etat[nom]);
    montrerVue("social");
  } catch (erreur) {
    document.querySelector('[data-message="hors-ligne"]').textContent = erreur.message;
    montrerVue("hors-ligne");
  } finally {
    actualisationEnCours = false;
  }
}

// Recherche par pseudo#1234 et demande d'ami
document.querySelector('[data-formulaire="ajout"]').addEventListener("submit", async evenement => {
  evenement.preventDefault();
  const formulaire = evenement.currentTarget;
  const bouton = formulaire.querySelector("button");
  bouton.disabled = true;
  try {
    const { statut, joueur } = await appelerServeur("demandes", { cible: formulaire.elements.cible.value.trim() });
    const nom = `${joueur.pseudo}#${joueur.tag}`;
    afficherMessageAjout(statut === "amis"
      ? `${nom} t'avait déjà fait une demande : vous êtes maintenant amis !`
      : `Demande envoyée à ${nom}.`);
    formulaire.reset();
    actualiser();
  } catch (erreur) {
    afficherMessageAjout(erreur.message, true);
  } finally {
    bouton.disabled = false;
  }
});

document.querySelector("[data-lier-discord]").addEventListener("click", () => {
  try {
    lancerConnexionDiscord();
  } catch (erreur) {
    document.querySelector('[data-message="discord"]').textContent = erreur.message;
  }
});

actualiser();
setInterval(() => {
  if (!document.hidden) actualiser();
}, ACTUALISATION_SOCIAL);
