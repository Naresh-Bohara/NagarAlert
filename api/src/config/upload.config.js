// config/upload.config.js
import { uploadFile } from "../middlewares/multipart-parser.middleware.js";

// Report specific upload (images + videos)
export const reportUpload = uploadFile(["image", "video"]).fields([
    { name: 'photos', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]);

// Profile image upload
export const profileImageUpload = uploadFile(["image"]).single('profileImage');

// Document upload
export const documentUpload = uploadFile(["document"]).single('document');

// Multiple images only
export const imagesUpload = uploadFile(["image"]).array('images', 10);

// Any file type (be careful with this one)
export const anyFileUpload = uploadFile(["image", "video", "document"]).single('file');

export default {
    reportUpload,
    profileImageUpload,
    documentUpload,
    imagesUpload,
    anyFileUpload
};