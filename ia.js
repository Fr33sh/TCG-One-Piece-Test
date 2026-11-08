// Adversaire contrôlé par l'ordinateur : installe ses cartes, puis joue chaque tour
// en enchaînant des actions du moteur (talents, poses, retraite, attaque).

const IA = {
  // Valeur d'un personnage pour le poste actif : ses PV et ses dégâts
  score(perso) {
    const degatsMax = Math.max(0, ...perso.carte.attaques.map(a => parseInt(a.degats, 10) || 0));
    return perso.pv + degatsMax * 1.5;
  },

  installer(partie, joueur) {
    const posables = joueur.main.filter(p => p.carte.rang < 4).sort((a, b) => this.score(b) - this.score(a));
    for (const perso of posables.slice(0, 3)) partie.poser(joueur, perso.uid);
  },

  // apres() est appelée après chaque action (rafraîchir l'écran, marquer une pause)
  async jouerTour(partie, joueur, apres) {
    const adversaire = partie.adversaireDe(joueur);
    const enCours = () => partie.phase === "jeu" && partie.joueurs[partie.courant] === joueur && !partie.attente;
    const bonusAvantAttaque = ["Armurier", "Récit légendaire"];

    // 1. Talents de soutien
    for (const perso of personnagesEnJeu(joueur)) {
      const nom = perso.carte.talent?.nom;
      if (!enCours() || bonusAvantAttaque.includes(nom) || !partie.talentDisponible(perso)) continue;
      if (nom === "Légendes interminables" && adversaire.actif.carte.rang < 3) continue;
      const cibles = partie.ciblesTalent(perso);
      const cible = cibles?.sort((a, b) => (a.pv - a.carte.pv) - (b.pv - b.carte.pv))[0];
      // Les gros soins uniques sont gardés pour un personnage vraiment blessé
      if (cible && TALENTS[nom].frequence === "partie" && cible.carte.pv - cible.pv < 40) continue;
      partie.utiliserTalent(perso.uid, cible?.uid);
      await apres();
    }

    // 2. Poser des cartes : une SSR dès qu'elle est payable, sauf si l'actif peut mettre K.O. ce tour-ci,
    //    et une place libre gardée sur le banc tant qu'une SSR attend dans la main
    const koPossible = () => joueur.actif && adversaire.actif && joueur.actif.carte.attaques.some((attaque, index) =>
      !partie.raisonPasAttaquer(joueur, index) && partie.estimerDegats(joueur, index, adversaire.actif) >= adversaire.actif.pv);
    for (const perso of [...joueur.main].sort((a, b) => this.score(b) - this.score(a))) {
      if (!enCours() || joueur.banc.length >= REGLES.tailleBanc) break;
      if (perso.carte.rang === 4) {
        if (REGLES.coutPoseSSR > 0 && (joueur.pa < REGLES.coutPoseSSR || koPossible())) continue;
      } else if (joueur.banc.length >= REGLES.tailleBanc - 1 && joueur.main.some(p => p.carte.rang === 4)) {
        continue;
      }
      if (!partie.poser(joueur, perso.uid)) await apres();
    }

    // 3. Retraite si l'actif est gêné et qu'un meilleur remplaçant attend sur le banc
    const actif = joueur.actif;
    if (enCours() && actif && !partie.raisonPasRetraite(joueur)) {
      const remplacant = joueur.banc.filter(p => p.carte.attaques.length).sort((a, b) => this.score(b) - this.score(a))[0];
      const gene = actif.etourdi || actif.brule || !actif.carte.attaques.length || (actif.pv < actif.carte.pv * 0.3 && remplacant?.pv > actif.pv);
      if (gene && remplacant) {
        partie.retraite(remplacant.uid);
        await apres();
      }
    }

    // 4. Attaque la plus rentable : un K.O. d'abord, sinon le plus de dégâts
    if (enCours() && joueur.actif) {
      let choix = null;
      joueur.actif.carte.attaques.forEach((attaque, index) => {
        if (partie.raisonPasAttaquer(joueur, index)) return;
        const effets = analyserAttaque(attaque);
        const cibles = effets.ciblerBanc ? personnagesEnJeu(adversaire) : [adversaire.actif];
        for (const cible of cibles) {
          const degats = partie.estimerDegats(joueur, index, cible);
          let valeur = degats + (effets.bancAdverse || 0) * adversaire.banc.length;
          if (degats >= cible.pv) valeur += cible.carte.rang === 4 ? 1500 : 1000;
          if (!choix || valeur > choix.valeur) choix = { index, cible, valeur };
        }
      });
      if (choix) {
        for (const perso of personnagesEnJeu(joueur)) {
          if (bonusAvantAttaque.includes(perso.carte.talent?.nom) && partie.talentDisponible(perso)) {
            partie.utiliserTalent(perso.uid);
            await apres();
          }
        }
        partie.attaquer(choix.index, choix.cible.uid);
        await apres();
        return;
      }
    }

    if (enCours()) {
      partie.finirTour();
      await apres();
    }
  },
};
