// Bordures de cartes vendues dans la Boutique (styles : bordures.css, classe « bordure--<id> »), rangées par
// catégorie selon leur animation. Le prix et la façon de les appliquer aux cartes restent à définir.

const CATEGORIES_BORDURES = [
  { id: "fixe", nom: "Non animées" },
  { id: "petite", nom: "Petite animation" },
  { id: "classique", nom: "Animation classique" },
  { id: "grosse", nom: "Grosse animation" },
];

const BORDURES = [
  // Non animées
  { id: "ame", categorie: "fixe", nom: "Âme", description: "Notre symbole 魂 en motif, filet prisma." },
  { id: "toxique", categorie: "fixe", nom: "Toxique", description: "Noir et vert acide lumineux." },
  { id: "lave", categorie: "fixe", nom: "Lave", description: "Roche noire et coulées de feu." },
  { id: "amethyste", categorie: "fixe", nom: "Améthyste", description: "Violet taillé en facettes." },
  { id: "rubis", categorie: "fixe", nom: "Rubis", description: "Rouge taillé en facettes." },
  { id: "pastel", categorie: "fixe", nom: "Pastel", description: "Rayures douces arc-en-ciel." },
  { id: "sceau-imperial", categorie: "fixe", nom: "Sceau impérial", description: "Laque rouge, coins et filets d'or." },
  { id: "vitrail", categorie: "fixe", nom: "Vitrail", description: "Verre coloré serti de plomb." },
  { id: "automne", categorie: "fixe", nom: "Automne", description: "Feuilles rousses sur fond orangé." },
  { id: "origami", categorie: "fixe", nom: "Origami", description: "Papier blanc plié, filet noir." },
  // Petite animation : mouvement lent ou discret
  { id: "aurore", categorie: "petite", nom: "Aurore boréale", description: "Des voiles verts et violets qui glissent." },
  { id: "cosmos", categorie: "petite", nom: "Cosmos", description: "Nébuleuse et étoiles qui scintillent." },
  { id: "lucioles", categorie: "petite", nom: "Lucioles", description: "Petites lumières qui s'allument et s'éteignent." },
  { id: "sakura", categorie: "petite", nom: "Sakura", description: "Pétales qui tombent en biais." },
  { id: "braises", categorie: "petite", nom: "Braises", description: "Étincelles qui montent et scintillent." },
  { id: "bulles", categorie: "petite", nom: "Bulles", description: "Bulles qui remontent doucement." },
  { id: "feuilles", categorie: "petite", nom: "Feuilles d'automne", description: "Feuilles qui tombent en tournoyant." },
  { id: "poussiere-or", categorie: "petite", nom: "Poussière d'or", description: "Paillettes d'or qui scintillent sur du noir." },
  { id: "reflets-eau", categorie: "petite", nom: "Reflets d'eau", description: "La lumière ondule comme au fond d'une piscine." },
  // Animation classique : tout le cadre est en mouvement
  { id: "prisma-vivant", categorie: "classique", nom: "Prisma vivant", description: "L'arc-en-ciel défile autour de la carte." },
  { id: "celeste", categorie: "classique", nom: "Céleste", description: "De l'or en mouvement." },
  { id: "ocean", categorie: "classique", nom: "Océan", description: "Vagues japonaises qui défilent." },
  { id: "neon", categorie: "classique", nom: "Néon arc-en-ciel", description: "La lueur change de couleur." },
  { id: "pluie-numerique", categorie: "classique", nom: "Pluie numérique", description: "Traînées vertes qui tombent." },
  { id: "courant", categorie: "classique", nom: "Courant électrique", description: "Filet rayé qui court autour de la carte." },
  { id: "ecailles", categorie: "classique", nom: "Écailles de dragon", description: "Écailles vertes et or qui glissent." },
  { id: "cristal", categorie: "classique", nom: "Cristal Anima", description: "Facettes noires, filet prisma, éclat qui traverse." },
  // Grosse animation : mouvement rapide et lueur qui pulse
  { id: "flammes", categorie: "grosse", nom: "Flammes", description: "Un feu qui ondule vers le haut." },
  { id: "flamme-ame", categorie: "grosse", nom: "Flamme d'âme", description: "Un feu violet qui monte." },
  { id: "supernova", categorie: "grosse", nom: "Supernova", description: "Rayons dorés qui tournent, éclat qui pulse." },
  { id: "magma", categorie: "grosse", nom: "Magma", description: "Lave qui coule vite, lueur qui gronde." },
  { id: "trou-noir", categorie: "grosse", nom: "Trou noir", description: "Spirale qui aspire, halo violet." },
  { id: "glitch", categorie: "grosse", nom: "Glitch", description: "Le cadre se brouille par à-coups." },
  { id: "feu-de-glace", categorie: "grosse", nom: "Feu de glace", description: "Flammes bleues rapides." },
  { id: "onde-de-choc", categorie: "grosse", nom: "Onde de choc", description: "Anneaux de feu qui explosent du centre." },
  { id: "tornade", categorie: "grosse", nom: "Tornade", description: "Vent gris et blanc qui tourne à toute vitesse." },
  { id: "hyperespace", categorie: "grosse", nom: "Hyperespace", description: "Traînées d'étoiles qui jaillissent du centre." },
];
