# APRDR — Gestion de cohorte · MC LIVE TECH

Application web de gestion des étudiants du centre de formation **MC LIVE TECH** (programme APRDR, Yaoundé) : inscription, suivi des frais, bulletins pondérés, cartes d'étudiant et certificats.

## Fonctionnalités

- **Inscription** avec identifiant unique généré automatiquement (`MLT-26-A-0001`)
- **Fiches étudiants** : piste, groupe, cycle, statut, frais, parent/tuteur, portfolio
- **Liste filtrable** : recherche (nom, ID, téléphone), filtres piste / groupe / statut
- **Bulletin pondéré** : livrables hebdo 30 % · mi-parcours 20 % · capstone 40 % · assiduité 10 %, bandes (haute distinction → insuffisant)
- **Éligibilité au certificat** : participation ≥ 80 % et note ≥ 60
- **Documents imprimables** : carte d'étudiant, bulletin, certificat (PDF via le navigateur)
- **Réalisations** : badges, awards, certificats délivrés aux étudiants
- **Tableau de bord** : effectifs, frais perçus / solde, répartition par filière, infos du centre
- **Export JSON** de toutes les données (`/api/export`)

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 · Vite 8 · Tailwind CSS 4 |
| Backend | Hono (`@hono/node-server`) |
| Base de données | SQLite via `node:sqlite` (zéro configuration) |
| Monorepo | pnpm workspaces |

## Structure

```
├── web/          # Frontend React (src/pages, src/components, src/lib)
├── server/       # API Hono + SQLite (src/index.js, src/db.js)
└── pnpm-workspace.yaml
```

## Démarrage

```bash
pnpm install
pnpm dev          # serveur API :8787 + Vite :5173
```

Production :

```bash
pnpm build        # build du frontend dans web/dist
pnpm start        # le serveur sert l'API et le frontend sur :8787
```

La base (`server/data/aprdr.db`) est créée automatiquement au premier lancement.

## Déploiement

Un blueprint [Render](https://render.com) est fourni (`render.yaml`) : sur Render, **New → Blueprint** → connecter ce dépôt, le build et le démarrage sont automatiques.

> ⚠️ SQLite est stocké sur le disque du service : sur un plan gratuit, les données sont perdues à chaque redéploiement. Pour la production, monter un volume ou migrer vers PostgreSQL.

## Licence

MIT — voir [LICENSE](LICENSE).
