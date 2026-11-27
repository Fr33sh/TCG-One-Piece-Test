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
  // Petite animation : mouvement lent ou discret
  { id: "aurore", categorie: "petite", nom: "Aurore boréale", description: "Des voiles verts et violets qui glissent." },
  { id: "cosmos", categorie: "petite", nom: "Cosmos", description: "Nébuleuse et étoiles qui scintillent." },
  { id: "lucioles", categorie: "petite", nom: "Lucioles", description: "Petites lumières qui s'allument et s'éteignent." },
  { id: "sakura", categorie: "petite", nom: "Sakura", description: "Pétales qui tombent en biais." },
  { id: "braises", categorie: "petite", nom: "Braises", description: "Étincelles qui montent et scintillent." },
  // Animation classique : tout le cadre est en mouvement
  { id: "prisma-vivant", categorie: "classique", nom: "Prisma vivant", description: "L'arc-en-ciel défile autour de la carte." },
  { id: "celeste", categorie: "classique", nom: "Céleste", description: "De l'or en mouvement." },
  { id: "ocean", categorie: "classique", nom: "Océan", description: "Vagues japonaises qui défilent." },
  { id: "neon", categorie: "classique", nom: "Néon arc-en-ciel", description: "La lueur change de couleur." },
  { id: "pluie-numerique", categorie: "classique", nom: "Pluie numérique", description: "Traînées vertes qui tombent." },
  { id: "courant", categorie: "classique", nom: "Courant électrique", description: "Filet rayé qui court autour de la carte." },
  // Grosse animation : mouvement rapide et lueur qui pulse
  { id: "flammes", categorie: "grosse", nom: "Flammes", description: "Un feu qui ondule vers le haut." },
  { id: "flamme-ame", categorie: "grosse", nom: "Flamme d'âme", description: "Un feu violet qui monte." },
  { id: "supernova", categorie: "grosse", nom: "Supernova", description: "Rayons dorés qui tournent, éclat qui pulse." },
  { id: "magma", categorie: "grosse", nom: "Magma", description: "Lave qui coule vite, lueur qui gronde." },
  { id: "trou-noir", categorie: "grosse", nom: "Trou noir", description: "Spirale qui aspire, halo violet." },
  { id: "glitch", categorie: "grosse", nom: "Glitch", description: "Le cadre se brouille par à-coups." },
  { id: "feu-de-glace", categorie: "grosse", nom: "Feu de glace", description: "Flammes bleues rapides." },
];
