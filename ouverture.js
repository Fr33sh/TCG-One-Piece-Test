// Ouverture des boosters (1 ou 10). Le doigt (ou la souris) glisse d'un bord à l'autre du booster, au niveau
// de la ligne entre l'en-tête et l'illustration : la découpe suit grossièrement son tracé, en restant une courbe
// réaliste, sinon elle se réinitialise. Un petit son (SR) ou des étoiles (SSR) annoncent les cartes rares.
// À 10 boosters, ouvrir le premier ouvre les suivants un par un, puis chaque booster se dévoile à son tour.
// Révélation : chaque toucher jette la carte de devant vers le coin en haut à gauche ; un appui maintenu
// écarte la pile pour en voir les bords. La dernière carte (ou « Tout révéler ») mène au résumé.

const MARGE_DECOUPE = 40; // px : la découpe peut s'écarter d'environ 1 cm au-dessus ou au-dessous de la ligne
const MARGE_DEPART = 60; // px : tolérance pour poser le doigt au départ
const BORD_DEPART = 0.22; // le geste commence près d'un bord du booster…
const BORD_ARRIVEE = 0.06; // …et se termine près du bord opposé
const LISSAGE = 0.35; // la découpe suit le doigt avec un léger retard, ce qui arrondit la courbe
const PENTE_MAX = 1.2; // au-delà (environ 50°), la découpe n'est plus réaliste
const RECUL_MAX = 0.05; // retour en arrière toléré, en part de la largeur du booster
const VIRAGES_MAX = 2; // changements de sens (montée / descente) tolérés
const DECALAGE_PILE = 3; // px entre deux cartes de la pile
const ECART_BOOSTERS = 0.07; // pile de boosters : décalage entre deux languettes, en part de la largeur
const MARGES_OUVERTURE = { cotes: 20, haut: 56, bas: 120 }; // px laissés autour du booster agrandi (en bas : la consigne)
const MARGE_HAUT_PILE = 100; // px : la pile de 10 boosters commence plus bas, loin du haut de l'écran
const COURBE_OUVERTURE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const coucheOuverture = document.querySelector(".ouverture");

let phase = "repos"; // "glisser", "sortie", "revelation", "resume"
let session = null; // { boosters: [{ cartes, nouvelles }], index } : boosters ouverts et booster en cours
let paquet = null;
let boutonToutReveler = null;
let numeroBooster = null;
let geste = null; // glissement en cours sur le booster
let manipulation = null; // appui en cours sur la pile
let enMouvement = false;

const attendre = duree => new Promise(fin => setTimeout(fin, duree));

// Joue l'animation et garde l'état final en style direct
function animer(el, images, duree, options = {}) {
  const delai = options.delai || 0;
  el.animate(images, { duration: duree, delay: delai, easing: options.courbe || COURBE_OUVERTURE, fill: "backwards" });
  const { offset, easing, ...final } = images[images.length - 1];
  Object.assign(el.style, final);
  return attendre(duree + delai);
}

const packAccueil = () => zoneBooster.querySelector(".pack");
const borner = (valeur, min, max) => Math.min(Math.max(valeur, min), max);
const boosterEnCours = () => session.boosters[session.index];
const plusieursBoosters = () => session.boosters.length > 1;

// ── 1. Préparer l'ouverture ──

document.querySelector(".bulle-choix--un").addEventListener("click", () => commencerOuverture(1));
document.querySelector(".bulle-choix--dix").addEventListener("click", () => commencerOuverture(10));

