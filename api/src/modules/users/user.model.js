// models/user.model.js (FIXED - Remove middleware)
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // ========== CORE AUTHENTICATION ==========
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    
    // ========== ROLE & ACCESS ==========
    role: {
        type: String,
        enum: ['citizen', 'municipality_admin', 'field_staff', 'sponsor', 'system_admin'],
        required: true,
        default: 'citizen'
    },
    
    // ========== COMMON INFO ==========
    phone: {
        type: String,
        required: true
    },
    profileImage: String,
    municipalityId: {
        type: mongoose.Types.ObjectId,
        ref: "Municipality"
    },
    
    // ========== CITIZEN-SPECIFIC FIELDS ==========
    address: String,
    ward: String,
    
    // Geo Location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: String,
        formattedAddress: String
    },
    
    // Citizen reward system
    points: { 
        type: Number, 
        default: 0
    },
    
    // ========== ACCOUNT MANAGEMENT ==========
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: "pending"
    },
    
    // ========== SECURITY ==========
    activationToken: String,
    resetToken: String,
    tokenExpiry: Date,
    
    // ========== ACTIVITY ==========
    lastLogin: Date

}, {
    timestamps: true
});

// ========== INDEXES ==========
// Geospatial index
UserSchema.index({ "location.coordinates": "2dsphere" });

// Common indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ municipalityId: 1 });
UserSchema.index({ points: -1 });

// ========== METHODS ==========
// Remove sensitive data
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.activationToken;
    delete user.resetToken;
    delete user.tokenExpiry;
    return user;
};

// Check if user is citizen
UserSchema.methods.isCitizen = function() {
    return this.role === 'citizen';
};

// Check if user is staff
UserSchema.methods.isStaff = function() {
    return this.role === 'field_staff';
};

// Add points (citizen only)
UserSchema.methods.addPoints = function(pointsToAdd) {
    if (this.role !== 'citizen') {
        throw new Error('Only citizens can earn points');
    }
    this.points += pointsToAdd;
    return this.save();
};

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;