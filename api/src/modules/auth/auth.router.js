import { Router } from "express";
import { loginDTO, userRegistrationDTO, activationDTO, resendOtpDTO, forgetPasswordDTO, resetPasswordDTO, changePasswordDTO } from "./auth.request.js";
import { uploadFile } from "../../middlewares/multipart-parser.middleware.js";
import { bodyValidator } from "../../middlewares/request-validator.middleware.js";
import { checkLogin, refreshToken } from "../../middlewares/auth.middleware.js";
import authCtrl from "./auth.controller.js"
import { profileImageUpload } from "../../config/upload.config.js";

const authRouter = Router();

authRouter.post("/register", profileImageUpload, bodyValidator(userRegistrationDTO), authCtrl.register);

authRouter.post("/activate", bodyValidator(activationDTO), authCtrl.activateUser);

authRouter.post("/resend-otp", bodyValidator(resendOtpDTO), authCtrl.resendOtp);

authRouter.post("/login", bodyValidator(loginDTO), authCtrl.login);

authRouter.get("/refresh", refreshToken, authCtrl.refreshToken);

authRouter.post("/forget-password", bodyValidator(forgetPasswordDTO), authCtrl.forgetPassword);

authRouter.post("/reset-password", bodyValidator(resetPasswordDTO), authCtrl.resetPassword);

authRouter.put("/change-password", checkLogin, bodyValidator(changePasswordDTO), authCtrl.changePassword);

authRouter.get("/profile", checkLogin, authCtrl.getLoggedInUser);

authRouter.put("/profile", checkLogin, profileImageUpload, authCtrl.updateProfile);

authRouter.put("/profile/:id", checkLogin, authCtrl.updateUserById);

export default authRouter;