function commencerOuverture(nombre) {
  if (phase !== "repos" || etatRecharge().reserve < nombre) return;
  phase = "glisser";

  // Une carte est « nouvelle » si elle n'était pas encore dans la collection (un seul badge par carte)
  const possedees = lireCollection();
  const vues = new Set();
  const boosters = Array.from({ length: nombre }, () => {
    const { cartes, godPack } = tirerBooster();
    const nouvelles = cartes.map(carte => {
      const nouvelle = !possedees[carte.id] && !vues.has(carte.id);
      vues.add(carte.id);
      return nouvelle;
    });
    return { cartes, nouvelles, godPack };
  });
  session = { boosters, index: 0 };

  // Pile de boosters : chacun dépasse un peu au-dessus du précédent, on voit toutes les languettes
  const pack = packAccueil();
  const ecart = pack.offsetWidth * ECART_BOOSTERS;
  for (let rang = 1; rang < nombre; rang++) {
    const copie = pack.cloneNode(true);
    copie.classList.add("pack--pile");
    copie.style.zIndex = nombre - rang;
    copie.style.translate = `0 ${-rang * ecart}px`;
    pack.parentElement.append(copie);
    copie.animate([{ opacity: 0, translate: "0 0" }, { opacity: 1, translate: `0 ${-rang * ecart}px` }],
      { duration: 500, delay: rang * 30, easing: COURBE_OUVERTURE, fill: "backwards" });
  }
  pack.style.zIndex = nombre;

  zoomerPourOuverture(ecart * (nombre - 1));
  document.body.classList.add("mode-ouverture", "ouverture-glisser");
  document.body.classList.toggle("ouverture-dix", nombre > 1);
  choixBooster.inert = true;
  ajouterDecoupe(pack, true);

  // Le paquet de cartes du premier booster est préparé tout de suite (invisible) pour charger ses polices
  paquet = creerPaquet(boosters[0]);
  coucheOuverture.hidden = false;
  coucheOuverture.append(paquet);
}

// Le booster (ou la pile) grandit pour occuper presque tout l'écran, en gardant un peu d'espace autour.
// Les mesures offset ignorent les transformations : elles donnent la place du booster sans zoom.
function zoomerPourOuverture(depassementHaut) {
  const contenu = zoneBooster.offsetParent.getBoundingClientRect();
  const largeur = zoneBooster.offsetWidth;
  const hauteur = zoneBooster.offsetHeight;
  const { cotes, bas } = MARGES_OUVERTURE;
  const haut = depassementHaut > 0 ? MARGE_HAUT_PILE : MARGES_OUVERTURE.haut;
  const echelle = Math.min((window.innerWidth - 2 * cotes) / largeur, (window.innerHeight - haut - bas) / (hauteur + depassementHaut));
  const deplacementX = window.innerWidth / 2 - (contenu.left + zoneBooster.offsetLeft + largeur / 2);
  const deplacementY = haut + (window.innerHeight - haut - bas) / 2
    - (contenu.top + zoneBooster.offsetTop + hauteur / 2) + (echelle * depassementHaut) / 2;
  zoneBooster.style.setProperty("--zoom-ouverture", `translate(${deplacementX}px, ${deplacementY}px) scale(${echelle})`);
}

// Ligne entre l'en-tête et l'illustration (en pointillés pour le booster à ouvrir) et tracé de la découpe
function ajouterDecoupe(pack, avecGuide) {
  const entete = pack.querySelector(".pack__entete");
  const illustration = pack.querySelector(".pack__illustration");
  const ligne = (entete.offsetHeight + illustration.offsetTop) / 2 / pack.offsetHeight;
  const decoupe = element("div", "decoupe");
  decoupe.dataset.ligne = ligne;
  decoupe.innerHTML = `
    ${avecGuide ? `<span class="decoupe__guide" style="top: ${ligne * 100}%"></span>` : ""}
    <svg class="decoupe__trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="" />
    </svg>`;
  pack.append(decoupe);
  return decoupe;
}

const versPoints = trace => trace.map(point => `${point.x * 100},${point.y * 100}`).join(" ");

// ── 2. Glisser pour ouvrir ──

function dessinerTrace() {
  const { zone, points } = geste;
  packAccueil().querySelector(".decoupe__trace polyline")
    .setAttribute("points", versPoints(points.map(point => ({ x: point.x, y: (point.y - zone.top) / zone.height }))));
}

// Le tracé s'efface ; en rouge s'il n'était pas réaliste
function effacerTrace(rate) {
  geste = null;
  const trace = packAccueil().querySelector(".decoupe__trace");
  trace.classList.toggle("decoupe__trace--ratee", rate);
  animer(trace, [{ opacity: 1 }, { opacity: 0 }], rate ? 450 : 250).then(() => {
    if (geste) return;
    trace.querySelector("polyline").setAttribute("points", "");
    trace.classList.remove("decoupe__trace--ratee");
    trace.style.opacity = "";
  });
}

