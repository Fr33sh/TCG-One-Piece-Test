// Musiques du jeu, sans paroles, fabriquées par le code (Web Audio), dans l'esprit des OST d'animés :
// - « aventure » sur l'écran « Touchez » : entraînante et héroïque (do majeur, 112 battements par minute) ;
// - « ambiance » sur tout le reste du jeu : calme et posée (ré majeur, 72 battements par minute).
// Chaque morceau tourne en boucle ; on passe de l'un à l'autre par un fondu. Dans l'émulateur, la musique
// n'est jamais interrompue par un changement d'onglet ; si une page du jeu est ouverte seule, la musique
// d'ambiance reprend à peu près là où elle en était.
// Utilise le contexte audio de sons.js et les réglages de reglages.js (à charger avant).
// Une page choisit son morceau avec <body data-musique="…"> (« ambiance » par défaut).

const AVANCE_MUSIQUE = 1.5; // s : les notes sont préparées un peu à l'avance
const DUREE_FONDU = 1.4; // s : le morceau qui s'arrête s'efface pendant ce temps
const CLE_MUSIQUE = "tcg-one-piece/musique";
const CROCHES_PAR_MESURE = 8;
const MESURES_PAR_PARTIE = 8;

const frequenceMidi = note => 440 * 2 ** ((note - 69) / 12);

let musique = null; // morceau en cours : { id, morceau, entree, volume, pas, temps }
let minuterieMusique = null;
let reponseReverberation = null;

// ═══ Morceau « ambiance » : piano en arpèges, nappe de cordes, basse douce, flûte puis piano ═══

// Accords : 5 notes (numéros MIDI, 60 = do central), de la basse vers l'aigu
const ACCORDS_AMBIANCE = {
  "Gmaj7": [43, 50, 55, 59, 66],
  "A": [45, 52, 57, 61, 64],
  "F#m7": [42, 49, 54, 57, 64],
  "Bm7": [47, 54, 59, 62, 69],
  "Em7": [40, 47, 52, 55, 62],
  "A7sus4": [45, 52, 57, 62, 67],
  "Dmaj7": [38, 45, 50, 54, 61],
};

// Mélodies : [note, début en temps, durée en temps], sur les 8 mesures de leur partie
const MELODIE_FLUTE = [
  [78, 0, 2], [76, 2, 1], [74, 3, 1],
  [76, 4, 1.5], [73, 5.5, 0.5], [69, 6, 2],
  [69, 8, 1], [73, 9, 1], [76, 10, 1], [78, 11, 1],
  [78, 12, 2], [76, 14, 1], [74, 15, 1],
  [74, 16, 1.5], [76, 17.5, 0.5], [79, 18, 2],
  [78, 20, 1.5], [76, 21.5, 0.5], [73, 22, 2],
  [74, 24, 1], [71, 25, 1], [74, 26, 1], [78, 27, 1],
  [76, 28, 3],
];

const MELODIE_PIANO = [
  [83, 0, 2], [81, 2, 2],
  [81, 4, 1.5], [76, 5.5, 0.5], [76, 6, 2],
  [78, 8, 2], [76, 10, 1], [73, 11, 1],
  [74, 12, 3],
  [71, 16, 1], [74, 17, 1], [79, 18, 2],
  [76, 20, 1.5], [74, 21.5, 0.5], [76, 22, 2],
  [78, 24, 2], [76, 26, 1], [73, 27, 1],
  [74, 28, 4],
];

// 4 parties de 8 mesures : introduction, flûte, piano, puis une partie plus dépouillée avant de reboucler
const PARTIES_AMBIANCE = [
  { accords: ["Gmaj7", "A", "F#m7", "Bm7", "Em7", "A7sus4", "Dmaj7", "Dmaj7"], arpege: "croches", basse: false },
  { accords: ["Gmaj7", "A", "F#m7", "Bm7", "Em7", "F#m7", "Gmaj7", "A7sus4"], arpege: "croches", basse: true, melodie: MELODIE_FLUTE, instrument: "flute" },
  { accords: ["Gmaj7", "A", "F#m7", "Bm7", "Em7", "A7sus4", "Dmaj7", "Dmaj7"], arpege: "croches", basse: true, melodie: MELODIE_PIANO, instrument: "piano" },
  { accords: ["Bm7", "F#m7", "Gmaj7", "Dmaj7", "Em7", "F#m7", "Gmaj7", "A7sus4"], arpege: "noires", basse: true },
];

