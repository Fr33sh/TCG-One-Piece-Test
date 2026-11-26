// Vidéo d'une carte Z en plein écran, avec le son : à sa découverte dans un booster (ouverture.js) et sur un
// appui maintenu dans la Collection (cartes.js). Transition : la carte s'illumine, puis la vidéo s'ouvre depuis la
// carte jusqu'à remplir l'écran ; à la fin (ou avec la croix), elle se referme dans la carte. La musique du jeu se
// tait pendant ce temps (musique.js). Styles : carte.css.
// Les navigateurs ne laissent jouer du son qu'à la suite d'un toucher : preparerVideoCarte() s'appelle pendant
// ce toucher, la vidéo peut ensuite démarrer un peu plus tard avec le son. Sinon elle démarre muette, avec un
// bouton pour activer le son.

const DUREE_OUVERTURE_VIDEO = 750;
const DUREE_FERMETURE_VIDEO = 600;
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

// La carte s'illumine et grossit un peu, juste avant que sa vidéo ne s'ouvre (ou pendant l'appui maintenu)
function illuminerCarte(carte, duree = 450) {
  return carte.animate([
    { transform: "scale(1)", filter: "brightness(1)" },
    { transform: "scale(1.06)", filter: "brightness(1.4) saturate(1.2)" },
  ], { duration: duree, easing: "ease-out", fill: "forwards" });
}

// Forme de la carte à l'écran : la vidéo s'ouvre et se referme dans ce rectangle aux coins arrondis
function formeCarte(carte) {
  const zone = carte?.isConnected ? carte.getBoundingClientRect() : null;
  if (!zone || !zone.width) return null;
  const largeur = window.innerWidth;
  const hauteur = window.innerHeight;
  const arrondi = (zone.width * 70) / 1260;
  const echelle = Math.max(zone.width / largeur, zone.height / hauteur);
  const dx = zone.left + zone.width / 2 - largeur / 2;
  const dy = zone.top + zone.height / 2 - hauteur / 2;
  return {
    decoupe: `inset(${zone.top}px ${largeur - zone.right}px ${hauteur - zone.bottom}px ${zone.left}px round ${arrondi}px)`,
    transformation: `translate(${dx}px, ${dy}px) scale(${echelle})`,
  };
}

// Lance la vidéo (préparée ou simple chemin) ; renvoie une promesse tenue quand elle est refermée.
// depuis : la carte d'où la vidéo s'ouvre ; muet : démarre sans le son (appui maintenu), activerSonVideoCarte()
// le rétablit au prochain toucher.
function lancerVideoCarte(videoOuSource, { muet = false, depuis = null } = {}) {
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
  couche.append(video, fermer, boutonSon);
  document.body.append(couche);
  if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(true);

  // Ouverture : depuis la carte jusqu'au plein écran (ou simple fondu si la carte n'est pas à l'écran)
  const forme = formeCarte(carte);
  if (forme) {
    couche.animate([{ clipPath: forme.decoupe }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }],
      { duration: DUREE_OUVERTURE_VIDEO, easing: COURBE_VIDEO });
    video.animate([{ transform: forme.transformation }, { transform: "none" }], { duration: DUREE_OUVERTURE_VIDEO, easing: COURBE_VIDEO });
  } else {
    couche.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" });
  }
  for (const bouton of [fermer, boutonSon]) {
    bouton.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: DUREE_OUVERTURE_VIDEO * 0.8, fill: "backwards" });
  }

  return new Promise(fin => {
    let fermee = false;
    const terminer = () => {
      if (fermee) return;
      fermee = true;
      video.pause();
      if (videoCarteEnCours?.video === video) videoCarteEnCours = null;
      if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(false);
      fermer.remove();
      boutonSon.remove();

      // Fermeture : la vidéo se referme dans la carte et s'efface sur la fin, laissant la carte réapparaître
      const retour = formeCarte(carte);
      const animations = retour
        ? [
          couche.animate([
            { clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 },
            { opacity: 1, offset: 0.65 },
            { clipPath: retour.decoupe, opacity: 0 },
          ], { duration: DUREE_FERMETURE_VIDEO, easing: COURBE_VIDEO, fill: "forwards" }),
          video.animate([{ transform: "none" }, { transform: retour.transformation }],
            { duration: DUREE_FERMETURE_VIDEO, easing: COURBE_VIDEO, fill: "forwards" }),
        ]
        : [couche.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" })];
      Promise.all(animations.map(animation => animation.finished)).finally(() => {
        couche.remove();
        fin();
      });
    };
    videoCarteEnCours = { video, fermer: terminer, boutonSon };

    fermer.addEventListener("click", terminer);
    boutonSon.addEventListener("click", activerSonVideoCarte);
    video.addEventListener("ended", terminer);
    video.addEventListener("error", terminer);

    video.currentTime = 0;
    video.muted = muet;
    boutonSon.hidden = !muet;
    video.play().catch(() => {
      // Son refusé par le navigateur : la vidéo démarre muette, le bouton permet de l'activer
      video.muted = true;
      boutonSon.hidden = false;
      video.play().catch(terminer);
    });
  });
}

// À appeler pendant un toucher : la vidéo en cours retrouve le son
function activerSonVideoCarte() {
  if (!videoCarteEnCours) return;
  const { video, boutonSon } = videoCarteEnCours;
  video.muted = false;
  boutonSon.hidden = true;
  if (video.paused) video.play().catch(() => {});
}