document.addEventListener("pointerdown", evenement => {
  if (phase !== "glisser") return;
  const pack = packAccueil();
  const zone = pack.getBoundingClientRect();
  const ligne = zone.top + zone.height * pack.querySelector(".decoupe").dataset.ligne;
  if (Math.abs(evenement.clientY - ligne) > MARGE_DEPART) return;
  const x = (evenement.clientX - zone.left) / zone.width;
  const sens = x < BORD_DEPART ? 1 : x > 1 - BORD_DEPART ? -1 : 0;
  if (!sens) return;

  const trace = pack.querySelector(".decoupe__trace");
  trace.getAnimations().forEach(animation => animation.cancel());
  trace.classList.remove("decoupe__trace--ratee");
  trace.style.opacity = "";

  const y = borner(evenement.clientY, ligne - MARGE_DECOUPE, ligne + MARGE_DECOUPE);
  geste = {
    sens, zone, ligne, pointeur: evenement.pointerId,
    points: [{ x: borner(x, 0, 1), y }], avance: x, direction: 0, depuisVirage: 0, virages: 0,
  };
  dessinerTrace();
});

document.addEventListener("pointermove", evenement => {
  if (!geste || evenement.pointerId !== geste.pointeur) return;
  const { zone, ligne, sens, points } = geste;
  const x = (evenement.clientX - zone.left) / zone.width;

  // Retour en arrière ou doigt trop loin de la ligne : la découpe se réinitialise
  if ((x - geste.avance) * sens < -RECUL_MAX || Math.abs(evenement.clientY - ligne) > MARGE_DECOUPE + 20) {
    effacerTrace(true);
    return;
  }
  if ((x - geste.avance) * sens > 0) geste.avance = x;

  const dernier = points[points.length - 1];
  const xBorne = borner(x, 0, 1);
  if ((xBorne - dernier.x) * sens >= 0.01) {
    const cible = borner(evenement.clientY, ligne - MARGE_DECOUPE, ligne + MARGE_DECOUPE);
    const y = dernier.y + (cible - dernier.y) * LISSAGE;
    const dy = y - dernier.y;

    // Trop raide ou trop de zigzags : la découpe n'est plus réaliste
    if (Math.abs(dy) / (Math.abs(xBorne - dernier.x) * zone.width) > PENTE_MAX) {
      effacerTrace(true);
      return;
    }
    if (Math.sign(dy) === geste.direction) {
      geste.depuisVirage = 0;
    } else {
      geste.depuisVirage += dy;
      if (Math.abs(geste.depuisVirage) > 6) {
        if (geste.direction) geste.virages++;
        geste.direction = Math.sign(geste.depuisVirage);
        geste.depuisVirage = 0;
        if (geste.virages > VIRAGES_MAX) {
          effacerTrace(true);
          return;
        }
      }
    }
    points.push({ x: xBorne, y });
    dessinerTrace();
  }

  if ((sens === 1 && x >= 1 - BORD_ARRIVEE) || (sens === -1 && x <= BORD_ARRIVEE)) {
    // Tracé de gauche à droite, prolongé jusqu'aux deux bords du booster
    const trace = [...points].sort((a, b) => a.x - b.x).map(point => ({ x: point.x, y: (point.y - zone.top) / zone.height }));
    trace.unshift({ x: 0, y: trace[0].y });
    trace.push({ x: 1, y: trace[trace.length - 1].y });
    geste = null;
    if (plusieursBoosters()) ouvrirLesBoosters(sens, trace);
    else ouvrirUnBooster(sens, trace);
  }
});

// Le doigt est levé avant l'autre bord : le tracé s'efface
function abandonnerGeste() {
  if (geste) effacerTrace(false);
}

document.addEventListener("pointerup", abandonnerGeste);
document.addEventListener("pointercancel", abandonnerGeste);

