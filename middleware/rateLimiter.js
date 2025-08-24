import rateLimit from 'express-rate-limit';

// Limiteur global pour toutes les routes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});

// Limiteur pour la création de tournois
export const createTournamentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // Limite chaque IP à 5 créations de tournoi par heure
  message: 'Trop de tentatives de création de tournoi depuis cette IP, veuillez réessayer dans une heure.'
});

// Limiteur pour les inscriptions aux tournois
export const tournamentRegistrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Limite chaque IP à 10 inscriptions par heure
  message: 'Trop de tentatives d\'inscription aux tournois depuis cette IP, veuillez réessayer dans une heure.'
});

// Limiteur pour les mises à jour de tournoi
export const updateTournamentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite chaque IP à 20 mises à jour par fenêtre
  message: 'Trop de tentatives de mise à jour depuis cette IP, veuillez réessayer plus tard.'
});
