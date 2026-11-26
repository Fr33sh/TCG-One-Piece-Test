// Page Missions : les 3 missions quotidiennes (missions-quotidiennes.js), leur barre de progression avec le
// Sceau bonus au bout, le temps avant les nouvelles missions et les boutons « Récupérer ».

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
    <span class="mission__recompense" aria-label="Récompense : ${nomSceaux(mission.recompense)}"><img src="assets/icones/sceau.svg" alt="">+${mission.recompense}</span>`;
  ligne.querySelector(".mission__titre").textContent = mission.titre;
  ligne.append(creerBoutonRecompense(mission.id, etat));
  return ligne;
}

function afficherMissions() {
  const etat = lireMissions();
  const accomplies = missionsAccomplies(etat);
  const total = MISSIONS_QUOTIDIENNES.length;

  document.querySelector("[data-sceaux]").textContent = lireSceaux();
  document.querySelector("[data-renouvellement]").textContent = `Nouvelles missions dans ${avantNouvellesMissions()}`;

  // Barre de progression : un tiers par mission accomplie ; pleine, elle offre le Sceau bonus
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
    messageMissions.textContent = `+${nomSceaux(gain)} !`;
    if (typeof jouerCarillon === "function") jouerCarillon();
  }
  afficherMissions();
}

boutonBonus.addEventListener("click", () => recuperer("bonus"));

// ── Onglets : missions quotidiennes et jetons SSR ──

function ouvrirOnglet(nom) {
  for (const bouton of document.querySelectorAll("[data-onglet]")) bouton.setAttribute("aria-selected", String(bouton.dataset.onglet === nom));
  for (const panneau of document.querySelectorAll("[data-panneau]")) panneau.hidden = panneau.dataset.panneau !== nom;
  if (nom === "jetons") afficherJetons();
}

for (const bouton of document.querySelectorAll("[data-onglet]")) {
  bouton.addEventListener("click", () => ouvrirOnglet(bouton.dataset.onglet));
}

// ── Jetons SSR (jetons-ssr.js) : une case par SSR du jeu, série par série ──

const ICONE_CADENAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>';

function creerCaseJeton(carte) {
  const etat = etatJetonSsr(carte);
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = `jeton-ssr jeton-ssr--${etat}`;
  bouton.disabled = etat !== "pret";

  const rond = document.createElement("span");
  rond.className = "jeton-ssr__rond";
  // Jeton d'une Z : animé (sauf tant que la carte n'est pas obtenue)
  rond.append(creerImageJeton([].concat(carte.illustration)[0], etat === "verrouille" ? null : carte.boucle, carte.cadrage || "50% 30%"));
  if (carte.boucle) rond.classList.add("jeton-ssr__rond--anime");
  if (etat === "verrouille") rond.insertAdjacentHTML("beforeend", ICONE_CADENAS);

  const nom = document.createElement("span");
  nom.className = "jeton-ssr__nom";
  // Une SSR pas encore obtenue garde son mystère : seul son numéro est affiché
  nom.textContent = etat === "verrouille" ? carte.id : carte.nom;

  const libelle = document.createElement("span");
  libelle.className = "jeton-ssr__etat";
  libelle.textContent = { verrouille: "À obtenir", pret: "Débloquer", debloque: "Débloqué ✓" }[etat];

  bouton.setAttribute("aria-label", `${etat === "verrouille" ? carte.id : carte.nom} : ${libelle.textContent}`);
  bouton.append(rond, nom, libelle);
  bouton.addEventListener("click", () => {
    if (!debloquerJetonSsr(carte)) return;
    document.querySelector("[data-message-jetons]").textContent = `Jeton de ${carte.nom} débloqué ! Choisis-le dans ton profil.`;
    if (typeof jouerCarillon === "function") jouerCarillon();
    afficherJetons();
  });
  return bouton;
}

function afficherJetons() {
  const toutes = cartesSsr();
  const debloques = toutes.filter(carte => etatJetonSsr(carte) === "debloque").length;
  document.querySelector("[data-jetons-compteur]").textContent = `${debloques} / ${toutes.length}`;
  document.querySelector("[data-jetons]").replaceChildren(...SERIES.map(serie => {
    const bloc = document.createElement("div");
    bloc.className = "jetons-serie";
    const titre = document.createElement("h3");
    titre.className = "jetons-serie__titre";
    titre.textContent = serie.nom;
    const grille = document.createElement("div");
    grille.className = "jetons-serie__grille";
    grille.append(...serie.cartes.filter(aUnJeton).map(creerCaseJeton));
    bloc.append(titre, grille);
    return bloc;
  }));
}

afficherMissions();
setInterval(() => {
  if (!document.hidden) afficherMissions();
}, ACTUALISATION_MISSIONS);
