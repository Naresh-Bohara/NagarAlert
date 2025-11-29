import HttpResponseCode from "../constants/http-status-code.contants.js";
import HttpResponse from "../constants/response-status.contants.js";


const checkPermission = (allowedRoles) => {
    return (req, res, next) => {
        // Input validation
        if (!allowedRoles || allowedRoles.length === 0) {
            return next({
                status: HttpResponseCode.BAD_REQUEST,
                message: "Route configuration error: No roles specified",
                statusCode: HttpResponse.validationFailed
            });
        }

        if (!Array.isArray(allowedRoles)) {
            return next({
                status: HttpResponseCode.BAD_REQUEST, 
                message: "Route configuration error: Roles must be an array",
                statusCode: HttpResponse.validationFailed
            });
        }

        
        if (!req.loggedInUser) {  
            return next({
                status: HttpResponseCode.UNAUTHENTICATED,
                message: "Authentication required",
                statusCode: HttpResponse.unauthenticated
            });
        }

        const userRole = req.loggedInUser.role;  

        // Check permission with better error message
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            next({
                status: HttpResponseCode.FORBIDDEN,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                statusCode: HttpResponse.accessDenied,
                meta: {
                    requiredRoles: allowedRoles,
                    userRole: userRole
                }
            });
        }
    };
};

// Professional shortcut methods for NagarAlert roles
const Require = {
    // Individual roles
    SystemAdmin: checkPermission(['system_admin']),
    MunicipalityAdmin: checkPermission(['municipality_admin']),
    FieldStaff: checkPermission(['field_staff']),
    Citizen: checkPermission(['citizen']),
    Sponsor: checkPermission(['sponsor']),
    
    // Combined permissions
    AdminOnly: checkPermission(['system_admin', 'municipality_admin']),
    StaffOnly: checkPermission(['municipality_admin', 'field_staff']),
    MunicipalityAccess: checkPermission(['municipality_admin', 'field_staff', 'citizen']),
    AllLoggedIn: checkPermission(['system_admin', 'municipality_admin', 'field_staff', 'citizen', 'sponsor'])
};

export { checkPermission, Require };