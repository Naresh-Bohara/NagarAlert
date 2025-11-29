import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
    // File validation
    static validateFileSize(filePath, maxSizeMB = 10) {
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        if (fileSizeInMB > maxSizeMB) {
            throw new Error(`File size too large. Maximum ${maxSizeMB}MB allowed.`);
        }
        return true;
    }

    // Base upload methods
    static async uploadImage(filePath, folder = "nagaralert") {
        try {
            this.validateFileSize(filePath, 10); // 10MB for images
            
            const cloudinaryFile = await cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: "image",
                unique_filename: true,
                overwrite: false
            });

            this.cleanupFile(filePath);
            return {
                url: cloudinaryFile.secure_url,
                public_id: cloudinaryFile.public_id
            };
        } catch (exception) {
            this.cleanupFile(filePath);
            throw exception;
        }
    }

    static async uploadVideo(filePath, folder = "nagaralert/videos") {
        try {
            this.validateFileSize(filePath, 100); // 100MB for videos
            
            const cloudinaryFile = await cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: "video",
                unique_filename: true,
                overwrite: false
            });

            this.cleanupFile(filePath);
            return {
                url: cloudinaryFile.secure_url,
                public_id: cloudinaryFile.public_id,
                duration: cloudinaryFile.duration
            };
        } catch (exception) {
            this.cleanupFile(filePath);
            throw exception;
        }
    }

    // Application-specific methods (keep your existing ones)
    static async uploadProfileImage(filePath, userId) {
        try {
            const folderPath = `nagaralert/users/${userId}`;
            const result = await this.uploadImage(filePath, folderPath);
            return result;
        } catch (exception) {
            throw exception;
        }
    }

    static async uploadReportImage(filePath, reportId) {
        try {
            const folderPath = `nagaralert/reports/${reportId}`;
            const result = await this.uploadImage(filePath, folderPath);
            return result;
        } catch (exception) {
            throw exception;
        }
    }

    static async uploadReportVideo(filePath, reportId) {
        try {
            const folderPath = `nagaralert/reports/${reportId}/videos`;
            const result = await this.uploadVideo(filePath, folderPath);
            return result;
        } catch (exception) {
            throw exception;
        }
    }

    static async uploadSponsorBanner(filePath, sponsorId) {
        try {
            const folderPath = `nagaralert/sponsors/${sponsorId}`;
            const result = await this.uploadImage(filePath, folderPath);
            return result;
        } catch (exception) {
            throw exception;
        }
    }

    // Bulk operations
    static async uploadMultipleImages(files, folder = "nagaralert") {
        try {
            const uploadPromises = files.map(file => 
                this.uploadImage(file.path, folder)
            );
            const results = await Promise.all(uploadPromises);
            return results;
        } catch (exception) {
            files.forEach(file => this.cleanupFile(file.path));
            throw exception;
        }
    }

    // Keep your existing methods
    static async deleteFile(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (exception) {
            throw exception;
        }
    }

    static cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.warn("File cleanup warning:", error.message);
        }
    }
}

export default CloudinaryService;