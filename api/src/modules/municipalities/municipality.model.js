import mongoose from "mongoose";

const MunicipalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  location: {
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,  
      lng: Number   
    }
  },
  
  boundaryBox: {
    minLat: Number,
    maxLat: Number,
    minLng: Number,
    maxLng: Number
  },
  
  adminId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  
  settings: {
    autoAssignReports: {
      type: Boolean,
      default: false
    },
    citizenRewards: {
      type: Boolean,
      default: true
    },
    pointValue: {
      type: Number,
      default: 1
    }
  },

  reportCategories: {
    type: [String],
    default: ['road', 'electricity', 'water', 'sanitation', 'safety', 'emergency', 'illegal_activity']
  },
  
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

MunicipalitySchema.index({ "location.city": 1 });
MunicipalitySchema.index({ adminId: 1 });
MunicipalitySchema.index({ isActive: 1 });

const MunicipalityModel = mongoose.model("Municipality", MunicipalitySchema);
export default MunicipalityModel;