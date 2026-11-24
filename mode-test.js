// Mode test (TEMPORAIRE, à retirer avant de partager le jeu) : boosters illimités sur cet appareil.
// Réglé dans les Paramètres ; gardé dans ce navigateur seulement (pas dans la sauvegarde en ligne).

const CLE_MODE_TEST = "tcg-one-piece/mode-test";

function modeTest() {
  try {
    return localStorage.getItem(CLE_MODE_TEST) === "1";
  } catch {
    return false;
  }
}

function activerModeTest(actif) {
  try {
    if (actif) localStorage.setItem(CLE_MODE_TEST, "1");
    else localStorage.removeItem(CLE_MODE_TEST);
  } catch {}
}
