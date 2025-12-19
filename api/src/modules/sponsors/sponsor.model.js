import mongoose from "mongoose";

const SponsorSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  contactEmail: {
    type: String,
    required: true
  },
  
  contactPhone: {
    type: String,
    required: true
  },
  
  // Sponsor Type - Complete list
  sponsorType: {
    type: String,
    enum: [
      'local_business', 
      'corporate', 
      'ngo', 
      'community_event', 
      'music_program', 
      'party_event',
      'csr_campaign',
      'government_scheme',
      'public_awareness'
    ],
    required: true
  },
  
  // Content
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  // Media
  bannerImage: {
    type: String,
  },
  
  website: String,
  
  // Scope
  scope: {
    type: String,
    enum: ['global', 'municipality'],
    default: 'global'
  },
  
  municipalityId: {
    type: mongoose.Types.ObjectId,
    ref: "Municipality"
  },
  
  // Campaign Period
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  }

}, {
  timestamps: true
});

// Indexes
SponsorSchema.index({ scope: 1, status: 1 });
SponsorSchema.index({ municipalityId: 1 });
SponsorSchema.index({ sponsorType: 1 });

const SponsorModel = mongoose.model("Sponsor", SponsorSchema);
export default SponsorModel;