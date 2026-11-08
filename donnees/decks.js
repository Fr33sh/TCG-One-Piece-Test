// Decks préconstruits : 20 cartes, 2 exemplaires maximum par carte.
// Les cartes sont désignées par leur nom, car les numéros changent si la collection est réorganisée.

const DECKS = [
  {
    id: "chapeaux",
    nom: "Chapeaux de Paille",
    description: "Luffy et son équipage, soutenus par leurs alliés d'East Blue.",
    vedette: "Monkey D. Luffy",
    cartes: [
      ["Monkey D. Luffy", 1], ["Roronoa Zoro", 1], ["Nami", 1], ["Usopp", 1], ["Sanji", 1],
      ["Zeff", 1], ["Ryuji", 1], ["Genzô", 2], ["Apis", 1], ["Kaya", 1], ["Nojiko", 1],
      ["Carotte, Piment & Oignon", 2], ["Yosaku & Johnny", 2], ["Patty & Carne", 2], ["Makino", 1], ["Merry", 1],
    ],
  },
  {
    id: "marine",
    nom: "Marine",
    description: "Smoker, Tashigi et les soldats de la Marine, épaulés par Mihawk.",
    vedette: "Smoker",
    cartes: [
      ["Smoker", 1], ["Dracule Mihawk", 1], ["Morgan", 1], ["Tashigi", 1],
      ["Koby", 2], ["Fullbody", 2], ["Bell-mère", 2], ["Nelson", 1],
      ["Hermep", 2], ["Ripper", 2], ["Nezumi", 2], ["Nakoh", 1], ["Monstre de la Baie", 1], ["Ippon Matsu", 1],
    ],
  },
  {
    id: "legendes",
    nom: "Légendes pirates",
    description: "Gol D. Roger, Shanks et son équipage, Baggy et les pirates d'Orange Town.",
    vedette: "Shanks le Roux",
    cartes: [
      ["Gol D. Roger", 1], ["Shanks le Roux", 1], ["Ben Beckmann", 1], ["Baggy le Clown", 1],
      ["Lucky Roo", 2], ["Yasopp", 2], ["Morge & Richie", 2], ["Cabaji", 2], ["Alvida", 2], ["Higuma", 2],
      ["Heppoko, Peppoko & Poppoko", 1], ["Gaimon", 1], ["Daddy Masterson", 1], ["Carol Masterson", 1],
    ],
  },
  {
    id: "mechants",
    nom: "Terreurs d'East Blue",
    description: "Arlong et ses hommes-poissons, Kuro, Don Krieg et leurs hommes de main.",
    vedette: "Arlong",
    cartes: [
      ["Arlong", 1], ["Octy", 1], ["Kuroobi", 1], ["Kuro", 1], ["Don Krieg", 1],
      ["Smack", 2], ["Meuh-Meuh", 2], ["Jango", 2], ["Sham & Buchi", 1], ["Pearl", 2],
      ["Nezumi", 2], ["Higuma", 1], ["Heppoko, Peppoko & Poppoko", 2], ["Gaimon", 1],
    ],
  },
];

// Transforme une liste de deck (noms et quantités) en liste de cartes
function cartesDuDeck(deck) {
  return deck.cartes.flatMap(([nom, quantite]) => {
    const carte = CARTES.find(c => c.nom === nom);
    if (!carte) throw new Error(`Carte introuvable dans le deck ${deck.nom} : ${nom}`);
    return Array(quantite).fill(carte);
  });
}
