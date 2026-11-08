// Écran de combat : choix du deck, affichage du plateau et actions du joueur contre l'IA.

const ecranDecks = document.querySelector(".ecran--decks");
const ecranCombat = document.querySelector(".ecran--combat");
const modale = document.querySelector(".modale");
const contenuModale = document.querySelector(".modale__contenu");

const PAUSE_IA = 750;
let partie = null;
let deckJoueur = null;
let deckIA = null;
let selection = null; // { message, uids, choisir(uid), annulable } : le joueur doit toucher une carte en surbrillance
let alerte = null; // message d'erreur affiché une fois dans le bandeau
let iaEnCours = false;

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const moi = () => partie.joueurs[0];

// ── Choix du deck ──

function afficherDecks() {
  modale.hidden = true;
  ecranCombat.hidden = true;
  ecranDecks.hidden = false;
  const liste = ecranDecks.querySelector(".decks");
  liste.replaceChildren();
  for (const deck of DECKS) {
    const vedette = CARTES.find(c => c.nom === deck.vedette);
    const bouton = element("button", "deck");
    bouton.type = "button";
    const image = element("img", "deck__image");
    image.src = [].concat(vedette.illustration)[0];
    image.alt = "";
    image.style.objectPosition = vedette.cadrage || "50% 50%";
    bouton.append(image, element("span", "deck__nom", deck.nom), element("span", "deck__description", deck.description));
    bouton.addEventListener("click", () => demarrer(deck));
    liste.append(bouton);
  }
}

function demarrer(deck) {
  const autres = DECKS.filter(d => d !== deck);
  deckJoueur = deck;
  deckIA = autres[Math.floor(Math.random() * autres.length)];
  partie = new Partie(cartesDuDeck(deck), cartesDuDeck(deckIA), deck.nom, deckIA.nom);
  IA.installer(partie, partie.joueurs[1]);
  selection = null;
  alerte = null;
  ecranDecks.hidden = true;
  ecranCombat.hidden = false;
  afficher();
}

// ── Cartes miniatures du plateau ──

function creerJeton(perso, enMain = false) {
  const carte = perso.carte;
  const jeton = element("button", `jeton jeton--rang-${carte.rang} jeton--${carte.camp}`);
  jeton.type = "button";
  jeton.dataset.uid = perso.uid;

  const image = element("img", "jeton__image");
  image.src = [].concat(carte.illustration || [])[0] || "";
  image.alt = "";
  image.style.objectPosition = carte.cadrage || "50% 50%";
  jeton.append(image, element("span", "jeton__rang", LETTRES_RANG[carte.rang]));

  const bas = element("span", "jeton__bas");
  bas.append(element("span", "jeton__nom", carte.nom));
  if (enMain) {
    if (carte.rang === 4 && REGLES.coutPoseSSR > 0) bas.append(element("span", "jeton__cout", `${REGLES.coutPoseSSR} PA`));
  } else {
    const barre = element("span", "jeton__barre");
    const remplissage = element("span", "jeton__remplissage");
    remplissage.style.width = `${Math.max(0, perso.pv / carte.pv) * 100}%`;
    barre.append(remplissage);
    bas.append(element("span", "jeton__pv", `${Math.max(0, perso.pv)} / ${carte.pv}`), barre);
  }
  jeton.append(bas);

  const etats = element("span", "jeton__etats");
  if (perso.etourdi) etats.append(element("span", "etat etat--etourdi", "Étourdi"));
  if (perso.brule) etats.append(element("span", "etat etat--brule", "Brûlé"));
  if (etats.childElementCount) jeton.append(etats);

  if (selection?.uids.includes(perso.uid)) jeton.classList.add("jeton--choix");
  if (partie.touches.includes(perso.uid)) jeton.classList.add("jeton--touche");
  jeton.addEventListener("click", () => toucher(perso));
  return jeton;
}

function emplacementVide() {
  return element("span", "emplacement");
}

// ── Affichage du plateau ──

function remplirInfos(selecteur, joueur, nom, montrerMain) {
  const zone = document.querySelector(selecteur);
  zone.replaceChildren();
  const points = element("span", "infos__points");
  for (let i = 0; i < REGLES.pointsVictoire; i++) points.append(element("span", i < joueur.points ? "point point--gagne" : "point"));
  zone.append(
    element("span", "infos__nom", nom),
    points,
    element("span", "infos__pa", `${joueur.pa} PA`),
    element("span", "infos__detail", `Pioche ${joueur.pioche.length}${montrerMain ? ` · Main ${joueur.main.length}` : ""}`),
  );
}