// ── 3. Le booster se déchire le long du tracé ──

// Coupe le booster : la bande du haut s'envole du côté où le doigt est parti
function couperPack(pack, trace, sens) {
  pack.querySelector(".decoupe")?.remove();
  jouerDechirure();
  const zone = pack.getBoundingClientRect();
  const enPourcents = liste => liste.map(point => `${point.x * 100}% ${point.y * 100}%`).join(", ");

  const bande = pack.cloneNode(true);
  bande.className = "pack pack--bande";
  bande.removeAttribute("style");
  bande.style.setProperty("--l", `${zone.width}px`);
  bande.style.left = `${zone.left}px`;
  bande.style.top = `${zone.top}px`;
  bande.style.clipPath = `polygon(0% 0%, 100% 0%, ${enPourcents([...trace].reverse())})`;
  coucheOuverture.append(bande);
  pack.style.clipPath = `polygon(${enPourcents(trace)}, 100% 100%, 0% 100%)`;
  animer(bande, [
    { transform: "none", opacity: 1 },
    { transform: `translate(${sens * 70}px, -50px) rotate(${sens * 16}deg)`, opacity: 0 },
  ], 700).then(() => bande.remove());

  // Le tracé en coordonnées de l'écran
  return { zone, ecran: trace.map(point => ({ x: zone.left + point.x * zone.width, y: zone.top + point.y * zone.height })) };
}

// Cartes rares, juste après la déchirure : un carillon pour une SR, un éclat et des étoiles pour une SSR,
// une fanfare pour un god pack (seul le son le plus fort est joué). Renvoie vrai s'il y a une SSR.
function annoncerRaretes(booster, zone, ecran) {
  const ssr = booster.cartes.some(carte => carte.rang === 4);
  if (booster.godPack) jouerGodPack(0.15);
  else if (ssr) jouerEclatSSR(0.15);
  else if (booster.cartes.some(carte => carte.rang === 3)) jouerCarillon(0.15);
  if (!ssr) return false;
  const milieu = ecran.reduce((somme, point) => somme + point.y, 0) / ecran.length;
  lancerEtoiles(zone.left + zone.width / 2, milieu, zone.width);
  return true;
}

// Un booster : les cartes sortent par l'ouverture, de dos, puis se retournent
async function ouvrirUnBooster(sens, trace) {
  phase = "sortie";
  document.body.classList.remove("ouverture-glisser");
  utiliserBoosters(1);
  ajouterALaCollection(boosterEnCours().cartes);
  const { zone, ecran } = couperPack(packAccueil(), trace, sens);
  const ssr = annoncerRaretes(boosterEnCours(), zone, ecran);
  await attendre(ssr ? 1450 : 450);

  const { hauteur, centreX, centreY } = await placerPaquet();
  const echelle = (zone.width * 0.86) / paquet.offsetWidth;
  const hautDecoupe = Math.min(...ecran.map(point => point.y));
  const basDecoupe = Math.max(...ecran.map(point => point.y));
  const position = y => `translate(${zone.left + zone.width / 2 - centreX}px, ${y - centreY}px) scale(${echelle})`;
  const dedans = position(basDecoupe + (hauteur * echelle) / 2 + 6);
  const dehors = position(hautDecoupe - (hauteur * echelle) / 2 - 14);

  // Seule la partie au-dessus du tracé est visible : les cartes semblent sortir du booster
  const sortie = element("div", "sortie");
  const largeurEcran = window.innerWidth;
  const contour = [...ecran].reverse().map(point => `${point.x}px ${point.y}px`).join(", ");
  sortie.style.clipPath = `polygon(0px 0px, ${largeurEcran}px 0px, ${largeurEcran}px ${ecran[ecran.length - 1].y}px, ${contour}, 0px ${ecran[0].y}px)`;
  sortie.append(paquet);
  coucheOuverture.append(sortie);
  paquet.style.transform = dedans;
  paquet.style.visibility = "visible";

  jouerSortieCartes(0.9);
  await animer(paquet, [{ transform: dedans }, { transform: dehors }], 900, { courbe: "cubic-bezier(0.33, 0, 0.2, 1)" });
  sortie.style.clipPath = "none";

  // Le booster vide descend et disparaît, le paquet vient au centre puis se retourne
  animer(zoneBooster.querySelector(".booster"), [{ translate: "0 0", opacity: 1 }, { translate: "0 140px", opacity: 0 }], 500, { courbe: "ease-in" });
  await animer(paquet, [{ transform: dehors }, { transform: "none" }], 650);
  await retournerPaquet();
  commencerRevelation();
}

