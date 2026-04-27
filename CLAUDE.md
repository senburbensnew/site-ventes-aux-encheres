# CLAUDE.md — Ventes aux Enchères

## Présentation du projet

Plateforme d'enchères en temps réel. Les enchères sont publiques en lecture ; créer une enchère ou placer une offre exige d'être authentifié.

**Stack** : Next.js 16 (App Router) + Node.js/Express + Socket.io + SQLite + Docker Compose.

---

## Lancer l'application

```bash
docker compose up --build   # première fois
docker compose up           # les fois suivantes
```

Services exposés :
- Frontend : http://localhost:3000
- API + WebSocket : http://localhost:8000

Reset complet :
```bash
docker compose down && docker compose up --build
```

Développement local sans Docker :
```bash
# Terminal 1
cd backend && npm install && node src/server.js

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## Structure critique

```
backend/
  src/server.js             # Express + Socket.io, port 8000
  src/db.js                 # SQLite (better-sqlite3), migrations inline au démarrage
  src/middleware/auth.js    # Bearer token → req.user
  src/routes/auth.js        # POST /api/register|login|logout, GET /api/me
  src/routes/auctions.js    # GET /api/auctions, GET /api/auctions/:id, POST /api/auctions
  src/routes/bids.js        # GET|POST /api/auctions/:id/bids → émet socket BidPlaced

frontend/
  app/                      # Next.js App Router (server components par défaut)
  components/               # Tous "use client"
  context/AuthContext.tsx   # Token Bearer stocké dans localStorage
  lib/api.ts                # Axios, injecte Authorization: Bearer <token>
  lib/socket.ts             # Socket.io singleton client
```

---

## Schéma de la base de données

```sql
users        (id, name, email, password, created_at, updated_at)
tokens       (id, user_id, token, created_at)          -- Bearer tokens
auctions     (id, user_id, title, description, image_url, start_price, current_price, status, end_at, created_at, updated_at)
bids         (id, auction_id, user_id, amount, created_at)
```

`status` peut être : `pending` | `active` | `ended`

---

## Conventions de code

### Frontend
- **Server components** par défaut dans `app/` ; ajouter `'use client'` uniquement si besoin de hooks ou d'interactivité.
- **Fetch côté serveur** avec `cache: 'no-store'` pour les données temps réel.
- **Couleur primaire** : `#ee4d2d` (Shopee orange). La classe Tailwind canonique est `text-shopee-orange` / `bg-shopee-orange`.
- Formatage des prix toujours via `toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })`.
- Pas de `useEffect` pour les appels API — utiliser les server components ou SWR si besoin de revalidation client.

### Backend
- **Auth** : Bearer token dans `Authorization` header, vérifié par `src/middleware/auth.js`.
- **WebSocket** : après chaque offre, `BidPlaced` est émis sur la salle `auction-{id}` via `io.to(room).emit(...)`. L'instance `io` est accessible via `req.app.get('io')`.
- **Validation** directement dans les routes (pas de librairie de validation externe).
- **Base de données** : SQLite via `better-sqlite3`. Toutes les requêtes sont synchrones. Les transactions utilisent `db.transaction(fn)()`.
- **Pas de volumes Docker** : les données SQLite sont dans le conteneur et sont éphémères.

---

## Flux d'une enchère en temps réel

1. Un utilisateur charge `/auctions/{id}` → le server component fetch les données initiales via `GET /api/auctions/:id`.
2. `AuctionDetailClient` s'hydrate côté client, `BidHistory` émet `join` sur le socket avec l'`auctionId`.
3. Un autre utilisateur soumet `BidForm` → `POST /api/auctions/{id}/bids`.
4. Le backend valide dans une transaction SQLite, crée le `bid`, met à jour `current_price`, émet `BidPlaced` sur la salle socket.io.
5. `BidHistory` reçoit `BidPlaced`, met à jour l'état React → l'UI reflète le nouveau prix sans rechargement.

---

## Tâches communes

### Ajouter un champ à auctions
1. Modifier `CREATE TABLE auctions` dans `backend/src/db.js`
2. Ajouter le champ dans les INSERT/SELECT des routes concernées
3. Mettre à jour `types/index.ts` dans le frontend
4. Relancer : `docker compose down && docker compose up --build`

### Ajouter un endpoint API
1. Ajouter la route dans le fichier de routes concerné sous `backend/src/routes/`
2. Monter la route dans `backend/src/server.js` si nouveau fichier
3. Ajouter la méthode dans `frontend/lib/api.ts` si nécessaire

### Ajouter une page frontend
1. Créer `frontend/app/<nom>/page.tsx` (server component par défaut)
2. Si interactif, extraire la logique dans un `<Nom>Client.tsx` avec `'use client'`

### Modifier les styles
- Toujours utiliser Tailwind v4 ; les custom tokens sont dans `globals.css` sous `@theme inline`
- Couleur principale `#ee4d2d` = `shopee-orange` dans Tailwind

---

## Points d'attention

- **CORS** : configuré dans `server.js` avec `cors({ origin: '*' })`. Restreindre en production.
- **SQLite éphémère** : pas de volume Docker — les données sont perdues au redémarrage du conteneur. Acceptable en dev ; en production, monter un volume ou migrer vers PostgreSQL.
- **better-sqlite3** nécessite des outils de compilation natifs (`python3`, `make`, `g++`). Ils sont installés dans le stage `deps` du Dockerfile backend.
- **Variables d'environnement frontend** : `NEXT_PUBLIC_*` sont baked in au moment du `next build`. Elles sont passées comme `ARG` dans le Dockerfile et comme `environment` dans docker-compose.
- **Socket.io en production** : configurer `cors` avec l'URL du domaine public et activer `https`/`wss`.
