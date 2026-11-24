// Barre de navigation commune : remplit chaque <nav class="navigation" data-actif="…">.
// Cinq onglets, chacun avec son nom en petit sous l'icône. Icônes : Lucide (licence ISC), sauf la collection.

const ICONES_NAVIGATION = {
  // Sac de boutique
  boutique: `
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />`,
  // Deux cartes empilées
  collection: `
    <rect x="8.5" y="2.5" width="11" height="15" rx="2" transform="rotate(12 14 10)" />
    <rect class="icone__devant" x="4.5" y="6.5" width="11" height="15" rx="2" />
    <path d="M8 14h4" />`,
  accueil: `
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />`,
  // Deux bulles de discussion
  chat: `
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />`,
  // Deux personnes
  social: `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />`,
};

const ONGLETS = [
  { id: "boutique", nom: "Boutique", lien: "boutique.html" },
  { id: "collection", nom: "Collection", lien: "cartes.html" },
  { id: "accueil", nom: "Accueil", lien: "accueil.html" },
  { id: "chat", nom: "Chat", lien: "chat.html" },
  { id: "social", nom: "Social", lien: "social.html" },
];

for (const barre of document.querySelectorAll(".navigation[data-actif]")) {
  barre.setAttribute("aria-label", "Navigation principale");
  barre.innerHTML = ONGLETS.map(onglet => {
    const actif = onglet.id === barre.dataset.actif;
    return `
      <a class="navigation__lien${actif ? " navigation__lien--actif" : ""}" href="${onglet.lien}"${actif ? ' aria-current="page"' : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true">${ICONES_NAVIGATION[onglet.id]}</svg>
        <span class="navigation__nom">${onglet.nom}</span>
      </a>`;
  }).join("");
}