function remplirZone(selecteur, persos, places) {
  const zone = document.querySelector(selecteur);
  zone.replaceChildren();
  for (let i = 0; i < places; i++) zone.append(persos[i] ? creerJeton(persos[i]) : emplacementVide());
}

function afficher() {
  if (!partie) return;
  const [joueur, ia] = partie.joueurs;

  if (partie.attente?.joueur === 0 && !selection) {
    selection = {
      message: "Ton personnage actif est K.O. : choisis son remplaçant sur ton banc.",
      uids: joueur.banc.map(p => p.uid),
      choisir: uid => jouer(() => partie.remplacer(uid)),
      annulable: false,
    };
  }

  remplirInfos(".infos--adverse", ia, deckIA.nom, true);
  remplirInfos(".infos--joueur", joueur, deckJoueur.nom, false);
  remplirZone(".poste--adverse", [ia.actif], 1);
  remplirZone(".banc--adverse", ia.banc, REGLES.tailleBanc);
  remplirZone(".poste--joueur", [joueur.actif], 1);
  remplirZone(".banc--joueur", joueur.banc, REGLES.tailleBanc);

  const main = document.querySelector(".main");
  main.replaceChildren(...joueur.main.map(p => creerJeton(p, true)));

  afficherBandeau();
  partie.touches = [];
  if (partie.phase === "fin") afficherFin();
}

function afficherBandeau() {
  const message = document.querySelector(".bandeau__message");
  const actions = document.querySelector(".bandeau__actions");
  const journal = document.querySelector(".bandeau__journal");
  actions.replaceChildren();

  if (alerte) message.textContent = alerte;
  else if (selection) message.textContent = selection.message;
  else if (partie.phase === "installation") message.textContent = moi().actif
    ? "Ajoute des personnages sur ton banc si tu veux, puis commence la partie."
    : "Touche une carte de ta main pour choisir ton personnage actif.";
  else if (partie.phase === "fin") message.textContent = partie.gagnant === 0 ? "Victoire !" : "Défaite…";
  else if (iaEnCours || partie.courant === 1) message.textContent = `${deckIA.nom} joue…`;
  else message.textContent = "À toi de jouer : touche une carte pour voir ses actions.";
  alerte = null;

  journal.replaceChildren(...partie.journal.slice(-3).map(ligne => element("li", "", ligne)));

  if (selection?.annulable) {
    actions.append(bouton("Annuler", () => { selection = null; afficher(); }));
  } else if (partie.phase === "installation") {
    const commencer = bouton("Commencer la partie", () => jouer(() => partie.commencer()));
    commencer.disabled = !moi().actif;
    actions.append(commencer);
  } else if (partie.phase === "jeu" && partie.courant === 0 && !partie.attente && !iaEnCours && !selection) {
    actions.append(bouton("Fin du tour", () => jouer(() => partie.finirTour())));
  }
}

function bouton(texte, action, classe = "bouton") {
  const b = element("button", classe, texte);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}

function afficherFin() {
  const victoire = partie.gagnant === 0;
  contenuModale.replaceChildren(
    element("h2", "fin__titre", victoire ? "Victoire !" : "Défaite…"),
    element("p", "fin__texte", `${moi().points} point(s) contre ${partie.joueurs[1].points}.`),
    bouton("Rejouer", afficherDecks),
    bouton("Retour à l'accueil", () => { location.href = "accueil.html"; }, "bouton bouton--discret"),
  );
  modale.hidden = false;
}

// ── Actions du joueur ──

function toucher(perso) {
  if (selection) {
    if (selection.uids.includes(perso.uid)) {
      const choix = selection;
      selection = null;
      choix.choisir(perso.uid);
    }
    return;
  }
  ouvrirDetail(perso);
}

function choisir(message, persos, action) {
  modale.hidden = true;
  selection = { message, uids: persos.map(p => p.uid), choisir: action, annulable: true };
  afficher();
}

function jouer(action) {
  modale.hidden = true;
  const erreur = action();
  if (erreur) alerte = erreur;
  afficher();
  lancerIA();
}