const MOTIF_ARPEGE = [0, 1, 2, 3, 4, 3, 2, 1];

function jouerCrocheAmbiance(morceau, pas, temps, partie, accord) {
  const croche = pas % CROCHES_PAR_MESURE;
  const dureeMesure = CROCHES_PAR_MESURE * morceau.croche;

  if (croche === 0) jouerNappe(accord.slice(1), temps, dureeMesure);
  if (partie.basse && croche % 4 === 0) jouerBasse(accord[0], temps, dureeMesure / 2);

  if (partie.arpege === "croches") {
    jouerPiano(accord[MOTIF_ARPEGE[croche]], temps, croche === 0 ? 0.07 : 0.05);
  } else if (croche % 2 === 0) {
    jouerPiano(accord[[0, 2, 4, 2][croche / 2]], temps, croche === 0 ? 0.06 : 0.04, 3);
  }

  for (const { note, duree, instrument } of morceau.melodies.get(pas) || []) {
    if (instrument === "flute") jouerFlute(note, temps, duree);
    else jouerPiano(note, temps, 0.09, Math.max(duree, 2.5));
  }
}

// ═══ Morceau « aventure » : cordes qui poussent en croches, timbales, caisse claire, mélodie aux cuivres ═══

const ACCORDS_AVENTURE = {
  "C": [36, 48, 55, 60, 64],
  "G": [43, 50, 55, 59, 62],
  "Am": [45, 52, 57, 60, 64],
  "F": [41, 48, 53, 57, 60],
  "Em": [40, 47, 52, 55, 59],
  "Dm": [38, 50, 53, 57, 62],
};

// Thème héroïque, puis sa variation plus haute
const MELODIE_THEME = [
  [69, 0, 1.5], [72, 1.5, 0.5], [77, 2, 2],
  [76, 4, 1], [74, 5, 1], [71, 6, 1], [74, 7, 1],
  [76, 8, 1.5], [79, 9.5, 0.5], [76, 10, 1], [74, 11, 1],
  [72, 12, 2], [69, 14, 2],
  [69, 16, 1], [72, 17, 1], [77, 18, 1.5], [76, 19.5, 0.5],
  [74, 20, 1], [79, 21, 2], [77, 23, 0.5], [76, 23.5, 0.5],
  [76, 24, 2], [74, 26, 1], [72, 27, 1],
  [72, 28, 3],
];

const MELODIE_ENVOLEE = [
  [76, 0, 1.5], [74, 1.5, 0.5], [72, 2, 1], [76, 3, 1],
  [77, 4, 2], [81, 6, 2],
  [79, 8, 1.5], [76, 9.5, 0.5], [72, 10, 2],
  [74, 12, 1], [76, 13, 1], [74, 14, 1], [71, 15, 1],
  [72, 16, 1], [76, 17, 1], [81, 18, 1.5], [79, 19.5, 0.5],
  [77, 20, 1], [76, 21, 1], [77, 22, 1], [81, 23, 1],
  [77, 24, 1.5], [76, 25.5, 0.5], [74, 26, 2],
  [71, 28, 1], [74, 29, 1], [79, 30, 2],
];

// 3 parties de 8 mesures : montée (cordes et timbales), thème, envolée ; puis on reboucle
const PARTIES_AVENTURE = [
  { accords: ["C", "G", "Am", "F", "C", "G", "F", "G"], batterie: false },
  { accords: ["F", "G", "Em", "Am", "F", "G", "C", "C"], batterie: true, melodie: MELODIE_THEME, instrument: "cuivres" },
  { accords: ["Am", "F", "C", "G", "Am", "F", "Dm", "G"], batterie: true, melodie: MELODIE_ENVOLEE, instrument: "cuivres" },
];

const MOTIF_CORDES = [1, 3, 2, 3, 1, 3, 2, 4];

