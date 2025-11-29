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
            expiryTime: generateDateTime(5),
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
        
        // Check municipality for relevant roles
        if (['citizen', 'municipality_admin', 'field_staff'].includes(data.role)) {
            if (!data.municipalityId) {
                throw {
                    status: HttpResponseCode.BAD_REQUEST, 
                    message: "Municipality ID required", 
                    statusCode: HttpResponse.validationFailed
                }
            }
            await this.checkMunicipalityExists(data.municipalityId);
        }

        // Hash password
        data.password = bcrypt.hashSync(data.password, 12);

        // Base user data
        const formattedData = {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            phone: data.phone,
            municipalityId: data.municipalityId,
            status: "pending", 
            ...this.generateActivationOtp()
        };

        // Handle profile image upload
        if (req.file) {
            const imageUrl = await this.uploadProfileImage(req.file);
            formattedData.profileImage = imageUrl;
        }

        // ✅ FIXED: Handle citizen profile fields correctly
        if (data.role === 'citizen') {
            formattedData.address = data.address; // Direct fields, not nested
            formattedData.ward = data.ward;
        }
        // Handle other role profiles if needed
        else if (data.role === 'field_staff' && data.staffProfile) {
            formattedData.staffProfile = {
                department: data.staffProfile.department,
                employeeId: data.staffProfile.employeeId,
                phone: data.staffProfile.phone,
                address: data.staffProfile.address,
                skills: data.staffProfile.skills || [],
                availability: data.staffProfile.availability !== false
            };
        }
        else if (data.role === 'sponsor' && data.sponsorProfile) {
            formattedData.sponsorProfile = {
                businessName: data.sponsorProfile.businessName,
                phone: data.sponsorProfile.phone,
                address: data.sponsorProfile.address,
                website: data.sponsorProfile.website,
                bannerImage: data.sponsorProfile.bannerImage
            };
        }

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

    forgetPassword = async (email) => {
        const user = await this.getUserByFilter({ email });
        
        if (user.status !== "active") {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Account not active.", 
                statusCode: HttpResponse.validationFailed
            }
        }

        const resetToken = this.generateActivationOtp();
        await this.updateUserById({
            forgetToken: resetToken.activationToken,
            expiryTime: resetToken.expiryTime
        }, user._id);

        await this.sendResetPasswordEmail(user, resetToken.activationToken);
        
        return true;
    };

    resetPassword = async (email, otp, newPassword) => {
        const user = await this.getUserByFilter({ email });

        if (user.forgetToken !== otp) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Invalid reset code", 
                statusCode: HttpResponse.validationFailed
            }
        }

        let today = new Date().getTime();
        let tokenExpiryTime = user.expiryTime.getTime();

        if ((today - tokenExpiryTime) > 0) {
            throw {
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Reset code expired", 
                statusCode: HttpResponse.validationFailed
            }
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        
        await this.updateUserById({
            password: hashedPassword,
            forgetToken: null,
            expiryTime: null
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
                    expiryTime: null
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