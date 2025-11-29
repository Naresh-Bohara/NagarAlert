import multer from "multer";
import fs from "fs";
import path from "path";
import HttpResponse from "../constants/response-status.contants.js";
import HttpResponseCode from "../constants/http-status-code.contants.js";

const ensureUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "./uploads/temp";
        ensureUploadDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}_${randomString}${ext}`);
    }
});

// Supported file types configuration
const FILE_TYPES = {
    image: {
        extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 5 * 1024 * 1024 // 5MB
    },
    video: {
        extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
        mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'],
        maxSize: 50 * 1024 * 1024 // 50MB
    },
    document: {
        extensions: ['pdf', 'doc', 'docx', 'txt'],
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        maxSize: 10 * 1024 * 1024 // 10MB
    }
};

// Enhanced uploadFile function that accepts both string and array
const uploadFile = (allowedTypes = ["image"]) => {
    // Convert string to array for backward compatibility
    const typesArray = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
    
    const typeFilter = (req, file, cb) => {
        const ext = file.originalname.split(".").pop().toLowerCase();
        const mimeType = file.mimetype;

        // Collect all allowed extensions and MIME types
        let allowedExtensions = [];
        let allowedMimeTypes = [];
        
        typesArray.forEach(type => {
            if (FILE_TYPES[type]) {
                allowedExtensions.push(...FILE_TYPES[type].extensions);
                allowedMimeTypes.push(...FILE_TYPES[type].mimeTypes);
            }
        });

        // Check both extension and MIME type for better security
        const isExtensionValid = allowedExtensions.includes(ext);
        const isMimeTypeValid = allowedMimeTypes.includes(mimeType);

        if (isExtensionValid && isMimeTypeValid) {
            cb(null, true);
        } else {
            cb({
                status: HttpResponseCode.BAD_REQUEST,
                message: `File type not supported. Allowed: ${typesArray.join(', ')}. Your file: ${file.originalname} (${mimeType})`,
                code: HttpResponse.validationFailed
            }, false);
        }
    };

    const getFileSizeLimit = () => {
        // Use the largest size limit among allowed types
        let maxSize = 5 * 1024 * 1024; // Default 5MB
        
        typesArray.forEach(type => {
            if (FILE_TYPES[type] && FILE_TYPES[type].maxSize > maxSize) {
                maxSize = FILE_TYPES[type].maxSize;
            }
        });
        
        return maxSize;
    };

    return multer({
        storage: storage,
        fileFilter: typeFilter,
        limits: {
            fileSize: getFileSizeLimit()
        }
    });
};

export { uploadFile };