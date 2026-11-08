// Set East Blue : données des cartes.
// camp : "pirate" | "marine" | "civil"
// equipe : sans le mot « équipage » (ex. Chapeaux de Paille, Pirates du Roux, Marine, Grand Corsaire) ; vide si aucune.
// rang : 1 (Base, A) · 2 (Mini HIT, S) · 3 (HIT, SR) · 4 (HIT+, SSR)
// illustration : chemin de l'image (ou liste d'images côte à côte) ; cadrage : point de l'image à garder visible (object-position).
// Les talents ne coûtent pas de PA ; les attaques coûtent de 1 à 4 PA (+1 PA par tour, cumulables).

const MOTS_CLES = {
  "Étourdi": "Le personnage ne peut pas attaquer pendant son prochain tour.",
  "Pile ou face": "Lancez une pièce : l'effet s'applique uniquement sur face.",
  "Brûlé": "Le personnage subit 10 dégâts à la fin de chaque tour, jusqu'à ce qu'il quitte le poste actif.",
};

const CARTES = [

  // ── A · Civils ──
  {
    id: "EB-001", lot: 1, nom: "Makino", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Hospitalité", texte: "Une fois par tour, soignez 10 PV à votre personnage actif." },
    attaques: [],
    proprietes: "Douce tenancière du bar du village de Fuchsia. Elle veille sur Luffy depuis qu'il est tout petit.",
    equipe: "", role: "Tenancière",
    illustration: "assets/illustrations/EB-001.jpg", cadrage: "50% 25%",
  },
  {
    id: "EB-002", lot: 1, nom: "Hoop Slap", camp: "civil", rang: 1, pv: 60, type: "Civil",
    talent: { nom: "Protecteur du village", texte: "Vos autres personnages Civils subissent 10 dégâts de moins." },
    attaques: [],
    proprietes: "Maire bourru du village de Fuchsia. Il déteste les pirates et désespère de voir Luffy rêver d'en devenir un.",
    equipe: "", role: "Maire",
    illustration: "assets/illustrations/EB-002.png", cadrage: "50% 18%",
  },
  {
    id: "EB-003", lot: 1, nom: "Rika", camp: "civil", rang: 1, pv: 40, type: "Civil",
    talent: { nom: "Onigiri sucrés", texte: "Une fois par partie, soignez 30 PV à l'un de vos personnages." },
    attaques: [],
    proprietes: "Petite fille courageuse de Shells Town. Elle a bravé les gardes pour apporter des onigiri à Zoro, attaché au poteau.",
    equipe: "", role: "Enfant",
    illustration: "assets/illustrations/EB-003.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-004", lot: 1, nom: "Ririka", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Table ouverte", texte: "Une fois par partie, soignez 20 PV à tous vos personnages." },
    attaques: [],
    proprietes: "Mère de Rika et tenancière de Shells Town. Elle offre un repas de fête à Luffy, Zoro et Koby après la chute de Morgan.",
    equipe: "", role: "Tenancière",
    illustration: "assets/illustrations/EB-004.jpg", cadrage: "50% 18%",
  },
  {
    id: "EB-005", lot: 2, nom: "Buddle", camp: "civil", rang: 1, pv: 60, type: "Civil",
    talent: null,
    attaques: [
      { nom: "Lance du maire", pa: 1, degats: "20", texte: "Buddle subit aussi 10 dégâts." },
    ],
    proprietes: "Maire têtu d'Orange Town, qui a bâti la ville de ses mains. Il défie seul Baggy, lance au poing, pour la défendre.",
    equipe: "", role: "Maire",
    illustration: "assets/illustrations/EB-005.jpg", cadrage: "50% 24%",
  },
  {
    id: "EB-006", lot: 2, nom: "Chouchou", camp: "civil", rang: 1, pv: 50, type: "Bête",
    talent: null,
    attaques: [
      { nom: "Morsure fidèle", pa: 1, degats: "20", texte: "" },
    ],
    proprietes: "Chien fidèle qui garde jour et nuit l'animalerie de son défunt maître, son trésor le plus précieux.",
    equipe: "", role: "Gardien",
    illustration: "assets/illustrations/EB-006.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-007", lot: 3, nom: "Kaya", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Héritière généreuse", texte: "Une fois par partie, gagnez 1 PA." },
    attaques: [],
    proprietes: "Jeune héritière fragile du village de Sirop. Elle offre aux Chapeaux de Paille leur premier navire, le Vogue Merry.",
    equipe: "", role: "Héritière",
    illustration: "assets/illustrations/EB-007.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-008", lot: 3, nom: "Merry", camp: "civil", rang: 1, pv: 60, type: "Civil",
    talent: { nom: "Majordome dévoué", texte: "Une fois par tour, soignez 10 PV à un personnage Civil de votre banc." },
    attaques: [],
    proprietes: "Fidèle majordome de Kaya. C'est lui qui a dessiné le Vogue Merry, la fierté de la maison.",
    equipe: "", role: "Majordome",
    illustration: "assets/illustrations/EB-008.jpg", cadrage: "50% 18%",
  },
  {
    id: "EB-009", lot: 4, nom: "Patty & Carne", camp: "civil", rang: 1, pv: 70, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Service musclé", pa: 1, degats: "20", texte: "" },
    ],
    proprietes: "Cuisiniers bagarreurs du Baratie. Ici, les clients qui refusent de payer repartent avec des bosses.",
    equipe: "", role: "Cuisiniers",
    illustration: ["assets/illustrations/EB-009-patty.jpg", "assets/illustrations/EB-009-carne.jpg"], cadrage: "50% 50%",
  },
  {
    id: "EB-010", lot: 5, nom: "Nojiko", camp: "civil", rang: 1, pv: 60, type: "Civil",
    talent: { nom: "Sœur protectrice", texte: "Une fois par tour, si Nami est en jeu de votre côté, soignez-lui 20 PV." },
    attaques: [],
    proprietes: "Sœur aînée de Nami, qui cultive les mandarines de Bell-mère. Elle seule connaît le vrai combat de sa sœur.",
    equipe: "", role: "Cultivatrice de mandarines",
    illustration: "assets/illustrations/EB-010.jpg", cadrage: "50% 18%",
  },
  {
    id: "EB-011", lot: 5, nom: "Chabo", camp: "civil", rang: 1, pv: 40, type: "Civil",
    talent: null,
    attaques: [
      { nom: "Couteau vengeur", pa: 1, degats: "10", texte: "" },
    ],
    proprietes: "Petit garçon de Gosa qui veut venger son père, tué par Arlong. Il a failli poignarder Usopp, pris pour un homme-poisson.",
    equipe: "", role: "Enfant",
    illustration: "assets/illustrations/EB-011.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-012", lot: 5, nom: "Nakoh", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Médecin de Cocoyashi", texte: "Une fois par tour, soignez 10 PV à l'un de vos personnages." },
    attaques: [],
    proprietes: "Médecin de Cocoyashi aux lunettes noires, toujours prêt à soigner les blessés de la révolte contre Arlong.",
    equipe: "", role: "Médecin",
    illustration: "assets/illustrations/EB-012.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-013", lot: 6, nom: "Ippon Matsu", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Armurier", texte: "Une fois par partie, l'attaque d'un de vos Sabreurs inflige 30 dégâts de plus." },
    attaques: [],
    proprietes: "Armurier de Loguetown. Touché par le courage de Zoro, il lui offre le Yubashiri, un sabre de grande qualité.",
    equipe: "", role: "Armurier",
    illustration: "assets/illustrations/EB-013.jpg", cadrage: "50% 25%",
  },
  {
    id: "EB-014", lot: 6, nom: "Raoul", camp: "civil", rang: 1, pv: 60, type: "Civil",
    talent: { nom: "Récit légendaire", texte: "Une fois par partie, votre personnage actif inflige 20 dégâts de plus ce tour-ci." },
    attaques: [],
    proprietes: "Barman de Loguetown qui a servi Gol D. Roger avant son départ pour Grand Line. Sa taverne porte désormais son nom.",
    equipe: "", role: "Barman",
    illustration: "assets/illustrations/EB-014.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-015", lot: 6, nom: "Carol Masterson", camp: "civil", rang: 1, pv: 40, type: "Civil",
    talent: { nom: "Fille chérie", texte: "Si Daddy Masterson est en jeu de votre côté, ses attaques infligent 20 dégâts de plus." },
    attaques: [],
    proprietes: "Fille adorée de Daddy Masterson. Une de ses colères pousse son père à défier Usopp en duel.",
    equipe: "", role: "Enfant",
    illustration: "assets/illustrations/EB-015.jpg", cadrage: "50% 25%",
  },
  {
    id: "EB-016", lot: 6, nom: "Carmen", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Défi culinaire", texte: "Une fois par partie, soignez 30 PV à l'un de vos personnages." },
    attaques: [],
    proprietes: "Cuisinière flamboyante qui défie Sanji lors d'un concours de cuisine à Loguetown.",
    equipe: "", role: "Cuisinière",
    illustration: "assets/illustrations/EB-016.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-017", lot: 7, nom: "Bokuden", camp: "civil", rang: 1, pv: 50, type: "Civil",
    talent: { nom: "Légendes interminables", texte: "Une fois par partie, le personnage actif adverse est Étourdi." },
    attaques: [],
    proprietes: "Grand-père d'Apis et conteur intarissable. Ses histoires de rois anciens endorment tous ceux qui l'écoutent.",
    equipe: "", role: "Conteur",
    illustration: "assets/illustrations/EB-017.jpg", cadrage: "50% 18%",
  },

  // ── A · Marine ──
  {
    id: "EB-018", lot: 1, nom: "Hermep", camp: "marine", rang: 1, pv: 50, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "« Je vais le dire à mon père ! »", pa: 1, degats: "10+", texte: "20 dégâts de plus si Morgan est en jeu de votre côté." },
    ],
    proprietes: "Fils capricieux du capitaine Morgan. Il abuse du pouvoir de son père pour martyriser les habitants de Shells Town.",
    equipe: "Marine", role: "Fils du capitaine",
    illustration: "assets/illustrations/EB-018.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-019", lot: 1, nom: "Ripper", camp: "marine", rang: 1, pv: 60, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Fusil réglementaire", pa: 1, degats: "20", texte: "" },
    ],
    proprietes: "Officier de la 153e base. Reconnaissant envers Luffy, il doit pourtant chasser ces pirates de Shells Town.",
    equipe: "Marine", role: "Commandant",
    illustration: "assets/illustrations/EB-019.jpg", cadrage: "50% 36%",
  },
  {
    id: "EB-020", lot: 5, nom: "Nezumi", camp: "marine", rang: 1, pv: 60, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Ordre du capitaine", pa: 1, degats: "20", texte: "" },
    ],
    proprietes: "Capitaine corrompu de la 16e base, payé par Arlong pour fermer les yeux. C'est lui qui fera mettre Luffy à prix.",
    equipe: "Marine", role: "Capitaine",
    illustration: "assets/illustrations/EB-020.jpg", cadrage: "50% 25%",
  },

  // ── A · Pirates ──
  {
    id: "EB-021", lot: 1, nom: "Heppoko, Peppoko & Poppoko", camp: "pirate", rang: 1, pv: 60, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Assaut en trio", pa: 2, degats: "10×", texte: "Lancez 3 pièces : 10 dégâts par face." },
    ],
    proprietes: "Trois matelots d'Alvida, toujours ensemble, toujours les premiers à fuir.",
    equipe: "Pirates d'Alvida", role: "Matelots",
    illustration: ["assets/illustrations/EB-021-heppoko.jpg", "assets/illustrations/EB-021-peppoko.jpg", "assets/illustrations/EB-021-poppoko.jpg"], cadrage: "45% 50%",
  },
  {
    id: "EB-022", lot: 3, nom: "Gaimon", camp: "pirate", rang: 1, pv: 60, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Tir du gardien", pa: 1, degats: "20", texte: "" },
    ],
    proprietes: "Ancien pirate coincé dans un coffre depuis vingt ans. Il veille sur l'île des animaux rares… et sur des coffres vides.",
    equipe: "", role: "Gardien de l'île",
    illustration: "assets/illustrations/EB-022.png", cadrage: "50% 60%",
  },
  {
    id: "EB-023", lot: 3, nom: "Carotte, Piment & Oignon", camp: "pirate", rang: 1, pv: 50, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Courage des petits pirates", pa: 1, degats: "10+", texte: "20 dégâts de plus si Usopp est en jeu de votre côté." },
    ],
    proprietes: "Les trois fidèles de l'équipage d'Usopp. Malgré leur peur, ils défendent leur village jusqu'au bout.",
    equipe: "Pirates d'Usopp", role: "Matelots",
    illustration: ["assets/illustrations/EB-023-ninjin.jpg", "assets/illustrations/EB-023-piiman.jpg", "assets/illustrations/EB-023-tamanegi.jpg"], cadrage: "50% 50%",
  },
  {
    id: "EB-024", lot: 4, nom: "Yosaku & Johnny", camp: "pirate", rang: 1, pv: 70, type: "Sabreur",
    talent: null,
    attaques: [
      { nom: "Lames jumelles", pa: 2, degats: "10+", texte: "Lancez 2 pièces : 10 dégâts de plus par face." },
    ],
    proprietes: "Chasseurs de primes et vieux compagnons de Zoro. Yosaku, rongé par le scorbut, sera sauvé… par des citrons verts.",
    equipe: "Chasseurs de primes", role: "Duo",
    illustration: ["assets/illustrations/EB-024-yosaku.jpg", "assets/illustrations/EB-024-johnny.jpg"], cadrage: "50% 50%",
  },

  // ── S · Civils ──
  {
    id: "EB-025", lot: 1, nom: "Monstre de la Baie", camp: "civil", rang: 2, pv: 100, type: "Bête",
    talent: null,
    attaques: [
      { nom: "Gueule abyssale", pa: 3, degats: "50", texte: "" },
    ],
    proprietes: "Monarque des mers qui règne sur les eaux de Fuchsia. C'est lui qui a emporté le bras de Shanks.",
    equipe: "", role: "Monarque des mers",
    illustration: "assets/illustrations/EB-025.jpg", cadrage: "50% 53%",
  },
  {
    id: "EB-026", lot: 5, nom: "Genzô", camp: "civil", rang: 2, pv: 90, type: "Sabreur",
    talent: null,
    attaques: [
      { nom: "Lame du shérif", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Shérif balafré de Cocoyashi et protecteur de Nami. Le moulin à vent de son chapeau, c'est pour la faire sourire.",
    equipe: "", role: "Shérif",
    illustration: "assets/illustrations/EB-026.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-027", lot: 7, nom: "Apis", camp: "civil", rang: 2, pv: 70, type: "Fruit du Démon",
    talent: { nom: "Hiso Hiso no Mi", texte: "Une fois par tour, soignez 20 PV à l'une de vos Bêtes." },
    attaques: [],
    proprietes: "Jeune fille qui parle aux animaux grâce à son fruit du démon. Elle protège Ryuji, un dragon millénaire blessé.",
    equipe: "", role: "Amie des animaux",
    illustration: "assets/illustrations/EB-027.jpg", cadrage: "50% 30%",
  },

  // ── S · Marine ──
  {
    id: "EB-028", lot: 1, nom: "Koby", camp: "marine", rang: 2, pv: 70, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Courage du mousse", pa: 1, degats: "10+", texte: "20 dégâts de plus si Koby a moins de PV que le personnage adverse." },
    ],
    proprietes: "Ancien mousse d'Alvida, timide et pleurnichard. Sa rencontre avec Luffy lui donne enfin le courage de rejoindre la Marine.",
    equipe: "Marine", role: "Recrue",
    illustration: "assets/illustrations/EB-028.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-029", lot: 4, nom: "Fullbody", camp: "marine", rang: 2, pv: 90, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Tekken", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "« Fullbody le poing de fer », lieutenant arrogant venu dîner au Baratie. Il repart sans dessert, mais avec un coup de pied.",
    equipe: "Marine", role: "Lieutenant",
    illustration: "assets/illustrations/EB-029.jpg", cadrage: "50% 5%",
  },
  {
    id: "EB-030", lot: 5, nom: "Bell-mère", camp: "marine", rang: 2, pv: 80, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Tir de l'ancienne Marine", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Ancienne soldate de la Marine devenue mère adoptive de Nami et Nojiko. Elle a donné sa vie pour ses filles.",
    equipe: "", role: "Ancienne Marine",
    illustration: "assets/illustrations/EB-030.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-031", lot: 7, nom: "Nelson", camp: "marine", rang: 2, pv: 90, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Ordre du commodore", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Commodore vaniteux de la 8e base, prêt à tout pour la gloire… même à chasser un dragon légendaire.",
    equipe: "Marine", role: "Commodore",
    illustration: "assets/illustrations/EB-031.jpg", cadrage: "50% 10%",
  },

  // ── S · Pirates ──
  {
    id: "EB-032", lot: 1, nom: "Lucky Roo", camp: "pirate", rang: 2, pv: 90, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Tir éclair", pa: 1, degats: "20+", texte: "Pile ou face : 20 dégâts de plus." },
    ],
    proprietes: "Officier jovial de l'équipage du Roux, jamais sans un gigot à la main. Il dégaine avant que l'ennemi n'ait fini sa menace.",
    equipe: "Pirates du Roux", role: "Officier",
    illustration: "assets/illustrations/EB-032.webp", cadrage: "20% 50%",
  },
  {
    id: "EB-033", lot: 1, nom: "Yasopp", camp: "pirate", rang: 2, pv: 80, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Tir de précision", pa: 2, degats: "30", texte: "Peut cibler un personnage du banc adverse." },
    ],
    proprietes: "Tireur d'élite de l'équipage du Roux, réputé ne jamais manquer sa cible. Il a laissé un fils au village de Sirop.",
    equipe: "Pirates du Roux", role: "Tireur d'élite",
    illustration: "assets/illustrations/EB-033.png", cadrage: "50% 15%",
  },
  {
    id: "EB-034", lot: 1, nom: "Higuma", camp: "pirate", rang: 2, pv: 80, type: "Sabreur",
    talent: null,
    attaques: [
      { nom: "Lame du bandit", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Chef des bandits des montagnes, recherché pour 8 000 000 Berrys. Son arrogance l'a mené tout droit dans la gueule du Monstre de la Baie.",
    equipe: "Bandits", role: "Chef",
    illustration: "assets/illustrations/EB-034.jpg", cadrage: "50% 18%",
  },
  {
    id: "EB-035", lot: 1, nom: "Alvida", camp: "pirate", rang: 2, pv: 90, type: "Cogneur",
    talent: null,
    attaques: [
      { nom: "Massue de fer", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "« Alvida à la massue de fer », recherchée pour 5 000 000 Berrys. Elle se croit la plus belle des mers : gare à qui ose la contredire !",
    equipe: "Pirates d'Alvida", role: "Capitaine",
    illustration: "assets/illustrations/EB-035.jpg", cadrage: "50% 14%",
  },
  {
    id: "EB-036", lot: 2, nom: "Morge & Richie", camp: "pirate", rang: 2, pv: 100, type: "Bête",
    talent: null,
    attaques: [
      { nom: "Charge du fauve", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Le dompteur de l'équipage de Baggy et son lion géant. Richie n'obéit qu'à Morge… quand il en a envie.",
    equipe: "Pirates de Baggy", role: "Dompteur",
    illustration: ["assets/illustrations/EB-036-mohji.jpg", "assets/illustrations/EB-036-richie.jpg"], cadrage: "50% 50%",
  },
  {
    id: "EB-037", lot: 2, nom: "Cabaji", camp: "pirate", rang: 2, pv: 90, type: "Sabreur",
    talent: null,
    attaques: [
      { nom: "Kyokugi! Kaji Oyaji", pa: 2, degats: "30", texte: "Le personnage actif adverse est Brûlé." },
    ],
    proprietes: "« Cabaji l'Acrobate », chef d'état-major de Baggy. Sabreur sans honneur, il vise sans pitié les blessures de ses adversaires.",
    equipe: "Pirates de Baggy", role: "Chef d'état-major",
    illustration: "assets/illustrations/EB-037.jpg", cadrage: "50% 24%",
  },
  {
    id: "EB-038", lot: 3, nom: "Jango", camp: "pirate", rang: 2, pv: 90, type: "Hypnotiseur",
    talent: null,
    attaques: [
      { nom: "Wan, Tsū, Jango", pa: 2, degats: "30", texte: "Pile ou face : le personnage actif adverse est Étourdi." },
    ],
    proprietes: "Hypnotiseur au pas de danse impeccable et capitaine par intérim du Chat Noir. Un, deux… Jango !",
    equipe: "Pirates du Chat Noir", role: "Capitaine par intérim",
    illustration: "assets/illustrations/EB-038.webp", cadrage: "50% 0%",
  },
  {
    id: "EB-039", lot: 3, nom: "Sham & Buchi", camp: "pirate", rang: 2, pv: 100, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Neko-Yanagi Daikōshin", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Les frères Nyaban, gardiens du navire du Chat Noir. Ensemble, leurs têtes valent 7 000 000 Berrys.",
    equipe: "Pirates du Chat Noir", role: "Gardiens du navire",
    illustration: ["assets/illustrations/EB-039-sham.jpg", "assets/illustrations/EB-039-buchi.jpg"], cadrage: "50% 50%",
  },
  {
    id: "EB-040", lot: 4, nom: "Pearl", camp: "pirate", rang: 2, pv: 100, type: "Cogneur",
    talent: null,
    attaques: [
      { nom: "Faiyā Pāru Purezento", pa: 2, degats: "30", texte: "Pile ou face : le personnage actif adverse est Brûlé." },
    ],
    proprietes: "« Pearl le mur de fer », jamais blessé en 61 combats grâce à ses boucliers… jusqu'à sa rencontre avec Sanji.",
    equipe: "Pirates de Krieg", role: "Commandant",
    illustration: "assets/illustrations/EB-040.jpg", cadrage: "50% 36%",
  },
  {
    id: "EB-041", lot: 5, nom: "Meuh-Meuh", camp: "pirate", rang: 2, pv: 100, type: "Bête",
    talent: null,
    attaques: [
      { nom: "Charge de la vache marine", pa: 2, degats: "40", texte: "" },
    ],
    proprietes: "Vache marine géante au service d'Arlong. Depuis la raclée de Luffy, elle tremble à la vue d'un chapeau de paille.",
    equipe: "Pirates d'Arlong", role: "Monture",
    illustration: "assets/illustrations/EB-041.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-042", lot: 5, nom: "Smack", camp: "pirate", rang: 2, pv: 90, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Hyappatsu Mizudeppō", pa: 2, degats: "30", texte: "Peut cibler un personnage du banc adverse." },
    ],
    proprietes: "Tireur d'élite d'Arlong à 5 500 000 Berrys. Il crache l'eau plus vite qu'un fusil, mais s'incline face à Usopp.",
    equipe: "Pirates d'Arlong", role: "Tireur d'élite",
    illustration: "assets/illustrations/EB-042.jpg", cadrage: "50% 5%",
  },
  {
    id: "EB-043", lot: 6, nom: "Daddy Masterson", camp: "pirate", rang: 2, pv: 90, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Tir du père", pa: 2, degats: "40", texte: "Peut cibler un personnage du banc adverse." },
    ],
    proprietes: "Ancien officier de la Marine devenu chasseur de primes, tireur hors pair. Il ne vise que les petites primes pour rester auprès de sa fille.",
    equipe: "Chasseurs de primes", role: "Tireur",
    illustration: "assets/illustrations/EB-043.jpg", cadrage: "50% 30%",
  },

  // ── SR · Civils ──
  {
    id: "EB-044", lot: 7, nom: "Ryuji", camp: "civil", rang: 3, pv: 140, type: "Bête",
    talent: null,
    attaques: [
      { nom: "Coup de queue", pa: 2, degats: "50", texte: "" },
      { nom: "Souffle millénaire", pa: 3, degats: "80", texte: "" },
    ],
    proprietes: "Dragon millénaire recueilli par Apis. Il rêve de rejoindre Lost Island, l'île légendaire où reposent les siens.",
    equipe: "", role: "Dragon millénaire",
    illustration: "assets/illustrations/EB-044.webp", cadrage: "50% 50%",
  },

  // ── SR · Marine ──
  {
    id: "EB-045", lot: 1, nom: "Morgan", camp: "marine", rang: 3, pv: 120, type: "Cogneur",
    talent: null,
    attaques: [
      { nom: "Main de hache", pa: 2, degats: "50", texte: "" },
      { nom: "Exécution du capitaine", pa: 3, degats: "80", texte: "" },
    ],
    proprietes: "« Morgan à la main de hache », capitaine tyrannique de la 153e base. Il fait régner la terreur sur Shells Town.",
    equipe: "Marine", role: "Capitaine",
    illustration: "assets/illustrations/EB-045.jpg", cadrage: "50% 24%",
  },
  {
    id: "EB-046", lot: 6, nom: "Tashigi", camp: "marine", rang: 3, pv: 110, type: "Sabreur",
    talent: { nom: "Passion des sabres", texte: "Tashigi inflige 20 dégâts de plus aux Sabreurs." },
    attaques: [
      { nom: "Lame de Shigure", pa: 2, degats: "50", texte: "" },
    ],
    proprietes: "Sergent-chef maladroite mais redoutable, passionnée de sabres. Elle ressemble trait pour trait à Kuina, l'amie d'enfance de Zoro.",
    equipe: "Marine", role: "Sergent-chef",
    illustration: "assets/illustrations/EB-046.jpg", cadrage: "50% 20%",
  },

  // ── SR · Pirates ──
  {
    id: "EB-047", lot: 1, nom: "Ben Beckmann", camp: "pirate", rang: 3, pv: 130, type: "Artilleur",
    talent: { nom: "Bras droit du Roux", texte: "Si Shanks est en jeu de votre côté, les attaques de Ben Beckmann infligent 20 dégâts de plus." },
    attaques: [
      { nom: "En joue", pa: 2, degats: "50", texte: "Pile ou face : le personnage actif adverse est Étourdi." },
    ],
    proprietes: "Second de Shanks, aussi fin stratège que redoutable tireur. Un fusil pointé et un regard froid suffisent à glacer les bandits.",
    equipe: "Pirates du Roux", role: "Second",
    illustration: "assets/illustrations/EB-047.jpg", cadrage: "50% 24%",
  },
  {
    id: "EB-048", lot: 2, nom: "Baggy le Clown", camp: "pirate", rang: 3, pv: 130, type: "Fruit du Démon",
    talent: { nom: "Bara Bara no Mi", texte: "Baggy subit 30 dégâts de moins des attaques des Sabreurs." },
    attaques: [
      { nom: "Tokusei Magī Dama", pa: 3, degats: "70", texte: "Inflige aussi 10 dégâts à chaque personnage du banc adverse." },
    ],
    proprietes: "Capitaine à 15 000 000 Berrys et ancien mousse du navire de Roger. Malheur à qui ose se moquer de son gros nez rouge !",
    equipe: "Pirates de Baggy", role: "Capitaine",
    illustration: "assets/illustrations/EB-048.jpg", cadrage: "50% 36%",
  },
  {
    id: "EB-049", lot: 3, nom: "Kuro", camp: "pirate", rang: 3, pv: 130, type: "Bagarreur",
    talent: null,
    attaques: [
      { nom: "Nuki Ashi", pa: 2, degats: "50", texte: "Pile ou face : le personnage actif adverse est Étourdi." },
      { nom: "Shakushi", pa: 3, degats: "80", texte: "Inflige aussi 10 dégâts à chacun de vos personnages du banc." },
    ],
    proprietes: "« Kuro aux mille plans », ancien capitaine à 16 000 000 Berrys caché en majordome. Il convoite la fortune de Kaya.",
    equipe: "Pirates du Chat Noir", role: "Capitaine",
    illustration: "assets/illustrations/EB-049.webp", cadrage: "50% 50%",
  },
  {
    id: "EB-050", lot: 4, nom: "Zeff", camp: "pirate", rang: 3, pv: 120, type: "Bagarreur",
    talent: { nom: "Leçon du chef", texte: "Vos autres Bagarreurs infligent 10 dégâts de plus." },
    attaques: [
      { nom: "Coup de jambe de bois", pa: 2, degats: "50", texte: "" },
    ],
    proprietes: "Légendaire capitaine pirate devenu chef du Baratie. Il a sacrifié sa jambe pour sauver le petit Sanji.",
    equipe: "", role: "Chef du Baratie",
    illustration: "assets/illustrations/EB-050.jpg", cadrage: "50% 30%",
  },
  {
    id: "EB-051", lot: 4, nom: "Gin", camp: "pirate", rang: 3, pv: 120, type: "Cogneur",
    talent: null,
    attaques: [
      { nom: "Tonfas du démon", pa: 2, degats: "50", texte: "" },
      { nom: "Assaut sans pitié", pa: 3, degats: "80", texte: "" },
    ],
    proprietes: "« Gin le Démon », commandant de Don Krieg à 12 000 000 Berrys. Un repas offert par Sanji a touché son cœur de pirate.",
    equipe: "Pirates de Krieg", role: "Commandant",
    illustration: "assets/illustrations/EB-051.jpg", cadrage: "50% 0%",
  },
  {
    id: "EB-052", lot: 4, nom: "Don Krieg", camp: "pirate", rang: 3, pv: 130, type: "Artilleur",
    talent: null,
    attaques: [
      { nom: "Daiya no Kobushi", pa: 2, degats: "50", texte: "" },
      { nom: "Daisensō", pa: 3, degats: "70", texte: "Inflige aussi 10 dégâts à chaque personnage du banc adverse." },
    ],
    proprietes: "Amiral d'une flotte de 50 navires, pirate le plus redouté d'East Blue avec 17 000 000 Berrys de prime.",
    equipe: "Pirates de Krieg", role: "Amiral",
    illustration: "assets/illustrations/EB-052.jpg", cadrage: "50% 13%",
  },
  {
    id: "EB-053", lot: 5, nom: "Octy", camp: "pirate", rang: 3, pv: 120, type: "Sabreur",
    talent: { nom: "Rokutōryū", texte: "Octy subit 20 dégâts de moins des attaques des Sabreurs." },
    attaques: [
      { nom: "Takoashi Kiken", pa: 2, degats: "50", texte: "" },
    ],
    proprietes: "Officier d'Arlong à 8 000 000 Berrys, maître du sabre à six lames. Redoutable… mais un peu tête en l'air.",
    equipe: "Pirates d'Arlong", role: "Officier",
    illustration: "assets/illustrations/EB-053.jpg", cadrage: "50% 25%",
  },
  {
    id: "EB-054", lot: 5, nom: "Kuroobi", camp: "pirate", rang: 3, pv: 120, type: "Bagarreur",
    talent: { nom: "Karaté homme-poisson", texte: "Les attaques de Kuroobi ignorent les réductions de dégâts du personnage adverse." },
    attaques: [
      { nom: "Poing des cent tuiles", pa: 2, degats: "50", texte: "" },
    ],
    proprietes: "Maître du karaté homme-poisson à 9 000 000 Berrys. Sa ceinture noire n'a pas suffi face aux jambes de Sanji.",
    equipe: "Pirates d'Arlong", role: "Officier",
    illustration: "assets/illustrations/EB-054.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-055", lot: 7, nom: "Erik", camp: "pirate", rang: 3, pv: 120, type: "Fruit du Démon",
    talent: null,
    attaques: [
      { nom: "Rafale tranchante", pa: 2, degats: "40", texte: "Peut cibler un personnage du banc adverse." },
      { nom: "Tourbillon de lames", pa: 3, degats: "70", texte: "Inflige aussi 10 dégâts à chaque personnage du banc adverse." },
    ],
    proprietes: "« Erik le Tourbillon », mercenaire aux vents tranchants. Il traque Apis pour voler le secret du dragon millénaire.",
    equipe: "", role: "Mercenaire",
    illustration: "assets/illustrations/EB-055.jpg", cadrage: "50% 30%",
  },

  // ── SSR · Marine ──
  {
    id: "EB-056", lot: 6, nom: "Smoker", camp: "marine", rang: 4, pv: 170, type: "Fruit du Démon",
    talent: { nom: "Corps de fumée", texte: "Smoker subit 30 dégâts de moins des attaques des Bagarreurs." },
    attaques: [
      { nom: "Howaito Burō", pa: 2, degats: "70", texte: "" },
      { nom: "Howaito Auto", pa: 4, degats: "110", texte: "Le personnage actif adverse est Étourdi." },
    ],
    proprietes: "« Smoker le chasseur blanc », capitaine de Loguetown fait de fumée. Il jure de traquer Luffy jusqu'au bout du monde.",
    equipe: "Marine", role: "Capitaine",
    illustration: "assets/illustrations/EB-056.jpg", cadrage: "50% 40%",
  },

  // ── SSR · Pirates ──
  {
    id: "EB-057", lot: 1, nom: "Monkey D. Luffy", camp: "pirate", rang: 4, pv: 170, type: "Fruit du Démon",
    talent: { nom: "Corps en caoutchouc", texte: "Luffy subit 20 dégâts de moins des attaques des Artilleurs." },
    attaques: [
      { nom: "Gomu Gomu no Pistol", pa: 1, degats: "30", texte: "" },
      { nom: "Gomu Gomu no Bazooka", pa: 3, degats: "100", texte: "" },
    ],
    proprietes: "Un garçon au corps de caoutchouc parti seul en mer pour devenir le Roi des Pirates. Sa tête finira par valoir 30 000 000 Berrys.",
    equipe: "Chapeaux de Paille", role: "Capitaine",
    illustration: "assets/illustrations/EB-057.png", cadrage: "50% 50%",
  },
  {
    id: "EB-058", lot: 1, nom: "Shanks le Roux", camp: "pirate", rang: 4, pv: 170, type: "Sabreur",
    talent: { nom: "Regard du Roux", texte: "Quand Shanks arrive en jeu, le personnage actif adverse est Étourdi." },
    attaques: [
      { nom: "Bras protecteur", pa: 2, degats: "50", texte: "Shanks subit 30 dégâts de moins pendant le prochain tour adverse." },
      { nom: "Lame du Roux", pa: 3, degats: "100", texte: "" },
    ],
    proprietes: "Capitaine légendaire au calme désarmant. Il a sacrifié un bras pour sauver le petit Luffy et lui a confié son précieux chapeau de paille.",
    equipe: "Pirates du Roux", role: "Capitaine",
    illustration: "assets/illustrations/EB-058.png", cadrage: "50% 50%",
  },
  {
    id: "EB-059", lot: 1, nom: "Roronoa Zoro", camp: "pirate", rang: 4, pv: 160, type: "Sabreur",
    talent: { nom: "Volonté de fer", texte: "Une fois par partie, si Zoro devait être mis K.O., il reste à 10 PV." },
    attaques: [
      { nom: "Oni Giri", pa: 2, degats: "60", texte: "" },
      { nom: "Sanzen Sekai", pa: 3, degats: "100", texte: "" },
    ],
    proprietes: "Célèbre chasseur de primes et maître du sabre à trois lames. Il rejoint Luffy en jurant de devenir le meilleur sabreur du monde.",
    equipe: "Chapeaux de Paille", role: "Second",
    illustration: "assets/illustrations/EB-059.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-060", lot: 2, nom: "Nami", camp: "pirate", rang: 4, pv: 130, type: "Voleuse",
    talent: { nom: "Voleuse de pirates", texte: "Une fois par partie, volez 1 PA à votre adversaire." },
    attaques: [
      { nom: "Coup de bâton", pa: 1, degats: "30", texte: "Pile ou face : le personnage actif adverse est Étourdi." },
      { nom: "Tempête annoncée", pa: 3, degats: "70+", texte: "Pile ou face : 30 dégâts de plus." },
    ],
    proprietes: "Voleuse rusée qui ne vole que les pirates. Elle rêve de dessiner la carte du monde entier.",
    equipe: "Chapeaux de Paille", role: "Navigatrice",
    illustration: "assets/illustrations/EB-060.png", cadrage: "50% 30%",
  },
  {
    id: "EB-061", lot: 3, nom: "Usopp", camp: "pirate", rang: 4, pv: 140, type: "Artilleur",
    talent: { nom: "Capitaine de 8 000 hommes", texte: "Une fois par partie, quand Usopp devrait subir une attaque, lancez une pièce : si face, il ne subit aucun dégât." },
    attaques: [
      { nom: "Hissatsu Namari Boshi", pa: 1, degats: "30", texte: "Peut cibler un personnage du banc adverse." },
      { nom: "Hissatsu Kayaku Boshi", pa: 3, degats: "80", texte: "Le personnage actif adverse est Brûlé." },
    ],
    proprietes: "Menteur au grand cœur du village de Sirop et fils de Yasopp. Il rêve de devenir un brave guerrier des mers.",
    equipe: "Chapeaux de Paille", role: "Tireur d'élite",
    illustration: "assets/illustrations/EB-061.jpg", cadrage: "50% 50%",
  },
  {
    id: "EB-062", lot: 4, nom: "Sanji", camp: "pirate", rang: 4, pv: 170, type: "Bagarreur",
    talent: { nom: "Repas du cuisinier", texte: "Une fois par partie, soignez 40 PV à l'un de vos personnages." },
    attaques: [
      { nom: "Collier Shoot", pa: 2, degats: "60", texte: "" },
      { nom: "Party Table Kick Course", pa: 3, degats: "90", texte: "Inflige aussi 10 dégâts à chaque personnage du banc adverse." },
    ],
    proprietes: "Cuisinier du Baratie aux jambes redoutables. Il rêve de trouver All Blue, la mer où vivent tous les poissons du monde.",
    equipe: "Chapeaux de Paille", role: "Cuisinier",
    illustration: "assets/illustrations/EB-062.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-063", lot: 4, nom: "Dracule Mihawk", camp: "pirate", rang: 4, pv: 170, type: "Sabreur",
    talent: { nom: "Œil de faucon", texte: "Mihawk subit 20 dégâts de moins des attaques des Sabreurs." },
    attaques: [
      { nom: "Petit couteau", pa: 1, degats: "20", texte: "Pile ou face : le personnage actif adverse est Étourdi." },
      { nom: "Lame de Yoru", pa: 4, degats: "120", texte: "" },
    ],
    proprietes: "Le meilleur sabreur du monde. Il a coulé la flotte de Krieg pour passer le temps, puis vaincu Zoro avec un simple couteau.",
    equipe: "Grand Corsaire", role: "Sabreur",
    illustration: "assets/illustrations/EB-063.jpg", cadrage: "50% 20%",
  },
  {
    id: "EB-064", lot: 5, nom: "Arlong", camp: "pirate", rang: 4, pv: 170, type: "Bagarreur",
    talent: { nom: "Race supérieure", texte: "Les attaques d'Arlong infligent 20 dégâts de plus aux personnages Fruit du Démon." },
    attaques: [
      { nom: "Shāku On Tūsu", pa: 2, degats: "70", texte: "" },
      { nom: "Shāku On Dātsu", pa: 3, degats: "100", texte: "" },
    ],
    proprietes: "Homme-poisson à 20 000 000 Berrys qui asservit l'île de Nami depuis huit ans. Il rêve d'un empire sur tout East Blue.",
    equipe: "Pirates d'Arlong", role: "Capitaine",
    illustration: "assets/illustrations/EB-064.jpg", cadrage: "50% 40%",
  },
  {
    id: "EB-065", lot: 6, nom: "Monkey D. Dragon", camp: "pirate", rang: 4, pv: 170, type: "Bagarreur",
    talent: { nom: "Vent de la révolution", texte: "Une fois par partie, annulez une attaque adverse." },
    attaques: [
      { nom: "Rafale du dragon", pa: 2, degats: "50", texte: "Peut cibler un personnage du banc adverse." },
      { nom: "Tempête révolutionnaire", pa: 4, degats: "100", texte: "Inflige aussi 10 dégâts à chaque personnage du banc adverse." },
    ],
    proprietes: "Mystérieux homme encapuchonné, le plus recherché du monde. Une tempête soudaine sauve Luffy… simple hasard ?",
    equipe: "Armée révolutionnaire", role: "Chef",
    illustration: "assets/illustrations/EB-065.jpg", cadrage: "50% 35%",
  },
  {
    // Exception voulue par l'utilisateur : PV hors échelle et aucune attaque
    id: "EB-066", lot: 6, nom: "Gol D. Roger", camp: "pirate", rang: 4, pv: 250, type: "Sabreur",
    talent: { nom: "Volonté du Roi des Pirates", texte: "Quand Roger est mis K.O., gagnez 3 PA." },
    attaques: [],
    proprietes: "Le Roi des Pirates, exécuté à Loguetown. Ses dernières paroles ont lancé la grande ère de la piraterie.",
    equipe: "Pirates de Roger", role: "Capitaine",
    illustration: "assets/illustrations/EB-066.jpg", cadrage: "50% 40%",
  },
];
