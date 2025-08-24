import express from 'express'
import TournamentController from '../controllers/tournament.controller.js'
import TournamentRepository from '../repositories/tournament.repository.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { 
    createTournamentLimiter, 
    updateTournamentLimiter 
} from '../middleware/rateLimiter.js'
import {
    createTournamentSchema,
    updateTournamentSchema,
    tournamentIdSchema,
    listTournamentsSchema
} from '../validation/tournamentSchemas.js'
import { requireOrganisateur } from '../middleware/authMiddleware.js'

const router = express.Router()

// Injection de dépendance
const tournamentRepository = new TournamentRepository()
const tournamentController = new TournamentController(tournamentRepository)

// Routes publiques (lecture)
router.get('/', 
    validateRequest(listTournamentsSchema, 'query'),
    tournamentController.listTournaments
);

router.get('/:tournamentId',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.getTournament
);

router.get('/:tournamentId/teams',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.getTournamentWithTeams
);

// Routes pour organisateurs (création, modification)
router.post('/organizer',
    createTournamentLimiter,
    ...requireOrganisateur,
    validateRequest(createTournamentSchema),
    tournamentController.createTournament
);

router.patch('/:tournamentId',
    updateTournamentLimiter,
    validateRequest(tournamentIdSchema, 'params'),
    validateRequest(updateTournamentSchema),
    tournamentController.updateTournament
);

router.delete('/:tournamentId',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.deleteTournament
);

// Routes de gestion des états du tournoi
router.patch('/:tournamentId/draft',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.draftTournament
);

router.patch('/:tournamentId/publish',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.publishTournament
);

router.patch('/:tournamentId/start',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.startTournament
);

router.patch('/:tournamentId/finish',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.finishTournament
);

router.patch('/:tournamentId/cancel',
    validateRequest(tournamentIdSchema, 'params'),
    tournamentController.cancelTournament
);

export default router