// Dix boosters : le premier est ouvert au doigt, les suivants s'ouvrent seuls, un par un
async function ouvrirLesBoosters(sens, premiereTrace) {
  phase = "sortie";
  document.body.classList.remove("ouverture-glisser");
  utiliserBoosters(session.boosters.length);
  ajouterALaCollection(session.boosters.flatMap(booster => booster.cartes));
  const packs = [packAccueil(), ...zoneBooster.querySelectorAll(".pack--pile")];
  const ecart = packs[0].offsetWidth * ECART_BOOSTERS;

  for (const [index, pack] of packs.entries()) {
    const trace = index === 0 ? premiereTrace : await tracerAutomatiquement(pack);
    const { zone, ecran } = couperPack(pack, trace, index === 0 ? sens : 1);
    const ssr = annoncerRaretes(session.boosters[index], zone, ecran);
    await attendre(ssr ? 300 : 60);

    // Le booster ouvert tombe, les suivants avancent d'un cran
    animer(pack, [{ transform: "none", opacity: 1 }, { transform: "translateY(120px)", opacity: 0 }], 220, { courbe: "ease-in" });
    packs.slice(index + 1).forEach((suivant, rang) => { suivant.style.translate = `0 ${-rang * ecart}px`; });
    await attendre(140);
  }
  await attendre(100);
  presenterBooster(0);
}

// Découpe automatique, légèrement courbée, tracée de gauche à droite
async function tracerAutomatiquement(pack) {
  const decoupe = ajouterDecoupe(pack, false);
  const ligne = Number(decoupe.dataset.ligne);
  const polyline = decoupe.querySelector("polyline");
  const amplitude = (Math.random() * 2 - 1) * 0.012;
  const depart = Math.random() * Math.PI * 2;
  const trace = Array.from({ length: 21 }, (_, rang) => ({ x: rang / 20, y: ligne + amplitude * Math.sin(depart + (rang / 20) * Math.PI * 1.5) }));
  for (let etape = 1; etape <= 5; etape++) {
    polyline.setAttribute("points", versPoints(trace.slice(0, etape * 4 + 1)));
    await attendre(18);
  }
  return trace;
}

// ── 4. Le paquet de cartes ──

function creerBadgeNouveau() {
  return element("span", "badge-nouveau", "Nouveau");
}

function creerPaquet({ cartes, nouvelles }) {
  const nouveau = element("div", "paquet");
  nouveau.tabIndex = 0;
  nouveau.setAttribute("role", "button");
  nouveau.setAttribute("aria-label", "Carte suivante");
  // À 10 boosters, les cartes sont un peu plus petites pour laisser la place au numéro du booster
  const largeurMax = plusieursBoosters() ? Math.min(250, window.innerWidth * 0.64) : Math.min(300, window.innerWidth * 0.8);
  nouveau.style.setProperty("--largeur-carte", `${Math.min(largeurMax, ((window.innerHeight - 200) * 1260) / 1760)}px`);

  // La première carte est devant, les suivantes cachées derrière elle
  cartes.forEach((carte, index) => {
    const tirage = element("div", "tirage");
    tirage.style.zIndex = cartes.length - index;
    const retournable = element("div", "tirage__retournable");
    const avant = element("div", "tirage__face tirage__face--avant");
    avant.append(creerCarte(carte));
    if (nouvelles[index]) avant.append(creerBadgeNouveau());
    const dos = element("div", "tirage__face tirage__face--dos");
    const image = element("img");
    image.src = "assets/cartes/dos.jpg";
    image.alt = "";
    dos.append(image);
    retournable.append(avant, dos);
    tirage.append(retournable);
    nouveau.append(tirage);
  });
  rangerPile(nouveau);

  nouveau.addEventListener("pointerdown", appuyer);
  nouveau.addEventListener("pointermove", deplacer);
  nouveau.addEventListener("pointerup", relacher);
  nouveau.addEventListener("pointercancel", relacher);
  nouveau.addEventListener("keydown", evenement => {
    if (evenement.key === "Enter" || evenement.key === " ") {
      evenement.preventDefault();
      if (phase === "revelation" && !enMouvement) passerALaSuivante();
    }
  });
  return nouveau;
}

