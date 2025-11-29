import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import HttpResponse from "../../constants/response-status.contants.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import authSvc from "./auth.service.js";

class AuthController {
  register = async (req, res, next) => {
    try {
      const formattedData = await authSvc.transformCreateUser(req);
      const user = await authSvc.registerUser(formattedData);
      await authSvc.sendActivationEmail(user);

      res.json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profileImage: user.profileImage
        },
        message: "Registration successful. Check email for activation code.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  activateUser = async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const user = await authSvc.getUserByFilter({ email });

      if (user.status !== "pending") {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "User already activated.", 
          statusCode: HttpResponse.validationFailed
        }
      }

      if (user.activationToken !== otp) {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "Incorrect OTP code", 
          statusCode: HttpResponse.validationFailed
        }
      }

      let today = new Date().getTime();
      let otpExpiryTime = user.expiryTime.getTime();

      if ((today - otpExpiryTime) > 0) {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "OTP code expired", 
          statusCode: HttpResponse.validationFailed
        }
      }

      await authSvc.activateUser(user._id);

      res.json({
        data: null,
        message: "Account activated successfully.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  resendOtp = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await authSvc.getUserByFilter({ email });

      if (user.status !== "pending") {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "User already activated.", 
          statusCode: HttpResponse.validationFailed
        }
      }

      const newOtpCode = authSvc.generateActivationOtp();
      await authSvc.updateUserById(newOtpCode, user._id);

      await authSvc.reSendActivationEmail({
        email: user.email, 
        activationToken: newOtpCode.activationToken, 
        name: user.name
      });

      res.json({
        data: null,
        message: "New OTP code sent to your email.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await authSvc.getUserByFilter({ email });

      if (user.status !== "active") {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "Account not active.", 
          statusCode: HttpResponse.user.notActivate
        }
      }

      if (bcrypt.compareSync(password, user.password)) {
        const payload = {
          sub: user._id,
          role: user.role,
          municipalityId: user.municipalityId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });

        let userDetail = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          municipalityId: user.municipalityId,
          points: user.points,
          lastLogin: user.lastLogin
        };

        if (user.role === 'citizen' && user.citizenProfile) {
          userDetail.citizenProfile = user.citizenProfile;
        } else if (user.role === 'field_staff' && user.staffProfile) {
          userDetail.staffProfile = user.staffProfile;
        } else if (user.role === 'sponsor' && user.sponsorProfile) {
          userDetail.sponsorProfile = user.sponsorProfile;
        }

        await authSvc.updateUserById({ lastLogin: new Date() }, user._id);

        res.json({
          data: {
            token: token,
            refreshToken: refreshToken,
            detail: userDetail
          },
          message: "Login successful.",
          status: HttpResponse.success,
          options: null
        });

      } else {
        throw {
          status: HttpResponseCode.BAD_REQUEST, 
          message: "Invalid credentials.", 
          statusCode: HttpResponse.user.credentialNotMatch
        }
      }

    } catch (exception) {
      next(exception);
    }
  };

  getLoggedInUser = async (req, res, next) => {
    try {
      const user = await authSvc.getUserByFilter({ _id: req.loggedInUser._id });
      
      let userDetail = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        municipalityId: user.municipalityId,
        points: user.points,
        status: user.status,
        lastLogin: user.lastLogin
      };

      if (user.role === 'citizen' && user.citizenProfile) {
        userDetail.citizenProfile = user.citizenProfile;
      } else if (user.role === 'field_staff' && user.staffProfile) {
        userDetail.staffProfile = user.staffProfile;
      } else if (user.role === 'sponsor' && user.sponsorProfile) {
        userDetail.sponsorProfile = user.sponsorProfile;
      }

      res.json({
        data: userDetail,
        message: "User profile fetched successfully.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  refreshToken = (req, res, next) => {
    try {
      const authUser = req.authUser;

      const payload = {
        sub: authUser._id,
        role: authUser.role,
        municipalityId: authUser.municipalityId
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });
      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });

      res.json({
        data: {
          token: token,
          refreshToken: refreshToken
        },
        message: "Token refreshed successfully.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const userId = req.authUser._id;
      const data = req.body;

      if (req.file) {
        const imageUrl = await authSvc.uploadProfileImage(req.file);
        data.profileImage = imageUrl;
      }

      const updatedUser = await authSvc.updateUserById(data, userId);
      
      res.json({
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage
        },
        message: "Profile updated successfully.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateUserById = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const data = req.body;

      const updatedUser = await authSvc.updateUserById(data, userId);
      
      res.json({
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status
        },
        message: "User updated successfully.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authSvc.forgetPassword(email);

    res.json({
      data: null,
      message: "Password reset code sent to your email.",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};

resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await authSvc.resetPassword(email, otp, newPassword);

    res.json({
      data: null,
      message: "Password reset successfully.",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};

changePassword = async (req, res, next) => {
  try {
    const userId = req.loggedInUser._id;
    const { currentPassword, newPassword } = req.body;
    
    await authSvc.changePassword(userId, currentPassword, newPassword);

    res.json({
      data: null,
      message: "Password changed successfully.",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};
}

const authCtrl = new AuthController();
export default authCtrl;