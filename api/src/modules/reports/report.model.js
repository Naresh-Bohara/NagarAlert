import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    enum: ['road', 'electricity', 'water', 'sanitation', 'safety', 'emergency', 'illegal_activity'],
    required: true
  },
  
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    ward: String
  },
  
  photos: [String],
  videos: [String],

   priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  dueDate: Date,
  assignmentNotes: String,
  assignedAt: Date,
  inProgressAt: Date,
  resolvedAt: Date,
  
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved'],
    default: 'pending'
  },
  
  citizenId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  municipalityId: {
    type: mongoose.Types.ObjectId,
    ref: "Municipality",
    required: true
  },
  
  assignedStaffId: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  
  pointsAwarded: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

ReportSchema.index({ municipalityId: 1, status: 1 });
ReportSchema.index({ citizenId: 1 });
ReportSchema.index({ createdAt: -1 });

const ReportModel = mongoose.model("Report", ReportSchema);
export default ReportModel;