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

// « Prochain booster avec une Z » : le prochain booster d'une série qui a des cartes Z en contient une
const CLE_TEST_Z = "tcg-one-piece/test-z";

function demanderTestZ() {
  try {
    localStorage.setItem(CLE_TEST_Z, "1");
  } catch {}
}

// Vrai une seule fois après la demande (le tirage consomme la demande)
function consommerTestZ() {
  try {
    if (localStorage.getItem(CLE_TEST_Z) !== "1") return false;
    localStorage.removeItem(CLE_TEST_Z);
    return true;
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
