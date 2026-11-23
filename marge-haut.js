// Hauteur de la barre d'état du téléphone (heure, batterie), mesurée par la page principale (index.html).
// Le jeu tourne dans un cadre, où le téléphone donne toujours 0 : chaque écran reprend donc la mesure de
// la page principale dans la variable CSS --marge-haut, pour passer sous la barre d'état en gardant ses
// boutons en dessous. À charger dans le <head>, avant l'affichage.

try {
  const marge = window.parent !== window ? window.parent.margeHaut : 0;
  if (marge > 0) document.documentElement.style.setProperty("--marge-haut", `${marge}px`);
} catch {
  // Page ouverte seule : le CSS se rabat sur la valeur donnée par le téléphone (env)
}
