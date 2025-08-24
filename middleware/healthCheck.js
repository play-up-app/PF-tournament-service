import { prismaClient } from '../config/prisma.js';
import { logError, logInfo } from '../config/logger.js';

// Fonction pour vérifier la connexion à la base de données
const checkDatabase = async () => {
  try {
    await prismaClient.$queryRaw`SELECT 1`;
    return { status: 'up', responseTime: 0 }; // Le temps de réponse sera ajouté plus tard
  } catch (error) {
    logError('Erreur de connexion à la base de données', { error: error.message });
    return { status: 'down', error: 'Database connection failed' };
  }
};

// Fonction pour vérifier la connexion au service auth
const checkAuthService = async () => {
  try {
    const response = await fetch(process.env.AUTH_SERVICE_URL + '/health');
    if (!response.ok) throw new Error('Auth service responded with status: ' + response.status);
    return { status: 'up', responseTime: 0 };
  } catch (error) {
    logError('Erreur de connexion au service auth', { error: error.message });
    return { status: 'down', error: 'Auth service connection failed' };
  }
};

// Fonction pour vérifier la connexion au service team
const checkTeamService = async () => {
  try {
    const response = await fetch(process.env.TEAM_SERVICE_URL + '/health');
    if (!response.ok) throw new Error('Team service responded with status: ' + response.status);
    return { status: 'up', responseTime: 0 };
  } catch (error) {
    logError('Erreur de connexion au service team', { error: error.message });
    return { status: 'down', error: 'Team service connection failed' };
  }
};

// Middleware de health check détaillé
export const detailedHealthCheck = async (req, res) => {
  const startTime = Date.now();
  const services = {
    database: await checkDatabase(),
    authService: await checkAuthService(),
    teamService: await checkTeamService()
  };

  // Calculer les temps de réponse
  services.database.responseTime = Date.now() - startTime;
  services.authService.responseTime = Date.now() - startTime;
  services.teamService.responseTime = Date.now() - startTime;

  // Vérifier si tous les services sont up
  const isHealthy = Object.values(services).every(
    service => service.status === 'up'
  );

  // Collecter les métriques système
  const systemMetrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform
  };

  const status = isHealthy ? 200 : 503;
  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services,
    system: systemMetrics
  };

  // Logger le résultat
  if (isHealthy) {
    logInfo('Health check réussi', response);
  } else {
    logError('Health check échoué', response);
  }

  res.status(status).json(response);
};

// Middleware de health check simple (pour les load balancers)
export const simpleHealthCheck = async (req, res) => {
  try {
    // Vérification rapide de la base de données
    await prismaClient.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logError('Health check simple échoué', { error: error.message });
    res.status(503).json({ status: 'error' });
  }
};
