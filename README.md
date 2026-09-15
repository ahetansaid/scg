# SCG – plateforme

Masterclasses, formations certifiantes, mentorat et publications pour
Strategic Consulting Group (Cotonou, Bénin).

Le socle visuel et les maquettes de référence sont dans
`../Charte-graphique-SCG.pdf`. Le système s'appelle **L'Arc**.

## Socle technique

| Couche    | Choix                                        |
| --------- | -------------------------------------------- |
| Front     | Next.js 16 (App Router, Turbopack), React 19 |
| Style     | Tailwind 4, tokens dans `app/globals.css`    |
| Données   | PostgreSQL 16 via Drizzle                     |
| Langage   | TypeScript strict                             |

## Démarrer

```bash
cp .env.example .env.local   # puis renseigner DATABASE_URL
npm run db:migrate           # applique drizzle/0000_*.sql
npm run dev
```

Il n'y a **pas de jeu de données de démonstration** : tout le contenu se crée
depuis le back-office. Pour ouvrir la première porte, créez un compte
administrateur en ligne de commande – c'est la seule voie, aucune route
publique ne peut fabriquer un compte privilégié :

```powershell
$env:SCG_EMAIL="vous@scg.bj"; $env:SCG_MOT_DE_PASSE="…"; $env:SCG_ROLE="admin"
npm run compte:creer
```

Les valeurs passent par l'environnement et non par des drapeaux : un mot de
passe en ligne de commande atterrit dans l'historique du shell et reste
visible dans la liste des processus.

### La base de développement

Le rôle applicatif est `scg`, **jamais `postgres`** : l'application ne doit
pas se connecter en superutilisateur. Pour la recréer depuis zéro :

```sql
create role scg with login password '…';
create database scg owner scg encoding 'UTF8';
```

`npm run db:seed` est idempotent sur l'offre pédagogique et **refuse de
s'exécuter si la base porte des inscriptions** – il vérifie avant de
supprimer quoi que ce soit.

## Scripts

| Commande              | Effet                                            |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Serveur de développement                          |
| `npm run build`       | Build de production                               |
| `npm run typecheck`   | `tsc --noEmit`                                    |
| `npm run lint`        | ESLint                                            |
| `npm run db:generate` | Génère une migration à partir de `lib/db/schema.ts` |
| `npm run db:migrate`  | Applique les migrations en attente                |
| `npm run db:studio`   | Explorateur de base Drizzle                       |
| `npm run compte:creer`| Crée un compte (voir « Démarrer »)                |

## Comment l'autorisation est tenue

`proxy.ts` redirige tôt vers la connexion, **mais ne protège rien** : il ne
voit pas les actions serveur. La vérification réelle est dans
`exigerUtilisateur` / `exigerRole`, appelés au début de **chaque page privée et
de chaque action**. Un rôle insuffisant renvoie un 404 plutôt qu'un 403 :
inutile de confirmer l'existence d'une page à qui n'y a pas droit.

Les règles métier – capacité d'une session, quota mensuel d'un mentor, plafond
de trois demandes ouvertes, cohérence des dates – sont vérifiées **à
l'écriture**, pas seulement affichées. Masquer un bouton ne protège pas une
action serveur, qui s'appelle directement.

## Les trois motifs

Ce ne sont pas des ornements : chaque dispositif porte une information que
l'on perdrait en le retirant. Ils vivent dans `components/motifs/`.

- **`Arc`** – la trajectoire. Porte les quatre pôles du cabinet dans le hero.
  `ArcTrajectoire` est la même courbe en jauge d'avancement pour l'espace
  membre. Les pastilles sont posées sur la cubique par le calcul, pas à l'œil.
- **`Cohorte`** – un carré, un siège. Remplace « il reste N places ». En
  back-office la même rangée se colore par statut de paiement. Porte toujours
  une alternative textuelle : le graphique n'est jamais la seule source.
- **`Ruban`** – le trimestre déplié sur douze colonnes, une par semaine. Les
  sessions sont placées par semaine de début et de fin, donc c'est la durée
  réelle qui dessine le bloc.

## Règles de couleur qui ne se négocient pas

- Le laiton clair `#C08A2E` en texte **uniquement sur fond nuit** (5,8:1).
  Sur papier c'est `#8A5F14` (5,0:1) – le clair y tombe à 2,7:1.
- Vert, laiton et terre sont réservés aux **statuts**. Jamais de décoration
  avec ces trois-là.
- Instrument Serif n'est chargée qu'en italique. Pas de romain.

## État

**Tout le produit lit et écrit dans Postgres.** Il n'y a aucune donnée en dur.

Livré : comptes et sessions (scrypt, jeton opaque en base, cookie httpOnly) ·
catalogue filtrable et fiches programmes · inscription à une session et suivi ·
espace membre avec arc de trajectoire, progression déduite des présences,
certificats vérifiables publiquement · mentorat complet (annuaire, créneaux,
demandes, fil d'échange, quotas) · publications et rapports chapitrés à
figures · opportunités et favoris · back-office pour tout créer.

**Le paiement est volontairement absent.** Une demande d'inscription part « en
attente » ; l'administration la confirme depuis le back-office après échange
sur les modalités. Les tables `paiements` et `certificats` existent déjà au
schéma : brancher un opérateur Mobile Money plus tard ne demandera pas de
migration.

**Ce qui manque encore** : l'envoi des e-mails (convocations, reçus, relances)
et le PDF des certificats – la page de vérification, elle, fonctionne.
