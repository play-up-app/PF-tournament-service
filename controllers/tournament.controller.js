export default class TournamentController {

    constructor(tournamentRepository) {
        this.tournamentRepository = tournamentRepository
    }

    // Créer un tournoi
    createTournament = async (req, res) => {
        try {
            // Debug: Vérifier req.user
            console.log('🔍 req.user:', req.user)
            console.log('🔍 req.headers:', req.headers)
            
            const organizerId = req.user.id
            const organizerRole = req.user.role
            const tournamentData = req.body

            // Validation de l'authentification
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentification requise pour créer un tournoi",
                    data: null
                })
            }

            // Validation du rôle (double vérification)
            if (!['organisateur', 'admin'].includes(organizerRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Rôle d'organisateur requis pour créer un tournoi",
                    data: null
                })
            }

            // Validation des données
            if (!tournamentData.name || !tournamentData.max_teams) {
                return res.status(400).json({
                    success: false,
                    message: "Nom et nombre maximum d'équipes requis",
                    data: null
                })
            }

            const tournament = await this.tournamentRepository.createTournament(organizerId, tournamentData)
            
            res.status(201).json({
                success: true,
                message: "Tournoi créé avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur création tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du tournoi",
                data: null
            })
        }
    }

    // Récupérer un tournoi par ID
    getTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params

            const tournament = await this.tournamentRepository.getTournament(tournamentId)
            
            if (!tournament) {
                return res.status(404).json({
                    success: false,
                    message: "Tournoi non trouvé",
                    data: null
                })
            }

            res.json({
                success: true,
                message: "Tournoi récupéré avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur récupération tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du tournoi",
                data: null
            })
        }
    }

    // Lister les tournois avec filtres et pagination
    listTournaments = async (req, res) => {
        try {
            const { status, tournament_type, organizer_id, page, limit } = req.query
            
            const filters = {}
            if (status) filters.status = status
            if (tournament_type) filters.tournament_type = tournament_type
            if (organizer_id) filters.organizer_id = organizer_id

            const pagination = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            }

            const result = await this.tournamentRepository.listTournaments(filters, pagination)
            
            res.json({
                success: true,
                message: "Tournois récupérés avec succès",
                data: result
            })
        } catch (error) {
            console.error('Erreur liste tournois:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des tournois",
                data: null
            })
        }
    }

    // Mettre à jour un tournoi
    updateTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            const updateData = req.body

            // Empêcher la modification de certains champs
            delete updateData.id
            delete updateData.organizer_id
            delete updateData.created_at

            const tournament = await this.tournamentRepository.updateTournament(tournamentId, updateData)
            
            res.json({
                success: true,
                message: "Tournoi mis à jour avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur mise à jour tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du tournoi",
                data: null
            })
        }
    }

    // Supprimer un tournoi
    deleteTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            await this.tournamentRepository.deleteTournament(tournamentId)
            
            res.json({
                success: true,
                message: "Tournoi supprimé avec succès",
                data: null
            })
        } catch (error) {
            console.error('Erreur suppression tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du tournoi",
                data: null
            })
        }
    }

    // Mettre un tournoi en brouillon
    draftTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.draftTournament(tournamentId)

            res.json({
                success: true,
                message: "Tournoi mis en brouillon avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur mise en brouillon tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise en brouillon du tournoi",
                data: null
            })
        }
    }

    // Publier un tournoi (le rendre disponible aux inscriptions)
    publishTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.publishTournament(tournamentId)
            
            res.json({
                success: true,
                message: "Tournoi publié avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur publication tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la publication du tournoi",
                data: null
            })
        }
    }

    // Démarrer un tournoi
    startTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.startTournament(tournamentId)
            
            res.json({
                success: true,
                message: "Tournoi démarré avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur démarrage tournoi:', error)
            
            // Gestion spécifique de l'erreur du nombre d'équipes
            if (error.message.includes('Au moins 2 équipes')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    data: null
                })
            }
            
            res.status(500).json({
                success: false,
                message: "Erreur lors du démarrage du tournoi",
                data: null
            })
        }
    }

    // Terminer un tournoi
    finishTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.finishTournament(tournamentId)
            
            res.json({
                success: true,
                message: "Tournoi terminé avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur fin tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la finalisation du tournoi",
                data: null
            })
        }
    }

    // Annuler un tournoi
    cancelTournament = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.cancelTournament(tournamentId)
            
            res.json({
                success: true,
                message: "Tournoi annulé avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur annulation tournoi:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de l'annulation du tournoi",
                data: null
            })
        }
    }

    // Récupérer un tournoi avec toutes ses équipes
    getTournamentWithTeams = async (req, res) => {
        try {
            const { tournamentId } = req.params
            
            const tournament = await this.tournamentRepository.getTournamentWithTeams(tournamentId)
            
            if (!tournament) {
                return res.status(404).json({
                    success: false,
                    message: "Tournoi non trouvé",
                    data: null
                })
            }

            res.json({
                success: true,
                message: "Tournoi avec équipes récupéré avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur récupération tournoi avec équipes:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du tournoi avec équipes",
                data: null
            })
        }
    }

    // Mettre à jour le compteur d'équipes inscrites
    updateRegisteredTeamsCount = async (req, res) => {
        try {
            const { tournamentId } = req.params
            const tournament = await this.tournamentRepository.updateRegisteredTeamsCount(tournamentId)
            res.json({
                success: true,
                message: "Compteur d'équipes inscrites mis à jour avec succès",
                data: tournament
            })
        } catch (error) {
            console.error('Erreur mise à jour compteur équipes inscrites:', error)
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du compteur d'équipes inscrites",
                data: null
            })
        }
    }
}