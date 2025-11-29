import Joi from "joi";

const createReportDTO = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 200 characters"
  }),

  description: Joi.string().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters"
  }),

  category: Joi.string()
    .valid('road', 'electricity', 'water', 'sanitation', 'safety', 'emergency', 'illegal_activity')
    .required()
    .messages({
      "any.only": "Invalid category",
      "string.empty": "Category is required"
    }),

  location: Joi.object({
    address: Joi.string().required().messages({
      "string.empty": "Address is required"
    }),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    }).optional(),
    ward: Joi.string().optional()
  }).required(),

  severity: Joi.string()
    .valid('low', 'medium', 'high', 'emergency')
    .default('medium')
    .messages({
      "any.only": "Invalid severity"
    }),

  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid municipality ID",
      "string.empty": "Municipality is required"
    })
});

const updateReportDTO = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string()
    .valid('road', 'electricity', 'water', 'sanitation', 'safety', 'emergency', 'illegal_activity')
    .optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).optional(),
      lng: Joi.number().min(-180).max(180).optional()
    }).optional(),
    ward: Joi.string().optional()
  }).optional(),
  severity: Joi.string()
    .valid('low', 'medium', 'high', 'emergency')
    .optional()
});

const staffUpdateReportDTO = Joi.object({
  status: Joi.string().valid('pending', 'assigned', 'in_progress', 'resolved').optional(),
  assignedStaffId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  pointsAwarded: Joi.number().min(0).optional()
});

const reportFilterDTO = Joi.object({
  category: Joi.string().valid('road', 'electricity', 'water', 'sanitation', 'safety', 'emergency', 'illegal_activity').optional(),
  status: Joi.string().valid('pending', 'assigned', 'in_progress', 'resolved').optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'emergency').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});

const reportIdDTO = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid report ID"
    })
});

const assignReportDTO = Joi.object({
  assignedStaffId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid staff ID.",
      "any.required": "Staff ID is required for assignment."
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional(),
    
  dueDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      "date.min": "Due date must be in the future."
    }),
    
  notes: Joi.string()
    .max(500)
    .optional()
});

export { 
  createReportDTO, 
  updateReportDTO, 
  staffUpdateReportDTO,
  reportFilterDTO,
  reportIdDTO,
  assignReportDTO
};