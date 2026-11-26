// Prépare les vidéos d'une carte Z (outil local, non déployé) :
//   node outils/animation.mjs EB-067 <vidéo entière> <extrait de 2 s>
// - assets/animations/<id>.mp4 : la vidéo entière, sans retouche de l'image (seulement convertie en H.264/AAC
//   pour être lue par tous les navigateurs) ;
// - assets/animations/<id>-boucle.mp4 : l'extrait en aller-retour (boomerang), muet, bandes noires retirées ;
// - assets/illustrations/<id>.jpg : la première image de l'extrait (affichée le temps que la boucle charge).

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const [id, entiere, extrait] = process.argv.slice(2);
if (!id || !entiere || !extrait) {
  console.error("Usage : node outils/animation.mjs <id> <vidéo entière> <extrait de 2 s>");
  process.exit(1);
}

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(racine, "assets/animations"), { recursive: true });
const lancer = args => execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

// Bandes noires de l'extrait (détection automatique sur toute sa durée)
const detection = spawnSync(ffmpeg, ["-i", extrait, "-vf", "cropdetect=limit=24:round=2:reset=0", "-f", "null", "-"], { encoding: "utf8" });
const recadrages = [...detection.stderr.matchAll(/crop=(\d+:\d+:\d+:\d+)/g)].map(m => m[1]);
const recadrage = recadrages.at(-1);
console.log("Recadrage de la boucle :", recadrage || "aucun");

// 1. Vidéo entière
// (les vidéos de téléphone ont souvent une cadence variable : on la fixe à 30 images/s pour n'en perdre aucune)
lancer(["-i", entiere, "-vf", "fps=30", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", join(racine, `assets/animations/${id}.mp4`)]);

// 2. Boucle : l'extrait à l'endroit puis à l'envers, sans le son
const filtres = `[0:v]fps=30,${recadrage ? `crop=${recadrage},` : ""}split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`;
lancer(["-i", extrait, "-filter_complex", filtres, "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "23",
  "-preset", "slow", "-movflags", "+faststart", join(racine, `assets/animations/${id}-boucle.mp4`)]);

// 3. Image d'attente
lancer(["-i", extrait, "-frames:v", "1", ...(recadrage ? ["-vf", `crop=${recadrage}`] : []), "-q:v", "3",
  join(racine, `assets/illustrations/${id}.jpg`)]);

console.log("Vidéos de", id, "prêtes.");