function attaquer(index) {
  const joueur = moi();
  const effets = analyserAttaque(joueur.actif.carte.attaques[index]);
  const cibles = personnagesEnJeu(partie.adversaireDe(joueur));
  if (effets.ciblerBanc && cibles.length > 1) choisir("Choisis la cible de l'attaque.", cibles, uid => jouer(() => partie.attaquer(index, uid)));
  else jouer(() => partie.attaquer(index));
}

function actionsPour(perso) {
  const joueur = moi();
  const actions = [];
  if (partie.phase === "fin" || iaEnCours || partie.attente) return actions;

  if (joueur.main.includes(perso)) {
    const zone = joueur.actif ? "sur le banc" : "en personnage actif";
    const cout = partie.phase === "jeu" && perso.carte.rang === 4 && REGLES.coutPoseSSR > 0 ? ` · ${REGLES.coutPoseSSR} PA` : "";
    actions.push({ texte: `Poser ${zone}${cout}`, raison: partie.raisonPasPoser(joueur, perso), faire: () => jouer(() => partie.poser(joueur, perso.uid)) });
  }

  if (partie.phase === "jeu" && personnagesEnJeu(joueur).includes(perso)) {
    if (perso === joueur.actif) {
      perso.carte.attaques.forEach((attaque, index) => {
        actions.push({ texte: `${attaque.nom} · ${attaque.pa} PA · ${attaque.degats} dégâts`, raison: partie.raisonPasAttaquer(joueur, index), faire: () => attaquer(index) });
      });
      actions.push({
        texte: `Retraite · ${REGLES.coutRetraite[perso.carte.rang]} PA`,
        raison: partie.raisonPasRetraite(joueur),
        faire: () => choisir("Choisis le personnage qui remplace ton actif.", joueur.banc, uid => jouer(() => partie.retraite(uid))),
      });
    }
    if (TALENTS[perso.carte.talent?.nom]?.frequence) {
      actions.push({
        texte: `Talent : ${perso.carte.talent.nom}`,
        raison: partie.talentDisponible(perso) ? null : "Talent indisponible pour l'instant.",
        faire: () => {
          const cibles = partie.ciblesTalent(perso);
          if (cibles) choisir("Choisis la cible du talent.", cibles, uid => jouer(() => partie.utiliserTalent(perso.uid, uid)));
          else jouer(() => partie.utiliserTalent(perso.uid));
        },
      });
    }
  }
  return actions;
}

function ouvrirDetail(perso) {
  const zoneCarte = element("div", "modale__carte");
  zoneCarte.append(creerCarte(perso.carte));

  const etats = [`PV ${Math.max(0, perso.pv)} / ${perso.carte.pv}`];
  if (perso.etourdi) etats.push("Étourdi");
  if (perso.brule) etats.push("Brûlé");

  const liste = element("div", "modale__actions");
  for (const action of actionsPour(perso)) {
    const b = bouton(action.texte, action.faire, "bouton bouton--action");
    if (action.raison) {
      b.disabled = true;
      b.title = action.raison;
      b.append(element("span", "bouton__raison", action.raison));
    }
    liste.append(b);
  }
  liste.append(bouton("Fermer", () => { modale.hidden = true; }, "bouton bouton--discret"));

  contenuModale.replaceChildren(zoneCarte, element("p", "modale__etat", etats.join(" · ")), liste);
  modale.hidden = false;
  ajusterProprietes(zoneCarte);
}

// Quitter une partie en cours par la barre de navigation demande une confirmation
document.querySelector(".navigation").addEventListener("click", evenement => {
  const enPartie = partie && !ecranCombat.hidden && partie.phase !== "fin";
  if (enPartie && evenement.target.closest("a") && !confirm("Quitter la partie en cours ?")) evenement.preventDefault();
});

modale.addEventListener("click", evenement => {
  if (evenement.target === modale && partie?.phase !== "fin") modale.hidden = true;
});

// ── Tour de l'IA ──

async function lancerIA() {
  if (iaEnCours || partie.phase !== "jeu" || partie.attente || partie.courant !== 1) return;
  iaEnCours = true;
  afficher();
  await pause(PAUSE_IA);
  await IA.jouerTour(partie, partie.joueurs[1], async () => {
    afficher();
    await pause(PAUSE_IA);
  });
  iaEnCours = false;
  afficher();
}

afficherDecks();
