// Sons du jeu, fabriqués par le code (Web Audio) : aucun fichier audio. Utilise reglages.js (à charger avant).
// Clic des boutons et menus, déchirure du booster, sortie des cartes, annonce des cartes rares.

const VOLUME_GENERAL = 0.8;

let contexteAudio = null;
let sortieSon = null; // volume général, vers les haut-parleurs
let bruitBlanc = null; // une seconde de souffle, base des bruits de papier

// Le navigateur n'autorise le son qu'après un geste : le contexte audio s'ouvre au premier appui
function preparerSon() {
  try {
    if (!contexteAudio) {
      const contexte = new AudioContext();
      sortieSon = contexte.createGain();
      sortieSon.gain.value = VOLUME_GENERAL * niveauSon("effets");
      sortieSon.connect(contexte.destination);
      bruitBlanc = contexte.createBuffer(1, contexte.sampleRate, contexte.sampleRate);
      const echantillons = bruitBlanc.getChannelData(0);
      for (let i = 0; i < echantillons.length; i++) echantillons[i] = Math.random() * 2 - 1;
      contexteAudio = contexte;
    }
    contexteAudio.resume();
  } catch {
    contexteAudio = null;
  }
}

document.addEventListener("pointerdown", preparerSon, { capture: true });
document.addEventListener("keydown", preparerSon, { capture: true });

// Volume et activation des effets sonores, réglés dans les paramètres (reglages.js, à charger avant)
suivreReglages(() => {
  if (contexteAudio) sortieSon.gain.setTargetAtTime(VOLUME_GENERAL * niveauSon("effets"), contexteAudio.currentTime, 0.03);
});

const sonPret = () => contexteAudio !== null;

// Une note : montée rapide puis extinction douce
function jouerNote(frequence, debut, duree, { type = "sine", volume = 0.1, attaque = 0.01, vers = sortieSon } = {}) {
  const oscillateur = contexteAudio.createOscillator();
  const gain = contexteAudio.createGain();
  oscillateur.type = type;
  oscillateur.frequency.setValueAtTime(frequence, debut);
  gain.gain.setValueAtTime(0.0001, debut);
  gain.gain.exponentialRampToValueAtTime(volume, debut + attaque);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
  oscillateur.connect(gain).connect(vers);
  oscillateur.start(debut);
  oscillateur.stop(debut + duree + 0.05);
  return oscillateur;
}

// Un souffle filtré ; son volume part de zéro et se règle par l'appelant
function jouerBruit(debut, duree, typeFiltre, frequence, q = 1) {
  const source = contexteAudio.createBufferSource();
  source.buffer = bruitBlanc;
  source.loop = true;
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = typeFiltre;
  filtre.frequency.setValueAtTime(frequence, debut);
  filtre.Q.value = q;
  const volume = contexteAudio.createGain();
  volume.gain.setValueAtTime(0, debut);
  source.connect(filtre).connect(volume).connect(sortieSon);
  source.start(debut, Math.random() * 0.5);
  source.stop(debut + duree);
  return { filtre, volume };
}

// ── Boutons et menus ──

// Son de toutes les interactions du menu : bruit sourd et mécanique, comme un engrenage qui tourne
// d'un cran (un coup grave et étouffé, puis deux petits cliquetis de dents)
function jouerClic() {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime;
  const coup = jouerNote(150, t, 0.16, { volume: 0.3, attaque: 0.003 });
  coup.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  const corps = jouerNote(310, t, 0.06, { type: "triangle", volume: 0.06, attaque: 0.002 });
  corps.frequency.exponentialRampToValueAtTime(140, t + 0.05);
  [0.012, 0.05].forEach((decalage, rang) => {
    const debut = t + decalage;
    const { volume } = jouerBruit(debut, 0.03, "bandpass", 1300 - rang * 250, 4);
    volume.gain.setValueAtTime(rang ? 0.22 : 0.3, debut);
    volume.gain.exponentialRampToValueAtTime(0.001, debut + 0.025);
  });
}

// Bulles, boutons, onglets, booster de l'accueil (pas les jetons du combat)
const ELEMENTS_CLIQUABLES = "button:not(.jeton), a[href], .zone-booster";

document.addEventListener("click", evenement => {
  const cible = evenement.target.closest(ELEMENTS_CLIQUABLES);
  if (!cible) return;
  // Le booster de l'accueil ne clique que lorsqu'il ouvre les choix
  if (cible.matches(".zone-booster") && document.body.matches(".mode-booster, .mode-ouverture")) return;
  jouerClic();

  // Changement de page : on laisse au clic le temps d'être entendu
  if (cible.matches("a[href]") && !evenement.defaultPrevented) {
    evenement.preventDefault();
    setTimeout(() => { location.href = cible.href; }, 120);
  }
});

