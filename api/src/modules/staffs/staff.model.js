// models/staff.model.js (OPTIMIZED)
import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    // ========== USER REFERENCE ==========
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    
    // ========== EMPLOYMENT DETAILS ==========
    employeeId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^[A-Z0-9\-]+$/, 'Invalid employee ID format']
    },
    department: {
        type: String,
        enum: [
            'public_works', 'electricity', 'water_supply', 'sanitation', 
            'safety', 'emergency', 'administration', 'road_maintenance', 
            'streetlight', 'waste_management', 'drainage', 'parks', 
            'building_inspection', 'traffic', 'environment'
        ],
        required: true
    },
    designation: {
        type: String,
        required: true,
        enum: [
            'junior_officer', 'field_officer', 'senior_officer', 
            'supervisor', 'department_head', 'assistant', 'technician',
            'engineer', 'inspector', 'coordinator'
        ]
    },
    
    // ========== WORK ASSIGNMENT ==========
    municipalityId: {
        type: mongoose.Types.ObjectId,
        ref: "Municipality",
        required: true
    },
    assignedWards: [{
        type: String,
        match: [/^\d+$/, 'Ward must be a number']
    }],
    assignedZones: [String],
    workRadius: { // Maximum distance from municipal office (in meters)
        type: Number,
        default: 10000, // 10km
        min: 1000
    },
    
    // ========== SKILLS & TOOLS ==========
    skills: [{
        type: String,
        enum: [
            'pothole_repair', 'pipe_installation', 'electrical_repair',
            'waste_collection', 'road_marking', 'tree_pruning',
            'drain_cleaning', 'streetlight_maintenance', 'inspection',
            'carpentry', 'plumbing', 'masonry', 'painting'
        ]
    }],
    tools: [String],
    vehicleNumber: {
        type: String,
        uppercase: true,
        match: [/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/, 'Invalid vehicle number']
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'car', 'truck', 'van', 'tractor', 'none'],
        default: 'none'
    },
    
    // ========== WORK STATUS ==========
    availability: {
        type: Boolean,
        default: true,
        index: true
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number], // [longitude, latitude]
        lastUpdated: Date,
        accuracy: Number // GPS accuracy in meters
    },
    workStatus: {
        type: String,
        enum: ['available', 'on_duty', 'on_break', 'off_duty', 'emergency'],
        default: 'available'
    },
    shift: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }, // HH:MM
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    },
    
    // ========== PERFORMANCE METRICS ==========
    totalTasksAssigned: {
        type: Number,
        default: 0,
        min: 0
    },
    tasksCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    tasksInProgress: {
        type: Number,
        default: 0,
        min: 0
    },
    averageResolutionTime: { // in hours
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    citizenRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    supervisorRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    
    // ========== HIERARCHY ==========
    supervisorId: {
        type: mongoose.Types.ObjectId,
        ref: "Staff"
    },
    subordinates: [{
        type: mongoose.Types.ObjectId,
        ref: "Staff"
    }],
    
    // ========== EMPLOYMENT INFO ==========
    joinDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    salaryGrade: String,
    contractType: {
        type: String,
        enum: ['permanent', 'contract', 'temporary', 'part_time'],
        default: 'permanent'
    },
    
    // ========== DOCUMENTS ==========
    documents: [{
        documentType: {
            type: String,
            enum: ['id_proof', 'address_proof', 'employment_letter', 
                   'certificate', 'license', 'insurance', 'contract']
        },
        url: String,
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
        expiryDate: Date
    }],
    
    // ========== STATUS ==========
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave', 'suspended', 'training'],
        default: 'active'
    },
    leaveBalance: {
        type: Number,
        default: 18, // Typical annual leave days
        min: 0
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========== VIRTUAL FIELDS ==========
StaffSchema.virtual('completionRate').get(function() {
    if (this.totalTasksAssigned === 0) return 0;
    return Math.round((this.tasksCompleted / this.totalTasksAssigned) * 100);
});

StaffSchema.virtual('averageRating').get(function() {
    const ratings = [];
    if (this.rating > 0) ratings.push(this.rating);
    if (this.citizenRating > 0) ratings.push(this.citizenRating);
    if (this.supervisorRating > 0) ratings.push(this.supervisorRating);
    
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b) / ratings.length;
});

StaffSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// ========== INDEXES ==========
StaffSchema.index({ userId: 1 }, { unique: true });
StaffSchema.index({ employeeId: 1 }, { unique: true });
StaffSchema.index({ municipalityId: 1 });
StaffSchema.index({ department: 1 });
StaffSchema.index({ assignedWards: 1 });
StaffSchema.index({ supervisorId: 1 });
StaffSchema.index({ status: 1 });
StaffSchema.index({ availability: 1 });
StaffSchema.index({ "currentLocation.coordinates": "2dsphere" });
StaffSchema.index({ municipalityId: 1, department: 1, availability: 1 });

// ========== METHODS ==========
// Get active tasks
StaffSchema.methods.getActiveTasks = async function() {
    const Report = mongoose.model('Report');
    return await Report.find({
        assignedStaffId: this.userId,
        status: { $in: ['assigned', 'in_progress', 'verified'] }
    });
};

// Calculate completion rate
StaffSchema.methods.getCompletionRate = function() {
    return this.completionRate;
};

// Update performance metrics
StaffSchema.methods.updatePerformance = async function(report, resolutionTime) {
    this.totalTasksAssigned += 1;
    
    if (report.status === 'resolved') {
        this.tasksCompleted += 1;
        
        // Update average resolution time
        if (resolutionTime) {
            const totalTime = (this.averageResolutionTime * (this.tasksCompleted - 1)) + resolutionTime;
            this.averageResolutionTime = totalTime / this.tasksCompleted;
        }
    } else if (['assigned', 'in_progress'].includes(report.status)) {
        this.tasksInProgress += 1;
    }
    
    await this.save();
    return this;
};

// Update location
StaffSchema.methods.updateLocation = function(lat, lng, accuracy = null) {
    this.currentLocation = {
        type: 'Point',
        coordinates: [lng, lat],
        lastUpdated: new Date(),
        accuracy: accuracy
    };
    return this.save();
};

// Check if staff is available for assignment
StaffSchema.methods.isAvailableForAssignment = function() {
    if (!this.availability) return false;
    if (this.status !== 'active') return false;
    if (this.workStatus === 'off_duty' || this.workStatus === 'emergency') return false;
    
    // Check if staff has too many tasks in progress
    if (this.tasksInProgress >= 5) return false; // Max 5 concurrent tasks
    
    return true;
};

// ========== STATICS ==========
// Find available staff for ward/department
StaffSchema.statics.findAvailableStaff = async function(municipalityId, department, ward = null) {
    const query = {
        municipalityId,
        department,
        availability: true,
        status: 'active',
        workStatus: { $in: ['available', 'on_duty'] },
        tasksInProgress: { $lt: 5 } // Less than 5 concurrent tasks
    };
    
    if (ward) {
        query.$or = [
            { assignedWards: ward },
            { assignedWards: [] }, // Staff assigned to all wards
            { assignedWards: { $exists: false } }
        ];
    }
    
    return this.find(query)
        .populate('user', 'name profileImage phone')
        .sort({ tasksInProgress: 1, rating: -1 }) // Least busy, highest rated first
        .limit(10);
};

// Get staff performance report
StaffSchema.statics.getPerformanceReport = async function(municipalityId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                municipalityId: mongoose.Types.ObjectId(municipalityId),
                joinDate: { $lte: endDate }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                name: '$user.name',
                employeeId: 1,
                department: 1,
                designation: 1,
                totalTasksAssigned: 1,
                tasksCompleted: 1,
                tasksInProgress: 1,
                completionRate: { 
                    $cond: [
                        { $eq: ['$totalTasksAssigned', 0] },
                        0,
                        { $multiply: [{ $divide: ['$tasksCompleted', '$totalTasksAssigned'] }, 100] }
                    ]
                },
                averageResolutionTime: 1,
                rating: 1,
                citizenRating: 1,
                supervisorRating: 1,
                averageRating: {
                    $avg: [
                        { $cond: [{ $gt: ['$rating', 0] }, '$rating', null] },
                        { $cond: [{ $gt: ['$citizenRating', 0] }, '$citizenRating', null] },
                        { $cond: [{ $gt: ['$supervisorRating', 0] }, '$supervisorRating', null] }
                    ]
                },
                status: 1,
                availability: 1
            }
        },
        { $sort: { completionRate: -1, averageRating: -1 } }
    ]);
};

const StaffModel = mongoose.model("Staff", StaffSchema);
export default StaffModel;