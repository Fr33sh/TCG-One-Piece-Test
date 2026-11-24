// Collection Naruto : données des cartes (personnages de l'arc du Pays des Vagues et d'avant). Collection complète.
// camp : "konoha" | "brume" | "civil" (ne change pas l'apparence des cartes)
// rang : 1 (A) · 2 (S) · 3 (SR) · 4 (SSR)
// Numérotation : rang A, S, SR, SSR ; dans chaque rang les civils, puis Konoha, puis la Brume ; puis l'ordre de
// l'histoire. Les images portent le numéro de leur carte (duos : une image par personnage, côte à côte).
// illustration : images de l'anime (à remplacer avant toute diffusion) ; cadrage : point de l'image gardé visible.
// Toute renumérotation s'ajoute à RENUMEROTATIONS dans collection.js, pour convertir les collections des joueurs.

const CARTES_NARUTO = [

  // ── A · Civils ──
  {
    id: "NA-001", nom: "Teuchi", camp: "civil", rang: 1,
    proprietes: "Patron de l'échoppe Ichiraku, il sert à Naruto ses ramens préférés… et parfois gratuitement.",
    equipe: "Ichiraku Ramen", role: "Cuisinier",
    illustration: "assets/illustrations/NA-001.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-002", nom: "Tazuna", camp: "civil", rang: 1,
    proprietes: "Vieux charpentier porté sur le saké, il bâtit le grand pont qui doit libérer son pays de Gatô.",
    equipe: "Pays des Vagues", role: "Charpentier",
    illustration: "assets/illustrations/NA-002.jpg", cadrage: "50% 40%",
  },
  {
    id: "NA-003", nom: "Tsunami", camp: "civil", rang: 1,
    proprietes: "Fille de Tazuna, douce mais courageuse, prête à tout pour protéger son fils Inari.",
    equipe: "Pays des Vagues", role: "Fille de Tazuna",
    illustration: "assets/illustrations/NA-003.jpg", cadrage: "45% 40%",
  },
  {
    id: "NA-004", nom: "Inari", camp: "civil", rang: 1,
    proprietes: "Petit-fils de Tazuna qui ne croit plus aux héros… jusqu'à ce que Naruto lui redonne courage.",
    equipe: "Pays des Vagues", role: "Enfant",
    illustration: "assets/illustrations/NA-004.jpg", cadrage: "50% 40%",
  },
  {
    id: "NA-005", nom: "Kaiza", camp: "civil", rang: 1,
    proprietes: "Le héros du Pays des Vagues, père adoptif d'Inari, exécuté pour avoir tenu tête à Gatô.",
    equipe: "Pays des Vagues", role: "Pêcheur",
    illustration: "assets/illustrations/NA-005.jpg", cadrage: "50% 40%",
  },
  {
    id: "NA-006", nom: "Zôri & Waraji", camp: "civil", rang: 1,
    proprietes: "Les gardes du corps de Gatô, envoyés enlever Tsunami… avant de croiser la route de Naruto.",
    equipe: "Gatô Company", role: "Gardes du corps",
    illustration: ["assets/illustrations/NA-006-gauche.jpg", "assets/illustrations/NA-006-droite.jpg"], cadrage: "50% 40%",
  },

  // ── A · Konoha ──
  {
    id: "NA-007", nom: "Konohamaru Sarutobi", camp: "konoha", rang: 1,
    proprietes: "Petit-fils du Troisième, il veut lui prendre son titre et a choisi Naruto comme grand rival.",
    equipe: "Konoha", role: "Élève de l'Académie",
    illustration: "assets/illustrations/NA-007.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-008", nom: "Ebisu", camp: "konoha", rang: 1,
    proprietes: "Précepteur d'élite de Konohamaru, persuadé qu'il n'existe aucun raccourci vers le titre de Hokage.",
    equipe: "Konoha", role: "Précepteur",
    illustration: "assets/illustrations/NA-008.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-009", nom: "Ino Yamanaka", camp: "konoha", rang: 1,
    proprietes: "Fille de fleuriste et rivale jurée de Sakura : entre elles, la bataille pour Sasuke ne fait que commencer.",
    equipe: "Équipe 10", role: "Genin",
    illustration: "assets/illustrations/NA-009.jpg", cadrage: "50% 40%",
  },
  {
    id: "NA-010", nom: "Shikamaru Nara", camp: "konoha", rang: 1,
    proprietes: "Génie paresseux qui trouve tout « galère », il préfère regarder passer les nuages que se battre.",
    equipe: "Équipe 10", role: "Genin",
    illustration: "assets/illustrations/NA-010.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-011", nom: "Chôji Akimichi", camp: "konoha", rang: 1,
    proprietes: "Gourmand au grand cœur, il ne se sépare jamais de ses chips… ni de son ami Shikamaru.",
    equipe: "Équipe 10", role: "Genin",
    illustration: "assets/illustrations/NA-011.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-012", nom: "Hinata Hyûga", camp: "konoha", rang: 1,
    proprietes: "Héritière timide du clan Hyûga, elle admire Naruto en secret et rougit dès qu'il lui parle.",
    equipe: "Équipe 8", role: "Genin",
    illustration: "assets/illustrations/NA-012.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-013", nom: "Kiba Inuzuka", camp: "konoha", rang: 1,
    proprietes: "Fougueux et sûr de lui, il fait équipe avec Akamaru, le chiot caché sous sa veste.",
    equipe: "Équipe 8", role: "Genin",
    illustration: "assets/illustrations/NA-013.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-014", nom: "Shino Aburame", camp: "konoha", rang: 1,
    proprietes: "Silencieux et méthodique, il abrite dans son corps une colonie d'insectes à ses ordres.",
    equipe: "Équipe 8", role: "Genin",
    illustration: "assets/illustrations/NA-014.jpg", cadrage: "50% 30%",
  },

  // ── A · Brume ──
  {
    id: "NA-015", nom: "Gôzu & Meizu", camp: "brume", rang: 1,
    proprietes: "Les Frères Démons de la Brume, reliés par leur chaîne griffue, tendent l'embuscade de la flaque d'eau.",
    equipe: "Brume", role: "Ninjas déserteurs",
    illustration: ["assets/illustrations/NA-015-gozu.jpg", "assets/illustrations/NA-015-meizu.jpg"], cadrage: "50% 45%",
  },

  // ── S ──
  {
    id: "NA-016", nom: "Gatô", camp: "civil", rang: 2,
    proprietes: "Petit magnat aux grands moyens, il étouffe le Pays des Vagues sous sa coupe et ses mercenaires.",
    equipe: "Gatô Company", role: "Magnat",
    illustration: "assets/illustrations/NA-016.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-017", nom: "Iruka Umino", camp: "konoha", rang: 2,
    proprietes: "Professeur à l'Académie, il est le premier à voir en Naruto autre chose que le démon renard.",
    equipe: "Konoha", role: "Chûnin",
    illustration: "assets/illustrations/NA-017.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-018", nom: "Mizuki", camp: "konoha", rang: 2,
    proprietes: "Professeur souriant de l'Académie… qui manipule Naruto pour lui faire voler le rouleau interdit.",
    equipe: "Konoha", role: "Chûnin",
    illustration: "assets/illustrations/NA-018.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-019", nom: "Sakura Haruno", camp: "konoha", rang: 2,
    proprietes: "Première de la classe en théorie, elle n'a d'yeux que pour Sasuke… et de poings que pour Naruto.",
    equipe: "Équipe 7", role: "Genin",
    illustration: "assets/illustrations/NA-019.jpg", cadrage: "50% 40%",
  },

  // ── SR ──
  {
    id: "NA-020", nom: "Hiruzen Sarutobi", camp: "konoha", rang: 3,
    proprietes: "Le Professeur, le plus sage des ninjas : il veille sur Konoha et sur Naruto avec une patience infinie.",
    equipe: "Konoha", role: "Troisième Hokage",
    illustration: "assets/illustrations/NA-020.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-021", nom: "Quatrième Hokage", camp: "konoha", rang: 3,
    proprietes: "Le héros qui scella le Kyûbi au prix de sa vie. Son visage veille sur le village depuis la falaise.",
    equipe: "Konoha", role: "Hokage",
    illustration: "assets/illustrations/NA-021.jpg", cadrage: "50% 30%",
  },

  // ── SSR ──
  {
    id: "NA-022", nom: "Naruto Uzumaki", camp: "konoha", rang: 4,
    proprietes: "Cancre bruyant de l'Académie, il rêve de devenir Hokage pour que tout le village le reconnaisse.",
    equipe: "Équipe 7", role: "Genin",
    illustration: "assets/illustrations/NA-022.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-023", nom: "Kyûbi", camp: "civil", rang: 4,
    proprietes: "Le démon renard à neuf queues qui ravagea Konoha, scellé depuis douze ans dans un nouveau-né.",
    equipe: "", role: "Démon à neuf queues",
    illustration: "assets/illustrations/NA-023.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-024", nom: "Sasuke Uchiha", camp: "konoha", rang: 4,
    proprietes: "Dernier survivant du clan Uchiha, il ne vit que pour devenir assez fort et venger les siens.",
    equipe: "Équipe 7", role: "Genin",
    illustration: "assets/illustrations/NA-024.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-025", nom: "Kakashi Hatake", camp: "konoha", rang: 4,
    proprietes: "Le Ninja Copieur au Sharingan, toujours en retard et plongé dans son livre, chef de l'équipe 7.",
    equipe: "Équipe 7", role: "Jônin",
    illustration: "assets/illustrations/NA-025.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-026", nom: "Zabuza Momochi", camp: "brume", rang: 4,
    proprietes: "Le Démon du Brouillard, déserteur à l'immense épée, engagé par Gatô pour éliminer Tazuna.",
    equipe: "Brume", role: "Ninja déserteur",
    illustration: "assets/illustrations/NA-026.jpg", cadrage: "50% 30%",
  },
  {
    id: "NA-027", nom: "Haku", camp: "brume", rang: 4,
    proprietes: "Fidèle outil de Zabuza, il manie les aiguilles et les miroirs de glace avec une douceur trompeuse.",
    equipe: "Brume", role: "Ninja déserteur",
    illustration: "assets/illustrations/NA-027.jpg", cadrage: "50% 30%",
  },
];
