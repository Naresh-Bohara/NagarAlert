import Joi from "joi";

// Create Sponsor
const createSponsorDTO = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters"
  }),

  contactEmail: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),

  contactPhone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).required().messages({
    "string.pattern.base": "Valid Nepali phone number is required"
  }),

  sponsorType: Joi.string()
    .valid(
      'local_business', 
      'corporate', 
      'ngo', 
      'community_event', 
      'music_program', 
      'party_event',
      'csr_campaign',
      'government_scheme',
      'public_awareness'
    )
    .required()
    .messages({
      "any.only": "Invalid sponsor type"
    }),

  title: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters"
  }),
  bannerImage: Joi.string().uri().optional(),

  description: Joi.string().max(500).optional(),

  website: Joi.string().uri().optional().messages({
    "string.uri": "Valid website URL is required"
  }),

  scope: Joi.string()
    .valid('global', 'municipality')
    .default('global'),

  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .when('scope', {
      is: 'municipality',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      "string.pattern.base": "Invalid municipality ID"
    }),

  startDate: Joi.date().min('now').required().messages({
    "date.min": "Start date must be in the future"
  }),

  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    "date.greater": "End date must be after start date"
  })
});

// Update Sponsor
const updateSponsorDTO = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).optional(),
  sponsorType: Joi.string().valid(
    'local_business', 'corporate', 'ngo', 'community_event', 
    'music_program', 'party_event', 'csr_campaign', 
    'government_scheme', 'public_awareness'
  ).optional(),
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(500).optional(),
  website: Joi.string().uri().optional(),
  scope: Joi.string().valid('global', 'municipality').optional(),
  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid('pending', 'active', 'inactive').optional()
});

// Sponsor Filter
const sponsorFilterDTO = Joi.object({
  sponsorType: Joi.string().valid(
    'local_business', 'corporate', 'ngo', 'community_event', 
    'music_program', 'party_event', 'csr_campaign', 
    'government_scheme', 'public_awareness'
  ).optional(),
  scope: Joi.string().valid('global', 'municipality').optional(),
  status: Joi.string().valid('pending', 'active', 'inactive').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});

// Sponsor ID
const sponsorIdDTO = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid sponsor ID"
    })
});

export {
  createSponsorDTO,
  updateSponsorDTO,
  sponsorFilterDTO,
  sponsorIdDTO
};