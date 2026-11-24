// Les séries (collections) du jeu : chacune a ses cartes et son booster. À charger après les fichiers de cartes.
// image : illustration de la série (onglet de la Collection) ; CARTES : toutes les cartes du jeu.

const SERIES = [
  { id: "east-blue", nom: "East Blue", licence: "One Piece", code: "EB", image: "assets/packs/east-blue.jpg", cartes: CARTES_EAST_BLUE },
  { id: "naruto", nom: "Naruto", licence: "Naruto", code: "NA", image: "assets/packs/naruto.jpg", cartes: CARTES_NARUTO },
];

const CARTES = SERIES.flatMap(serie => serie.cartes);
const serieDe = id => SERIES.find(serie => serie.id === id) || SERIES[0];
