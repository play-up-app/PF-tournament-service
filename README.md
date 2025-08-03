# Tournament Service

Service de gestion des tournois pour l'application de volleyball.

## 🚀 Installation

### Installation locale
```bash
npm install
npm run dev
```

## 📊 Health Check

- **URL**: `http://localhost:3001/health`
- **Response**: Status de l'application et métriques

## 🏆 API

- **Base URL**: `http://localhost:3001/api/tournaments`
- **Documentation**: Voir section API ci-dessous

### Routes disponibles

#### Publiques
- `GET /` - Liste des tournois
- `GET /:tournamentId` - Détails d'un tournoi  
- `GET /:tournamentId/teams` - Équipes d'un tournoi

#### Protégées (auth requise)
- `POST /organizer/:organizerId` - Créer un tournoi
- `PATCH /:tournamentId` - Modifier un tournoi
- `DELETE /:tournamentId` - Supprimer un tournoi
- `PATCH /:tournamentId/draft` - Brouillon un tournoi
- `PATCH /:tournamentId/publish` - Publier un tournoi
- `PATCH /:tournamentId/start` - Démarrer un tournoi
- `PATCH /:tournamentId/finish` - Terminer un tournoi
- `PATCH /:tournamentId/cancel` - Annuler un tournoi

## 🧪 Tests

```bash
# Tous les tests
npm test
```

## 🔧 Configuration

### Variables d'environnement

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/tournament_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 📝 Architecture

```
tournament-service/
├── controllers/     # Logique de contrôle
├── config/          # Configuration connexion bd
├── repositories/    # Accès aux données
├── routes/          # Routes Express
├── middleware/      # Middlewares d'auth
├── tests/           # Tests unitaires
└── prisma/          # Schema base de données
```

## 🏗️ Développement

### Local
```bash
npm run dev
```

### Structure du code
- **Clean Architecture** avec séparation des couches
- **Repository Pattern** pour l'accès aux données  
- **Dependency Injection** dans les contrôleurs
- **Middleware** d'authentification modulaire

## 🐛 Debug

### Debugging local
```bash
DEBUG=* npm run dev
```

### Health checks
- Application: `http://localhost:3000/health`
- Database: Via Prisma connection

