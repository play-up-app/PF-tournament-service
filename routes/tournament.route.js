import express from 'express'
import TournamentController from '../controllers/tournament.controller.js'
import TournamentRepository from '../repositories/tournament.repository.js'

const router = express.Router()

// Injection de dépendance
const tournamentRepository = new TournamentRepository()
const tournamentController = new TournamentController(tournamentRepository)

// Routes publiques (lecture)
router.get('/', tournamentController.listTournaments)
router.get('/:tournamentId', tournamentController.getTournament)
router.get('/:tournamentId/teams', tournamentController.getTournamentWithTeams)

// Routes pour organisateurs (création, modification)
router.post('/organizer/:organizerId', tournamentController.createTournament)
router.patch('/:tournamentId', tournamentController.updateTournament)
router.delete('/:tournamentId', tournamentController.deleteTournament)

// Routes de gestion des états du tournoi
router.patch('/:tournamentId/draft', tournamentController.draftTournament)
router.patch('/:tournamentId/publish', tournamentController.publishTournament)
router.patch('/:tournamentId/start', tournamentController.startTournament)
router.patch('/:tournamentId/finish', tournamentController.finishTournament)
router.patch('/:tournamentId/cancel', tournamentController.cancelTournament)

export default router

