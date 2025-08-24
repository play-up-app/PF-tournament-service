import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Mock de Prisma
const mockPrismaClient = {
  tournament: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  team: {
    count: jest.fn(),
  },
};

// Mock des modules
jest.unstable_mockModule('../../config/prisma.js', () => ({
  prismaClient: mockPrismaClient
}));

// Import après les mocks
const TournamentRepository = (await import('../../repositories/tournament.repository.js')).default;

describe('TournamentRepository', () => {
  let tournamentRepository;
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    tournamentRepository = new TournamentRepository();
    jest.clearAllMocks();
  });

  describe('createTournament', () => {
    const mockTournamentData = {
      name: 'Test Tournament',
      description: 'Test description',
      tournament_type: 'league',
      start_date: new Date('2024-01-01'),
      start_time: new Date('2024-01-01T14:00:00'),
      max_teams: 8,
      match_duration_minutes: 30,
      break_duration_minutes: 10,
      courts_available: 2,
    };

    it('devrait créer un tournoi avec succès', async () => {
      const mockCreatedTournament = {
        id: validUUID,
        ...mockTournamentData,
        organizer_id: validUUID,
        status: 'draft',
        registered_teams: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.create.mockResolvedValue(mockCreatedTournament);

      const result = await tournamentRepository.createTournament(validUUID, mockTournamentData);

      expect(result).toEqual(mockCreatedTournament);
      expect(mockPrismaClient.tournament.create).toHaveBeenCalledWith({
        data: {
          ...mockTournamentData,
          organizer_id: validUUID,
          status: 'draft',
          registered_teams: 0,
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de création');
      mockPrismaClient.tournament.create.mockRejectedValue(error);

      await expect(tournamentRepository.createTournament(validUUID, mockTournamentData))
        .rejects
        .toThrow('Erreur de création');
    });
  });

  describe('getTournament', () => {
    it('devrait récupérer un tournoi avec succès', async () => {
      const mockTournament = {
        id: validUUID,
        name: 'Test Tournament',
        profile: {
          id: validUUID,
          email: 'test@example.com',
          display_name: 'Test User',
          role: 'organizer',
        },
        team: [
          {
            id: validUUID,
            name: 'Team 1',
            status: 'registered',
            skill_level: 'amateur',
          },
        ],
        match: [
          {
            id: validUUID,
            court_number: 1,
            schedule_time: new Date(),
            status: 'scheduled',
          },
        ],
        team_ranking: [
          {
            id: validUUID,
            point: 10,
            matches_played: 5,
            matches_won: 3,
            matches_lost: 2,
            ranking_position: 1,
          },
        ],
      };

      mockPrismaClient.tournament.findUnique.mockResolvedValue(mockTournament);

      const result = await tournamentRepository.getTournament(validUUID);

      expect(result).toEqual(mockTournament);
      expect(mockPrismaClient.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: validUUID },
        include: expect.any(Object),
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de récupération');
      mockPrismaClient.tournament.findUnique.mockRejectedValue(error);

      await expect(tournamentRepository.getTournament(validUUID))
        .rejects
        .toThrow('Erreur de récupération');
    });
  });

  describe('updateTournament', () => {
    const mockUpdateData = {
      name: 'Updated Tournament',
      description: 'Updated description',
      max_teams: 10,
    };

    it('devrait mettre à jour un tournoi avec succès', async () => {
      const mockUpdatedTournament = {
        id: validUUID,
        ...mockUpdateData,
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockUpdatedTournament);

      const result = await tournamentRepository.updateTournament(validUUID, mockUpdateData);

      expect(result).toEqual(mockUpdatedTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          ...mockUpdateData,
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de mise à jour');
      mockPrismaClient.tournament.update.mockRejectedValue(error);

      await expect(tournamentRepository.updateTournament(validUUID, mockUpdateData))
        .rejects
        .toThrow('Erreur de mise à jour');
    });
  });

  describe('deleteTournament', () => {
    it('devrait supprimer un tournoi avec succès', async () => {
      mockPrismaClient.tournament.delete.mockResolvedValue({});

      const result = await tournamentRepository.deleteTournament(validUUID);

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.tournament.delete).toHaveBeenCalledWith({
        where: { id: validUUID },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de suppression');
      mockPrismaClient.tournament.delete.mockRejectedValue(error);

      await expect(tournamentRepository.deleteTournament(validUUID))
        .rejects
        .toThrow('Erreur de suppression');
    });
  });

  describe('listTournaments', () => {
    it('devrait lister les tournois avec succès', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          status: 'ready',
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(1);

      const result = await tournamentRepository.listTournaments();

      expect(result).toEqual({
        tournaments: mockTournaments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('devrait lister les tournois avec filtres', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          status: 'ready',
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(1);

      const filters = {
        status: 'ready',
        tournament_type: 'league',
        organizer_id: validUUID,
      };

      const result = await tournamentRepository.listTournaments(filters);

      expect(result).toEqual({
        tournaments: mockTournaments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(mockPrismaClient.tournament.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ready',
          tournament_type: 'league',
          organizer_id: validUUID,
        },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('devrait lister les tournois avec pagination personnalisée', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          status: 'ready',
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(25);

      const pagination = {
        page: 2,
        limit: 5,
      };

      const result = await tournamentRepository.listTournaments({}, pagination);

      expect(result).toEqual({
        tournaments: mockTournaments,
        pagination: {
          page: 2,
          limit: 5,
          total: 25,
          totalPages: 5,
        },
      });

      expect(mockPrismaClient.tournament.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.any(Object),
        skip: 5,
        take: 5,
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('devrait lister les tournois avec filtre status seulement', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          status: 'draft',
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(1);

      const filters = { status: 'draft' };

      const result = await tournamentRepository.listTournaments(filters);

      expect(mockPrismaClient.tournament.findMany).toHaveBeenCalledWith({
        where: { status: 'draft' },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('devrait lister les tournois avec filtre tournament_type seulement', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          tournament_type: 'cup',
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(1);

      const filters = { tournament_type: 'cup' };

      const result = await tournamentRepository.listTournaments(filters);

      expect(mockPrismaClient.tournament.findMany).toHaveBeenCalledWith({
        where: { tournament_type: 'cup' },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('devrait lister les tournois avec filtre organizer_id seulement', async () => {
      const mockTournaments = [
        {
          id: validUUID,
          name: 'Test Tournament',
          organizer_id: validUUID,
        },
      ];

      mockPrismaClient.tournament.findMany.mockResolvedValue(mockTournaments);
      mockPrismaClient.tournament.count.mockResolvedValue(1);

      const filters = { organizer_id: validUUID };

      const result = await tournamentRepository.listTournaments(filters);

      expect(mockPrismaClient.tournament.findMany).toHaveBeenCalledWith({
        where: { organizer_id: validUUID },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de listage');
      mockPrismaClient.tournament.findMany.mockRejectedValue(error);

      await expect(tournamentRepository.listTournaments())
        .rejects
        .toThrow('Erreur de listage');
    });
  });

  describe('publishTournament', () => {
    it('devrait publier un tournoi avec succès', async () => {
      const mockPublishedTournament = {
        id: validUUID,
        status: 'ready',
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockPublishedTournament);

      const result = await tournamentRepository.publishTournament(validUUID);

      expect(result).toEqual(mockPublishedTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          status: 'ready',
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de publication');
      mockPrismaClient.tournament.update.mockRejectedValue(error);

      await expect(tournamentRepository.publishTournament(validUUID))
        .rejects
        .toThrow('Erreur de publication');
    });
  });

  describe('startTournament', () => {
    it('devrait démarrer un tournoi avec succès', async () => {
      mockPrismaClient.tournament.findUnique.mockResolvedValue({
        registered_teams: 2,
      });

      const mockStartedTournament = {
        id: validUUID,
        status: 'in_progress',
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockStartedTournament);

      const result = await tournamentRepository.startTournament(validUUID);

      expect(result).toEqual(mockStartedTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          status: 'in_progress',
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait échouer si le tournoi n\'existe pas', async () => {
      mockPrismaClient.tournament.findUnique.mockResolvedValue(null);

      await expect(tournamentRepository.startTournament(validUUID))
        .rejects
        .toThrow('Tournoi non trouvé');
    });

    it('devrait échouer s\'il n\'y a pas assez d\'équipes', async () => {
      mockPrismaClient.tournament.findUnique.mockResolvedValue({
        registered_teams: 1,
      });

      await expect(tournamentRepository.startTournament(validUUID))
        .rejects
        .toThrow('Au moins 2 équipes doivent être inscrites pour démarrer le tournoi');
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de démarrage');
      mockPrismaClient.tournament.findUnique.mockRejectedValue(error);

      await expect(tournamentRepository.startTournament(validUUID))
        .rejects
        .toThrow('Erreur de démarrage');
    });
  });

  describe('draftTournament', () => {
    it('devrait mettre un tournoi en brouillon avec succès', async () => {
      const mockDraftTournament = {
        id: validUUID,
        status: 'draft',
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockDraftTournament);

      const result = await tournamentRepository.draftTournament(validUUID);

      expect(result).toEqual(mockDraftTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          status: 'draft',
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de mise en brouillon');
      mockPrismaClient.tournament.update.mockRejectedValue(error);

      await expect(tournamentRepository.draftTournament(validUUID))
        .rejects
        .toThrow('Erreur de mise en brouillon');
    });
  });

  describe('finishTournament', () => {
    it('devrait terminer un tournoi avec succès', async () => {
      const mockFinishedTournament = {
        id: validUUID,
        status: 'completed',
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockFinishedTournament);

      const result = await tournamentRepository.finishTournament(validUUID);

      expect(result).toEqual(mockFinishedTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          status: 'completed',
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de fin de tournoi');
      mockPrismaClient.tournament.update.mockRejectedValue(error);

      await expect(tournamentRepository.finishTournament(validUUID))
        .rejects
        .toThrow('Erreur de fin de tournoi');
    });
  });

  describe('cancelTournament', () => {
    it('devrait annuler un tournoi avec succès', async () => {
      const mockCancelledTournament = {
        id: validUUID,
        status: 'cancelled',
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockCancelledTournament);

      const result = await tournamentRepository.cancelTournament(validUUID);

      expect(result).toEqual(mockCancelledTournament);
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          status: 'cancelled',
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur d\'annulation');
      mockPrismaClient.tournament.update.mockRejectedValue(error);

      await expect(tournamentRepository.cancelTournament(validUUID))
        .rejects
        .toThrow('Erreur d\'annulation');
    });
  });

  describe('getTournamentWithTeams', () => {
    it('devrait récupérer un tournoi avec ses équipes avec succès', async () => {
      const mockTournamentWithTeams = [
        {
          id: validUUID,
          name: undefined,
          description: undefined,
          tournament_id: undefined,
          captain_id: undefined,
          status: undefined,
          contact_email: undefined,
          contact_phone: undefined,
          skill_level: undefined,
          notes: undefined,
          created_at: undefined,
          updated_at: undefined,
          members: [
            {
              name: 'Player 1',
              email: 'player@example.com',
            },
          ],
        },
      ];

      mockPrismaClient.tournament.findUnique.mockResolvedValue({
        team: [
          {
            id: validUUID,
            team_member: [
              {
                profile: {
                  id: validUUID,
                  email: 'player@example.com',
                  display_name: 'Player 1',
                },
              },
            ],
          },
        ],
      });

      const result = await tournamentRepository.getTournamentWithTeams(validUUID);

      expect(result).toEqual(mockTournamentWithTeams);
      expect(mockPrismaClient.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: validUUID },
        select: expect.any(Object),
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de récupération');
      mockPrismaClient.tournament.findUnique.mockRejectedValue(error);

      await expect(tournamentRepository.getTournamentWithTeams(validUUID))
        .rejects
        .toThrow('Erreur de récupération');
    });
  });

  describe('updateRegisteredTeamsCount', () => {
    it('devrait mettre à jour le compteur d\'équipes avec succès', async () => {
      mockPrismaClient.team.count.mockResolvedValue(5);

      const mockUpdatedTournament = {
        id: validUUID,
        registered_teams: 5,
        updated_at: new Date(),
      };

      mockPrismaClient.tournament.update.mockResolvedValue(mockUpdatedTournament);

      const result = await tournamentRepository.updateRegisteredTeamsCount(validUUID);

      expect(result).toEqual(mockUpdatedTournament);
      expect(mockPrismaClient.team.count).toHaveBeenCalledWith({
        where: {
          tournament_id: validUUID,
          status: { in: ['registered', 'confirmed'] },
        },
      });
      expect(mockPrismaClient.tournament.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          registered_teams: 5,
          updated_at: expect.any(Date),
        },
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de mise à jour');
      mockPrismaClient.team.count.mockRejectedValue(error);

      await expect(tournamentRepository.updateRegisteredTeamsCount(validUUID))
        .rejects
        .toThrow('Erreur de mise à jour');
    });
  });

  describe('getTournamentStats', () => {
    it('devrait récupérer les statistiques d\'un tournoi avec succès', async () => {
      const mockStats = {
        id: validUUID,
        name: 'Test Tournament',
        status: 'in_progress',
        registered_teams: 5,
        max_teams: 8,
        start_date: new Date(),
        start_time: new Date(),
        match_duration_minutes: 30,
        break_duration_minutes: 10,
        courts_available: 2,
        _count: {
          team: 5,
          match: 10,
          team_ranking: 5,
        },
      };

      mockPrismaClient.tournament.findUnique.mockResolvedValue(mockStats);

      const result = await tournamentRepository.getTournamentStats(validUUID);

      expect(result).toEqual(mockStats);
      expect(mockPrismaClient.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: validUUID },
        select: expect.any(Object),
      });
    });

    it('devrait propager l\'erreur en cas d\'échec', async () => {
      const error = new Error('Erreur de récupération des stats');
      mockPrismaClient.tournament.findUnique.mockRejectedValue(error);

      await expect(tournamentRepository.getTournamentStats(validUUID))
        .rejects
        .toThrow('Erreur de récupération des stats');
    });
  });
});
   