import { prismaClient } from '../config/prisma.js'

/**
 * Repository pour la gestion des tournois
 * 
 * Statuts valides selon la contrainte DB :
 * - 'draft' : Brouillon, en cours de création
 * - 'ready' : Prêt, ouvert aux inscriptions  
 * - 'in_progress' : En cours, tournoi lancé
 * - 'completed' : Terminé
 * - 'cancelled' : Annulé
 */
export default class TournamentRepository {

    // Créer un tournoi avec l'organizerId
    async createTournament(organizerId, tournamentData) {
        try {
            

            const newTournament = await prismaClient.tournament.create({
                data: {
                    ...tournamentData,
                    organizer_id: organizerId,
                    status: 'draft', // Par défaut en brouillon
                    registered_teams: 0 // Commence avec 0 équipe inscrite
                }
            })
            console.log('Tournament created:', newTournament.id)
            return newTournament
        } catch (error) {
            console.error('Error creating tournament:', error)
            throw error
        }
    }

    // Récupérer un tournoi par ID
    async getTournament(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.findUnique({
                where: { id: tournamentId },
                include: {
                    profile: {
                        select: {
                            id: true,
                            email: true,
                            display_name: true,
                            role: true
                        }
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            skill_level: true
                        }
                    },
                    match: {
                        select: {
                            id: true,
                            court_number: true,
                            schedule_time: true,
                            status: true
                        }
                    },
                    team_ranking: {
                        select: {
                            id: true,
                            point: true,
                            matches_played: true,
                            matches_won: true,
                            matches_lost: true,
                            ranking_position: true
                        }
                    }
                }
            })
            return tournament
        } catch (error) {
            console.error('Error fetching tournament:', error)
            throw error
        }
    }

    // Mettre à jour un tournoi
    async updateTournament(tournamentId, updateData) {
        try {
            const updatedTournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    ...updateData,
                    updated_at: new Date()
                }
            })
            console.log('Tournament updated:', tournamentId)
            return updatedTournament
        } catch (error) {
            console.error('Error updating tournament:', error)
            throw error
        }
    }

    // Supprimer un tournoi
    async deleteTournament(tournamentId) {
        try {
            await prismaClient.tournament.delete({
                where: { id: tournamentId }
            })
            console.log('Tournament deleted:', tournamentId)
            return { success: true }
        } catch (error) {
            console.error('Error deleting tournament:', error)
            throw error
        }
    }

    // Lister les tournois avec filtres et pagination
    async listTournaments(filters = {}, pagination = {}) {
        try {
            const { status, tournament_type, organizer_id } = filters
            const { page = 1, limit = 10 } = pagination

            const whereClause = {}
            if (status) whereClause.status = status
            if (tournament_type) whereClause.tournament_type = tournament_type
            if (organizer_id) whereClause.organizer_id = organizer_id

            const tournaments = await prismaClient.tournament.findMany({
                where: whereClause,
                include: {
                    profile: {
                        select: {
                            id: true,
                            display_name: true,
                            email: true
                        }
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                            status: true
                        }
                    }
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    created_at: 'desc'
                }
            })

            const total = await prismaClient.tournament.count({
                where: whereClause
            })

            console.log(`Found ${tournaments.length} tournaments`)
            return {
                tournaments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        } catch (error) {
            console.error('Error listing tournaments:', error)
            throw error
        }
    }

    // Publier un tournoi (le rendre prêt pour inscription)
    async publishTournament(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: 'ready',
                    updated_at: new Date()
                }
            })
            console.log('Tournament published:', tournamentId)
            return tournament
        } catch (error) {
            console.error('Error publishing tournament:', error)
            throw error
        }
    }

    // Démarrer un tournoi
    async startTournament(tournamentId) {
        try {
            // Récupérer le tournoi avec le compteur d'équipes
            const tournament = await prismaClient.tournament.findUnique({
                where: { id: tournamentId },
                select: { registered_teams: true }
            })

            if (!tournament) {
                throw new Error('Tournoi non trouvé')
            }

            // Vérifier le nombre d'équipes inscrites (utiliser registered_teams du schema)
            if (tournament.registered_teams < 2) {
                throw new Error('Au moins 2 équipes doivent être inscrites pour démarrer le tournoi')
            }

            const updatedTournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: 'in_progress',
                    updated_at: new Date()
                }
            })
            console.log('Tournament started:', tournamentId)
            return updatedTournament
        } catch (error) {
            console.error('Error starting tournament:', error)
            throw error
        }
    }

    // Mettre un tournoi en brouillon
    async draftTournament(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: 'draft',
                    updated_at: new Date()
                }
            })
            console.log('Tournament drafted:', tournamentId)
            return tournament
        } catch (error) {   
            console.error('Error drafting tournament:', error)
            throw error
        }
    }

    // Terminer un tournoi
    async finishTournament(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: 'completed',
                    updated_at: new Date()
                }
            })
            console.log('Tournament finished:', tournamentId)
            return tournament
        } catch (error) {
            console.error('Error finishing tournament:', error)
            throw error
        }
    }

    // Annuler un tournoi
    async cancelTournament(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: 'cancelled',
                    updated_at: new Date()
                }
            })
            console.log('Tournament cancelled:', tournamentId)
            return tournament
        } catch (error) {
            console.error('Error cancelling tournament:', error)
            throw error
        }
    }

    // Méthode helper pour récupérer un tournoi avec toutes ses équipes et données complètes
    async getTournamentWithTeams(tournamentId) {
        try {
            const tournament = await prismaClient.tournament.findUnique({
                where: { id: tournamentId },
                include: {
                    team: {
                        include: {
                            team_member: {
                                include: {
                                    profile: {
                                        select: {
                                            id: true,
                                            email: true,
                                            display_name: true
                                        }
                                    }
                                }
                            },
                            team_ranking: {
                                select: {
                                    point: true,
                                    matches_played: true,
                                    matches_won: true,
                                    matches_lost: true,
                                    ranking_position: true
                                }
                            }
                        }
                    },
                    match: {
                        select: {
                            id: true,
                            court_number: true,
                            schedule_time: true,
                            actual_start_time: true,
                            actual_end_time: true,
                            status: true,
                            team_a_score: true,
                            team_b_score: true,
                            phase: true,
                            round_number: true
                        }
                    },
                    team_ranking: {
                        include: {
                            team: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },
                        orderBy: {
                            ranking_position: 'asc'
                        }
                    },
                    profile: {
                        select: {
                            id: true,
                            display_name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            })
            return tournament
        } catch (error) {
            console.error('Error fetching tournament with teams:', error)
            throw error
        }
    }

    // Nouvelle méthode : Mettre à jour le compteur d'équipes inscrites
    async updateRegisteredTeamsCount(tournamentId) {
        try {
            // Compter les équipes réellement inscrites
            const teamsCount = await prismaClient.team.count({
                where: { 
                    tournament_id: tournamentId,
                    status: { in: ['registered', 'confirmed'] }
                }
            })

            // Mettre à jour le compteur dans le tournoi
            const tournament = await prismaClient.tournament.update({
                where: { id: tournamentId },
                data: {
                    registered_teams: teamsCount,
                    updated_at: new Date()
                }
            })
            
            console.log(`Tournament ${tournamentId} registered teams count updated: ${teamsCount}`)
            return tournament
        } catch (error) {
            console.error('Error updating registered teams count:', error)
            throw error
        }
    }

    // Nouvelle méthode : Récupérer les statistiques complètes d'un tournoi
    async getTournamentStats(tournamentId) {
        try {
            const stats = await prismaClient.tournament.findUnique({
                where: { id: tournamentId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    registered_teams: true,
                    max_teams: true,
                    start_date: true,
                    start_time: true,
                    match_duration_minutes: true,
                    break_duration_minutes: true,
                    courts_available: true,
                    _count: {
                        select: {
                            team: true,
                            match: true,
                            team_ranking: true
                        }
                    }
                }
            })
            return stats
        } catch (error) {
            console.error('Error fetching tournament stats:', error)
            throw error
        }
    }
} 