// Recharge des boosters : un booster toutes les 8 h, jusqu'à 3 en réserve ; le tout premier est disponible
// tout de suite. Sous le booster, la barre avance vers le prochain et le temps restant s'affiche dessous, à côté
// du nombre de Sabliers ; les boosters disponibles sont de petites icônes en éventail, comme des cartes en main.
// « Ouvrir 1 Booster » demande 1 booster en réserve, « Ouvrir 10 Boosters » en demande 10 : ce qui manque
// se paie en Sabliers (sabliers.js, 1 Sablier = 1 heure de recharge).

const DUREE_RECHARGE = 8 * 60 * 60 * 1000; // ms
const RESERVE_MAX = 3;
const CLE_RECHARGE = "tcg-one-piece/recharge";
const ANGLE_EVENTAIL = 10; // degrés entre deux icônes

const barreRecharge = document.querySelector(".recharge");
const remplissageRecharge = document.querySelector(".recharge__remplissage");
const tempsRecharge = document.querySelector(".recharge__texte");
const reserveBoosters = document.querySelector(".reserve-boosters");
const compteurSabliers = document.querySelector(".sabliers__nombre");

function enregistrerOrigine(origine) {
  try {
    localStorage.setItem(CLE_RECHARGE, JSON.stringify({ origine }));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

// Une seule date suffit : la réserve compte les périodes de 8 h écoulées depuis cette « origine »
function lireOrigine() {
  try {
    const sauvegarde = JSON.parse(localStorage.getItem(CLE_RECHARGE));
    if (sauvegarde && Number.isFinite(sauvegarde.origine)) return sauvegarde.origine;
  } catch {}
  // Nouveau joueur : le premier booster est déjà prêt
  const origine = Date.now() - DUREE_RECHARGE;
  enregistrerOrigine(origine);
  return origine;
}

let origineRecharge = lireOrigine();

function etatRecharge(maintenant = Date.now()) {
  const ecoule = Math.max(0, maintenant - origineRecharge);
  const gagnes = Math.floor(ecoule / DUREE_RECHARGE);
  // Réserve pleine : la barre reste pleine et le temps s'arrête
  if (gagnes >= RESERVE_MAX) return { reserve: RESERVE_MAX, progression: 1, restant: 0 };
  const dansLaPeriode = ecoule - gagnes * DUREE_RECHARGE;
  return { reserve: gagnes, progression: dansLaPeriode / DUREE_RECHARGE, restant: DUREE_RECHARGE - dansLaPeriode };
}

// Sabliers à dépenser pour ouvrir « nombre » boosters : les heures qui manquent, en comptant la réserve
// et le temps déjà écoulé vers le prochain (une heure entamée compte pour un Sablier entier).
// Réserve pleine : le temps est arrêté, rien n'est écoulé vers le suivant.
function coutSabliers(nombre, maintenant = Date.now()) {
  const { reserve, restant } = etatRecharge(maintenant);
  if (reserve >= nombre) return 0;
  const ecoule = reserve >= RESERVE_MAX ? 0 : DUREE_RECHARGE - restant;
  return Math.ceil(((nombre - reserve) * DUREE_RECHARGE - ecoule) / DUREE_SABLIER);
}

const peutOuvrir = nombre => coutSabliers(nombre) <= lireSabliers();

// Retire des boosters de la réserve, en complétant avec des Sabliers si besoin ; renvoie faux s'il n'y en a pas assez
function utiliserBoosters(nombre) {
  const maintenant = Date.now();
  const { reserve } = etatRecharge(maintenant);
  const cout = coutSabliers(nombre, maintenant);
  if (!depenserSabliers(cout)) return false;
  // Avec des Sabliers, toute la réserve et le temps écoulé sont utilisés : la recharge repart de zéro
  if (cout > 0) origineRecharge = maintenant;
  // Si la réserve était pleine, l'attente du suivant ne commence que maintenant
  else if (reserve >= RESERVE_MAX) origineRecharge = maintenant - (RESERVE_MAX - nombre) * DUREE_RECHARGE;
  else origineRecharge += nombre * DUREE_RECHARGE;
  enregistrerOrigine(origineRecharge);
  afficherRecharge();
  // Mission quotidienne « Ouvrir 2 boosters » (missions-quotidiennes.js)
  if (typeof progresserMission === "function") progresserMission("boosters", nombre);
  return true;
}

// « 7 h 05 min », « 32 min »
function formaterDuree(ms) {
  const minutes = Math.ceil(ms / 60000);
  const heures = Math.floor(minutes / 60);
  return heures ? `${heures} h ${String(minutes % 60).padStart(2, "0")} min` : `${minutes} min`;
}

// Une icône de booster par booster disponible, en éventail ; celle qui vient d'arriver apparaît en douceur
function afficherReserve(reserve) {
  const icones = reserveBoosters.children;
  if (icones.length === reserve) return;
  while (icones.length > reserve) icones[icones.length - 1].remove();
  while (icones.length < reserve) {
    const icone = document.createElement("span");
    icone.className = "mini-booster";
    reserveBoosters.append(icone);
    icone.animate([{ opacity: 0, scale: "0.5" }, { opacity: 1, scale: "1" }], { duration: 400, easing: "ease-out" });
  }
  [...icones].forEach((icone, rang) => {
    const ecart = rang - (reserve - 1) / 2;
    icone.style.rotate = `${ecart * ANGLE_EVENTAIL}deg`;
    icone.style.translate = `0 ${Math.abs(ecart) * 1.5}px`;
  });
  reserveBoosters.setAttribute("aria-label", `${reserve} booster${reserve > 1 ? "s" : ""} disponible${reserve > 1 ? "s" : ""}`);
}

function afficherRecharge() {
  const { reserve, progression, restant } = etatRecharge();
  remplissageRecharge.style.width = `${progression * 100}%`;
  barreRecharge.setAttribute("aria-valuenow", Math.floor(progression * 100));
  tempsRecharge.textContent = reserve >= RESERVE_MAX ? "Réserve pleine" : formaterDuree(restant);
  afficherReserve(reserve);
  compteurSabliers.textContent = lireSabliers();
  afficherCoutBouton(".bulle-choix--un", 1);
  afficherCoutBouton(".bulle-choix--dix", 10);
}

// Sous le texte du bouton : le prix en Sabliers, s'il faut en dépenser
function afficherCoutBouton(selecteur, nombre) {
  const bouton = document.querySelector(selecteur);
  const cout = coutSabliers(nombre);
  bouton.disabled = cout > lireSabliers();
  bouton.querySelector(".bulle-choix__cout").hidden = !cout;
  bouton.querySelector(".bulle-choix__prix").textContent = cout;
  bouton.setAttribute("aria-label", `${bouton.firstChild.textContent.trim()}${cout ? `, ${cout} Sablier${cout > 1 ? "s" : ""}` : ""}`);
}

afficherRecharge();
setInterval(afficherRecharge, 1000);
