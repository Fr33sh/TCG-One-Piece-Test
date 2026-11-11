// Serveur du jeu (Cloudflare Worker). Cloudflare sert lui-même les fichiers du jeu ; ce Worker ne répond
// qu'aux adresses /api/… : comptes (pseudo#1234) et amis.
// Toutes les données sont gardées dans un seul Durable Object « Social », avec sa propre base SQLite.
//
// Un compte = un identifiant public (id) + un jeton secret, gardés dans le navigateur du joueur.
// Le serveur ne garde qu'une empreinte du jeton : chaque demande doit le présenter
// (en-tête « Authorization: Bearer id.jeton »).

import { DurableObject } from "cloudflare:workers";

export default {
  async fetch(requete, env) {
    const url = new URL(requete.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(requete);
    return env.SOCIAL.get(env.SOCIAL.idFromName("monde")).fetch(requete);
  },
};

const PSEUDO_VALIDE = /^[\p{L}\p{N}_-]{3,16}$/u;
const NOMBRE_TAGS = 10000; // de #0000 à #9999

class ErreurJeu extends Error {
  constructor(message, statut = 400) {
    super(message);
    this.statut = statut;
  }
}

const enJson = (donnees, statut = 200) => new Response(JSON.stringify(donnees), {
  status: statut,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

function verifierPseudo(pseudo) {
  const propre = String(pseudo ?? "").trim().normalize("NFC");
  if (!PSEUDO_VALIDE.test(propre)) {
    throw new ErreurJeu("Le pseudo doit faire de 3 à 16 caractères : lettres, chiffres, « _ » ou « - », sans espace.");
  }
  return propre;
}

const enMinuscules = pseudo => pseudo.toLocaleLowerCase("fr");

async function empreinte(texte) {
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map(octet => octet.toString(16).padStart(2, "0")).join("");
}

function jetonAuHasard() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(octet => octet.toString(16).padStart(2, "0")).join("");
}

export class Social extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS joueurs (
        id TEXT PRIMARY KEY,
        empreinte_jeton TEXT NOT NULL,
        pseudo TEXT NOT NULL,
        pseudo_min TEXT NOT NULL,
        tag TEXT NOT NULL,
        cree INTEGER NOT NULL,
        UNIQUE (pseudo_min, tag)
      );
      CREATE TABLE IF NOT EXISTS demandes (
        de TEXT NOT NULL,
        vers TEXT NOT NULL,
        cree INTEGER NOT NULL,
        PRIMARY KEY (de, vers)
      );
      CREATE INDEX IF NOT EXISTS demandes_vers ON demandes (vers);
      CREATE TABLE IF NOT EXISTS amis (
        joueur TEXT NOT NULL,
        ami TEXT NOT NULL,
        depuis INTEGER NOT NULL,
        PRIMARY KEY (joueur, ami)
      );
    `);
  }

  async fetch(requete) {
    try {
      const { pathname } = new URL(requete.url);
      const corps = requete.method === "POST" ? await requete.json().catch(() => ({})) : {};
      const route = `${requete.method} ${pathname}`;

      if (route === "POST /api/compte") return enJson(await this.creerCompte(corps));

      const moi = await this.joueurConnecte(requete);
      switch (route) {
        case "GET /api/social": return enJson(this.etat(moi));
        case "POST /api/compte/pseudo": return enJson(this.changerPseudo(moi, corps));
        case "POST /api/demandes": return enJson(this.envoyerDemande(moi, corps));
        case "POST /api/demandes/accepter": return enJson(this.accepter(moi, corps));
        case "POST /api/demandes/refuser": return enJson(this.supprimerDemande(corps.id, moi.id));
        case "POST /api/demandes/annuler": return enJson(this.supprimerDemande(moi.id, corps.id));
        case "POST /api/amis/retirer": return enJson(this.retirerAmi(moi, corps));
        default: throw new ErreurJeu("Adresse inconnue.", 404);
      }
    } catch (erreur) {
      if (erreur instanceof ErreurJeu) return enJson({ erreur: erreur.message }, erreur.statut);
      console.error(erreur);
      return enJson({ erreur: "Le serveur a rencontré un problème." }, 500);
    }
  }

  // ── Comptes ──

  async joueurConnecte(requete) {
    const [id, jeton] = (requete.headers.get("Authorization") || "").replace(/^Bearer /, "").split(".");
    const joueur = id && jeton ? this.sql.exec("SELECT * FROM joueurs WHERE id = ?", id).toArray()[0] : null;
    if (!joueur || joueur.empreinte_jeton !== await empreinte(jeton)) {
      throw new ErreurJeu("Profil introuvable : crée ton profil depuis l'accueil.", 401);
    }
    return joueur;
  }

  // 4 chiffres au hasard, parmi ceux que personne n'a encore avec ce pseudo
  tagLibre(pseudoMin) {
    const pris = new Set(this.sql.exec("SELECT tag FROM joueurs WHERE pseudo_min = ?", pseudoMin).toArray().map(ligne => ligne.tag));
    if (pris.size >= NOMBRE_TAGS) throw new ErreurJeu("Ce pseudo est déjà pris par trop de joueurs, choisis-en un autre.");
    let tag;
    do tag = String(Math.floor(Math.random() * NOMBRE_TAGS)).padStart(4, "0");
    while (pris.has(tag));
    return tag;
  }

  async creerCompte(corps) {
    const pseudo = verifierPseudo(corps.pseudo);
    const pseudoMin = enMinuscules(pseudo);
    const id = crypto.randomUUID();
    const jeton = jetonAuHasard();
    const tag = this.tagLibre(pseudoMin);
    this.sql.exec(
      "INSERT INTO joueurs (id, empreinte_jeton, pseudo, pseudo_min, tag, cree) VALUES (?, ?, ?, ?, ?, ?)",
      id, await empreinte(jeton), pseudo, pseudoMin, tag, Date.now(),
    );
    return { id, jeton, pseudo, tag };
  }

  // Le # est gardé si personne d'autre n'a déjà le nouveau pseudo avec ces 4 chiffres
  changerPseudo(moi, corps) {
    const pseudo = verifierPseudo(corps.pseudo);
    const pseudoMin = enMinuscules(pseudo);
    const occupe = this.sql.exec("SELECT id FROM joueurs WHERE pseudo_min = ? AND tag = ? AND id != ?", pseudoMin, moi.tag, moi.id).toArray().length > 0;
    const tag = occupe ? this.tagLibre(pseudoMin) : moi.tag;
    this.sql.exec("UPDATE joueurs SET pseudo = ?, pseudo_min = ?, tag = ? WHERE id = ?", pseudo, pseudoMin, tag, moi.id);
    return { pseudo, tag };
  }

  // ── Amis ──

  joueursLies(requete, id) {
    return this.sql.exec(requete, id).toArray().map(({ id, pseudo, tag }) => ({ id, pseudo, tag }));
  }

  etat(moi) {
    return {
      moi: { pseudo: moi.pseudo, tag: moi.tag },
      amis: this.joueursLies("SELECT j.id, j.pseudo, j.tag FROM amis a JOIN joueurs j ON j.id = a.ami WHERE a.joueur = ? ORDER BY j.pseudo_min, j.tag", moi.id),
      recues: this.joueursLies("SELECT j.id, j.pseudo, j.tag FROM demandes d JOIN joueurs j ON j.id = d.de WHERE d.vers = ? ORDER BY d.cree DESC", moi.id),
      envoyees: this.joueursLies("SELECT j.id, j.pseudo, j.tag FROM demandes d JOIN joueurs j ON j.id = d.vers WHERE d.de = ? ORDER BY d.cree DESC", moi.id),
    };
  }

  sontAmis(a, b) {
    return this.sql.exec("SELECT 1 FROM amis WHERE joueur = ? AND ami = ?", a, b).toArray().length > 0;
  }

  demandeExiste(de, vers) {
    return this.sql.exec("SELECT 1 FROM demandes WHERE de = ? AND vers = ?", de, vers).toArray().length > 0;
  }

  devenirAmis(a, b) {
    const maintenant = Date.now();
    this.sql.exec("DELETE FROM demandes WHERE (de = ? AND vers = ?) OR (de = ? AND vers = ?)", a, b, b, a);
    this.sql.exec("INSERT OR IGNORE INTO amis (joueur, ami, depuis) VALUES (?, ?, ?), (?, ?, ?)", a, b, maintenant, b, a, maintenant);
  }

  // Recherche par « pseudo#1234 » (majuscules et minuscules confondues) puis demande d'ami.
  // Si l'autre joueur m'avait déjà fait une demande, nous devenons amis directement.
  envoyerDemande(moi, corps) {
    const morceaux = String(corps.cible ?? "").trim().normalize("NFC").match(/^(.+)#(\d{4})$/);
    if (!morceaux) throw new ErreurJeu("Écris le pseudo suivi du # et des 4 chiffres, par exemple Luffy#1234.");
    const cible = this.sql.exec("SELECT * FROM joueurs WHERE pseudo_min = ? AND tag = ?", enMinuscules(morceaux[1]), morceaux[2]).toArray()[0];
    if (!cible) throw new ErreurJeu("Aucun joueur ne s'appelle ainsi.", 404);
    if (cible.id === moi.id) throw new ErreurJeu("C'est ton propre profil !");
    if (this.sontAmis(moi.id, cible.id)) throw new ErreurJeu(`${cible.pseudo}#${cible.tag} est déjà ton ami.`);
    if (this.demandeExiste(moi.id, cible.id)) throw new ErreurJeu(`Tu as déjà envoyé une demande à ${cible.pseudo}#${cible.tag}.`);
    if (this.demandeExiste(cible.id, moi.id)) {
      this.devenirAmis(moi.id, cible.id);
      return { statut: "amis", joueur: { pseudo: cible.pseudo, tag: cible.tag } };
    }
    this.sql.exec("INSERT INTO demandes (de, vers, cree) VALUES (?, ?, ?)", moi.id, cible.id, Date.now());
    return { statut: "envoyee", joueur: { pseudo: cible.pseudo, tag: cible.tag } };
  }

  accepter(moi, corps) {
    const id = String(corps.id ?? "");
    if (!this.demandeExiste(id, moi.id)) throw new ErreurJeu("Cette demande n'existe plus.", 404);
    this.devenirAmis(moi.id, id);
    return { ok: true };
  }

  supprimerDemande(de, vers) {
    this.sql.exec("DELETE FROM demandes WHERE de = ? AND vers = ?", String(de ?? ""), String(vers ?? ""));
    return { ok: true };
  }

  retirerAmi(moi, corps) {
    this.sql.exec("DELETE FROM amis WHERE (joueur = ? AND ami = ?) OR (joueur = ? AND ami = ?)", moi.id, String(corps.id ?? ""), String(corps.id ?? ""), moi.id);
    return { ok: true };
  }
}