// Polices chargées, propriétés ajustées (avant toute mise à l'échelle), paquet centré
async function placerPaquet() {
  await document.fonts.ready;
  ajusterProprietes(paquet);
  const hauteur = paquet.offsetHeight;
  const centreX = window.innerWidth / 2;
  const centreY = window.innerHeight * 0.45;
  paquet.style.left = `${centreX - paquet.offsetWidth / 2}px`;
  paquet.style.top = `${centreY - hauteur / 2}px`;
  return { hauteur, centreX, centreY };
}

// Les cartes passent de dos à face visible
function retournerPaquet() {
  return Promise.all([...paquet.querySelectorAll(".tirage__retournable")].map(retournable => animer(retournable, [
    { transform: "rotateY(180deg) scale(1)" },
    { transform: "rotateY(90deg) scale(1.06)", offset: 0.5 },
    { transform: "rotateY(0deg) scale(1)" },
  ], 700, { courbe: "cubic-bezier(0.45, 0.05, 0.35, 1)" })));
}

// Dix boosters : le paquet du booster suivant arrive de dos au centre, puis se retourne
async function presenterBooster(index) {
  phase = "sortie";
  session.index = index;
  if (index > 0) {
    paquet = creerPaquet(boosterEnCours());
    coucheOuverture.append(paquet);
  }
  await placerPaquet();
  afficherNumeroBooster();
  paquet.style.visibility = "visible";
  jouerSortieCartes(0.5);
  await animer(paquet, [{ opacity: 0, transform: "translateY(60px) scale(0.85)" }, { opacity: 1, transform: "none" }], 400);
  await retournerPaquet();
  commencerRevelation();
}

// « Booster n°X », à droite des cartes
function afficherNumeroBooster() {
  if (!numeroBooster) {
    numeroBooster = element("div", "numero-booster");
    coucheOuverture.append(numeroBooster);
  }
  numeroBooster.innerHTML = `<span>Booster</span><strong>n°${session.index + 1}</strong>`;
  numeroBooster.style.left = `${paquet.offsetLeft + paquet.offsetWidth + 10}px`;
  numeroBooster.style.top = `${paquet.offsetTop + paquet.offsetHeight / 2}px`;
  animer(numeroBooster, [{ opacity: 0, scale: "0.7" }, { opacity: 1, scale: "1" }], 300);
}

function commencerRevelation() {
  // Bulle « Tout révéler », sous la pile
  if (!boutonToutReveler) {
    boutonToutReveler = element("button", "bulle-choix bulle-ouverture bulle-tout-reveler", "Tout révéler");
    boutonToutReveler.type = "button";
    boutonToutReveler.addEventListener("click", () => {
      if (phase !== "revelation" || enMouvement) return;
      if (plusieursBoosters()) revelerBoosterEnCours();
      else afficherResume();
    });
    coucheOuverture.append(boutonToutReveler);
    animer(boutonToutReveler, [{ opacity: 0, translate: "-50% 12px" }, { opacity: 1, translate: "-50% 0" }], 350);
  }
  phase = "revelation";
  paquet.focus({ preventScroll: true });
}

const cartesRestantes = () => [...paquet.querySelectorAll(".tirage:not(.tirage--jetee)")];

// Pile : chaque carte dépasse de quelques pixels de celle qui est devant elle
function rangerPile(pile) {
  pile.querySelectorAll(".tirage:not(.tirage--jetee)").forEach((tirage, rang) => {
    tirage.style.translate = `${rang * DECALAGE_PILE}px ${rang * DECALAGE_PILE}px`;
  });
}

