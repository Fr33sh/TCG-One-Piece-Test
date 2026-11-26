// Vidéo d'une carte Z en plein écran, avec le son : à sa découverte dans un booster (ouverture.js) et sur un
// appui maintenu dans la Collection (cartes.js). La musique du jeu se tait pendant ce temps (musique.js).
// Transition : un zoom sur l'illustration de la carte. Sa boucle animée grandit depuis la carte jusqu'à remplir
// l'écran, puis la vidéo entière prend le relais en fondu ; à la fin (ou avec la croix), la vidéo laisse la place
// à la boucle, qui se rétrécit jusqu'à retrouver sa place dans la carte. Styles : carte.css.
// Les navigateurs ne laissent jouer du son qu'à la suite d'un toucher : preparerVideoCarte() s'appelle pendant
// ce toucher, la vidéo peut ensuite démarrer un peu plus tard avec le son. Sinon elle démarre muette, avec un
// bouton pour activer le son.

const DUREE_ZOOM_VIDEO = 800;
const DUREE_DEZOOM_VIDEO = 650;
const DUREE_FONDU_VIDEO = 250;
const COURBE_VIDEO = "cubic-bezier(0.65, 0, 0.35, 1)";

let videoCarteEnCours = null; // { video, fermer, boutonSon }

function creerVideoCarte(source) {
  const video = document.createElement("video");
  video.src = source;
  video.preload = "auto";
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  return video;
}

// Pendant un toucher du joueur : la vidéo est « autorisée » à jouer avec le son plus tard
function preparerVideoCarte(source) {
  const video = creerVideoCarte(source);
  const essai = video.play();
  video.pause();
  essai?.catch(() => {});
  return video;
}

// La carte s'illumine et grossit un peu (pendant l'appui maintenu de la Collection)
function illuminerCarte(carte, duree = 450) {
  return carte.animate([
    { transform: "scale(1)", filter: "brightness(1)" },
    { transform: "scale(1.06)", filter: "brightness(1.4) saturate(1.2)" },
  ], { duration: duree, easing: "ease-out", fill: "forwards" });
}

// Attend de connaître les dimensions d'une vidéo (un court instant au plus)
function dimensionsVideo(video, attente = 800) {
  if (video.videoWidth) return Promise.resolve();
  return new Promise(pret => {
    video.addEventListener("loadedmetadata", pret, { once: true });
    setTimeout(pret, attente);
  });
}

// Illustration de la carte à l'écran, et place de sa boucle une fois en plein écran (même cadrage que la vidéo
// entière, dont la boucle est un extrait sans les bandes noires)
function geometrieZoom(carte, video) {
  const images = carte?.isConnected ? carte.querySelector(".carte__images") : null;
  const zone = images?.getBoundingClientRect();
  if (!zone || !zone.width) return null;
  const boucle = images.querySelector("video");
  const largeurEcran = window.innerWidth;
  const hauteurEcran = window.innerHeight;
  const rapportBoucle = boucle?.videoWidth ? boucle.videoHeight / boucle.videoWidth : 1436 / 1080;
  const rapportVideo = video.videoWidth ? video.videoHeight / video.videoWidth : 16 / 9;

  // En plein écran, la vidéo entière tient dans l'écran ; la boucle occupe sa largeur
  const largeurPleinEcran = Math.min(largeurEcran, hauteurEcran / rapportVideo);
  const final = {
    largeur: largeurPleinEcran,
    hauteur: largeurPleinEcran * rapportBoucle,
  };
  final.gauche = (largeurEcran - final.largeur) / 2;
  final.haut = (hauteurEcran - final.hauteur) / 2;

  // Dans la carte, la boucle couvre l'illustration
  const largeurDansCarte = Math.max(zone.width, zone.height / rapportBoucle);
  const echelle = largeurDansCarte / final.largeur;
  const dx = zone.left + zone.width / 2 - largeurEcran / 2;
  const dy = zone.top + zone.height / 2 - hauteurEcran / 2;
  return {
    boucle,
    final,
    decoupe: `inset(${zone.top}px ${largeurEcran - zone.right}px ${hauteurEcran - zone.bottom}px ${zone.left}px)`,
    transformation: `translate(${dx}px, ${dy}px) scale(${echelle})`,
  };
}

