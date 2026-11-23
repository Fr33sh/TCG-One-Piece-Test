// Page Missions : les 3 missions quotidiennes (missions-quotidiennes.js), leur barre de progression avec le
// Sablier bonus au bout, le temps avant les nouvelles missions et les boutons « Récupérer ».

const ACTUALISATION_MISSIONS = 30000; // ms : compte à rebours et changement de jour

const listeMissions = document.querySelector("[data-liste-missions]");
const boutonBonus = document.querySelector("[data-bonus]");
const messageMissions = document.querySelector("[data-message]");

// Temps restant avant minuit, heure du téléphone : « 5 h 12 min », « 8 min »
function avantNouvellesMissions() {
  const minuit = new Date();
  minuit.setHours(24, 0, 0, 0);
  const minutes = Math.ceil((minuit - Date.now()) / 60000);
  const heures = Math.floor(minutes / 60);
  return heures ? `${heures} h ${String(minutes % 60).padStart(2, "0")} min` : `${minutes} min`;
}

function creerBoutonRecompense(id, etat) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  if (etat.recuperees[id]) {
    bouton.className = "petite-bulle mission__bouton mission__bouton--fait";
    bouton.textContent = "Récupéré ✓";
    bouton.disabled = true;
  } else if (recompensePrete(id, etat)) {
    bouton.className = "petite-bulle petite-bulle--principale mission__bouton";
    bouton.textContent = "Récupérer";
    bouton.addEventListener("click", () => recuperer(id));
  } else {
    bouton.className = "petite-bulle mission__bouton";
    bouton.textContent = "En cours";
    bouton.disabled = true;
  }
  return bouton;
}

function creerLigneMission(mission, etat) {
  const avancement = Math.min(mission.objectif, etat.avancement[mission.id] || 0);
  const ligne = document.createElement("li");
  ligne.className = `mission${avancement >= mission.objectif ? " mission--accomplie" : ""}`;
  ligne.innerHTML = `
    <div class="mission__infos">
      <span class="mission__titre"></span>
      <span class="mission__suivi">
        <span class="mission__barre"><span class="mission__remplissage" style="width: ${(avancement / mission.objectif) * 100}%"></span></span>
        <span class="mission__compte">${avancement} / ${mission.objectif}</span>
      </span>
    </div>
    <span class="mission__recompense" aria-label="Récompense : ${mission.recompense} Sablier"><img src="assets/icones/sablier.svg" alt="">+${mission.recompense}</span>`;
  ligne.querySelector(".mission__titre").textContent = mission.titre;
  ligne.append(creerBoutonRecompense(mission.id, etat));
  return ligne;
}

function afficherMissions() {
  const etat = lireMissions();
  const accomplies = missionsAccomplies(etat);
  const total = MISSIONS_QUOTIDIENNES.length;

  document.querySelector("[data-sabliers]").textContent = lireSabliers();
  document.querySelector("[data-renouvellement]").textContent = `Nouvelles missions dans ${avantNouvellesMissions()}`;

  // Barre de progression : un tiers par mission accomplie ; pleine, elle offre le Sablier bonus
  const piste = document.querySelector(".progression__piste");
  piste.setAttribute("aria-valuenow", accomplies);
  document.querySelector(".progression__remplissage").style.width = `${(accomplies / total) * 100}%`;
  document.querySelector("[data-progression-texte]").textContent = `${accomplies} / ${total}`;
  boutonBonus.disabled = !recompensePrete("bonus", etat);
  boutonBonus.classList.toggle("progression__bonus--pret", recompensePrete("bonus", etat));
  boutonBonus.classList.toggle("progression__bonus--fait", Boolean(etat.recuperees.bonus));
  boutonBonus.querySelector(".progression__gain").textContent = etat.recuperees.bonus ? "✓" : `+${RECOMPENSE_BONUS}`;

  listeMissions.replaceChildren(...MISSIONS_QUOTIDIENNES.map(mission => creerLigneMission(mission, etat)));
}

function recuperer(id) {
  const gain = recupererRecompense(id);
  if (gain) {
    messageMissions.textContent = `+${gain} Sablier${gain > 1 ? "s" : ""} !`;
    if (typeof jouerCarillon === "function") jouerCarillon();
  }
  afficherMissions();
}

boutonBonus.addEventListener("click", () => recuperer("bonus"));

afficherMissions();
setInterval(() => {
  if (!document.hidden) afficherMissions();
}, ACTUALISATION_MISSIONS);
