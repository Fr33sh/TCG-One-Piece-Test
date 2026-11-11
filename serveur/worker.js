// Serveur du jeu (Cloudflare Worker). Cloudflare sert lui-même les fichiers du jeu ; ce Worker ne répond
// qu'aux adresses /api/… : connexion avec Discord, compte (pseudo#1234), sauvegarde en ligne et amis.
// Toutes les données sont gardées dans un seul Durable Object « Social », avec sa propre base SQLite.
//
// Un compte est lié à un compte Discord. À chaque connexion Discord, le serveur remet au navigateur une
// session (identifiant de compte + jeton secret) ; il n'en garde qu'une empreinte. Chaque demande présente
// cette session dans l'en-tête « Authorization: Bearer id.jeton ».
//
// Réglages à faire dans Cloudflare (Worker → Paramètres → Variables et secrets), type « Secret » :
// DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET, ceux de l'application Discord du jeu.

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
const TAILLE_MAX_SAUVEGARDE = 200000; // caractères
const COOKIE_ETAT = "discord_etat";

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

const redirection = (adresse, entetes = {}) => new Response(null, { status: 302, headers: { Location: adresse, ...entetes } });

function verifierPseudo(pseudo) {
  const propre = String(pseudo ?? "").trim().normalize("NFC");
  if (!PSEUDO_VALIDE.test(propre)) {
    throw new ErreurJeu("Le pseudo doit faire de 3 à 16 caractères : lettres, chiffres, « _ » ou « - », sans espace.");
  }
  return propre;
}

const enMinuscules = pseudo => pseudo.toLocaleLowerCase("fr");

const enHexadecimal = octets => [...new Uint8Array(octets)].map(octet => octet.toString(16).padStart(2, "0")).join("");

async function empreinte(texte) {
  return enHexadecimal(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte)));
}

const auHasard = () => enHexadecimal(crypto.getRandomValues(new Uint8Array(32)));

function lireCookie(requete, nom) {
  const trouve = (requete.headers.get("Cookie") || "").split(";").map(morceau => morceau.trim().split("=")).find(([cle]) => cle === nom);
  return trouve ? trouve[1] : null;
}