// Lance la vidéo (préparée ou simple chemin) ; renvoie une promesse tenue quand elle est refermée.
// depuis : la carte dont l'illustration s'agrandit ; muet : démarre sans le son (appui maintenu),
// activerSonVideoCarte() le rétablit au prochain toucher.
async function lancerVideoCarte(videoOuSource, { muet = false, depuis = null } = {}) {
  if (videoCarteEnCours) videoCarteEnCours.fermer();
  const video = typeof videoOuSource === "string" ? creerVideoCarte(videoOuSource) : videoOuSource;
  const carte = depuis?.classList.contains("carte") ? depuis : depuis?.querySelector(".carte") || depuis;

  const couche = element("div", "video-carte");
  const fermer = element("button", "video-carte__fermer", "✕");
  fermer.type = "button";
  fermer.setAttribute("aria-label", "Fermer la vidéo");
  const boutonSon = element("button", "video-carte__son", "🔊 Activer le son");
  boutonSon.type = "button";
  boutonSon.hidden = true;
  video.className = "video-carte__video";
  video.style.opacity = "0";
  couche.append(video, fermer, boutonSon);
  if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(true);

  let fermee = false;
  let fin;
  const refermee = new Promise(tenir => { fin = tenir; });
  const terminer = async () => {
    if (fermee) return;
    fermee = true;
    video.pause();
    if (videoCarteEnCours?.video === video) videoCarteEnCours = null;
    if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(false);
    fermer.remove();
    boutonSon.remove();
    await dezoomer();
    couche.remove();
    fin();
  };
  videoCarteEnCours = { video, fermer: terminer, boutonSon };
  fermer.addEventListener("click", terminer);
  boutonSon.addEventListener("click", activerSonVideoCarte);
  video.addEventListener("ended", terminer);
  video.addEventListener("error", terminer);

  // Zoom : une copie de la boucle de la carte, prise au même instant, grandit jusqu'au plein écran
  await dimensionsVideo(video);
  const zoom = geometrieZoom(carte, video);
  let apercu = null;
  if (zoom) {
    apercu = element("video", "video-carte__apercu");
    Object.assign(apercu, { src: zoom.boucle?.currentSrc || "", muted: true, loop: true, playsInline: true });
    apercu.setAttribute("playsinline", "");
    if (zoom.boucle) apercu.currentTime = zoom.boucle.currentTime;
    Object.assign(apercu.style, {
      left: `${zoom.final.gauche}px`, top: `${zoom.final.haut}px`,
      width: `${zoom.final.largeur}px`, height: `${zoom.final.hauteur}px`,
    });
    couche.prepend(apercu);
    apercu.play().catch(() => {});
  }
  document.body.append(couche);

  if (zoom) {
    const options = { duration: DUREE_ZOOM_VIDEO, easing: COURBE_VIDEO };
    couche.animate([{ clipPath: zoom.decoupe, backgroundColor: "rgb(0 0 0 / 0%)" }, { clipPath: "inset(0px)", backgroundColor: "rgb(0 0 0 / 100%)" }], options);
    await apercu.animate([{ transform: zoom.transformation }, { transform: "none" }], options).finished;
  } else {
    await couche.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" }).finished;
  }
  for (const bouton of [fermer, boutonSon]) bouton.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });

  // La vidéo entière prend le relais en fondu
  async function dezoomer() {
    if (!apercu) {
      await couche.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" }).finished;
      return;
    }
    await video.animate([{ opacity: Number(getComputedStyle(video).opacity) }, { opacity: 0 }], { duration: DUREE_FONDU_VIDEO, fill: "forwards" }).finished;
    const retour = geometrieZoom(carte, video);
    if (!retour) {
      await couche.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" }).finished;
      return;
    }
    const options = { duration: DUREE_DEZOOM_VIDEO, easing: COURBE_VIDEO, fill: "forwards" };
    couche.animate([
      { clipPath: "inset(0px)", backgroundColor: "rgb(0 0 0 / 100%)", opacity: 1 },
      { opacity: 1, offset: 0.8 },
      { clipPath: retour.decoupe, backgroundColor: "rgb(0 0 0 / 0%)", opacity: 0 },
    ], options);
    await apercu.animate([{ transform: "none" }, { transform: retour.transformation }], options).finished;
  }

  if (!fermee) {
    video.currentTime = 0;
    video.muted = muet;
    boutonSon.hidden = !muet;
    video.addEventListener("playing", () => {
      if (!fermee) {
        video.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUREE_FONDU_VIDEO, fill: "forwards" });
      }
    }, { once: true });
    video.play().catch(() => {
      // Son refusé par le navigateur : la vidéo démarre muette, le bouton permet de l'activer
      video.muted = true;
      boutonSon.hidden = false;
      video.play().catch(terminer);
    });
  }
  return refermee;
}

// À appeler pendant un toucher : la vidéo en cours retrouve le son
function activerSonVideoCarte() {
  if (!videoCarteEnCours) return;
  const { video, boutonSon } = videoCarteEnCours;
  video.muted = false;
  boutonSon.hidden = true;
  if (video.paused) video.play().catch(() => {});
}
