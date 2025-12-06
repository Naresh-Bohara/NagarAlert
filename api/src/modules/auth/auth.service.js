import bcrypt from "bcryptjs";
import { generateDateTime, generateRandomString } from "../../utilities/helpers.js";
import mailSvc from "../../services/mail.service.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import HttpResponse from "../../constants/response-status.contants.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import UserModel from "../users/user.model.js";

class AuthService {
    generateActivationOtp = () => {
        return {
            activationToken: generateRandomString(6).toUpperCase(),
            tokenExpiry: generateDateTime(5), // CHANGED: expiryTime → tokenExpiry
        }
    }

    uploadProfileImage = async (file) => {
        if (!file) return null;
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw {
                status: HttpResponseCode.BAD_REQUEST,
                message: "Invalid image format",
                statusCode: HttpResponse.validationFailed
            }
        }

        if (file.size > 5 * 1024 * 1024) {
            throw {
                status: HttpResponseCode.BAD_REQUEST,
                message: "Image too large",
                statusCode: HttpResponse.validationFailed
            }
        }

        const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/users/temp');
        return uploadResult.url;
    }

    checkMunicipalityExists = async (municipalityId) => {
        const municipality = await MunicipalityModel.findById(municipalityId);
        if (!municipality) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Municipality not found", 
                statusCode: HttpResponse.validationFailed
            }
        }
        return municipality;
    }

    transformCreateUser = async (req) => {
        const data = req.body;
        
        data.role = 'citizen';

        if (!data.municipalityId) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Municipality ID is required", 
                statusCode: HttpResponse.validationFailed
            }
        }
        
        if (!data.address || !data.ward) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Address and ward are required", 
                statusCode: HttpResponse.validationFailed
            }
        }

        await this.checkMunicipalityExists(data.municipalityId);

        let locationData = null;
        if (data.location) {
            try {
                locationData = typeof data.location === 'string' 
                    ? JSON.parse(data.location) 
                    : data.location;
                
                if (!locationData.latitude || !locationData.longitude) {
                    throw new Error('Invalid location coordinates');
                }
                
                locationData = {
                    type: 'Point',
                    coordinates: [locationData.longitude, locationData.latitude],
                    address: locationData.address || '',
                    formattedAddress: locationData.address || ''
                };
            } catch (error) {
                throw {
                    status: HttpResponseCode.BAD_REQUEST,
                    message: "Invalid location data format",
                    statusCode: HttpResponse.validationFailed
                };
            }
        }

        const { activationToken, tokenExpiry } = this.generateActivationOtp(); // CHANGED

        const formattedData = {
            name: data.name,
            email: data.email,
            password: data.password, // Will be hashed by pre-save middleware
            role: data.role,
            phone: data.phone,
            municipalityId: data.municipalityId,
            address: data.address,
            ward: data.ward,
            location: locationData,
            status: "pending", 
            points: 0,
            activationToken: activationToken,
            tokenExpiry: tokenExpiry // CHANGED
        };

        if (req.file) {
            const imageUrl = await this.uploadProfileImage(req.file);
            formattedData.profileImage = imageUrl;
        }

        formattedData.citizenProfile = {
            address: data.address,
            ward: data.ward,
            location: locationData,
            registrationDate: new Date()
        };

        return formattedData;
    }

    registerUser = async (data) => {
        const existingUser = await UserModel.findOne({ email: data.email });
        if (existingUser) {
            throw {
                status: HttpResponseCode.BAD_REQUEST,
                message: "Email already registered",
                statusCode: HttpResponse.validationFailed
            };
        }

        const userObj = new UserModel(data);
        return await userObj.save();
    }

    sendActivationEmail = async (user) => {
        let msg = `
        <div>Welcome to NagarAlert!</div>
        <p>Dear ${user.name},</p>
        <p>Your activation code: <strong>${user.activationToken}</strong></p>
        <p>Valid for 5 minutes</p>
        `;
        
        await mailSvc.sendEmail(user.email, "Activate your NagarAlert Account", msg);
        return true;
    }

    reSendActivationEmail = async (user) => {
        let msg = `
        <div>Your New OTP Code</div>
        <p>Dear ${user.name},</p>
        <p>New activation code: <strong>${user.activationToken}</strong></p>
        <p>Valid for 5 minutes</p>
        `;
        
        await mailSvc.sendEmail(user.email, "New Activation Code - NagarAlert", msg);
        return true;
    }

    // NEW SERVICE METHOD: Activate user account with proper error handling
    activateUserAccount = async (email, otp) => {
        const user = await this.getUserByFilter({ email });

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

        // FIX: Check if tokenExpiry exists (not expiryTime)
        if (!user.tokenExpiry) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "OTP has expired or is invalid", 
                statusCode: HttpResponse.validationFailed
            }
        }

        // FIX: Use tokenExpiry instead of expiryTime
        const today = new Date();
        const otpExpiryTime = new Date(user.tokenExpiry);

        if (today > otpExpiryTime) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "OTP code expired", 
                statusCode: HttpResponse.validationFailed
            }
        }

        // Activate the user
        await this.activateUser(user._id);

        return {
            success: true,
            message: "Account activated successfully",
            user: user
        };
    }

    // NEW SERVICE METHOD: Resend OTP with proper error handling
    resendUserOtp = async (email) => {
        const user = await this.getUserByFilter({ email });

        if (user.status !== "pending") {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "User already activated.", 
                statusCode: HttpResponse.validationFailed
            }
        }

        // Generate new OTP
        const { activationToken, tokenExpiry } = this.generateActivationOtp(); // CHANGED
        await this.updateUserById({
            activationToken: activationToken,
            tokenExpiry: tokenExpiry // CHANGED
        }, user._id);

        // Send email with new OTP
        await mailSvc.sendEmail(user.email, "New Activation Code - NagarAlert", `
            <div>Your New OTP Code</div>
            <p>Dear ${user.name},</p>
            <p>New activation code: <strong>${activationToken}</strong></p>
            <p>Valid for 5 minutes</p>
        `);

        return {
            success: true,
            message: "New OTP code sent to your email",
            otp: activationToken
        };
    }

  forgetPassword = async (email) => {
    const user = await this.getUserByFilter({ email });
    
    if (user.status !== "active") {
        throw {
            status: HttpResponseCode.BAD_REQUEST, 
            message: "Account not active.", 
            statusCode: HttpResponse.validationFailed
        }
    }

    const { activationToken, tokenExpiry } = this.generateActivationOtp();
    
    // Update user with reset token and expiry
    await this.updateUserById({
        resetToken: activationToken,
        tokenExpiry: tokenExpiry
    }, user._id);

    // Send email with OTP
    await this.sendResetPasswordEmail(user, activationToken);
    
    // Return the reset token so frontend can use it in URL
    return {
        success: true,
        resetToken: activationToken,
        message: "Password reset OTP sent to your email"
    };
};