export class Social extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS comptes (
        id TEXT PRIMARY KEY,
        discord_id TEXT NOT NULL UNIQUE,
        discord_nom TEXT,
        pseudo TEXT,
        pseudo_min TEXT,
        tag TEXT,
        sauvegarde TEXT,
        sauvegarde_maj INTEGER,
        cree INTEGER NOT NULL,
        UNIQUE (pseudo_min, tag)
      );
      CREATE TABLE IF NOT EXISTS sessions (
        empreinte TEXT PRIMARY KEY,
        compte TEXT NOT NULL,
        cree INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS demandes_amis (
        de TEXT NOT NULL,
        vers TEXT NOT NULL,
        cree INTEGER NOT NULL,
        PRIMARY KEY (de, vers)
      );
      CREATE INDEX IF NOT EXISTS demandes_amis_vers ON demandes_amis (vers);
      CREATE TABLE IF NOT EXISTS amities (
        joueur TEXT NOT NULL,
        ami TEXT NOT NULL,
        depuis INTEGER NOT NULL,
        PRIMARY KEY (joueur, ami)
      );
    `);
  }

  async fetch(requete) {
    const url = new URL(requete.url);
    const route = `${requete.method} ${url.pathname}`;

    // Connexion Discord : pages ouvertes par le navigateur, qui finissent par un retour au jeu
    if (route === "GET /api/discord/connexion") return this.allerSurDiscord(url);
    if (route === "GET /api/discord/retour") return this.retourDeDiscord(requete, url);

    try {
      const corps = requete.method === "POST" ? await requete.json().catch(() => ({})) : {};
      const moi = await this.compteConnecte(requete);
      switch (route) {
        case "GET /api/compte": return enJson(this.decrireCompte(moi));
        case "POST /api/compte/pseudo": return enJson(this.choisirPseudo(moi, corps));
        case "GET /api/sauvegarde": return enJson(this.lireSauvegarde(moi));
        case "POST /api/sauvegarde": return enJson(this.ecrireSauvegarde(moi, corps));
      }

      // Les amis demandent un pseudo
      if (!moi.pseudo) throw new ErreurJeu("Choisis d'abord ton pseudo dans ton profil.", 403);
      switch (route) {
        case "GET /api/social": return enJson(this.etat(moi));
        case "POST /api/demandes": return enJson(this.envoyerDemande(moi, corps));
        case "POST /api/demandes/accepter": return enJson(this.accepter(moi, corps));
        case "POST /api/demandes/refuser": return enJson(this.supprimerDemande(String(corps.id ?? ""), moi.id));
        case "POST /api/demandes/annuler": return enJson(this.supprimerDemande(moi.id, String(corps.id ?? "")));
        case "POST /api/amis/retirer": return enJson(this.retirerAmi(moi, corps));
        default: throw new ErreurJeu("Adresse inconnue.", 404);
      }
    } catch (erreur) {
      if (erreur instanceof ErreurJeu) return enJson({ erreur: erreur.message }, erreur.statut);
      console.error(erreur);
      return enJson({ erreur: "Le serveur a rencontré un problème." }, 500);
    }
  }

  // ── Connexion avec Discord ──

  // Le joueur est envoyé sur Discord pour accepter ; un code « état » au hasard, gardé dans un cookie,
  // garantit au retour que c'est bien lui qui a commencé la connexion
  allerSurDiscord(url) {
    if (!this.env.DISCORD_CLIENT_ID || !this.env.DISCORD_CLIENT_SECRET) {
      return redirection(`/#discord-erreur=${encodeURIComponent("La connexion Discord n'est pas encore configurée.")}`);
    }
    const etat = auHasard();
    const adresse = new URL("https://discord.com/oauth2/authorize");
    adresse.search = new URLSearchParams({
      response_type: "code",
      client_id: this.env.DISCORD_CLIENT_ID,
      scope: "identify",
      redirect_uri: `${url.origin}/api/discord/retour`,
      state: etat,
    });
    return redirection(adresse.toString(), {
      "Set-Cookie": `${COOKIE_ETAT}=${etat}; Path=/api/discord; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    });
  }

  async retourDeDiscord(requete, url) {
    const effacerCookie = { "Set-Cookie": `${COOKIE_ETAT}=; Path=/api/discord; HttpOnly; Secure; SameSite=Lax; Max-Age=0` };
    const echec = message => redirection(`/#discord-erreur=${encodeURIComponent(message)}`, effacerCookie);
    try {
      if (url.searchParams.get("error")) return echec("Connexion Discord annulée.");
      const code = url.searchParams.get("code");
      const etat = url.searchParams.get("state");
      if (!code || !etat || etat !== lireCookie(requete, COOKIE_ETAT)) return echec("La connexion Discord a expiré, réessaie.");

      // Le code donné par Discord s'échange contre un accès, qui permet de lire l'identité du joueur
      const reponseJeton = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${url.origin}/api/discord/retour`,
          client_id: this.env.DISCORD_CLIENT_ID,
          client_secret: this.env.DISCORD_CLIENT_SECRET,
        }),
      });
      if (!reponseJeton.ok) return echec("Discord a refusé la connexion, réessaie.");
      const { access_token: acces } = await reponseJeton.json();
      const reponseIdentite = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${acces}` } });
      if (!reponseIdentite.ok) return echec("Impossible de lire ton compte Discord, réessaie.");
      const discord = await reponseIdentite.json();

      // Compte existant (même compte Discord) ou nouveau compte, sans pseudo pour l'instant
      const nomDiscord = discord.global_name || discord.username || "";
      let compte = this.sql.exec("SELECT id FROM comptes WHERE discord_id = ?", discord.id).toArray()[0];
      if (compte) {
        this.sql.exec("UPDATE comptes SET discord_nom = ? WHERE id = ?", nomDiscord, compte.id);
      } else {
        compte = { id: crypto.randomUUID() };
        this.sql.exec("INSERT INTO comptes (id, discord_id, discord_nom, cree) VALUES (?, ?, ?, ?)", compte.id, discord.id, nomDiscord, Date.now());
      }
      const jeton = auHasard();
      this.sql.exec("INSERT INTO sessions (empreinte, compte, cree) VALUES (?, ?, ?)", await empreinte(jeton), compte.id, Date.now());

      // La session est rendue au jeu dans la partie « # » de l'adresse, qui n'est jamais envoyée aux serveurs
      return redirection(`/#discord-session=${compte.id}.${jeton}`, effacerCookie);
    } catch (erreur) {
      console.error(erreur);
      return echec("La connexion Discord a échoué, réessaie.");
    }
  }

  // ── Compte ──

  async compteConnecte(requete) {
    const [id, jeton] = (requete.headers.get("Authorization") || "").replace(/^Bearer /, "").split(".");
    const session = id && jeton
      ? this.sql.exec("SELECT compte FROM sessions WHERE empreinte = ?", await empreinte(jeton)).toArray()[0]
      : null;
    const compte = session?.compte === id ? this.sql.exec("SELECT * FROM comptes WHERE id = ?", id).toArray()[0] : null;
    if (!compte) throw new ErreurJeu("Compte introuvable : connecte-toi avec Discord depuis ton profil.", 401);
    return compte;
  }

  decrireCompte(moi) {
    return { pseudo: moi.pseudo, tag: moi.tag, discord: moi.discord_nom };
  }

  // 4 chiffres au hasard, parmi ceux que personne n'a encore avec ce pseudo
  tagLibre(pseudoMin) {
    const pris = new Set(this.sql.exec("SELECT tag FROM comptes WHERE pseudo_min = ?", pseudoMin).toArray().map(ligne => ligne.tag));
    if (pris.size >= NOMBRE_TAGS) throw new ErreurJeu("Ce pseudo est déjà pris par trop de joueurs, choisis-en un autre.");
    let tag;
    do tag = String(Math.floor(Math.random() * NOMBRE_TAGS)).padStart(4, "0");
    while (pris.has(tag));
    return tag;
  }

  // Premier pseudo ou changement : le # est gardé si personne d'autre n'a le nouveau pseudo avec ces chiffres
  choisirPseudo(moi, corps) {
    const pseudo = verifierPseudo(corps.pseudo);
    const pseudoMin = enMinuscules(pseudo);
    const occupe = !moi.tag || this.sql.exec("SELECT 1 FROM comptes WHERE pseudo_min = ? AND tag = ? AND id != ?", pseudoMin, moi.tag, moi.id).toArray().length > 0;
    const tag = occupe ? this.tagLibre(pseudoMin) : moi.tag;
    this.sql.exec("UPDATE comptes SET pseudo = ?, pseudo_min = ?, tag = ? WHERE id = ?", pseudo, pseudoMin, tag, moi.id);
    return { pseudo, tag };
  }

  // ── Sauvegarde en ligne (collection, boosters, réglages…) ──

  lireSauvegarde(moi) {
    return { donnees: moi.sauvegarde ? JSON.parse(moi.sauvegarde) : null, maj: moi.sauvegarde_maj };
  }

  ecrireSauvegarde(moi, corps) {
    const texte = JSON.stringify(corps.donnees ?? null);
    if (!corps.donnees || typeof corps.donnees !== "object") throw new ErreurJeu("Sauvegarde vide.");
    if (texte.length > TAILLE_MAX_SAUVEGARDE) throw new ErreurJeu("Sauvegarde trop grosse.", 413);
    const maj = Date.now();
    this.sql.exec("UPDATE comptes SET sauvegarde = ?, sauvegarde_maj = ? WHERE id = ?", texte, maj, moi.id);
    return { maj };
  }

  // ── Amis ──

  comptesLies(requete, id) {
    return this.sql.exec(requete, id).toArray().map(({ id, pseudo, tag }) => ({ id, pseudo, tag }));
  }

  etat(moi) {
    return {
      moi: { pseudo: moi.pseudo, tag: moi.tag },
      amis: this.comptesLies("SELECT c.id, c.pseudo, c.tag FROM amities a JOIN comptes c ON c.id = a.ami WHERE a.joueur = ? ORDER BY c.pseudo_min, c.tag", moi.id),
      recues: this.comptesLies("SELECT c.id, c.pseudo, c.tag FROM demandes_amis d JOIN comptes c ON c.id = d.de WHERE d.vers = ? ORDER BY d.cree DESC", moi.id),
      envoyees: this.comptesLies("SELECT c.id, c.pseudo, c.tag FROM demandes_amis d JOIN comptes c ON c.id = d.vers WHERE d.de = ? ORDER BY d.cree DESC", moi.id),
    };
  }

  sontAmis(a, b) {
    return this.sql.exec("SELECT 1 FROM amities WHERE joueur = ? AND ami = ?", a, b).toArray().length > 0;
  }

  demandeExiste(de, vers) {
    return this.sql.exec("SELECT 1 FROM demandes_amis WHERE de = ? AND vers = ?", de, vers).toArray().length > 0;
  }

  devenirAmis(a, b) {
    const maintenant = Date.now();
    this.sql.exec("DELETE FROM demandes_amis WHERE (de = ? AND vers = ?) OR (de = ? AND vers = ?)", a, b, b, a);
    this.sql.exec("INSERT OR IGNORE INTO amities (joueur, ami, depuis) VALUES (?, ?, ?), (?, ?, ?)", a, b, maintenant, b, a, maintenant);
  }

  // Recherche par « pseudo#1234 » (majuscules et minuscules confondues) puis demande d'ami.
  // Si l'autre joueur m'avait déjà fait une demande, nous devenons amis directement.
  envoyerDemande(moi, corps) {
    const morceaux = String(corps.cible ?? "").trim().normalize("NFC").match(/^(.+)#(\d{4})$/);
    if (!morceaux) throw new ErreurJeu("Écris le pseudo suivi du # et des 4 chiffres, par exemple Luffy#1234.");
    const cible = this.sql.exec("SELECT * FROM comptes WHERE pseudo_min = ? AND tag = ?", enMinuscules(morceaux[1]), morceaux[2]).toArray()[0];
    if (!cible) throw new ErreurJeu("Aucun joueur ne s'appelle ainsi.", 404);
    if (cible.id === moi.id) throw new ErreurJeu("C'est ton propre profil !");
    if (this.sontAmis(moi.id, cible.id)) throw new ErreurJeu(`${cible.pseudo}#${cible.tag} est déjà ton ami.`);
    if (this.demandeExiste(moi.id, cible.id)) throw new ErreurJeu(`Tu as déjà envoyé une demande à ${cible.pseudo}#${cible.tag}.`);
    if (this.demandeExiste(cible.id, moi.id)) {
      this.devenirAmis(moi.id, cible.id);
      return { statut: "amis", joueur: { pseudo: cible.pseudo, tag: cible.tag } };
    }
    this.sql.exec("INSERT INTO demandes_amis (de, vers, cree) VALUES (?, ?, ?)", moi.id, cible.id, Date.now());
    return { statut: "envoyee", joueur: { pseudo: cible.pseudo, tag: cible.tag } };
  }

  accepter(moi, corps) {
    const id = String(corps.id ?? "");
    if (!this.demandeExiste(id, moi.id)) throw new ErreurJeu("Cette demande n'existe plus.", 404);
    this.devenirAmis(moi.id, id);
    return { ok: true };
  }

  supprimerDemande(de, vers) {
    this.sql.exec("DELETE FROM demandes_amis WHERE de = ? AND vers = ?", de, vers);
    return { ok: true };
  }

  retirerAmi(moi, corps) {
    const id = String(corps.id ?? "");
    this.sql.exec("DELETE FROM amities WHERE (joueur = ? AND ami = ?) OR (joueur = ? AND ami = ?)", moi.id, id, id, moi.id);
    return { ok: true };
  }
}
