const HttpResponse = {
    notFound: "NOT_FOUND",
    success: "Success_OK", 
    unauthenticated: "UNAUTHENTICATED",
    internalServerError: "INTERNAL_SERVER_ERROR",
    
    validationFailed: "VALIDATION_FAILED",
    
    user: {
        notActivate: "USER_NOT_ACTIVATED",
        credentialNotMatch: "CREDENTIALS_DONT_MATCH"
    },
    
    created: "CREATED",
    updated: "UPDATED",
    deleted: "DELETED",
    badRequest: "BAD_REQUEST",
    accessDenied: "ACCESS_DENIED",
    conflict: "CONFLICT"
};

export default HttpResponse;