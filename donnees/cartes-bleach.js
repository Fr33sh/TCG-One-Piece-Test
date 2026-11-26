// Collection Bleach : données des cartes (personnages du premier arc, « Shinigami remplaçant », épisodes 1 à 20).
// camp : "humain" | "quincy" | "shinigami" | "hollow" (ne change pas l'apparence des cartes)
// rang : 1 (A) · 2 (S) · 3 (SR) · 4 (SSR) · 5 (Z, 3 au plus par collection)
// Numérotation : rang A, S, SR, SSR ; dans chaque rang les humains, puis les Quincy et les Shinigami, puis les
// Hollows ; puis l'ordre de l'histoire. Les images portent le numéro de leur carte (duos : une image par personnage).
// illustration : images de l'anime (à remplacer avant toute diffusion) ; cadrage : point de l'image gardé visible.
// Menos Grande attend encore son image (la numérotation changera ; voir RENUMEROTATIONS dans collection.js).

const CARTES_BLEACH = [

  // ── A ──
  {
    id: "BL-001", nom: "Karin & Yuzu", camp: "humain", rang: 1,
    proprietes: "Karin la sportive qui voit les esprits, Yuzu la petite cuisinière de la maison : les sœurs d'Ichigo.",
    equipe: "Famille Kurosaki", role: "Sœurs d'Ichigo",
    illustration: ["assets/illustrations/BL-001-karin.jpg", "assets/illustrations/BL-001-yuzu.jpg"], cadrage: "50% 30%",
  },
  {
    id: "BL-002", nom: "Keigo & Mizuiro", camp: "humain", rang: 1,
    proprietes: "Keigo le bruyant et Mizuiro le charmeur poli : les deux copains qui ne lâchent jamais Ichigo.",
    equipe: "Lycée de Karakura", role: "Camarades",
    illustration: ["assets/illustrations/BL-002-keigo.jpg", "assets/illustrations/BL-002-mizuiro.jpg"], cadrage: "50% 30%",
  },
  {
    id: "BL-003", nom: "Chizuru Honshô", camp: "humain", rang: 1,
    proprietes: "Camarade exubérante, prête à tout pour attirer l'attention d'Orihime… au grand dam de Tatsuki.",
    equipe: "Lycée de Karakura", role: "Camarade",
    illustration: "assets/illustrations/BL-003.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-004", nom: "Jinta & Ururu", camp: "humain", rang: 1,
    proprietes: "Le garnement bagarreur et la timide qui frappe plus fort que lui : les petits employés de la boutique.",
    equipe: "Boutique Urahara", role: "Employés",
    illustration: ["assets/illustrations/BL-004-jinta.jpg", "assets/illustrations/BL-004-ururu.jpg"], cadrage: "50% 30%",
  },
  {
    id: "BL-005", nom: "Yûichi Shibata", camp: "humain", rang: 1,
    proprietes: "Petit garçon dont l'âme est piégée dans une perruche, traqué par le Hollow qui a tué sa mère.",
    equipe: "", role: "Âme errante",
    illustration: "assets/illustrations/BL-005.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-006", nom: "Sôken Ishida", camp: "quincy", rang: 1,
    proprietes: "Le grand-père d'Uryû, maître Quincy qui croyait à l'entente avec les Shinigami… mort en les attendant.",
    equipe: "Quincy", role: "Grand-père d'Uryû",
    illustration: "assets/illustrations/BL-006.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-007", nom: "Fishbone D", camp: "hollow", rang: 1,
    proprietes: "Le premier Hollow à frapper la famille Kurosaki, celui qui pousse Ichigo à devenir Shinigami.",
    equipe: "Hollow", role: "Dévoreur d'âmes",
    illustration: "assets/illustrations/BL-007.jpg", cadrage: "50% 30%",
  },

  // ── S ──
  {
    id: "BL-008", nom: "Isshin Kurosaki", camp: "humain", rang: 2,
    proprietes: "Médecin de quartier exubérant qui accueille son fils à coups de pied volants… et cache bien son jeu.",
    equipe: "Famille Kurosaki", role: "Médecin",
    illustration: "assets/illustrations/BL-008.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-009", nom: "Tatsuki Arisawa", camp: "humain", rang: 2,
    proprietes: "Amie d'enfance d'Ichigo et karatéka redoutable, qui veille sur Orihime comme sur une petite sœur.",
    equipe: "Lycée de Karakura", role: "Karatéka",
    illustration: "assets/illustrations/BL-009.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-010", nom: "Tessai Tsukabishi", camp: "humain", rang: 2,
    proprietes: "Colosse moustachu de la boutique Urahara, maître des sorts de kidô sous son tablier.",
    equipe: "Boutique Urahara", role: "Assistant",
    illustration: "assets/illustrations/BL-010.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-011", nom: "Kon", camp: "humain", rang: 2,
    proprietes: "Âme modifiée cachée dans une peluche de lion, vantarde et dragueuse, qui remplace Ichigo dans son corps.",
    equipe: "Boutique Urahara", role: "Âme modifiée",
    illustration: "assets/illustrations/BL-011.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-012", nom: "Masaki Kurosaki", camp: "humain", rang: 2,
    proprietes: "La mère d'Ichigo, toujours souriante, tuée sous ses yeux un jour de pluie au bord du fleuve.",
    equipe: "Famille Kurosaki", role: "Mère d'Ichigo",
    illustration: "assets/illustrations/BL-012.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-013", nom: "Don Kanonji", camp: "humain", rang: 2,
    proprietes: "Star excentrique du petit écran, qui prétend chasser les esprits devant les caméras. Bwahahaha !",
    equipe: "Télévision", role: "Médium",
    illustration: "assets/illustrations/BL-013.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-014", nom: "Acidwire", camp: "hollow", rang: 2,
    proprietes: "Sora, le grand frère d'Orihime, devenu Hollow par jalousie et par amour, revenu la chercher.",
    equipe: "Hollow", role: "Frère d'Orihime",
    illustration: "assets/illustrations/BL-014.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-015", nom: "Shrieker", camp: "hollow", rang: 2,
    proprietes: "Tueur en série devenu Hollow, il traque l'âme du petit Yûichi pour le plaisir de le voir souffrir.",
    equipe: "Hollow", role: "Tueur en série",
    illustration: "assets/illustrations/BL-015.jpg", cadrage: "50% 30%",
  },

  // ── SR ──
  {
    id: "BL-016", nom: "Orihime Inoue", camp: "humain", rang: 3,
    proprietes: "Lycéenne rêveuse aux recettes improbables, dont les pouvoirs s'éveillent au contact d'Ichigo.",
    equipe: "Lycée de Karakura", role: "Lycéenne",
    illustration: "assets/illustrations/BL-016.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-017", nom: "Yasutora Sado", camp: "humain", rang: 3,
    proprietes: "Colosse taciturne au grand cœur, qui ne se bat jamais pour lui-même, seulement pour les autres.",
    equipe: "Lycée de Karakura", role: "Lycéen",
    illustration: "assets/illustrations/BL-017.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-018", nom: "Renji Abarai", camp: "shinigami", rang: 3,
    proprietes: "Lieutenant de la 6e division et ami d'enfance de Rukia, venu la ramener… et écraser l'intrus.",
    equipe: "6e division", role: "Lieutenant",
    illustration: "assets/illustrations/BL-018.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-019", nom: "Grand Fisher", camp: "hollow", rang: 3,
    proprietes: "Hollow rusé qui attire ses proies avec un leurre, et qui a tué la mère d'Ichigo six ans plus tôt.",
    equipe: "Hollow", role: "Chasseur d'âmes",
    illustration: "assets/illustrations/BL-019.jpg", cadrage: "50% 30%",
  },

  // ── SSR ──
  {
    id: "BL-020", nom: "Ichigo Kurosaki", camp: "humain", rang: 4,
    proprietes: "Lycéen qui voit les esprits, devenu Shinigami remplaçant pour protéger les siens, coûte que coûte.",
    equipe: "Karakura", role: "Shinigami remplaçant",
    illustration: "assets/illustrations/BL-020.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-021", nom: "Kisuke Urahara", camp: "humain", rang: 4,
    proprietes: "Marchand au chapeau rayé et à l'éventail, bien plus dangereux et renseigné qu'il ne le laisse croire.",
    equipe: "Boutique Urahara", role: "Marchand",
    illustration: "assets/illustrations/BL-021.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-022", nom: "Uryû Ishida", camp: "quincy", rang: 4,
    proprietes: "Dernier des Quincy, archer orgueilleux qui jure de prouver la supériorité des siens sur les Shinigami.",
    equipe: "Quincy", role: "Dernier Quincy",
    illustration: "assets/illustrations/BL-022.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-023", nom: "Rukia Kuchiki", camp: "shinigami", rang: 4,
    proprietes: "Shinigami qui a confié ses pouvoirs à un humain, un crime qui pourrait lui coûter la vie.",
    equipe: "13e division", role: "Shinigami",
    illustration: "assets/illustrations/BL-023.jpg", cadrage: "50% 30%",
  },
  {
    id: "BL-024", nom: "Byakuya Kuchiki", camp: "shinigami", rang: 4,
    proprietes: "Capitaine de la 6e division et chef du clan Kuchiki, d'un calme glacial, venu arrêter sa propre sœur.",
    equipe: "6e division", role: "Capitaine",
    illustration: "assets/illustrations/BL-024.jpg", cadrage: "50% 30%",
  },

  // ── Z · Cartes ultimes (3 au plus par collection) : image animée ──
  // boucle : l'extrait en aller-retour, muet, sur la carte ; video : la scène entière, avec le son, en plein écran
  // (video-carte.js) ; jeton : le jeton de profil animé. Fabriqués par outils/animation.mjs.
  {
    id: "BL-025", nom: "Rukia Kuchiki", camp: "shinigami", rang: 5,
    proprietes: "« Je suis une Shinigami, une faucheuse d'âmes. » Ainsi commence tout, dans la chambre d'Ichigo.",
    equipe: "13e division", role: "Shinigami",
    illustration: "assets/illustrations/BL-025.jpg", cadrage: "50% 50%",
    boucle: "assets/animations/BL-025-boucle.mp4",
    video: "assets/animations/BL-025.mp4",
    jeton: "assets/icones-profil/BL-025.webp",
  },
];
