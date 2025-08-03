// index.js - Service de gestion des tournois
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import tournamentRoutes from './routes/tournament.route.js'
import { dateTimeNormalizer } from './middleware/dateTimeNormalizer.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Middleware pour normaliser automatiquement les dates/heures
app.use(dateTimeNormalizer)

// Route de santé pour Docker
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Tournament service is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// Routes
app.use('/api/tournaments', tournamentRoutes)

// Route par défaut
app.get('/', (req, res) => {
    res.json({
        message: 'Tournament Service API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            tournaments: '/api/tournaments'
        }
    })
})

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        data: null
    })
})

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tournament Service démarré sur le port ${PORT}`)
    console.log(`📊 Health check disponible sur http://localhost:${PORT}/health`)
    console.log(`🏆 API disponible sur http://localhost:${PORT}/api/tournaments`)
})
