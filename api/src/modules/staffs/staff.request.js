import Joi from "joi";

const staffRegistrationDTO = Joi.object({
  // User fields
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("municipality_admin", "field_staff").required(),
  municipalityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  phone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).required(),
  
  // Staff fields (from Staff model)
  employeeId: Joi.string().required(),
  department: Joi.string().valid(
    'public_works', 
    'electricity', 
    'water_supply', 
    'sanitation', 
    'safety', 
    'emergency',
    'administration',
    'road_maintenance',
    'streetlight',
    'waste_management'
  ).required(),
  designation: Joi.string().required(),
  
  // Optional Staff fields
  assignedWards: Joi.array().items(Joi.string()).default([]),
  assignedZones: Joi.array().items(Joi.string()).default([]),
  skills: Joi.array().items(Joi.string()).default([]),
  tools: Joi.array().items(Joi.string()).default([]),
  vehicleNumber: Joi.string().optional().allow('', null),
  supervisorId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow('', null),
  joinDate: Joi.date().default(() => new Date()),
  salaryGrade: Joi.string().optional().allow('', null)
});

const staffUpdateDTO = Joi.object({
  // User fields that can be updated
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).optional(),
  
  // Staff fields that can be updated
  employeeId: Joi.string().optional(),
  department: Joi.string().valid(
    'public_works', 
    'electricity', 
    'water_supply', 
    'sanitation', 
    'safety', 
    'emergency',
    'administration',
    'road_maintenance',
    'streetlight',
    'waste_management'
  ).optional(),
  designation: Joi.string().optional(),
  assignedWards: Joi.array().items(Joi.string()).optional(),
  assignedZones: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  tools: Joi.array().items(Joi.string()).optional(),
  vehicleNumber: Joi.string().optional().allow('', null),
  availability: Joi.boolean().optional(),
  joinDate: Joi.date().optional(),
  salaryGrade: Joi.string().optional().allow('', null),
  supervisorId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'suspended').optional()
});

const staffSelfUpdateDTO = Joi.object({
  // Fields staff can update about themselves
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^(\+977-?)?(98|97)\d{8}$/).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  tools: Joi.array().items(Joi.string()).optional(),
  vehicleNumber: Joi.string().optional().allow('', null),
  availability: Joi.boolean().optional()
});

const staffReportsFilterDTO = Joi.object({
  // Pagination
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  
  // Status filters
  status: Joi.string().valid(
    'pending', 
    'assigned', 
    'in_progress', 
    'resolved', 
    'rejected', 
    'closed',
    'verified'
  ),
  
  // Multiple status filter (comma-separated)
  statuses: Joi.string().custom((value, helpers) => {
    if (!value) return undefined;
    const statuses = value.split(',').map(s => s.trim());
    const validStatuses = [
      'pending', 'assigned', 'in_progress', 'resolved', 
      'rejected', 'closed', 'verified'
    ];
    for (const status of statuses) {
      if (!validStatuses.includes(status)) {
        return helpers.error('any.invalid');
      }
    }
    return statuses;
  }).messages({
    'any.invalid': 'Invalid status in statuses filter'
  }),
  
  // Priority filter
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  
  // Category filter
  category: Joi.string().valid(
    'road_repair',
    'streetlight',
    'water_supply',
    'sanitation',
    'drainage',
    'waste_management',
    'safety_hazard',
    'park_maintenance',
    'electricity',
    'public_works',
    'emergency',
    'other'
  ),
  
  // Multiple categories filter (comma-separated)
  categories: Joi.string().custom((value, helpers) => {
    if (!value) return undefined;
    return value.split(',').map(c => c.trim());
  }),
  
  // Date filters
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  
  // Ward filter
  ward: Joi.string(),
  
  // Multiple wards filter (comma-separated)
  wards: Joi.string().custom((value, helpers) => {
    if (!value) return undefined;
    return value.split(',').map(w => w.trim());
  }),
  
  // Sorting
  sortBy: Joi.string().valid(
    'createdAt', 
    'updatedAt', 
    'priority', 
    'status',
    'category'
  ).default('createdAt'),
  
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  
  // Search by title/description
  search: Joi.string().max(100),
  
  // Show only reports with media
  hasMedia: Joi.boolean(),
  
  // Show only reports with specific flags
  isEmergency: Joi.boolean(),
  isVerified: Joi.boolean(),
  
  // Time-based filters
  overdue: Joi.boolean().description("Show only overdue reports"),
  
  // Resolution time filter
  maxResolutionTime: Joi.number().min(1).description("Maximum resolution time in hours"),
  
  // Citizen rating filter
  minRating: Joi.number().min(0).max(5).description("Minimum citizen rating"),
  
  // Assigned date filter (for staff)
  assignedFrom: Joi.date().iso(),
  assignedTo: Joi.date().iso()
});


const staffFilterDTO = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: Joi.string().valid(
    'public_works', 
    'electricity', 
    'water_supply', 
    'sanitation', 
    'safety', 
    'emergency',
    'administration',
    'road_maintenance',
    'streetlight',
    'waste_management'
  ),
  availability: Joi.boolean(),
  role: Joi.string().valid('municipality_admin', 'field_staff'),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'suspended')
});

const staffIdDTO = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

// For array input from query params (comma-separated)
const commaSeparatedArray = Joi.string().custom((value, helpers) => {
  if (!value) return [];
  return value.split(',').map(item => item.trim());
});

// Query params version (for GET requests with comma-separated values)
const staffQueryFilterDTO = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: Joi.string().valid(
    'public_works', 
    'electricity', 
    'water_supply', 
    'sanitation', 
    'safety', 
    'emergency',
    'administration',
    'road_maintenance',
    'streetlight',
    'waste_management'
  ),
  availability: Joi.boolean(),
  role: Joi.string().valid('municipality_admin', 'field_staff'),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'suspended'),
  // For array fields in query params
  assignedWards: commaSeparatedArray,
  skills: commaSeparatedArray
});

export { 
  staffRegistrationDTO, 
  staffUpdateDTO,
  staffSelfUpdateDTO,
  staffFilterDTO, 
  staffQueryFilterDTO,
  staffIdDTO, staffReportsFilterDTO
};