function jouerCrocheAventure(morceau, pas, temps, partie, accord) {
  const croche = pas % CROCHES_PAR_MESURE;
  const mesure = Math.floor(pas / CROCHES_PAR_MESURE) % MESURES_PAR_PARTIE;
  const dureeMesure = CROCHES_PAR_MESURE * morceau.croche;

  if (croche === 0) jouerNappe(accord.slice(2), temps, dureeMesure, { coupure: 1100, volume: 0.014 });
  jouerCordeCourte(accord[MOTIF_CORDES[croche]], temps, croche % 2 ? 0.026 : 0.036);
  if (partie.batterie && croche % 2 === 0) jouerBasse(accord[0] + 12, temps, morceau.croche * 1.6, 0.09);

  // Percussions : la montée s'intensifie jusqu'au roulement final, puis la batterie entre avec une cymbale
  if (partie.batterie) {
    if (croche === 0 || croche === 4) jouerTimbale(temps);
    if (croche === 2 || croche === 6) jouerCaisseClaire(temps);
    if (mesure === 0 && croche === 0) jouerCymbale(temps);
  } else {
    if (croche === 0 || (mesure >= 4 && croche === 4)) jouerTimbale(temps);
    if (mesure === 7 && croche >= 5) jouerTimbale(temps, 0.24);
  }

  for (const { note, duree } of morceau.melodies.get(pas) || []) jouerCuivre(note, temps, duree);
}

// ═══ Les deux morceaux ═══

function creerMorceau(morceau) {
  const croche = 60 / morceau.tempo / 2;
  const crochesParPartie = MESURES_PAR_PARTIE * CROCHES_PAR_MESURE;
  // Notes de mélodie rangées par croche de départ
  const melodies = new Map();
  morceau.parties.forEach((partie, rang) => {
    for (const [note, debut, duree] of partie.melodie || []) {
      const pas = rang * crochesParPartie + Math.round(debut * 2);
      melodies.set(pas, [...(melodies.get(pas) || []), { note, duree: duree * 2 * croche, instrument: partie.instrument }]);
    }
  });
  return { ...morceau, croche, crochesParPartie, total: morceau.parties.length * crochesParPartie, melodies };
}

const MORCEAUX = {
  // reprendre : en changeant de page, le morceau repart là où il en était plutôt qu'au début
  ambiance: creerMorceau({ tempo: 72, volume: 0.6, reverberation: 0.4, reprendre: true, accords: ACCORDS_AMBIANCE, parties: PARTIES_AMBIANCE, jouer: jouerCrocheAmbiance }),
  aventure: creerMorceau({ tempo: 112, volume: 0.5, reverberation: 0.25, reprendre: false, accords: ACCORDS_AVENTURE, parties: PARTIES_AVENTURE, jouer: jouerCrocheAventure }),
};

// ═══ Instruments (ils jouent dans le morceau en cours) ═══

// Piano doux : attaque nette, extinction lente
function jouerPiano(note, debut, volume, duree = 2.4) {
  const f = frequenceMidi(note);
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0.0001, debut);
  enveloppe.gain.exponentialRampToValueAtTime(volume, debut + 0.008);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
  enveloppe.connect(musique.entree);

  const fondamentale = contexteAudio.createOscillator();
  fondamentale.frequency.value = f;
  fondamentale.connect(enveloppe);
  const harmonique = contexteAudio.createOscillator();
  harmonique.type = "triangle";
  harmonique.frequency.value = f * 2;
  const douceur = contexteAudio.createGain();
  douceur.gain.value = 0.12;
  harmonique.connect(douceur).connect(enveloppe);
  for (const oscillateur of [fondamentale, harmonique]) {
    oscillateur.start(debut);
    oscillateur.stop(debut + duree + 0.05);
  }
}

// Nappe de cordes : deux scies légèrement désaccordées, très filtrées, qui montent et s'éteignent lentement
function jouerNappe(notes, debut, duree, { coupure = 850, volume = 0.018 } = {}) {
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = coupure;
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0, debut);
  enveloppe.gain.linearRampToValueAtTime(1, debut + Math.min(1, duree / 2));
  enveloppe.gain.setValueAtTime(1, debut + duree);
  enveloppe.gain.linearRampToValueAtTime(0, debut + duree + 1.2);
  filtre.connect(enveloppe).connect(musique.entree);

  for (const note of notes) {
    for (const desaccord of [-7, 7]) {
      const oscillateur = contexteAudio.createOscillator();
      oscillateur.type = "sawtooth";
      oscillateur.frequency.value = frequenceMidi(note);
      oscillateur.detune.value = desaccord;
      const gain = contexteAudio.createGain();
      gain.gain.value = volume;
      oscillateur.connect(gain).connect(filtre);
      oscillateur.start(debut);
      oscillateur.stop(debut + duree + 1.3);
    }
  }
}

