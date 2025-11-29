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

  address: Joi.string().required().messages({
    "string.empty": "Address required."
  }),

  ward: Joi.string().required().messages({
    "string.empty": "Ward required."
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

export { userRegistrationDTO, loginDTO, activationDTO, resendOtpDTO, forgetPasswordDTO, resetPasswordDTO, changePasswordDTO };