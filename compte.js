// Compte du joueur, gardé dans ce navigateur, et échanges avec le serveur du jeu (serveur/worker.js).
// - Pseudo choisi à la création du compte (écran de création, au lancement du jeu).
// - Compte lié à Discord : une session (identifiant + jeton secret) prouve au serveur qui est le joueur ;
//   le pseudo reçoit alors un # et 4 chiffres, et les données sont sauvegardées en ligne.
// - Sans Discord : le pseudo reste dans ce navigateur, sans amis ni sauvegarde en ligne.

const CLE_SESSION = "tcg-one-piece/session";
const CLE_PSEUDO_LOCAL = "tcg-one-piece/pseudo-local";
const CLE_SANS_COMPTE = "tcg-one-piece/sans-compte";
const PSEUDO_VALIDE = /^[\p{L}\p{N}_-]{3,16}$/u;

function lireStockage(cle) {
  try {
    return JSON.parse(localStorage.getItem(cle));
  } catch {
    return null;
  }
}

function ecrireStockage(cle, valeur) {
  try {
    if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {}
}

// Session Discord : { id, jeton, pseudo, tag, discord }
const lireCompte = () => lireStockage(CLE_SESSION);
const enregistrerCompte = compte => ecrireStockage(CLE_SESSION, compte);
const compteLie = () => Boolean(lireCompte()?.jeton);

const lirePseudoLocal = () => lireStockage(CLE_PSEUDO_LOCAL);
const enregistrerPseudoLocal = pseudo => ecrireStockage(CLE_PSEUDO_LOCAL, pseudo);

// L'écran de création n'apparaît qu'une fois : compte lié, ou choix de jouer sans compte
const choixCompteFait = () => compteLie() || lireStockage(CLE_SANS_COMPTE) === true;
const choisirSansCompte = () => ecrireStockage(CLE_SANS_COMPTE, true);

// « Luffy#4821 », avec le # et les chiffres un peu plus discrets (sans compte lié : le pseudo seul)
function creerNomJoueur({ pseudo, tag }) {
  const nom = document.createElement("span");
  nom.className = "pseudo";
  nom.append(pseudo);
  if (tag) {
    const chiffres = document.createElement("span");
    chiffres.className = "pseudo__tag";
    chiffres.textContent = `#${tag}`;
    nom.append(chiffres);
  }
  return nom;
}

function verifierPseudoSaisi(pseudo) {
  if (!PSEUDO_VALIDE.test(pseudo)) {
    throw new Error("Le pseudo doit faire de 3 à 16 caractères : lettres, chiffres, « _ » ou « - », sans espace.");
  }
}

// Départ vers Discord. Discord refuse de s'afficher dans un cadre : c'est toute la fenêtre qui part
// (l'émulateur compris), puis le serveur ramène le joueur au jeu.
function lancerConnexionDiscord() {
  if (location.protocol === "file:") {
    throw new Error("La connexion Discord ne marche que sur le site du jeu, pas en ouvrant les fichiers sur le PC.");
  }
  window.top.location.href = "/api/discord/connexion";
}

// Appelle le serveur ; renvoie sa réponse, ou lève une erreur avec un message à montrer au joueur
async function appelerServeur(chemin, corps, options = {}) {
  if (location.protocol === "file:") {
    throw new Error("Les fonctions en ligne ne marchent que sur le site du jeu, pas en ouvrant les fichiers sur le PC.");
  }
  const requete = { method: corps === undefined ? "GET" : "POST", headers: {}, keepalive: Boolean(options.keepalive) };
  if (corps !== undefined) {
    requete.headers["Content-Type"] = "application/json";
    requete.body = JSON.stringify(corps);
  }
  const compte = lireCompte();
  if (compte?.jeton) requete.headers.Authorization = `Bearer ${compte.id}.${compte.jeton}`;

  let reponse;
  try {
    reponse = await fetch(`/api/${chemin}`, requete);
  } catch {
    throw new Error("Impossible de joindre le serveur : vérifie ta connexion internet.");
  }
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) throw new Error(donnees.erreur || "Le serveur a rencontré un problème, réessaie plus tard.");
  return donnees;
}

// Au retour de Discord : la session est enregistrée ; un nouveau compte reçoit le pseudo choisi à la création
// (un compte qui avait déjà un pseudo, sur un autre appareil, le garde). Renvoie le compte à jour.
async function terminerConnexionDiscord(session) {
  const [id, jeton] = session.split(".");
  enregistrerCompte({ id, jeton });
  let compte = await appelerServeur("compte");
  const pseudoLocal = lirePseudoLocal();
  if (!compte.pseudo && pseudoLocal) compte = { ...compte, ...await appelerServeur("compte/pseudo", { pseudo: pseudoLocal }) };
  enregistrerCompte({ id, jeton, ...compte });
  if (compte.pseudo) enregistrerPseudoLocal(compte.pseudo);
  return compte;
}