// Basse ronde
function jouerBasse(note, debut, duree, volume = 0.11) {
  const oscillateur = contexteAudio.createOscillator();
  oscillateur.frequency.value = frequenceMidi(note);
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0, debut);
  enveloppe.gain.linearRampToValueAtTime(volume, debut + 0.03);
  enveloppe.gain.linearRampToValueAtTime(volume * 0.65, debut + duree);
  enveloppe.gain.linearRampToValueAtTime(0, debut + duree + 0.15);
  oscillateur.connect(enveloppe).connect(musique.entree);
  oscillateur.start(debut);
  oscillateur.stop(debut + duree + 0.2);
}

// Flûte : son pur avec un léger vibrato qui arrive après l'attaque
function jouerFlute(note, debut, duree) {
  const f = frequenceMidi(note);
  const oscillateur = contexteAudio.createOscillator();
  oscillateur.frequency.value = f;
  const vibrato = contexteAudio.createOscillator();
  vibrato.frequency.value = 5;
  const ampleur = contexteAudio.createGain();
  ampleur.gain.setValueAtTime(0, debut);
  ampleur.gain.linearRampToValueAtTime(f * 0.005, debut + Math.min(0.4, duree));
  vibrato.connect(ampleur).connect(oscillateur.frequency);

  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0, debut);
  enveloppe.gain.linearRampToValueAtTime(0.06, debut + 0.08);
  enveloppe.gain.linearRampToValueAtTime(0.045, debut + duree);
  enveloppe.gain.linearRampToValueAtTime(0, debut + duree + 0.3);
  oscillateur.connect(enveloppe).connect(musique.entree);
  for (const source of [oscillateur, vibrato]) {
    source.start(debut);
    source.stop(debut + duree + 0.35);
  }
}

// Cuivres : deux scies dont le filtre s'ouvre à l'attaque (le « souffle » du cuivre), avec un vibrato
function jouerCuivre(note, debut, duree) {
  const f = frequenceMidi(note);
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.Q.value = 1.2;
  filtre.frequency.setValueAtTime(500, debut);
  filtre.frequency.exponentialRampToValueAtTime(2600, debut + 0.07);
  filtre.frequency.exponentialRampToValueAtTime(1500, debut + Math.max(0.1, duree));
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0, debut);
  enveloppe.gain.linearRampToValueAtTime(0.06, debut + 0.04);
  enveloppe.gain.linearRampToValueAtTime(0.045, debut + duree);
  enveloppe.gain.linearRampToValueAtTime(0, debut + duree + 0.15);
  filtre.connect(enveloppe).connect(musique.entree);

  const vibrato = contexteAudio.createOscillator();
  vibrato.frequency.value = 5.5;
  const ampleur = contexteAudio.createGain();
  ampleur.gain.setValueAtTime(0, debut);
  ampleur.gain.linearRampToValueAtTime(f * 0.004, debut + Math.min(0.35, duree));
  vibrato.connect(ampleur);
  for (const desaccord of [0, 9]) {
    const oscillateur = contexteAudio.createOscillator();
    oscillateur.type = "sawtooth";
    oscillateur.frequency.value = f;
    oscillateur.detune.value = desaccord;
    ampleur.connect(oscillateur.frequency);
    oscillateur.connect(filtre);
    oscillateur.start(debut);
    oscillateur.stop(debut + duree + 0.2);
  }
  vibrato.start(debut);
  vibrato.stop(debut + duree + 0.2);
}

// Cordes jouées court (une note par croche), qui donnent l'élan
function jouerCordeCourte(note, debut, volume) {
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 2000;
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0.0001, debut);
  enveloppe.gain.exponentialRampToValueAtTime(volume, debut + 0.012);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + 0.22);
  filtre.connect(enveloppe).connect(musique.entree);
  for (const desaccord of [-10, 10]) {
    const oscillateur = contexteAudio.createOscillator();
    oscillateur.type = "sawtooth";
    oscillateur.frequency.value = frequenceMidi(note);
    oscillateur.detune.value = desaccord;
    oscillateur.connect(filtre);
    oscillateur.start(debut);
    oscillateur.stop(debut + 0.25);
  }
}

// Souffle filtré pour les percussions, dans le morceau en cours
function jouerBruitMusique(debut, duree, typeFiltre, frequence, volumeDepart, q = 1) {
  const source = contexteAudio.createBufferSource();
  source.buffer = bruitBlanc;
  source.loop = true;
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = typeFiltre;
  filtre.frequency.value = frequence;
  filtre.Q.value = q;
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(volumeDepart, debut);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
  source.connect(filtre).connect(enveloppe).connect(musique.entree);
  source.start(debut, Math.random() * 0.5);
  source.stop(debut + duree + 0.05);
}