// ── 5. Les cartes se dévoilent une à une ──

function appuyer(evenement) {
  if (phase !== "revelation" || enMouvement) return;
  manipulation = { x: evenement.clientX, y: evenement.clientY, debut: performance.now(), pointeur: evenement.pointerId, bouge: false };
  paquet.setPointerCapture(evenement.pointerId);
}

// Toute la pile suit le doigt en s'écartant : la carte de devant bouge le plus, celle du fond le moins,
// si bien que les bords de chaque carte apparaissent
function deplacer(evenement) {
  if (!manipulation || evenement.pointerId !== manipulation.pointeur) return;
  const dx = evenement.clientX - manipulation.x;
  const dy = evenement.clientY - manipulation.y;
  if (Math.hypot(dx, dy) > 6) manipulation.bouge = true;
  if (!manipulation.bouge) return;
  const limite = paquet.offsetWidth * 0.22;
  const freiner = distance => limite * Math.tanh(distance / (limite * 1.5));
  const fx = freiner(dx);
  const fy = freiner(dy);
  const pile = cartesRestantes();
  pile.forEach((carte, rang) => {
    const part = pile.length === 1 ? 1 : 0.25 + (0.75 * (pile.length - 1 - rang)) / (pile.length - 1);
    carte.style.transform = `translate(${fx * part}px, ${fy * part}px) rotate(${fx * part * 0.05}deg)`;
  });
}

function relacher(evenement) {
  if (!manipulation || evenement.pointerId !== manipulation.pointeur) return;
  const { bouge, debut } = manipulation;
  manipulation = null;
  if (evenement.type === "pointerup" && !bouge && performance.now() - debut < 350) {
    passerALaSuivante();
    return;
  }
  // La pile se resserre
  for (const carte of cartesRestantes()) {
    if (carte.style.transform) animer(carte, [{ transform: carte.style.transform }, { transform: "translate(0px, 0px) rotate(0deg)" }], 300);
  }
}

// Toucher la carte de devant : elle est jetée. La dernière mène au booster suivant, ou au résumé.
async function passerALaSuivante() {
  const pile = cartesRestantes();
  if (pile.length > 1) {
    jeter(pile[0]);
  } else if (session.index < session.boosters.length - 1) {
    phase = "sortie";
    jeter(pile[0]);
    await attendre(450);
    paquet.remove();
    presenterBooster(session.index + 1);
  } else {
    afficherResume();
  }
}

// La carte part vers le coin en haut à gauche, comme jetée hors de l'écran
function jeter(carte) {
  enMouvement = true;
  carte.classList.add("tirage--jetee");
  rangerPile(paquet);
  const cadre = carte.getBoundingClientRect();
  animer(carte, [
    { transform: carte.style.transform || "translate(0px, 0px) rotate(0deg)" },
    { transform: `translate(${-(cadre.right + 60)}px, ${-(cadre.bottom + 60)}px) rotate(-30deg)` },
  ], 450, { courbe: "cubic-bezier(0.5, 0, 0.75, 0.4)" }).then(() => carte.remove());
  setTimeout(() => { enMouvement = false; }, 250);
}

// ── 6. Résumé : chaque booster en 3 + 2 cartes (les 10 boosters à la suite) ; puis « Suivant » ──

function creerPlaceResume(carte, nouvelle) {
  const place = element("div", "resume__carte");
  place.append(creerCarte(carte));
  if (nouvelle) place.append(creerBadgeNouveau());
  return place;
}

// Les 5 cartes d'un booster, 3 en haut et 2 en bas, apparaissant l'une après l'autre
function creerCartesBooster({ cartes, nouvelles }) {
  const cartesResume = element("div", "resume__cartes");
  cartes.forEach((carte, rang) => cartesResume.append(creerPlaceResume(carte, nouvelles[rang])));
  return cartesResume;
}

function creerBoutonSuivant(action) {
  const suivant = element("button", "bulle-choix bulle-ouverture", "Suivant");
  suivant.type = "button";
  suivant.addEventListener("click", action);
  return suivant;
}

