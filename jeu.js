// Onglet Combat : accueil des combats. Les modes (Versus, Solo), le guide et les decks ne sont pas encore
// prêts : les toucher affiche un message « bientôt disponible » quelques secondes.
// Quand un combat existera, penser à la mission quotidienne : progresserMission("combat") à la fin de chaque
// partie (missions-quotidiennes.js).

const DUREE_MESSAGE = 2200; // ms

const messageBientot = document.querySelector(".bientot");
let minuterieMessage = null;

function annoncerBientot(message) {
  messageBientot.textContent = message;
  messageBientot.hidden = false;
  messageBientot.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "ease-out" });
  clearTimeout(minuterieMessage);
  minuterieMessage = setTimeout(() => { messageBientot.hidden = true; }, DUREE_MESSAGE);
}

for (const bouton of document.querySelectorAll("[data-bientot]")) {
  bouton.addEventListener("click", () => annoncerBientot(bouton.dataset.bientot));
}
