// Moteur du combat : règles, état de la partie et effets des cartes (aucun accès à la page).
// Les effets des attaques sont lus dans leur texte, écrit selon des formulations fixes ;
// ceux des talents sont décrits par leur nom dans TALENTS.

const REGLES = {
  tailleMain: 5,
  tailleBanc: 3,
  pointsVictoire: 3,
  coutPoseSSR: 0, // les SSR se posent gratuitement : leur K.O. rapporte déjà 2 points

  coutRetraite: { 1: 1, 2: 1, 3: 2, 4: 2 },
};

function melanger(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

function personnagesEnJeu(joueur) {
  return [joueur.actif, ...joueur.banc].filter(Boolean);
}

function aTalent(perso, nom) {
  return perso.carte.talent?.nom === nom;
}

function estBlesse(perso) {
  return perso.pv < perso.carte.pv;
}

let prochainUid = 1;

function creerPerso(carte) {
  return { uid: prochainUid++, carte, pv: carte.pv, etourdi: false, brule: false, protection: 0, talentTour: false, talentPartie: false };
}

// Soin dont la cible est choisie parmi les personnages blessés du joueur
function soinCible(frequence, valeur, filtre = () => true) {
  return {
    frequence,
    cibles: (partie, joueur) => personnagesEnJeu(joueur).filter(p => estBlesse(p) && filtre(p, joueur)),
    appliquer: (partie, joueur, perso, cible) => partie.soigner(cible, valeur),
  };
}

const TALENTS = {
  // Passifs : pris en compte dans le calcul des dégâts
  "Corps en caoutchouc": { reduction: { type: "Artilleur", valeur: 20 } },
  "Bara Bara no Mi": { reduction: { type: "Sabreur", valeur: 30 } },
  "Œil de faucon": { reduction: { type: "Sabreur", valeur: 20 } },
  "Rokutōryū": { reduction: { type: "Sabreur", valeur: 20 } },
  "Corps de fumée": { reduction: { type: "Bagarreur", valeur: 30 } },
  "Race supérieure": { bonus: { type: "Fruit du Démon", valeur: 20 } },
  "Passion des sabres": { bonus: { type: "Sabreur", valeur: 20 } },
  "Bras droit du Roux": {},
  "Leçon du chef": {},
  "Fille chérie": {},
  "Karaté homme-poisson": {},
  "Protecteur du village": {},

  // Automatiques : déclenchés par le moteur au bon moment
  "Regard du Roux": {},
  "Volonté de fer": {},
  "Capitaine de 8 000 hommes": {},
  "Vent de la révolution": {},
  "Volonté du Roi des Pirates": {},

  // Activables par le joueur, une fois par tour ou une fois par partie
  "Hospitalité": soinCible("tour", 10, (p, joueur) => p === joueur.actif),
  "Médecin de Cocoyashi": soinCible("tour", 10),
  "Majordome dévoué": soinCible("tour", 10, (p, joueur) => p !== joueur.actif && p.carte.camp === "civil"),
  "Sœur protectrice": soinCible("tour", 20, p => p.carte.nom === "Nami"),
  "Hiso Hiso no Mi": soinCible("tour", 20, p => p.carte.type === "Bête"),
  "Onigiri sucrés": soinCible("partie", 30),
  "Repas du cuisinier": soinCible("partie", 40),
  "Défi culinaire": soinCible("partie", 30),
  "Table ouverte": {
    frequence: "partie",
    possible: (partie, joueur) => personnagesEnJeu(joueur).some(estBlesse),
    appliquer: (partie, joueur) => personnagesEnJeu(joueur).forEach(p => partie.soigner(p, 20)),
  },
  "Voleuse de pirates": {
    frequence: "partie",
    possible: (partie, joueur) => partie.adversaireDe(joueur).pa > 0,
    appliquer: (partie, joueur) => {
      partie.adversaireDe(joueur).pa -= 1;
      joueur.pa += 1;
      partie.noter(`${joueur.nom} vole 1 PA à son adversaire !`);
    },
  },
  "Héritière généreuse": {
    frequence: "partie",
    appliquer: (partie, joueur) => {
      joueur.pa += 1;
      partie.noter(`${joueur.nom} gagne 1 PA.`);
    },
  },
  "Armurier": {
    frequence: "partie",
    possible: (partie, joueur) => joueur.actif?.carte.type === "Sabreur",
    appliquer: (partie, joueur) => {
      joueur.bonusAttaque += 30;
      partie.noter(`L'attaque de ${joueur.actif.carte.nom} infligera 30 dégâts de plus ce tour-ci.`);
    },
  },
  "Récit légendaire": {
    frequence: "partie",
    possible: (partie, joueur) => Boolean(joueur.actif),
    appliquer: (partie, joueur) => {
      joueur.bonusAttaque += 20;
      partie.noter(`L'attaque de ${joueur.actif.carte.nom} infligera 20 dégâts de plus ce tour-ci.`);
    },
  },
  "Légendes interminables": {
    frequence: "partie",
    possible: (partie, joueur) => {
      const cible = partie.adversaireDe(joueur).actif;
      return Boolean(cible) && !cible.etourdi;
    },
    appliquer: (partie, joueur) => partie.etourdir(partie.adversaireDe(joueur).actif),
  },
};

// Traduit le texte d'une attaque en effets de jeu
function analyserAttaque(attaque) {
  const texte = attaque.texte || "";
  const effets = { base: parseInt(attaque.degats, 10) || 0 };
  let m;
  if ((m = texte.match(/Lancez (\d+) pièces : (\d+) dégâts par face/))) effets.pieces = { nombre: +m[1], valeur: +m[2] };
  if ((m = texte.match(/Lancez (\d+) pièces : (\d+) dégâts de plus par face/))) effets.piecesBonus = { nombre: +m[1], valeur: +m[2] };
  if ((m = texte.match(/^Pile ou face : (\d+) dégâts de plus/))) effets.pileBonus = +m[1];
  if (/Pile ou face : le personnage actif adverse est Étourdi/.test(texte)) effets.etourdi = "piece";
  else if (/Le personnage actif adverse est Étourdi/.test(texte)) effets.etourdi = "toujours";
  if (/Pile ou face : le personnage actif adverse est Brûlé/.test(texte)) effets.brule = "piece";
  else if (/Le personnage actif adverse est Brûlé/.test(texte)) effets.brule = "toujours";
  if (/Peut cibler un personnage du banc adverse/.test(texte)) effets.ciblerBanc = true;
  if ((m = texte.match(/Inflige aussi (\d+) dégâts à chaque personnage du banc adverse/))) effets.bancAdverse = +m[1];
  if ((m = texte.match(/Inflige aussi (\d+) dégâts à chacun de vos personnages du banc/))) effets.bancAllie = +m[1];
  if ((m = texte.match(/(\d+) dégâts de plus si .+ a moins de PV que le personnage adverse/))) effets.siMoinsPV = +m[1];
  if ((m = texte.match(/(\d+) dégâts de plus si (.+) est en jeu de votre côté/))) effets.siAllie = { valeur: +m[1], nom: m[2] };
  if ((m = texte.match(/subit aussi (\d+) dégâts/))) effets.recul = +m[1];
  if ((m = texte.match(/subit (\d+) dégâts de moins pendant le prochain tour adverse/))) effets.protection = +m[1];
  return effets;
}

function creerJoueur(nom, cartes, estIA) {
  // La main de départ contient toujours au moins une carte posable gratuitement (non SSR)
  let pioche;
  do {
    pioche = melanger(cartes.map(creerPerso));
  } while (!pioche.slice(0, REGLES.tailleMain).some(p => p.carte.rang < 4));
  return {
    nom, estIA, pioche,
    main: pioche.splice(0, REGLES.tailleMain),
    actif: null, banc: [], defausse: [],
    pa: 0, points: 0, retraiteFaite: false, bonusAttaque: 0,
  };
}

class Partie {
  constructor(cartesJoueur, cartesIA, nomJoueur = "Toi", nomIA = "IA") {
    this.joueurs = [creerJoueur(nomJoueur, cartesJoueur, false), creerJoueur(nomIA, cartesIA, true)];
    this.phase = "installation"; // installation → jeu → fin
    this.courant = 0;
    this.tour = 0;
    this.gagnant = null;
    this.attente = null; // { joueur } : ce joueur doit choisir un nouveau personnage actif
    this.suite = null; // joueur dont le tour commencera une fois l'attente réglée
    this.journal = [];
    this.touches = []; // uid des personnages touchés par la dernière action (animation)
  }

  adversaireDe(joueur) {
    return this.joueurs[1 - this.joueurs.indexOf(joueur)];
  }

  noter(message) {
    this.journal.push(message);
    if (this.journal.length > 200) this.journal.shift();
  }

  lancer(nombre) {
    const resultats = Array.from({ length: nombre }, () => Math.random() < 0.5);
    this.noter(`Pile ou face : ${resultats.map(f => (f ? "face" : "pile")).join(", ")}.`);
    return resultats.filter(Boolean).length;
  }

  trouver(uid) {
    for (const joueur of this.joueurs) {
      const perso = [...personnagesEnJeu(joueur), ...joueur.main].find(p => p.uid === uid);
      if (perso) return { joueur, perso };
    }
    return null;
  }

  soigner(perso, valeur) {
    const avant = perso.pv;
    perso.pv = Math.min(perso.carte.pv, perso.pv + valeur);
    if (perso.pv > avant) this.noter(`${perso.carte.nom} récupère ${perso.pv - avant} PV.`);
  }

  etourdir(perso) {
    perso.etourdi = true;
    this.noter(`${perso.carte.nom} est Étourdi !`);
  }

  // ── Poser des cartes ──

  raisonPasPoser(joueur, perso) {
    if (this.phase === "fin" || this.attente) return "Action impossible pour l'instant.";
    if (this.phase === "installation") {
      if (perso.carte.rang === 4) return "Une SSR ne peut pas être posée pendant l'installation.";
    } else {
      if (this.joueurs[this.courant] !== joueur) return "Ce n'est pas ton tour.";
      if (perso.carte.rang === 4 && joueur.pa < REGLES.coutPoseSSR) return `Il faut ${REGLES.coutPoseSSR} PA pour poser une SSR.`;
    }
    if (joueur.actif && joueur.banc.length >= REGLES.tailleBanc) return "Ton banc est complet.";
    return null;
  }

  poser(joueur, uid) {
    const perso = joueur.main.find(p => p.uid === uid);
    const raison = perso ? this.raisonPasPoser(joueur, perso) : "Carte introuvable.";
    if (raison) return raison;
    if (this.phase === "jeu" && perso.carte.rang === 4) joueur.pa -= REGLES.coutPoseSSR;
    joueur.main.splice(joueur.main.indexOf(perso), 1);
    if (!joueur.actif) joueur.actif = perso;
    else joueur.banc.push(perso);
    if (this.phase === "jeu") {
      this.noter(`${joueur.nom} pose ${perso.carte.nom}.`);
      const cible = this.adversaireDe(joueur).actif;
      if (aTalent(perso, "Regard du Roux") && cible) {
        this.noter("Regard du Roux !");
        this.etourdir(cible);
      }
    }
    return null;
  }

  commencer() {
    if (!this.joueurs.every(j => j.actif)) return "Chaque joueur doit avoir un personnage actif.";
    this.phase = "jeu";
    const premier = Math.random() < 0.5 ? 0 : 1;
    this.noter(`Pile ou face : ${this.joueurs[premier].nom} commence.`);
    this.debuterTour(premier);
    return null;
  }

  // ── Déroulement des tours ──

  debuterTour(index) {
    this.courant = index;
    this.tour += 1;
    const joueur = this.joueurs[index];
    joueur.retraiteFaite = false;
    joueur.bonusAttaque = 0;
    for (const perso of personnagesEnJeu(joueur)) {
      perso.talentTour = false;
      perso.protection = 0;
    }
    if (joueur.pioche.length) joueur.main.push(joueur.pioche.shift());
    // Le premier joueur ne gagne pas de PA et ne peut pas attaquer à son premier tour
    if (this.tour > 1) joueur.pa += 1;
    this.noter(`— Tour ${this.tour} : ${joueur.nom} —`);
  }

  finirTour() {
    if (this.phase !== "jeu" || this.attente) return "Action impossible pour l'instant.";
    this.terminerTour();
    return null;
  }

  terminerTour() {
    this.verifierKO();
    if (this.phase === "fin") return;
    for (const joueur of this.joueurs) {
      if (joueur.actif?.brule && joueur.actif.pv > 0) {
        this.noter(`${joueur.actif.carte.nom} est Brûlé.`);
        this.infliger(joueur.actif, 10);
      }
    }
    // L'étourdissement dure jusqu'à la fin du tour de son propriétaire
    for (const perso of personnagesEnJeu(this.joueurs[this.courant])) perso.etourdi = false;
    this.verifierKO();
    if (this.phase === "fin") return;
    const suivant = 1 - this.courant;
    if (this.attente) this.suite = suivant;
    else this.debuterTour(suivant);
  }

  verifierKO() {
    this.joueurs.forEach((joueur, index) => {
      for (const perso of personnagesEnJeu(joueur).filter(p => p.pv <= 0)) {
        const adversaire = this.joueurs[1 - index];
        const points = perso.carte.rang === 4 ? 2 : 1;
        adversaire.points += points;
        this.noter(`${perso.carte.nom} est K.O. ! ${adversaire.nom} marque ${points} point${points > 1 ? "s" : ""}.`);
        if (aTalent(perso, "Volonté du Roi des Pirates")) {
          joueur.pa += 3;
          this.noter(`Volonté du Roi des Pirates : ${joueur.nom} gagne 3 PA.`);
        }
        perso.etourdi = perso.brule = false;
        joueur.defausse.push(perso);
        if (joueur.actif === perso) joueur.actif = null;
        else joueur.banc.splice(joueur.banc.indexOf(perso), 1);
      }
    });

    // Victoire aux points, ou quand un joueur n'a plus aucun personnage en jeu
    const auxPoints = this.joueurs.filter(j => j.points >= REGLES.pointsVictoire);
    const sansPerso = this.joueurs.filter(j => !personnagesEnJeu(j).length);
    if (auxPoints.length || sansPerso.length) {
      let gagnant;
      if (auxPoints.length === 1) gagnant = auxPoints[0];
      else if (auxPoints.length === 2) gagnant = this.joueurs[0].points === this.joueurs[1].points ? this.joueurs[this.courant] : auxPoints.sort((a, b) => b.points - a.points)[0];
      else gagnant = sansPerso.length === 2 ? this.joueurs[this.courant] : this.adversaireDe(sansPerso[0]);
      this.phase = "fin";
      this.gagnant = this.joueurs.indexOf(gagnant);
      this.attente = null;
      this.noter(`${gagnant.nom} remporte la partie !`);
      return;
    }

    // Remplacement du personnage actif mis K.O.
    this.joueurs.forEach((joueur, index) => {
      if (joueur.actif) return;
      if (joueur.estIA) {
        const remplacant = [...joueur.banc].sort((a, b) => b.pv - a.pv)[0];
        this.promouvoir(joueur, remplacant);
      } else {
        this.attente = { joueur: index };
      }
    });
  }

  promouvoir(joueur, perso) {
    joueur.banc.splice(joueur.banc.indexOf(perso), 1);
    joueur.actif = perso;
    this.noter(`${perso.carte.nom} devient le personnage actif de ${joueur.nom}.`);
  }

  remplacer(uid) {
    if (!this.attente) return "Aucun remplacement en attente.";
    const joueur = this.joueurs[this.attente.joueur];
    const perso = joueur.banc.find(p => p.uid === uid);
    if (!perso) return "Choisis un personnage de ton banc.";
    this.promouvoir(joueur, perso);
    this.attente = null;
    if (this.suite !== null) {
      const suivant = this.suite;
      this.suite = null;
      this.debuterTour(suivant);
    }
    return null;
  }

  // ── Retraite ──

  raisonPasRetraite(joueur) {
    if (this.phase !== "jeu" || this.attente) return "Action impossible pour l'instant.";
    if (this.joueurs[this.courant] !== joueur) return "Ce n'est pas ton tour.";
    if (!joueur.actif) return "Aucun personnage actif.";
    if (joueur.retraiteFaite) return "Une seule retraite par tour.";
    if (!joueur.banc.length) return "Ton banc est vide.";
    const cout = REGLES.coutRetraite[joueur.actif.carte.rang];
    if (joueur.pa < cout) return `Il faut ${cout} PA pour la retraite.`;
    return null;
  }

  retraite(uid) {
    const joueur = this.joueurs[this.courant];
    const raison = this.raisonPasRetraite(joueur);
    if (raison) return raison;
    const index = joueur.banc.findIndex(p => p.uid === uid);
    if (index < 0) return "Choisis un personnage de ton banc.";
    const ancien = joueur.actif;
    joueur.pa -= REGLES.coutRetraite[ancien.carte.rang];
    joueur.actif = joueur.banc[index];
    joueur.banc[index] = ancien;
    ancien.etourdi = ancien.brule = false;
    joueur.retraiteFaite = true;
    this.noter(`${ancien.carte.nom} se retire, ${joueur.actif.carte.nom} prend sa place.`);
    return null;
  }

  // ── Talents activables ──

  talentDisponible(perso) {
    const def = TALENTS[perso.carte.talent?.nom];
    if (!def?.frequence || this.phase !== "jeu" || this.attente) return false;
    const joueur = this.joueurs[this.courant];
    if (!personnagesEnJeu(joueur).includes(perso)) return false;
    if (def.frequence === "tour" ? perso.talentTour : perso.talentPartie) return false;
    if (def.cibles) return def.cibles(this, joueur, perso).length > 0;
    return def.possible ? def.possible(this, joueur, perso) : true;
  }

  ciblesTalent(perso) {
    const def = TALENTS[perso.carte.talent?.nom];
    return def?.cibles ? def.cibles(this, this.joueurs[this.courant], perso) : null;
  }

  utiliserTalent(uid, uidCible) {
    const joueur = this.joueurs[this.courant];
    const perso = personnagesEnJeu(joueur).find(p => p.uid === uid);
    if (!perso || !this.talentDisponible(perso)) return "Ce talent n'est pas utilisable maintenant.";
    const def = TALENTS[perso.carte.talent.nom];
    let cible = null;
    if (def.cibles) {
      cible = def.cibles(this, joueur, perso).find(p => p.uid === uidCible);
      if (!cible) return "Choisis une cible valide.";
    }
    this.noter(`${perso.carte.nom} utilise son talent ${perso.carte.talent.nom}.`);
    if (def.frequence === "tour") perso.talentTour = true;
    else perso.talentPartie = true;
    def.appliquer(this, joueur, perso, cible);
    return null;
  }

  // ── Attaques ──

  raisonPasAttaquer(joueur, indexAttaque) {
    if (this.phase !== "jeu" || this.attente) return "Action impossible pour l'instant.";
    if (this.joueurs[this.courant] !== joueur) return "Ce n'est pas ton tour.";
    const attaque = joueur.actif?.carte.attaques[indexAttaque];
    if (!attaque) return "Attaque introuvable.";
    if (this.tour === 1) return "Le premier joueur ne peut pas attaquer à son premier tour.";
    if (joueur.actif.etourdi) return `${joueur.actif.carte.nom} est Étourdi.`;
    if (joueur.pa < attaque.pa) return `Il faut ${attaque.pa} PA.`;
    return null;
  }

  calculerDegats(joueur, attaquant, cible, base) {
    const adversaire = this.adversaireDe(joueur);
    const allies = personnagesEnJeu(joueur);
    let degats = base;
    if (aTalent(attaquant, "Bras droit du Roux") && allies.some(p => p.carte.nom === "Shanks le Roux")) degats += 20;
    if (attaquant.carte.type === "Bagarreur" && allies.some(p => p !== attaquant && aTalent(p, "Leçon du chef"))) degats += 10;
    if (attaquant.carte.nom === "Daddy Masterson" && allies.some(p => aTalent(p, "Fille chérie"))) degats += 20;
    const bonus = TALENTS[attaquant.carte.talent?.nom]?.bonus;
    if (bonus && cible.carte.type === bonus.type) degats += bonus.valeur;
    degats += joueur.bonusAttaque;

    if (!aTalent(attaquant, "Karaté homme-poisson")) {
      const reduction = TALENTS[cible.carte.talent?.nom]?.reduction;
      if (reduction && attaquant.carte.type === reduction.type) degats -= reduction.valeur;
      degats -= cible.protection;
      if (cible.carte.camp === "civil" && personnagesEnJeu(adversaire).some(p => p !== cible && aTalent(p, "Protecteur du village"))) degats -= 10;
    }
    return Math.max(0, degats);
  }

  // Dégâts moyens attendus (pièces comprises), sans rien modifier : sert à l'IA et à l'affichage
  estimerDegats(joueur, indexAttaque, cible) {
    const attaquant = joueur.actif;
    const effets = analyserAttaque(attaquant.carte.attaques[indexAttaque]);
    let degats = effets.base;
    if (effets.pieces) degats = (effets.pieces.nombre * effets.pieces.valeur) / 2;
    if (effets.piecesBonus) degats += (effets.piecesBonus.nombre * effets.piecesBonus.valeur) / 2;
    if (effets.pileBonus) degats += effets.pileBonus / 2;
    if (effets.siMoinsPV && attaquant.pv < cible.pv) degats += effets.siMoinsPV;
    if (effets.siAllie && personnagesEnJeu(joueur).some(p => p !== attaquant && p.carte.nom === effets.siAllie.nom)) degats += effets.siAllie.valeur;
    return this.calculerDegats(joueur, attaquant, cible, Math.round(degats));
  }

  attaquer(indexAttaque, uidCible) {
    const joueur = this.joueurs[this.courant];
    const raison = this.raisonPasAttaquer(joueur, indexAttaque);
    if (raison) return raison;
    const adversaire = this.adversaireDe(joueur);
    const attaquant = joueur.actif;
    const attaque = attaquant.carte.attaques[indexAttaque];
    const effets = analyserAttaque(attaque);
    let cible = adversaire.actif;
    if (effets.ciblerBanc && uidCible) cible = personnagesEnJeu(adversaire).find(p => p.uid === uidCible) || cible;

    joueur.pa -= attaque.pa;
    this.touches = [];
    this.noter(`${attaquant.carte.nom} utilise ${attaque.nom}${cible !== adversaire.actif ? ` sur ${cible.carte.nom}` : ""} !`);

    let degats = effets.base;
    if (effets.pieces) degats = this.lancer(effets.pieces.nombre) * effets.pieces.valeur;
    if (effets.piecesBonus) degats += this.lancer(effets.piecesBonus.nombre) * effets.piecesBonus.valeur;
    if (effets.pileBonus && this.lancer(1)) degats += effets.pileBonus;
    if (effets.siMoinsPV && attaquant.pv < cible.pv) degats += effets.siMoinsPV;
    if (effets.siAllie && personnagesEnJeu(joueur).some(p => p !== attaquant && p.carte.nom === effets.siAllie.nom)) degats += effets.siAllie.valeur;
    degats = this.calculerDegats(joueur, attaquant, cible, degats);
    joueur.bonusAttaque = 0;

    // Réactions défensives
    const dragon = personnagesEnJeu(adversaire).find(p => aTalent(p, "Vent de la révolution") && !p.talentPartie);
    if (dragon && degats >= cible.pv) {
      dragon.talentPartie = true;
      this.noter(`Vent de la révolution ! ${dragon.carte.nom} annule l'attaque.`);
      this.terminerTour();
      return null;
    }
    if (aTalent(cible, "Capitaine de 8 000 hommes") && !cible.talentPartie && degats > 0) {
      cible.talentPartie = true;
      this.noter("Capitaine de 8 000 hommes !");
      if (this.lancer(1)) {
        this.noter(`${cible.carte.nom} esquive l'attaque !`);
        degats = 0;
      }
    }

    this.infliger(cible, degats);
    const actifAdverse = adversaire.actif;
    if (actifAdverse && actifAdverse.pv > 0) {
      if (effets.etourdi === "toujours" || (effets.etourdi === "piece" && this.lancer(1))) this.etourdir(actifAdverse);
      if (effets.brule === "toujours" || (effets.brule === "piece" && this.lancer(1))) {
        actifAdverse.brule = true;
        this.noter(`${actifAdverse.carte.nom} est Brûlé !`);
      }
    }
    if (effets.bancAdverse) adversaire.banc.forEach(p => this.infliger(p, effets.bancAdverse));
    if (effets.bancAllie) joueur.banc.forEach(p => this.infliger(p, effets.bancAllie));
    if (effets.recul) this.infliger(attaquant, effets.recul);
    if (effets.protection) attaquant.protection = effets.protection;

    this.terminerTour();
    return null;
  }

  infliger(perso, degats) {
    if (degats <= 0) {
      this.noter(`${perso.carte.nom} ne subit aucun dégât.`);
      return;
    }
    this.touches.push(perso.uid);
    if (aTalent(perso, "Volonté de fer") && !perso.talentPartie && perso.pv > 10 && perso.pv - degats <= 0) {
      perso.talentPartie = true;
      perso.pv = 10;
      this.noter(`Volonté de fer ! ${perso.carte.nom} résiste et garde 10 PV.`);
      return;
    }
    perso.pv -= degats;
    this.noter(`${perso.carte.nom} subit ${degats} dégâts.`);
  }
}