// ── Ouverture du booster ──

// Papier qui se déchire : souffle aigu qui crépite et monte
function jouerDechirure() {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime;
  const duree = 0.38;
  const { filtre, volume } = jouerBruit(t, duree + 0.1, "bandpass", 1600, 0.9);
  filtre.frequency.exponentialRampToValueAtTime(4200, t + duree);
  for (let instant = 0; instant < duree; instant += 0.012) {
    const enveloppe = Math.min(1, instant / 0.03) * (1 - (instant / duree) * 0.6);
    volume.gain.setValueAtTime(0.35 * enveloppe * (0.35 + Math.random() * 0.65), t + instant);
  }
  volume.gain.linearRampToValueAtTime(0, t + duree + 0.06);
}

// Les cartes glissent hors du booster : souffle doux qui monte puis retombe
function jouerSortieCartes(duree = 0.9) {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime;
  const { filtre, volume } = jouerBruit(t, duree + 0.1, "lowpass", 450, 0.7);
  filtre.frequency.exponentialRampToValueAtTime(1700, t + duree * 0.55);
  filtre.frequency.exponentialRampToValueAtTime(600, t + duree);
  volume.gain.linearRampToValueAtTime(0.16, t + duree * 0.4);
  volume.gain.linearRampToValueAtTime(0, t + duree);
}

// ── Cartes rares ──

// SR : léger carillon de trois notes aiguës
function jouerCarillon(delai = 0) {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime + delai;
  [1318.5, 1760, 2637].forEach((frequence, index) => {
    jouerNote(frequence, t + index * 0.09, 0.7, { volume: 0.12, attaque: 0.02 });
  });
}

// Scintillement : souffle très aigu qui s'éteint lentement
function jouerScintillement(debut, duree, volumeMax) {
  const { volume } = jouerBruit(debut, duree, "highpass", 7000, 0.5);
  volume.gain.linearRampToValueAtTime(volumeMax, debut + 0.15);
  volume.gain.linearRampToValueAtTime(0, debut + duree);
}

// Coup sourd qui donne de l'ampleur
function jouerImpact(debut, volume) {
  const oscillateur = jouerNote(120, debut, 0.5, { volume, attaque: 0.008 });
  oscillateur.frequency.exponentialRampToValueAtTime(50, debut + 0.4);
}

// SSR : coup sourd puis arpège brillant qui monte, avec un scintillement
function jouerEclatSSR(delai = 0) {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime + delai;
  jouerImpact(t, 0.28);
  [1046.5, 1318.5, 1568, 2093, 2637].forEach((frequence, index) => {
    const debut = t + 0.05 + index * 0.075;
    jouerNote(frequence, debut, 0.9, { volume: 0.09, attaque: 0.01 });
    jouerNote(frequence * 2, debut, 0.5, { type: "triangle", volume: 0.025, attaque: 0.01 });
  });
  jouerScintillement(t + 0.1, 1.4, 0.05);
}

// God pack : petite fanfare (montée puis accord tenu), suivie de l'éclat SSR
function jouerGodPack(delai = 0) {
  if (!sonPret()) return;
  const t = contexteAudio.currentTime + delai;
  jouerImpact(t, 0.32);

  // Les cuivres : dents de scie adoucies par un filtre
  const cuivres = contexteAudio.createBiquadFilter();
  cuivres.type = "lowpass";
  cuivres.frequency.value = 2400;
  cuivres.connect(sortieSon);

  [392, 523.25, 659.25].forEach((frequence, index) => {
    jouerNote(frequence, t + index * 0.12, 0.2, { type: "sawtooth", volume: 0.06, attaque: 0.015, vers: cuivres });
  });
  const accord = t + 0.38;
  [523.25, 659.25, 783.99, 1046.5].forEach(frequence => {
    const note = jouerNote(frequence, accord, 1.7, { type: "sawtooth", volume: 0.045, attaque: 0.04, vers: cuivres });
    // Léger vibrato sur l'accord tenu
    const vibrato = contexteAudio.createOscillator();
    const ampleur = contexteAudio.createGain();
    vibrato.frequency.value = 5.5;
    ampleur.gain.value = frequence * 0.006;
    vibrato.connect(ampleur).connect(note.frequency);
    vibrato.start(accord);
    vibrato.stop(accord + 1.75);
  });
  jouerEclatSSR(delai + 0.55);
}