// Timbale : coup grave qui descend, avec l'impact de la baguette
function jouerTimbale(debut, volume = 0.4) {
  const oscillateur = contexteAudio.createOscillator();
  oscillateur.frequency.setValueAtTime(105, debut);
  oscillateur.frequency.exponentialRampToValueAtTime(48, debut + 0.3);
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0.0001, debut);
  enveloppe.gain.exponentialRampToValueAtTime(volume, debut + 0.006);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + 0.5);
  oscillateur.connect(enveloppe).connect(musique.entree);
  oscillateur.start(debut);
  oscillateur.stop(debut + 0.55);
  jouerBruitMusique(debut, 0.06, "lowpass", 400, volume * 0.5);
}

function jouerCaisseClaire(debut) {
  jouerBruitMusique(debut, 0.14, "bandpass", 1900, 0.16, 0.7);
  const corps = contexteAudio.createOscillator();
  corps.type = "triangle";
  corps.frequency.value = 190;
  const enveloppe = contexteAudio.createGain();
  enveloppe.gain.setValueAtTime(0.06, debut);
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + 0.08);
  corps.connect(enveloppe).connect(musique.entree);
  corps.start(debut);
  corps.stop(debut + 0.1);
}

function jouerCymbale(debut) {
  jouerBruitMusique(debut, 1.6, "highpass", 5000, 0.07, 0.5);
}

// ═══ Lecture ═══

function planifierMusique() {
  if (!musique) return;
  const { morceau } = musique;
  const limite = contexteAudio.currentTime + AVANCE_MUSIQUE;
  while (musique.temps < limite) {
    const mesure = Math.floor(musique.pas / CROCHES_PAR_MESURE);
    const partie = morceau.parties[Math.floor(mesure / MESURES_PAR_PARTIE)];
    const accord = morceau.accords[partie.accords[mesure % MESURES_PAR_PARTIE]];
    morceau.jouer(morceau, musique.pas, musique.temps, partie, accord);
    musique.pas = (musique.pas + 1) % morceau.total;
    musique.temps += morceau.croche;
  }
}

// Réverbération : réponse fabriquée à partir d'un souffle qui s'éteint en 3 secondes
function creerReverberation() {
  if (!reponseReverberation) {
    const longueur = Math.floor(contexteAudio.sampleRate * 3);
    reponseReverberation = contexteAudio.createBuffer(2, longueur, contexteAudio.sampleRate);
    for (let canal = 0; canal < 2; canal++) {
      const echantillons = reponseReverberation.getChannelData(canal);
      for (let i = 0; i < longueur; i++) echantillons[i] = (Math.random() * 2 - 1) * (1 - i / longueur) ** 3;
    }
  }
  const reverberation = contexteAudio.createConvolver();
  reverberation.buffer = reponseReverberation;
  return reverberation;
}

// Le volume glisse vers sa nouvelle valeur au lieu de sauter
function glisserVolume(gain, cible, duree) {
  const maintenant = contexteAudio.currentTime;
  if (gain.cancelAndHoldAtTime) {
    gain.cancelAndHoldAtTime(maintenant);
  } else {
    gain.cancelScheduledValues(maintenant);
    gain.setValueAtTime(gain.value, maintenant);
  }
  gain.linearRampToValueAtTime(cible, maintenant + duree);
}

const volumeVoulu = morceau => morceau.volume * niveauSon("musique");

// Croche où reprendre : là où la page précédente s'est arrêtée, plus le temps passé depuis
function crocheDeReprise(id) {
  const morceau = MORCEAUX[id];
  if (!morceau.reprendre) return 0;
  try {
    const sauvegarde = JSON.parse(sessionStorage.getItem(`${CLE_MUSIQUE}/${id}`));
    if (!sauvegarde) return 0;
    const ecoulees = Math.round((Date.now() - sauvegarde.date) / 1000 / morceau.croche);
    return (sauvegarde.pas + ecoulees) % morceau.total;
  } catch {
    return 0;
  }
}

function sauvegarderPosition() {
  if (!musique || !musique.morceau.reprendre) return;
  const { morceau } = musique;
  const enAvance = Math.max(0, Math.round((musique.temps - contexteAudio.currentTime) / morceau.croche));
  const pas = (musique.pas - enAvance + morceau.total) % morceau.total;
  try {
    sessionStorage.setItem(`${CLE_MUSIQUE}/${musique.id}`, JSON.stringify({ pas, date: Date.now() }));
  } catch {}
}

