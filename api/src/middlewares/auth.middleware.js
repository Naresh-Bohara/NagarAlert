import jwt from "jsonwebtoken";
const { TokenExpiredError, JsonWebTokenError } = jwt;

import HttpResponseCode from "../constants/http-status-code.contants.js";
import HttpResponse from "../constants/response-status.contants.js";
import authSvc from "../modules/auth/auth.service.js";

// -------------------------
// MAIN LOGIN MIDDLEWARE
// -------------------------
const checkLogin = async (req, res, next) => {
    try {
        let token = req.headers["authorization"] || null;

        if (!token) {
            throw {
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Please login first.",
                statusCode: HttpResponse.unauthenticated,
            };
        }

        token = token.split(" ").pop();

        // Decode JWT
        const data = jwt.verify(token, process.env.JWT_SECRET);

        const user = await authSvc.getUserByFilter({ _id: data.sub });

        if (!user) {
            throw {
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "User not found.",
                statusCode: HttpResponse.unauthenticated,
            };
        }

        // Check active/inactive
        if (user.status !== "active") {
            throw {
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Account is not active.",
                statusCode: HttpResponse.user.notActivate,
            };
        }

        // -------------------------
        // BASE USER DATA
        // -------------------------
        const loggedInUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role, // citizen, municipality_admin, system_admin, field_staff, sponsor
            profileImage: user.profileImage,
            status: user.status,
             municipalityId: user.municipalityId,
        };

        // -------------------------
        // ROLE-SPECIFIC PROFILES
        // -------------------------

        // CITIZEN EXTRA PROFILE
        if (user.role === "citizen" && user.citizenProfile) {
            loggedInUser.citizenProfile = user.citizenProfile;
        }

        // MUNICIPALITY ADMIN EXTRA PROFILE
        if (user.role === "municipality_admin" && user.municipalityProfile) {
            loggedInUser.municipalityProfile = user.municipalityProfile; // e.g. wardId, area, office info
        }

        // SYSTEM ADMIN EXTRA PROFILE (usually empty)
        if (user.role === "system_admin") {
            loggedInUser.systemAccess = "full_control";
        }

        // FIELD STAFF EXTRA PROFILE
        if (user.role === "field_staff" && user.staffProfile) {
            loggedInUser.staffProfile = user.staffProfile; // e.g. department, skills, availability
        }

        // SPONSOR EXTRA PROFILE
        if (user.role === "sponsor" && user.sponsorProfile) {
            loggedInUser.sponsorProfile = user.sponsorProfile; // business info, banner count
        }

        req.loggedInUser = loggedInUser;

        next();
    } catch (exception) {
        if (exception instanceof TokenExpiredError) {
            next({
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Token expired. Please login again.",
                statusCode: HttpResponse.unauthenticated,
            });
        } else if (exception instanceof JsonWebTokenError) {
            next({
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Invalid token.",
                statusCode: HttpResponse.unauthenticated,
            });
        } else {
            next(exception);
        }
    }
};

// -------------------------
// REFRESH TOKEN
// -------------------------
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.headers["refresh"] || null;

        if (!refreshToken) {
            throw {
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Refresh token missing.",
                statusCode: HttpResponse.unauthenticated,
            };
        }

        const data = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const user = await authSvc.getUserByFilter({ _id: data.sub });

        if (!user) {
            throw {
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "User not found.",
                statusCode: HttpResponse.unauthenticated,
            };
        }

        // Base user info
        const loggedInUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage,
            status: user.status,
        };

        // Role extras (same as above)
        if (user.role === "citizen" && user.citizenProfile) {
            loggedInUser.citizenProfile = user.citizenProfile;
        }

        if (user.role === "municipality_admin" && user.municipalityProfile) {
            loggedInUser.municipalityProfile = user.municipalityProfile;
        }

        if (user.role === "field_staff" && user.staffProfile) {
            loggedInUser.staffProfile = user.staffProfile;
        }

        if (user.role === "sponsor" && user.sponsorProfile) {
            loggedInUser.sponsorProfile = user.sponsorProfile;
        }

        req.loggedInUser = loggedInUser;

        next();
    } catch (exception) {
        if (exception instanceof TokenExpiredError) {
            next({
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Refresh token expired.",
                statusCode: HttpResponse.unauthenticated,
            });
        } else if (exception instanceof JsonWebTokenError) {
            next({
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Invalid refresh token.",
                statusCode: HttpResponse.unauthenticated,
            });
        } else {
            next(exception);
        }
    }
};

export { checkLogin, refreshToken };
