// Vidéo d'une carte Z en plein écran, avec le son : à sa découverte dans un booster (ouverture.js) et sur un
// appui maintenu dans la Collection (cartes.js). Elle se ferme seule à la fin, ou avec la croix ; la musique du
// jeu se tait pendant ce temps (musique.js). Styles : carte.css.
// Les navigateurs ne laissent jouer du son qu'à la suite d'un toucher : preparerVideoCarte() s'appelle pendant
// ce toucher, la vidéo peut ensuite démarrer un peu plus tard avec le son. Sinon elle démarre muette, avec un
// bouton pour activer le son.

let videoCarteEnCours = null; // { video, fermer }

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

// Lance la vidéo (préparée ou simple chemin) ; renvoie une promesse tenue quand elle se ferme.
// muet : démarre sans le son (appui maintenu) ; activerSonVideoCarte() le rétablit au prochain toucher.
function lancerVideoCarte(videoOuSource, { muet = false } = {}) {
  if (videoCarteEnCours) videoCarteEnCours.fermer();
  const video = typeof videoOuSource === "string" ? creerVideoCarte(videoOuSource) : videoOuSource;

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
  couche.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" });
  if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(true);

  return new Promise(fin => {
    let fermee = false;
    const terminer = () => {
      if (fermee) return;
      fermee = true;
      video.pause();
      if (videoCarteEnCours?.video === video) videoCarteEnCours = null;
      if (typeof mettreMusiqueEnSourdine === "function") mettreMusiqueEnSourdine(false);
      couche.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease" }).finished
        .finally(() => { couche.remove(); fin(); });
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