resetPassword = async (email, otp, newPassword) => {
    const user = await this.getUserByFilter({ email });

    if (user.resetToken !== otp) {
        throw {
            status: HttpResponseCode.BAD_REQUEST, 
            message: "Invalid reset code", 
            statusCode: HttpResponse.validationFailed
        }
    }

    if (!user.tokenExpiry) {
        throw {
            status: HttpResponseCode.BAD_REQUEST, 
            message: "Reset code has expired", 
            statusCode: HttpResponse.validationFailed
        }
    }

    const today = new Date();
    const tokenExpiryTime = new Date(user.tokenExpiry);

    if (today > tokenExpiryTime) {
        throw {
            status: HttpResponseCode.BAD_REQUEST, 
            message: "Reset code expired", 
            statusCode: HttpResponse.validationFailed
        }
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 12);
    
    await this.updateUserById({
        password: hashedPassword,
        resetToken: null,
        tokenExpiry: null
    }, user._id);

    return {
        success: true,
        message: "Password reset successfully"
    };
};

    resetPassword = async (email, otp, newPassword) => {
        const user = await this.getUserByFilter({ email });

        // FIX: Check resetToken (not forgetToken)
        if (user.resetToken !== otp) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Invalid reset code", 
                statusCode: HttpResponse.validationFailed
            }
        }

        // FIX: Use tokenExpiry instead of expiryTime
        if (!user.tokenExpiry) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Reset code has expired", 
                statusCode: HttpResponse.validationFailed
            }
        }

        const today = new Date();
        const tokenExpiryTime = new Date(user.tokenExpiry); // CHANGED

        if (today > tokenExpiryTime) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Reset code expired", 
                statusCode: HttpResponse.validationFailed
            }
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        
        await this.updateUserById({
            password: hashedPassword,
            resetToken: null,
            tokenExpiry: null // CHANGED
        }, user._id);

        return true;
    };

    sendResetPasswordEmail = async (user, resetToken) => {
        let msg = `
        <div>Password Reset Request</div>
        <p>Dear ${user.name},</p>
        <p>Your password reset code: <strong>${resetToken}</strong></p>
        <p>Valid for 5 minutes</p>
        `;
        
        await mailSvc.sendEmail(user.email, "Password Reset - NagarAlert", msg);
        return true;
    };

    getUserByFilter = async (filter) => {
        const user = await UserModel.findOne(filter);
        if (!user) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "User Not Found", 
                statusCode: HttpResponse.validationFailed
            }
        }
        return user;
    }

    updateUserById = async (data, userId) => {
        const user = await UserModel.findByIdAndUpdate(
            userId, 
            { $set: data },
            { new: true } 
        );
        return user;
    }

    activateUser = async (userId) => {
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    status: 'active',
                    activationToken: null,
                    tokenExpiry: null // CHANGED
                } 
            },
            { new: true }
        );
        return user;
    }

    changePassword = async (userId, currentPassword, newPassword) => {
        const user = await this.getUserByFilter({ _id: userId });

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Current password is incorrect", 
                statusCode: HttpResponse.validationFailed
            }
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        
        await this.updateUserById({
            password: hashedPassword
        }, user._id);

        return true;
    };
}

const authSvc = new AuthService();
export default authSvc;