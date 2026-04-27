# 🔨 Ventes aux Enchères

Plateforme d'enchères en temps réel inspirée de Shopee / Lazada / Tiki.  
Les enchères sont **live** — les offres s'affichent instantanément sans recharger la page grâce à Socket.io.

---

## Stack technique

| Couche          | Technologie                                      |
|-----------------|--------------------------------------------------|
| Frontend        | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend         | Node.js 20, Express 4                            |
| Base de données | SQLite via `better-sqlite3`                      |
| Auth            | Bearer tokens (crypto.randomBytes) en SQLite     |
| WebSockets      | Socket.io intégré au backend                     |
| Conteneurs      | Docker + Docker Compose (multistage, sans volumes)|

---

## Démarrage rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### Lancer l'application

```bash
# Cloner le projet
git clone <url-du-repo>
cd ventes-aux-encheres

# Démarrer tous les services (premier lancement)
docker compose up --build

# Les fois suivantes
docker compose up
```

L'application est disponible sur :

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000      |
| API      | http://localhost:8000/api  |
| Sockets  | ws://localhost:8000        |

> **Note :** Les données SQLite sont stockées dans le conteneur et réinitialisées à chaque `docker compose up --build`. Il n'y a pas de volume persistant — c'est voulu.

### Arrêter

```bash
docker compose down
```

---

## Architecture

```
ventes-aux-encheres/
├── backend/                    # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── server.js           # Point d'entrée : Express + Socket.io
│   │   ├── db.js               # SQLite (better-sqlite3) + migrations inline
│   │   ├── middleware/
│   │   │   └── auth.js         # Vérification Bearer token
│   │   └── routes/
│   │       ├── auth.js         # register / login / logout / me
│   │       ├── auctions.js     # CRUD enchères
│   │       └── bids.js         # Offres + broadcast socket.io
│   ├── package.json
│   └── Dockerfile              # Multistage (deps → runner)
│
├── frontend/                   # Next.js 16 App Router
│   ├── app/
│   │   ├── page.tsx            # Homepage — liste des enchères
│   │   ├── layout.tsx          # Layout global (Navbar, AuthProvider)
│   │   ├── auctions/
│   │   │   ├── [id]/           # Page détail enchère
│   │   │   └── create/         # Formulaire de création
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── Navbar.tsx          # Barre de navigation orange (Shopee-style)
│   │   ├── AuctionCard.tsx     # Card produit avec timer et badge Live
│   │   ├── CountdownTimer.tsx  # Timer blocs flash-sale
│   │   ├── BidForm.tsx         # Formulaire d'enchère + boutons rapides
│   │   └── BidHistory.tsx      # Historique live (socket.io)
│   ├── context/
│   │   └── AuthContext.tsx     # Auth globale (token Bearer)
│   ├── lib/
│   │   ├── api.ts              # Axios configuré
│   │   └── socket.ts           # Socket.io singleton client
│   ├── next.config.ts          # output: standalone
│   └── Dockerfile              # Multistage (deps → build → runner)
│
└── docker-compose.yml          # 2 services : backend + frontend (sans volumes)
```

---

## API REST

### Authentification

| Méthode | Endpoint        | Auth | Description              |
|---------|-----------------|------|--------------------------|
| POST    | `/api/register` | —    | Créer un compte           |
| POST    | `/api/login`    | —    | Connexion → Bearer token  |
| POST    | `/api/logout`   | ✓    | Déconnexion               |
| GET     | `/api/me`       | ✓    | Profil utilisateur        |

### Enchères

| Méthode | Endpoint                    | Auth | Description               |
|---------|-----------------------------|------|---------------------------|
| GET     | `/api/auctions`             | —    | Liste toutes les enchères  |
| GET     | `/api/auctions/:id`         | —    | Détail + historique offres |
| POST    | `/api/auctions`             | ✓    | Créer une enchère          |
| GET     | `/api/auctions/:id/bids`    | —    | Historique des offres      |
| POST    | `/api/auctions/:id/bids`    | ✓    | Placer une offre           |

### Exemple

```bash
# Inscription
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'

# Réponse : { "user": {...}, "token": "abc123..." }

# Créer une enchère
curl -X POST http://localhost:8000/api/auctions \
  -H "Authorization: Bearer abc123..." \
  -H "Content-Type: application/json" \
  -d '{"title":"MacBook Pro","start_price":500,"end_at":"2026-06-01T20:00:00"}'
```

---

## WebSockets (temps réel)

Le client émet `join` avec l'`auctionId` pour rejoindre la salle.  
Le serveur émet `BidPlaced` à tous les membres de la salle à chaque nouvelle offre.

| Événement  | Direction        | Payload                                                       |
|------------|------------------|---------------------------------------------------------------|
| `join`     | client → serveur | `auctionId` (number)                                          |
| `BidPlaced`| serveur → salle  | `{ bid_id, amount, bidder_name, current_price, created_at }` |

Salle socket.io : `auction-{id}`

---

## Variables d'environnement

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

Ces variables sont aussi passées comme `ARG` dans le `Dockerfile` frontend au moment du `build`.

---

## Développement sans Docker

```bash
# Backend
cd backend
npm install
node src/server.js          # port 8000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev                 # port 3000
```