function faireApparaitre(blocs, suivant) {
  blocs.forEach((bloc, index) => {
    animer(bloc, [{ opacity: 0, scale: "0.8" }, { opacity: 1, scale: "1" }], 350, { delai: index * 80 });
  });
  animer(suivant, [{ opacity: 0 }, { opacity: 1 }], 300, { delai: Math.min(blocs.length * 80, 600) });
}

// Dix boosters : « Tout révéler » termine le booster en cours seulement et passe directement
// au booster suivant (ou au résumé des 10 après le dernier)
async function revelerBoosterEnCours() {
  if (session.index === session.boosters.length - 1) {
    afficherResume();
    return;
  }
  phase = "sortie";
  await animer(paquet, [{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.92" }], 300);
  paquet.remove();
  presenterBooster(session.index + 1);
}

async function afficherResume() {
  phase = "resume";
  for (const el of [boutonToutReveler, numeroBooster]) {
    if (el) animer(el, [{ opacity: 1 }, { opacity: 0 }], 250);
  }
  if (paquet.isConnected) await animer(paquet, [{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.92" }], 300);
  coucheOuverture.replaceChildren();
  boutonToutReveler = null;
  numeroBooster = null;

  const resume = element("div", "resume");
  const blocs = [];
  if (plusieursBoosters()) {
    resume.classList.add("resume--dix");
    session.boosters.forEach((booster, index) => {
      const bloc = element("section", "resume__booster");
      bloc.append(element("h2", "resume__entete", `Booster n°${index + 1}`), creerCartesBooster(booster));
      blocs.push(bloc);
    });
    resume.append(...blocs);
  } else {
    const cartesResume = creerCartesBooster(boosterEnCours());
    blocs.push(...cartesResume.children);
    resume.append(cartesResume);
  }

  const suivant = creerBoutonSuivant(terminerOuverture);
  resume.append(suivant);
  coucheOuverture.append(resume);
  ajusterProprietes(resume);

  // Les cartes (ou les boosters) apparaissent l'un après l'autre
  faireApparaitre(blocs, suivant);
}

// ── 7. Retour au booster et aux bulles ──

function terminerOuverture() {
  phase = "repos";
  coucheOuverture.replaceChildren();
  coucheOuverture.hidden = true;
  session = null;
  paquet = null;
  boutonToutReveler = null;
  numeroBooster = null;
  manipulation = null;
  enMouvement = false;

  const booster = zoneBooster.querySelector(".booster");
  zoneBooster.querySelectorAll(".pack--pile").forEach(copie => copie.remove());
  packAccueil().removeAttribute("style");
  booster.style.translate = "";
  booster.style.opacity = "";
  document.body.classList.remove("mode-ouverture", "ouverture-dix");
  afficherChoixBooster(true);
  booster.animate([{ opacity: 0, scale: "0.9" }, { opacity: 1, scale: "1" }], { duration: 450, easing: COURBE_OUVERTURE });
}

// ── Effet : étoiles (les sons sont dans sons.js) ──

function lancerEtoiles(x, y, largeurPack) {
  for (let i = 0; i < 18; i++) {
    const etoile = element("span", "etoile");
    etoile.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 14.6 9.4 24 12 14.6 14.6 12 24 9.4 14.6 0 12 9.4 9.4z" /></svg>';
    const taille = 14 + Math.random() * 16;
    etoile.style.left = `${x}px`;
    etoile.style.top = `${y}px`;
    etoile.style.width = etoile.style.height = `${taille}px`;
    coucheOuverture.append(etoile);

    // Les étoiles jaillissent de l'ouverture du booster, en éventail vers le haut
    const depart = (Math.random() - 0.5) * largeurPack * 0.7;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const distance = 90 + Math.random() * 160;
    const duree = 900 + Math.random() * 500;
    etoile.animate([
      { transform: `translate(calc(-50% + ${depart}px), -50%) scale(0.2) rotate(0deg)`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(calc(-50% + ${depart + Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0 },
    ], { duration: duree, delay: Math.random() * 250, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "both" });
    setTimeout(() => etoile.remove(), duree + 300);
  }
}
