import HttpResponseCode from "../constants/http-status-code.contants.js";
import HttpResponse from "../constants/response-status.contants.js";

const bodyValidator = (schemaDto) => {
    return async (req, res, next) => {
        try {
            let data = req.body;
            
            const validatedData = await schemaDto.validateAsync(data, { abortEarly: false });
            
            req.body = validatedData;
            next();
            
        } catch (exception) {
            let msg = {};
            
            if (exception.details && Array.isArray(exception.details)) {
                exception.details.forEach((error) => {
                    msg[error.context.label] = error.message;
                });
            } else {
                msg.general = exception.message || "Validation failed";
            }
            
            next({
                detail: msg, 
                statusCode: HttpResponse.validationFailed, 
                message: "Validation Failed", 
                status: HttpResponseCode.BAD_REQUEST
            });
        }
    }
}

const queryValidator = (schemaDto) => {
    return async (req, res, next) => {
        try {
            let data = req.query;
            
            const validatedData = await schemaDto.validateAsync(data, { abortEarly: false });
            
            // FIX: Don't set req.query directly, store validated data in req.validatedQuery
            req.validatedQuery = validatedData;
            next();
            
        } catch (exception) {
            let msg = {};
            
            if (exception.details && Array.isArray(exception.details)) {
                exception.details.forEach((error) => {
                    msg[error.context.label] = error.message;
                });
            } else {
                msg.general = exception.message || "Query validation failed";
            }
            
            next({
                detail: msg, 
                statusCode: HttpResponse.validationFailed, 
                message: "Query Validation Failed", 
                status: HttpResponseCode.BAD_REQUEST
            });
        }
    }
}

const paramsValidator = (schemaDto) => {
    return async (req, res, next) => {
        try {
            let data = req.params;
            
            const validatedData = await schemaDto.validateAsync(data, { abortEarly: false });
            
            // FIX: Don't set req.params directly, store validated data in req.validatedParams
            req.validatedParams = validatedData;
            next();
            
        } catch (exception) {
            let msg = {};
            
            if (exception.details && Array.isArray(exception.details)) {
                exception.details.forEach((error) => {
                    msg[error.context.label] = error.message;
                });
            } else {
                msg.general = exception.message || "Parameter validation failed";
            }
            
            next({
                detail: msg, 
                statusCode: HttpResponse.validationFailed, 
                message: "Parameter Validation Failed", 
                status: HttpResponseCode.BAD_REQUEST
            });
        }
    }
}


const fileValidator = (options = {}) => {
    return (req, res, next) => {
        try {
            const { 
                allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
                maxSize = 5 * 1024 * 1024, // 5MB default
                required = false 
            } = options;

            // Check if file is required but not provided
            if (required && (!req.file || !req.files)) {
                throw {
                    detail: { file: 'File is required' },
                    statusCode: HttpResponse.validationFailed,
                    message: "File Validation Failed",
                    status: HttpResponseCode.BAD_REQUEST
                };
            }

            // Single file validation
            if (req.file) {
                if (!allowedTypes.includes(req.file.mimetype)) {
                    throw {
                        detail: { file: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` },
                        statusCode: HttpResponse.validationFailed,
                        message: "File Validation Failed",
                        status: HttpResponseCode.BAD_REQUEST
                    };
                }

                if (req.file.size > maxSize) {
                    throw {
                        detail: { file: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
                        statusCode: HttpResponse.validationFailed,
                        message: "File Validation Failed",
                        status: HttpResponseCode.BAD_REQUEST
                    };
                }
            }

            // Multiple files validation
            if (req.files) {
                const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
                
                for (let file of files) {
                    if (!allowedTypes.includes(file.mimetype)) {
                        throw {
                            detail: { file: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` },
                            statusCode: HttpResponse.validationFailed,
                            message: "File Validation Failed",
                            status: HttpResponseCode.BAD_REQUEST
                        };
                    }

                    if (file.size > maxSize) {
                        throw {
                            detail: { file: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
                            statusCode: HttpResponse.validationFailed,
                            message: "File Validation Failed",
                            status: HttpResponseCode.BAD_REQUEST
                        };
                    }
                }
            }

            next();
            
        } catch (exception) {
            next(exception);
        }
    }
}

const headersValidator = (schemaDto) => {
    return async (req, res, next) => {
        try {
            let data = req.headers;
            
            // Validate headers
            const validatedData = await schemaDto.validateAsync(data, { abortEarly: false, stripUnknown: true });
            
            // Replace headers with validated data
            req.headers = { ...req.headers, ...validatedData };
            next();
            
        } catch (exception) {
            let msg = {};
            
            // Handle validation errors
            exception.details.forEach((error) => {
                msg[error.context.label] = error.message;
            });
            
            next({
                detail: msg, 
                statusCode: HttpResponse.validationFailed, 
                message: "Headers Validation Failed", 
                status: HttpResponseCode.BAD_REQUEST
            });
        }
    }
}

// Combined validator for complex scenarios
const validateRequest = (validations = {}) => {
    return async (req, res, next) => {
        try {
            const { body, query, params, headers } = validations;
            const errors = {};

            // Validate body
            if (body) {
                try {
                    req.body = await body.validateAsync(req.body, { abortEarly: false });
                } catch (error) {
                    errors.body = {};
                    error.details.forEach(detail => {
                        errors.body[detail.context.label] = detail.message;
                    });
                }
            }

            // Validate query
            if (query) {
                try {
                    req.query = await query.validateAsync(req.query, { abortEarly: false });
                } catch (error) {
                    errors.query = {};
                    error.details.forEach(detail => {
                        errors.query[detail.context.label] = detail.message;
                    });
                }
            }

            // Validate params
            if (params) {
                try {
                    req.params = await params.validateAsync(req.params, { abortEarly: false });
                } catch (error) {
                    errors.params = {};
                    error.details.forEach(detail => {
                        errors.params[detail.context.label] = detail.message;
                    });
                }
            }

            // Validate headers
            if (headers) {
                try {
                    const validatedHeaders = await headers.validateAsync(req.headers, { abortEarly: false, stripUnknown: true });
                    req.headers = { ...req.headers, ...validatedHeaders };
                } catch (error) {
                    errors.headers = {};
                    error.details.forEach(detail => {
                        errors.headers[detail.context.label] = detail.message;
                    });
                }
            }

            // Check if any errors occurred
            if (Object.keys(errors).length > 0) {
                throw {
                    detail: errors,
                    statusCode: HttpResponse.validationFailed,
                    message: "Request Validation Failed",
                    status: HttpResponseCode.BAD_REQUEST
                };
            }

            next();
            
        } catch (exception) {
            next(exception);
        }
    }
}

export { 
    bodyValidator, 
    queryValidator, 
    paramsValidator, 
    fileValidator, 
    headersValidator,
    validateRequest 
};