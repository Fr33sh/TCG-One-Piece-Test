// Tirage d'un booster de 5 cartes. Les taux (en %) dépendent de la place de la carte dans le paquet ;
// la 5e et dernière carte est la plus rare. Dans un rang, chaque carte a la même chance de sortir.

const TAUX_PAR_CARTE = [
  { 4: 0, 3: 0, 2: 10, 1: 90 },
  { 4: 0, 3: 0, 2: 10, 1: 90 },
  { 4: 0, 3: 0, 2: 10, 1: 90 },
  { 4: 0, 3: 2.5, 2: 10, 1: 87.5 },
  { 4: 3, 3: 5, 2: 10, 1: 82 },
];

// God pack : 1 S, 2 SR et 2 SSR, les plus rares en dernier
const CHANCE_GOD_PACK = 0.1;
const RANGS_GOD_PACK = [2, 3, 3, 4, 4];

function tirerRang(taux) {
  let tirage = Math.random() * 100;
  for (const rang of [4, 3, 2]) {
    if (tirage < taux[rang]) return rang;
    tirage -= taux[rang];
  }
  return 1;
}

// Les SR et SSR passent toujours en fin de paquet, la plus rare en dernier (SSR en 5e, SR en 4e)
function ordonnerCartes(cartes) {
  const communes = cartes.filter(carte => carte.rang < 3);
  const rares = cartes.filter(carte => carte.rang >= 3).sort((a, b) => a.rang - b.rang);
  return [...communes, ...rares];
}

function tirerBooster() {
  const godPack = Math.random() * 100 < CHANCE_GOD_PACK;
  const rangs = godPack ? RANGS_GOD_PACK : TAUX_PAR_CARTE.map(tirerRang);
  const cartes = rangs.map(rang => {
    const possibles = CARTES.filter(carte => carte.rang === rang);
    return possibles[Math.floor(Math.random() * possibles.length)];
  });
  return { godPack, cartes: ordonnerCartes(cartes) };
}
