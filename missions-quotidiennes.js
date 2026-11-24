// Missions quotidiennes : 3 missions par jour, renouvelées à minuit (heure du téléphone). Chacune rapporte
// 1 Sceau ; une fois les 3 accomplies, la barre de progression est pleine et offre 1 Sceau bonus.
// Les récompenses se récupèrent à la main sur la page Missions. Utilise sceaux.js (à charger avant).
//
// Avancement : connexion → accueil.js, boosters → recharge.js (utiliserBoosters), combat → jeu.js.

const CLE_MISSIONS = "tcg-one-piece/missions";

const MISSIONS_QUOTIDIENNES = [
  { id: "connexion", titre: "Se connecter au jeu", objectif: 1, recompense: 1 },
  { id: "boosters", titre: "Ouvrir 2 boosters", objectif: 2, recompense: 1 },
  { id: "combat", titre: "Disputer un combat", objectif: 1, recompense: 1 },
];
const RECOMPENSE_BONUS = 1;

// « 2026-11-23 » : le jour en cours, à l'heure du téléphone
function jourActuel(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// { jour, avancement: { connexion: 1, … }, recuperees: { connexion: true, …, bonus: true } } ;
// un nouveau jour repart de zéro
function lireMissions() {
  try {
    const etat = JSON.parse(localStorage.getItem(CLE_MISSIONS));
    if (etat?.jour === jourActuel()) return { avancement: {}, recuperees: {}, ...etat };
  } catch {}
  return { jour: jourActuel(), avancement: {}, recuperees: {} };
}

function enregistrerMissions(etat) {
  try {
    localStorage.setItem(CLE_MISSIONS, JSON.stringify(etat));
  } catch {}
  // Copie en ligne pour les comptes liés à Discord (sauvegarde.js, si la page le charge)
  if (typeof signalerModification === "function") signalerModification();
}

const missionAccomplie = (etat, mission) => (etat.avancement[mission.id] || 0) >= mission.objectif;
const missionsAccomplies = (etat = lireMissions()) => MISSIONS_QUOTIDIENNES.filter(m => missionAccomplie(etat, m)).length;

// À appeler quand le joueur fait l'action demandée (« boosters » : nombre de boosters ouverts)
function progresserMission(id, quantite = 1) {
  const mission = MISSIONS_QUOTIDIENNES.find(m => m.id === id);
  const etat = lireMissions();
  if (!mission || missionAccomplie(etat, mission)) return;
  etat.avancement[id] = Math.min(mission.objectif, (etat.avancement[id] || 0) + quantite);
  enregistrerMissions(etat);
}

// Une récompense prête : mission accomplie (ou les 3 pour le bonus) et pas encore récupérée
function recompensePrete(id, etat = lireMissions()) {
  if (etat.recuperees[id]) return false;
  if (id === "bonus") return missionsAccomplies(etat) === MISSIONS_QUOTIDIENNES.length;
  const mission = MISSIONS_QUOTIDIENNES.find(m => m.id === id);
  return Boolean(mission) && missionAccomplie(etat, mission);
}

// Donne les Sceaux d'une récompense prête ; renvoie le nombre gagné (0 si rien à récupérer)
function recupererRecompense(id) {
  const etat = lireMissions();
  if (!recompensePrete(id, etat)) return 0;
  const gain = id === "bonus" ? RECOMPENSE_BONUS : MISSIONS_QUOTIDIENNES.find(m => m.id === id).recompense;
  etat.recuperees[id] = true;
  enregistrerMissions(etat);
  gagnerSceaux(gain);
  return gain;
}
