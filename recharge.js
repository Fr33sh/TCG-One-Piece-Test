// Recharge des boosters : un booster toutes les 8 h, jusqu'à 3 en réserve ; le tout premier est disponible
// tout de suite. La barre, sur la languette du bas du booster, avance vers le prochain et affiche le temps
// restant ; les boosters disponibles sont de petites icônes en éventail, comme des cartes en main.
// « Ouvrir 1 Booster » demande 1 booster en réserve, « Ouvrir 10 Boosters » en demande 10.

const DUREE_RECHARGE = 8 * 60 * 60 * 1000; // ms
const RESERVE_MAX = 3;
const CLE_RECHARGE = "tcg-one-piece/recharge";
const ANGLE_EVENTAIL = 10; // degrés entre deux icônes

const barreRecharge = document.querySelector(".recharge");
const remplissageRecharge = document.querySelector(".recharge__remplissage");
const tempsRecharge = document.querySelector(".recharge__temps");
const reserveBoosters = document.querySelector(".reserve-boosters");

function enregistrerOrigine(origine) {
  try {
    localStorage.setItem(CLE_RECHARGE, JSON.stringify({ origine }));
  } catch {}
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

// Cadeau temporaire, pour voir le rendu des icônes : 3 boosters d'un coup, une seule fois par navigateur.
// À retirer avant de partager le jeu.
const CLE_CADEAU = "tcg-one-piece/cadeau-3-boosters";
try {
  if (!localStorage.getItem(CLE_CADEAU)) {
    origineRecharge = Date.now() - RESERVE_MAX * DUREE_RECHARGE;
    enregistrerOrigine(origineRecharge);
    localStorage.setItem(CLE_CADEAU, "1");
  }
} catch {}

function etatRecharge(maintenant = Date.now()) {
  const ecoule = Math.max(0, maintenant - origineRecharge);
  const gagnes = Math.floor(ecoule / DUREE_RECHARGE);
  // Réserve pleine : la barre reste pleine et le temps s'arrête
  if (gagnes >= RESERVE_MAX) return { reserve: RESERVE_MAX, progression: 1, restant: 0 };
  const dansLaPeriode = ecoule - gagnes * DUREE_RECHARGE;
  return { reserve: gagnes, progression: dansLaPeriode / DUREE_RECHARGE, restant: DUREE_RECHARGE - dansLaPeriode };
}

// Retire des boosters de la réserve ; renvoie faux s'il n'y en a pas assez
function utiliserBoosters(nombre) {
  const maintenant = Date.now();
  const { reserve } = etatRecharge(maintenant);
  if (reserve < nombre) return false;
  // Si la réserve était pleine, l'attente du suivant ne commence que maintenant
  if (reserve >= RESERVE_MAX) origineRecharge = maintenant - (RESERVE_MAX - nombre) * DUREE_RECHARGE;
  else origineRecharge += nombre * DUREE_RECHARGE;
  enregistrerOrigine(origineRecharge);
  afficherRecharge();
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
  document.querySelector(".bulle-choix--un").disabled = reserve < 1;
  document.querySelector(".bulle-choix--dix").disabled = reserve < 10;
}

afficherRecharge();
setInterval(afficherRecharge, 1000);
