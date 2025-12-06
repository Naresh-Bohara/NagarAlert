import Joi from "joi";

const createEmergencyDTO = Joi.object({
  name: Joi.string().valid(
    'Police', 'Ambulance', 'Fire Brigade', 'Women Helpline',
    'Child Helpline', 'Disaster Management', 'Traffic Police'
  ).required().messages({
    "any.only": "Invalid service name",
    "string.empty": "Service name is required"
  }),

  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Phone must be 10 digits"
  }),

  altPhone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
  whatsapp: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
  email: Joi.string().email().allow('', null),
  logo: Joi.string().uri().allow('', null),
  description: Joi.string().max(500).allow('', null),

  location: Joi.object({
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    lat: Joi.number().min(-90).max(90).allow(null),
    lng: Joi.number().min(-180).max(180).allow(null)
  }).optional(),

  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  
  category: Joi.string().valid(
    'police', 'medical', 'fire', 'helpline', 'traffic', 'disaster'
  ).required().messages({
    "any.only": "Invalid category",
    "string.empty": "Category is required"
  }),

  is24x7: Joi.boolean().default(true),
  avgResponseTime: Joi.number().min(0).allow(null)
});

const updateEmergencyDTO = Joi.object({
  name: Joi.string().valid(
    'Police', 'Ambulance', 'Fire Brigade', 'Women Helpline',
    'Child Helpline', 'Disaster Management', 'Traffic Police'
  ).optional(),

  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  altPhone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
  whatsapp: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null),
  email: Joi.string().email().allow('', null),
  logo: Joi.string().uri().allow('', null),
  description: Joi.string().max(500).allow('', null),

  location: Joi.object({
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    lat: Joi.number().min(-90).max(90).allow(null),
    lng: Joi.number().min(-180).max(180).allow(null)
  }).optional(),

  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  
  category: Joi.string().valid(
    'police', 'medical', 'fire', 'helpline', 'traffic', 'disaster'
  ).optional(),

  isActive: Joi.boolean(),
  is24x7: Joi.boolean(),
  avgResponseTime: Joi.number().min(0).allow(null)
});

const emergencyFilterDTO = Joi.object({
  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  category: Joi.string().valid(
    'police', 'medical', 'fire', 'helpline', 'traffic', 'disaster'
  ),
  isActive: Joi.boolean(),
  search: Joi.string().max(100),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20)
});

const emergencyIdDTO = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export { 
  createEmergencyDTO, 
  updateEmergencyDTO, 
  emergencyFilterDTO,
  emergencyIdDTO
};