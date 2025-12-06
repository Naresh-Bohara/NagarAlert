import Joi from "joi";

// user registration
const userRegistrationDTO = Joi.object({
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
    .valid("citizen", "municipality_admin", "field_staff", "sponsor")
    .optional()
    .default("citizen")
    .messages({
      "any.only": "Invalid role."
    }),

  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional() 
    .messages({
      "string.pattern.base": "Invalid municipality ID."
    }),

  phone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .required()
    .messages({
      "string.empty": "Phone required.",
      "string.pattern.base": "Invalid Nepali number."
    }),

  address: Joi.string().min(5).required().messages({
    "string.empty": "Address required.",
    "string.min": "Address must be at least 5 characters."
  }),

  ward: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.empty": "Ward required.",
      "string.pattern.base": "Ward must be a number."
    }),

  // Location field - can be object or JSON string
  location: Joi.alternatives()
    .try(
      // Accept as object
      Joi.object({
        latitude: Joi.number()
          .min(-90)
          .max(90)
          .required()
          .messages({
            "number.base": "Latitude must be a number.",
            "number.min": "Latitude must be between -90 and 90.",
            "number.max": "Latitude must be between -90 and 90.",
            "any.required": "Latitude is required."
          }),
        longitude: Joi.number()
          .min(-180)
          .max(180)
          .required()
          .messages({
            "number.base": "Longitude must be a number.",
            "number.min": "Longitude must be between -180 and 180.",
            "number.max": "Longitude must be between -180 and 180.",
            "any.required": "Longitude is required."
          }),
        address: Joi.string().optional()
      }),
      // Accept as string (JSON string from FormData)
      Joi.string()
    )
    .optional()
    .messages({
      "alternatives.match": "Location must be a valid object or JSON string.",
      "alternatives.types": "Location must be a valid object or JSON string."
    }),

  profileImage: Joi.string().optional()
});

// login
const loginDTO = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email required.",
    "string.email": "Invalid email."
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password required."
  })
});

// otp activation
const activationDTO = Joi.object({
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits.",
    "string.empty": "OTP required."
  }),
  email: Joi.string().email().required()
});

// resend otp
const resendOtpDTO = Joi.object({
  email: Joi.string().email().required()
});

// Forget Password DTO
const forgetPasswordDTO = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email required.",
    "string.email": "Invalid email."
  })
});

// Reset Password DTO
const resetPasswordDTO = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits.",
    "string.empty": "OTP required."
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.empty": "New password required.",
    "string.min": "Password too short."
  })
});

// Change Password DTO
const changePasswordDTO = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password required."
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.empty": "New password required.",
    "string.min": "Password too short."
  })
});

export { 
  userRegistrationDTO, 
  loginDTO, 
  activationDTO, 
  resendOtpDTO, 
  forgetPasswordDTO, 
  resetPasswordDTO, 
  changePasswordDTO 
};