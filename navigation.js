// Barre de navigation commune : remplit chaque <nav class="navigation" data-actif="…">.
// Icônes : Lucide (licence ISC), sauf la collection.

const ICONES_NAVIGATION = {
  // Deux cartes empilées
  collection: `
    <rect x="8.5" y="2.5" width="11" height="15" rx="2" transform="rotate(12 14 10)" />
    <rect class="icone__devant" x="4.5" y="6.5" width="11" height="15" rx="2" />
    <path d="M8 14h4" />`,
  accueil: `
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />`,
  combat: `
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" x2="19" y1="19" y2="13" />
    <line x1="16" x2="20" y1="16" y2="20" />
    <line x1="19" x2="21" y1="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" x2="9" y1="14" y2="18" />
    <line x1="7" x2="4" y1="17" y2="20" />
    <line x1="3" x2="5" y1="19" y2="21" />`,
};

// 5 emplacements : la collection, l'accueil au centre, puis le combat
const ONGLETS = [
  { id: "collection", nom: "Collection", lien: "cartes.html", colonne: 2 },
  { id: "accueil", nom: "Accueil", lien: "accueil.html", colonne: 3 },
  { id: "combat", nom: "Combat", lien: "jeu.html", colonne: 4 },
];

for (const barre of document.querySelectorAll(".navigation[data-actif]")) {
  barre.setAttribute("aria-label", "Navigation principale");
  barre.innerHTML = ONGLETS.map(onglet => {
    const actif = onglet.id === barre.dataset.actif;
    return `
      <a class="navigation__lien${actif ? " navigation__lien--actif" : ""}" href="${onglet.lien}"
         style="grid-column: ${onglet.colonne}" aria-label="${onglet.nom}"${actif ? ' aria-current="page"' : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true">${ICONES_NAVIGATION[onglet.id]}</svg>
      </a>`;
  }).join("");
}