// Lance un morceau ; celui qui jouait s'efface en fondu pendant que le nouveau monte
function lancerMorceau(id) {
  // Le navigateur peut refuser le son avant un premier toucher : la musique part alors à ce moment-là
  preparerSon();
  if (!contexteAudio || !MORCEAUX[id] || musique?.id === id) return;

  if (musique) {
    sauvegarderPosition();
    const ancien = musique.volume;
    glisserVolume(ancien.gain, 0, DUREE_FONDU);
    setTimeout(() => ancien.disconnect(), (DUREE_FONDU + AVANCE_MUSIQUE + 0.5) * 1000);
  }

  const morceau = MORCEAUX[id];
  const filtre = contexteAudio.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 3200;
  const volume = contexteAudio.createGain();
  volume.gain.setValueAtTime(0, contexteAudio.currentTime);
  volume.gain.linearRampToValueAtTime(volumeVoulu(morceau), contexteAudio.currentTime + 2);
  volume.connect(contexteAudio.destination);

  const direct = contexteAudio.createGain();
  direct.gain.value = 0.75;
  const humide = contexteAudio.createGain();
  humide.gain.value = morceau.reverberation;
  filtre.connect(direct).connect(volume);
  filtre.connect(creerReverberation()).connect(humide).connect(volume);

  musique = { id, morceau, entree: filtre, volume, pas: crocheDeReprise(id), temps: contexteAudio.currentTime + 0.1 };
  planifierMusique();
  minuterieMusique ??= setInterval(planifierMusique, 250);
}

// ═══ Qui joue la musique ? ═══

// Dans l'émulateur, le jeu est dans un cadre qui change de page à chaque onglet : la musique est jouée par
// la page de l'émulateur, qui reste ouverte, si bien qu'elle continue sans jamais repartir de zéro.
// Le jeu lui dit quel morceau jouer, et lui signale les touchers (le son n'est permis qu'après un geste).
const MESSAGE_TOUCHER = "tcg-one-piece:toucher";
const MESSAGE_MORCEAU = "tcg-one-piece:morceau:";
const MESSAGE_QUEL_MORCEAU = "tcg-one-piece:quel-morceau";

const pageEmulateur = document.querySelector(".telephone__ecran") !== null;
const pageDansEmulateur = window.parent !== window && !pageEmulateur;
let morceauDemande = document.body.dataset.musique || "ambiance";

// Demande un morceau : à l'émulateur s'il joue la musique, sinon à cette page
function demanderMorceau(id) {
  morceauDemande = id;
  if (pageDansEmulateur) window.parent.postMessage(MESSAGE_MORCEAU + id, "*");
  else lancerMorceau(id);
}

if (pageDansEmulateur) {
  for (const type of ["pointerdown", "keydown"]) {
    document.addEventListener(type, () => window.parent.postMessage(MESSAGE_TOUCHER, "*"), { capture: true });
  }
  // L'émulateur, s'il s'est préparé après cette page, redemande le morceau
  addEventListener("message", evenement => {
    if (evenement.data === MESSAGE_QUEL_MORCEAU) demanderMorceau(morceauDemande);
  });
} else {
  addEventListener("message", evenement => {
    if (evenement.data === MESSAGE_TOUCHER) preparerSon();
    else if (typeof evenement.data === "string" && evenement.data.startsWith(MESSAGE_MORCEAU)) {
      lancerMorceau(evenement.data.slice(MESSAGE_MORCEAU.length));
    }
  });
  addEventListener("pagehide", sauvegarderPosition);

  // Volume et activation réglés dans les paramètres : la musique continue, seul son volume change
  suivreReglages(() => {
    if (musique) glisserVolume(musique.volume.gain, volumeVoulu(musique.morceau), 0.15);
  });

  // Le jeu passe en arrière-plan : le son se met en pause
  document.addEventListener("visibilitychange", () => {
    if (!contexteAudio) return;
    if (document.hidden) {
      sauvegarderPosition();
      contexteAudio.suspend();
    } else {
      contexteAudio.resume();
    }
  });
}

// L'émulateur attend que le jeu lui dise quel morceau jouer ; les pages du jeu le demandent dès leur ouverture
if (pageEmulateur) document.querySelector(".telephone__ecran").contentWindow.postMessage(MESSAGE_QUEL_MORCEAU, "*");
else demanderMorceau(morceauDemande);
