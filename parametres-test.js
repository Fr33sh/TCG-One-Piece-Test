// Section « Mode test » des Paramètres (TEMPORAIRE, à retirer avant de partager le jeu) :
// l'interrupteur des boosters illimités (mode-test.js) et un bouton qui ajoute un exemplaire de chaque carte du jeu.

const interrupteurTest = document.querySelector("[data-mode-test]");
const messageTest = document.querySelector('[data-message="test"]');

function afficherModeTest() {
  interrupteurTest.setAttribute("aria-checked", modeTest());
}

interrupteurTest.addEventListener("click", () => {
  activerModeTest(!modeTest());
  afficherModeTest();
  messageTest.textContent = modeTest() ? "Boosters illimités activés." : "Boosters illimités désactivés.";
});

document.querySelector("[data-toutes-cartes]").addEventListener("click", () => {
  ajouterALaCollection(CARTES);
  messageTest.textContent = `${CARTES.length} cartes ajoutées à ta collection (une de chaque).`;
});

// Les cartes Z sont retirées de la collection pour que la prochaine compte comme une découverte (avec sa vidéo)
document.querySelector("[data-test-z]").addEventListener("click", () => {
  const collection = lireCollection();
  for (const carte of CARTES.filter(c => c.rang === 5)) delete collection[carte.id];
  enregistrerCollection(collection);
  demanderTestZ();
  messageTest.textContent = "Ton prochain booster (East Blue, Naruto ou Bleach) contiendra sa carte Z, comme une première découverte.";
});

afficherModeTest();
