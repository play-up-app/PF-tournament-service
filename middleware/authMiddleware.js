import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)


export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token d\'authentification requis',
                data: null
            })
        }
        
        // TODO: Intégrer avec le auth-service pour vérifier le token
        // Pour l'instant, simulation simple pour le MVP
        req.user = {
            id: 'user-123',
            email: 'test@example.com',
            role: 'organisateur',
            display_name: 'Test User'
        }
        
        next()
    } catch (error) {
        console.error('Auth error:', error)
        res.status(401).json({
            success: false,
            message: 'Token invalide',
            data: null
        })
    }
}

/**
 * Middleware pour vérifier les rôles autorisés
 */
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise',
                data: null
            })
        }
        
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Rôle requis: ${roles.join(' ou ')}. Votre rôle: ${req.user.role}`,
                data: null
            })
        }
        
        next()
    }
}

/**
 * Middleware pour vérifier la propriété d'un tournoi (version simple)
 */
export const requireTournamentOwner = (req, res, next) => {
    // Pour le MVP, on fait confiance aux rôles
    // TODO: Vérifier en base de données plus tard
    if (req.user.role === 'admin' || req.user.role === 'organisateur') {
        return next()
    }
    
    res.status(403).json({
        success: false,
        message: 'Accès refusé - Propriétaire du tournoi requis',
        data: null
    })
}

// Middlewares spécialisés
export const requireAuth = authenticateToken
export const requireOrganisateur = authorizeRole(['organisateur', 'admin'])
export const requireJoueur = authorizeRole(['joueur', 'organisateur', 'admin'])
export const requireSpectateur = authorizeRole(['spectateur', 'joueur', 'organisateur', 'admin']) 