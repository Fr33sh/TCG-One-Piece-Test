// Compte du joueur (pseudo#1234), gardé dans ce navigateur, et échanges avec le serveur du jeu (serveur/worker.js).
// Le compte contient un jeton secret : c'est lui qui prouve au serveur que le joueur est bien le propriétaire.

const CLE_COMPTE = "tcg-one-piece/compte";
const PSEUDO_VALIDE = /^[\p{L}\p{N}_-]{3,16}$/u;

function lireCompte() {
  try {
    return JSON.parse(localStorage.getItem(CLE_COMPTE));
  } catch {
    return null;
  }
}

function enregistrerCompte(compte) {
  try {
    localStorage.setItem(CLE_COMPTE, JSON.stringify(compte));
  } catch {}
}

// « Luffy#4821 », avec le # et les chiffres un peu plus discrets
function creerNomJoueur({ pseudo, tag }) {
  const nom = document.createElement("span");
  nom.className = "pseudo";
  const chiffres = document.createElement("span");
  chiffres.className = "pseudo__tag";
  chiffres.textContent = `#${tag}`;
  nom.append(pseudo, chiffres);
  return nom;
}

function verifierPseudoSaisi(pseudo) {
  if (!PSEUDO_VALIDE.test(pseudo)) {
    throw new Error("Le pseudo doit faire de 3 à 16 caractères : lettres, chiffres, « _ » ou « - », sans espace.");
  }
}

// Appelle le serveur ; renvoie sa réponse, ou lève une erreur avec un message à montrer au joueur
async function appelerServeur(chemin, corps) {
  if (location.protocol === "file:") {
    throw new Error("Les fonctions en ligne ne marchent que sur le site du jeu, pas en ouvrant les fichiers sur le PC.");
  }
  const options = { method: corps === undefined ? "GET" : "POST", headers: {} };
  if (corps !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(corps);
  }
  const compte = lireCompte();
  if (compte) options.headers.Authorization = `Bearer ${compte.id}.${compte.jeton}`;

  let reponse;
  try {
    reponse = await fetch(`/api/${chemin}`, options);
  } catch {
    throw new Error("Impossible de joindre le serveur : vérifie ta connexion internet.");
  }
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) throw new Error(donnees.erreur || "Le serveur a rencontré un problème, réessaie plus tard.");
  return donnees;
}
