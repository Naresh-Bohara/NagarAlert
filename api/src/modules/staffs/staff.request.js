import Joi from "joi";

const staffRegistrationDTO = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name required.",
    "string.min": "Name too short.",
    "string.max": "Name too long."
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email required.",
    "string.email": "Invalid email."
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password required.",
    "string.min": "Password too short."
  }),

  role: Joi.string()
    .valid("municipality_admin", "field_staff")
    .required()
    .messages({
      "any.only": "Invalid staff role."
    }),

  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid municipality ID.",
      "string.empty": "Municipality ID required."
    }),

  phone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .required()
    .messages({
      "string.empty": "Phone required.",
      "string.pattern.base": "Invalid Nepali number."
    }),

  staffProfile: Joi.object({
    department: Joi.string()
      .valid('public_works', 'electricity', 'water_supply', 'sanitation', 'safety', 'emergency', 'administration')
      .required()
      .messages({
        "any.only": "Invalid department.",
        "string.empty": "Department required."
      }),

    employeeId: Joi.string().required().messages({
      "string.empty": "Employee ID required."
    }),

    designation: Joi.string().required().messages({
      "string.empty": "Designation required."
    }),

    skills: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).custom((value, helpers) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(skill => skill.trim());
        }
      }
      return value;
    }).default([]),
    
    assignedWards: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).custom((value, helpers) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(ward => ward.trim());
        }
      }
      return value;
    }).default([]),
    
    availability: Joi.boolean().default(true),
    
    joinDate: Joi.date().default(Date.now),
    
    salaryGrade: Joi.string().optional(),
    
    supervisorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid supervisor ID."
      })
  }).required().messages({
    "object.base": "Staff profile required."
  })
});

const staffUpdateDTO = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "Name too short.",
    "string.max": "Name too long."
  }),

  phone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid Nepali number."
    }),

  staffProfile: Joi.object({
    department: Joi.string()
      .valid('public_works', 'electricity', 'water_supply', 'sanitation', 'safety', 'emergency', 'administration')
      .optional()
      .messages({
        "any.only": "Invalid department."
      }),

    employeeId: Joi.string().optional(),

    designation: Joi.string().optional(),

    skills: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).custom((value, helpers) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(skill => skill.trim());
        }
      }
      return value;
    }).optional(),
    
    assignedWards: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).custom((value, helpers) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(ward => ward.trim());
        }
      }
      return value;
    }).optional(),
    
    availability: Joi.boolean().optional(),
    
    joinDate: Joi.date().optional(),
    
    salaryGrade: Joi.string().optional(),
    
    supervisorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid supervisor ID."
      })
  }).optional()
});

const staffFilterDTO = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: Joi.string().valid('public_works', 'electricity', 'water_supply', 'sanitation', 'safety', 'emergency', 'administration'),
  availability: Joi.boolean(),
  role: Joi.string().valid('municipality_admin', 'field_staff'),
  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
});

const staffIdDTO = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid staff ID."
    })
});

export { 
  staffRegistrationDTO, 
  staffUpdateDTO, 
  staffFilterDTO, 
  staffIdDTO 
};