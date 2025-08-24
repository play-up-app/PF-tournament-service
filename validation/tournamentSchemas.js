import Joi from 'joi';

const uuidSchema = Joi.string().guid({ version: ['uuidv4'] }).required().messages({
  'string.guid': 'L\'ID doit être un UUID valide.',
  'string.empty': 'L\'ID ne peut pas être vide.',
  'any.required': 'L\'ID est requis.'
});

export const createTournamentSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Le nom du tournoi doit contenir au moins 3 caractères.',
    'string.max': 'Le nom du tournoi ne peut pas dépasser 100 caractères.',
    'string.empty': 'Le nom du tournoi ne peut pas être vide.',
    'any.required': 'Le nom du tournoi est requis.'
  }),
  description: Joi.string().max(1000).optional().allow(null, '').messages({
    'string.max': 'La description ne peut pas dépasser 1000 caractères.'
  }),
  tournament_type: Joi.string().valid('poules_elimination').required().messages({
    'any.only': 'Le type de tournoi doit être poules_elimination.',
    'any.required': 'Le type de tournoi est requis.'
  }),
  max_teams: Joi.number().integer().min(2).max(128).required().messages({
    'number.min': 'Le nombre minimum d\'équipes est de 2.',
    'number.max': 'Le nombre maximum d\'équipes est de 128.',
    'any.required': 'Le nombre maximum d\'équipes est requis.'
  }),
  courts_available: Joi.number().integer().min(1).required().messages({
    'number.min': 'Il doit y avoir au moins 1 terrain disponible.',
    'any.required': 'Le nombre de terrains disponibles est requis.'
  }),
  start_date: Joi.date().greater('now').required().messages({
    'date.greater': 'La date de début doit être dans le futur.',
    'any.required': 'La date de début est requise.'
  }),
  // start_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
  //   'string.pattern.base': 'L\'heure de début doit être au format HH:MM.',
  //   'any.required': 'L\'heure de début est requise.'
  // }),
  match_duration_minutes: Joi.number().integer().min(5).required().messages({
    'number.min': 'La durée minimum d\'un match est de 5 minutes.',
    'any.required': 'La durée des matchs est requise.'
  }),
  break_duration_minutes: Joi.number().integer().min(0).required().messages({
    'number.min': 'La durée de pause ne peut pas être négative.',
    'any.required': 'La durée des pauses est requise.'
  }),
  organizer_id: Joi.string().guid({ version: ['uuidv4'] }).required().messages({
    'string.guid': 'L\'ID de l\'organisateur doit être un UUID valide.',
    'any.required': 'L\'ID de l\'organisateur est requis.'
  }),
  status: Joi.string().valid('draft').default('draft').messages({
    'any.only': 'Le statut doit être draft.'
  })
});

export const updateTournamentSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Le nom du tournoi doit contenir au moins 3 caractères.',
    'string.max': 'Le nom du tournoi ne peut pas dépasser 100 caractères.'
  }),
  description: Joi.string().max(1000).optional().allow(null, '').messages({
    'string.max': 'La description ne peut pas dépasser 1000 caractères.'
  }),
  start_date: Joi.date().greater('now').optional().messages({
    'date.greater': 'La date de début doit être dans le futur.'
  }),
  end_date: Joi.date().greater(Joi.ref('start_date')).optional().messages({
    'date.greater': 'La date de fin doit être après la date de début.'
  }),
  registration_deadline: Joi.date().less(Joi.ref('start_date')).optional().messages({
    'date.less': 'La date limite d\'inscription doit être avant la date de début.'
  }),
  location: Joi.object({
    city: Joi.string(),
    address: Joi.string(),
    postal_code: Joi.string().pattern(/^[0-9]{5}$/),
    country: Joi.string()
  }).optional(),
  max_teams: Joi.number().integer().min(2).max(128).optional().messages({
    'number.min': 'Le nombre minimum d\'équipes est de 2.',
    'number.max': 'Le nombre maximum d\'équipes est de 128.'
  }),
  team_size: Joi.number().integer().min(1).max(20).optional().messages({
    'number.min': 'La taille minimum d\'une équipe est de 1.',
    'number.max': 'La taille maximum d\'une équipe est de 20.'
  }),
  format: Joi.string().valid('elimination', 'round_robin', 'groups').optional().messages({
    'any.only': 'Le format doit être elimination, round_robin ou groups.'
  }),
  skill_level: Joi.string().valid('amateur', 'intermédiaire', 'confirmé', 'expert').optional().messages({
    'any.only': 'Le niveau doit être amateur, intermédiaire, confirmé ou expert.'
  }),
  rules: Joi.string().max(2000).optional().allow(null, '').messages({
    'string.max': 'Les règles ne peuvent pas dépasser 2000 caractères.'
  }),
  prizes: Joi.array().items(
    Joi.object({
      rank: Joi.number().integer().min(1).required(),
      description: Joi.string().required(),
      value: Joi.number().optional()
    })
  ).optional(),
  contact: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional()
  }).optional()
}).min(1).messages({
  'object.min': 'Au moins un champ doit être fourni pour la mise à jour.'
});

export const tournamentIdSchema = Joi.object({
  tournamentId: uuidSchema
});

export const registerTeamSchema = Joi.object({
  team_id: uuidSchema,
  captain_id: uuidSchema,
  additional_info: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Les informations additionnelles ne peuvent pas dépasser 500 caractères.'
  })
});

export const listTournamentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sport: Joi.string().optional(),
  skill_level: Joi.string().valid('amateur', 'intermédiaire', 'confirmé', 'expert').optional(),
  start_date_after: Joi.date().optional(),
  start_date_before: Joi.date().optional(),
  location_city: Joi.string().optional(),
  format: Joi.string().valid('elimination', 'round_robin', 'groups').optional()
});
