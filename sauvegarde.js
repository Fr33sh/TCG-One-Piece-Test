// Sauvegarde en ligne, pour les comptes liés à Discord : collection, boosters et réglages sont copiés sur le
// serveur à chaque changement, et récupérés au lancement du jeu (ou sur un autre appareil).
// Utilise compte.js (à charger avant). Sans compte lié, rien ne se passe : tout reste dans ce navigateur.

const CLES_SAUVEGARDEES = [
  "tcg-one-piece/collection",
  "tcg-one-piece/recharge",
  "tcg-one-piece/cadeau-3-boosters",
  "tcg-one-piece/parametres",
];
const DELAI_SAUVEGARDE = 1500; // ms : plusieurs changements rapprochés partent en un seul envoi

let minuterieSauvegarde = null;

function donneesLocales() {
  const donnees = {};
  for (const cle of CLES_SAUVEGARDEES) {
    try {
      const valeur = localStorage.getItem(cle);
      if (valeur !== null) donnees[cle] = valeur;
    } catch {}
  }
  return donnees;
}

function restaurerDonnees(donnees) {
  for (const cle of CLES_SAUVEGARDEES) {
    try {
      if (cle in donnees) localStorage.setItem(cle, donnees[cle]);
      else localStorage.removeItem(cle);
    } catch {}
  }
}

function envoyerSauvegarde(options = {}) {
  clearTimeout(minuterieSauvegarde);
  minuterieSauvegarde = null;
  if (!compteLie()) return Promise.resolve();
  return appelerServeur("sauvegarde", { donnees: donneesLocales() }, options).catch(() => {});
}

// À appeler après chaque changement de données sauvegardées
function signalerModification() {
  if (!compteLie()) return;
  clearTimeout(minuterieSauvegarde);
  minuterieSauvegarde = setTimeout(envoyerSauvegarde, DELAI_SAUVEGARDE);
}

// Au lancement : la sauvegarde en ligne remplace celle de ce navigateur. S'il n'y en a pas encore
// (compte tout juste lié), c'est la progression de ce navigateur qui est envoyée.
async function recupererSauvegarde() {
  if (!compteLie()) return;
  try {
    const { donnees } = await appelerServeur("sauvegarde");
    if (donnees) restaurerDonnees(donnees);
    else await envoyerSauvegarde();
  } catch {}
}

// En quittant la page, un envoi en attente part tout de suite
addEventListener("pagehide", () => {
  if (minuterieSauvegarde) envoyerSauvegarde({ keepalive: true });
});
