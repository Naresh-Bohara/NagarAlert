import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['citizen', 'municipality_admin', 'field_staff', 'sponsor', 'system_admin'],
        default: 'citizen'
    },
    
    municipalityId: {
        type: mongoose.Types.ObjectId,
        ref: "Municipality"
    },
    
    address: String,
    ward: String,
    
    staffProfile: {
        department: {
            type: String,
            enum: ['public_works', 'electricity', 'water_supply', 'sanitation', 'safety', 'emergency', 'administration'],
            default: 'public_works'
        },
        employeeId: String,
        designation: String,
        skills: [String],
        assignedWards: [String],
        availability: {
            type: Boolean,
            default: true
        },
        joinDate: Date,
        salaryGrade: String,
        supervisorId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    
    sponsorProfile: {
        businessName: String,
        website: String,
        bannerImage: String,
        sponsorshipTier: {
            type: String,
            enum: ['basic', 'premium', 'enterprise'],
            default: 'basic'
        }
    },
    
    phone: String,
    profileImage: String,
    points: { type: Number, default: 0 },
    
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: "pending"
    },
    activationToken: String,
    forgetToken: String,
    expiryTime: Date,
    lastLogin: Date

}, {
    timestamps: true,
    autoCreate: true,
    autoIndex: true
});

UserSchema.index({ role: 1 });
UserSchema.index({ municipalityId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'staffProfile.availability': 1 });
UserSchema.index({ 'staffProfile.department': 1 });

UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.activationToken;
    delete user.forgetToken;
    delete user.expiryTime;
    return user;
};

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;