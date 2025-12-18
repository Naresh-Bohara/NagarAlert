import Joi from "joi";

const createMunicipalityDTO = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Municipality name is required",
    "string.min": "Municipality name must be at least 2 characters",
    "string.max": "Municipality name cannot exceed 100 characters"
  }),

  location: Joi.object({
    city: Joi.string().required().messages({
      "string.empty": "City is required"
    }),
    province: Joi.string().required().messages({
      "string.empty": "Province is required"
    }),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).optional(),
      lng: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).required(),

  boundaryBox: Joi.object({
    minLat: Joi.number().min(-90).max(90).optional(),
    maxLat: Joi.number().min(-90).max(90).optional(),
    minLng: Joi.number().min(-180).max(180).optional(),
    maxLng: Joi.number().min(-180).max(180).optional()
  }).optional(),

  adminUser: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Admin name is required"
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Valid admin email is required",
      "string.empty": "Admin email is required"
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Admin password is required",
      "string.min": "Admin password must be at least 6 characters"
    }),
    phone: Joi.string()
      .pattern(/^(\+977-?)?(98|97)\d{8}$/)
      .required()
      .messages({
        "string.pattern.base": "Valid Nepali phone number is required",
        "string.empty": "Admin phone is required"
      })
  }).required(),

  contactEmail: Joi.string().email().required().messages({
    "string.email": "Valid contact email is required",
    "string.empty": "Contact email is required"
  }),

  contactPhone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Valid Nepali phone number is required",
      "string.empty": "Contact phone is required"
    }),

  settings: Joi.object({
    autoAssignReports: Joi.boolean().default(false),
    citizenRewards: Joi.boolean().default(true),
    pointValue: Joi.number().min(0).default(1)
  }).optional(),

  reportCategories: Joi.array().items(Joi.string()).optional()
});

const updateMunicipalityDTO = Joi.object({
  name: Joi.string().min(2).max(100).optional(),

  location: Joi.object({
    city: Joi.string().optional(),
    province: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).optional(),
      lng: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),

  boundaryBox: Joi.object({
    minLat: Joi.number().min(-90).max(90).optional(),
    maxLat: Joi.number().min(-90).max(90).optional(),
    minLng: Joi.number().min(-180).max(180).optional(),
    maxLng: Joi.number().min(-180).max(180).optional()
  }).optional(),

  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).optional(),

  settings: Joi.object({
    autoAssignReports: Joi.boolean().optional(),
    citizenRewards: Joi.boolean().optional(),
    pointValue: Joi.number().min(0).optional()
  }).optional(),

  reportCategories: Joi.array().items(Joi.string()).optional(),

  isActive: Joi.boolean().optional()
});

const municipalityFilterDTO = Joi.object({
  city: Joi.string().optional(),
  province: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional()
});

const municipalityIdDTO = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid municipality ID format"
    })
});

export { 
  createMunicipalityDTO, 
  updateMunicipalityDTO, 
  municipalityFilterDTO,
  municipalityIdDTO 
};