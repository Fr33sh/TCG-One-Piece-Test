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
  // Petite animation : mouvement lent ou discret
  { id: "aurore", categorie: "petite", nom: "Aurore boréale", description: "Des voiles verts et violets qui glissent." },
  { id: "cosmos", categorie: "petite", nom: "Cosmos", description: "Nébuleuse et étoiles qui scintillent." },
  // Animation classique : tout le cadre est en mouvement
  { id: "prisma-vivant", categorie: "classique", nom: "Prisma vivant", description: "L'arc-en-ciel défile autour de la carte." },
  { id: "celeste", categorie: "classique", nom: "Céleste", description: "De l'or en mouvement." },
  // Grosse animation : mouvement rapide et lueur qui pulse
  { id: "flammes", categorie: "grosse", nom: "Flammes", description: "Un feu qui ondule vers le haut." },
  { id: "flamme-ame", categorie: "grosse", nom: "Flamme d'âme", description: "Un feu violet qui monte." },
];
