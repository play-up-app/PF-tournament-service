import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import tournamentRoutes from './routes/tournament.route.js'
import { dateTimeNormalizer } from './middleware/dateTimeNormalizer.js'
import { 
    requestLogger, 
    logError,
    logInfo 
} from './config/logger.js'
import { simpleHealthCheck, detailedHealthCheck } from './middleware/healthCheck.js'
import corsOptions from './config/cors.js'
import helmetOptions from './config/helmet.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors(corsOptions))
// Configuration de Helmet
app.use(helmet(helmetOptions))

app.use(express.json({
    limit: '10kb' // Limite la taille des requêtes JSON
}))
app.use(express.urlencoded({ 
    extended: true,
    limit: '10kb' // Limite la taille des données de formulaire
}))
app.use(cookieParser())

// Logger pour les requêtes HTTP
app.use(requestLogger)

// Middleware pour normaliser automatiquement les dates/heures
app.use(dateTimeNormalizer)

// Health checks
app.get('/health', simpleHealthCheck);
app.get('/health/detailed', detailedHealthCheck);

// Routes
app.use('/api/tournament', tournamentRoutes)

// Route par défaut
app.get('/', (req, res) => {
    res.json({
        message: 'Tournament Service API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            tournaments: '/api/tournament'
        }
    })
})

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
    // Log l'erreur
    logError(error, {
        url: req.url,
        method: req.method,
        body: req.body,
        user: req.user?.id
    });
    
    // Erreur de validation Prisma
    if (error.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Conflit de données - cette ressource existe déjà',
            details: error.meta
        });
    }
    
    // Erreur de contrainte de clé étrangère Prisma
    if (error.code === 'P2003') {
        return res.status(400).json({
            success: false,
            message: 'Référence invalide - ressource liée non trouvée'
        });
    }
    
    // Erreur de parsing JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            success: false,
            message: 'Format JSON invalide'
        });
    }
    
    // Erreur générique
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        data: null
    });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    logInfo('Serveur démarré', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
});