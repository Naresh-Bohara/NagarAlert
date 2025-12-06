import mongoose from "mongoose";

const EmergencyServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Police', 'Ambulance', 'Fire Brigade', 'Women Helpline', 
           'Child Helpline', 'Disaster Management', 'Traffic Police']
  },
  
  phone: {
    type: String,
    required: true
  },
  
  altPhone: String,
  whatsapp: String,
  email: String,
  logo: String,
  description: String,
  
  location: {
    address: String,
    city: String,
    lat: Number,
    lng: Number
  },
  
  municipalityId: {
    type: mongoose.Types.ObjectId,
    ref: "Municipality"
  },
  
  category: {
    type: String,
    enum: ['police', 'medical', 'fire', 'helpline', 'traffic', 'disaster'],
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  is24x7: {
    type: Boolean,
    default: true
  },
  
  totalCalls: {
    type: Number,
    default: 0
  },
  
  avgResponseTime: Number

}, {
  timestamps: true
});

EmergencyServiceSchema.index({ municipalityId: 1 });
EmergencyServiceSchema.index({ category: 1 });
EmergencyServiceSchema.index({ isActive: 1 });

const EmergencyServiceModel = mongoose.model("EmergencyService", EmergencyServiceSchema);
export default EmergencyServiceModel;