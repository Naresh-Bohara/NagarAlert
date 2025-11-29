import SponsorModel from "./sponsor.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";

class SponsorService {
  createSponsor = async (sponsorData, bannerImage, adminId) => {
    // Check if sponsor already exists with same email
    const existingSponsor = await SponsorModel.findOne({ contactEmail: sponsorData.contactEmail });
    if (existingSponsor) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Sponsor with this email already exists",
        statusCode: HttpResponse.validationFailed
      };
    }

    // Validate municipality if scope is municipality
    if (sponsorData.scope === 'municipality' && sponsorData.municipalityId) {
      const municipality = await MunicipalityModel.findById(sponsorData.municipalityId);
      if (!municipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality not found",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    // Upload banner image to Cloudinary
    let bannerImageUrl = null;
    if (bannerImage) {
      const uploadResult = await CloudinaryService.uploadImage(bannerImage, 'nagaralert/sponsors');
      bannerImageUrl = uploadResult.url;
    }

    // Create sponsor
    const sponsor = new SponsorModel({
      ...sponsorData,
      bannerImage: bannerImageUrl,
      createdBy: adminId
    });

    await sponsor.save();
    return sponsor;
  };

  getSponsors = async (filter = {}) => {
    const { page = 1, limit = 10, sponsorType, scope, status, ...otherFilters } = filter;

    const query = { ...otherFilters };
    if (sponsorType) query.sponsorType = sponsorType;
    if (scope) query.scope = scope;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [sponsors, total] = await Promise.all([
      SponsorModel.find(query)
        .populate('municipalityId', 'name location.city')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SponsorModel.countDocuments(query)
    ]);

    return {
      sponsors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  getSponsorById = async (sponsorId) => {
    const sponsor = await SponsorModel.findById(sponsorId)
      .populate('municipalityId', 'name location.city contactEmail contactPhone')
      .populate('createdBy', 'name email phone');

    if (!sponsor) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Sponsor not found",
        statusCode: HttpResponse.notFound
      };
    }

    return sponsor;
  };

  updateSponsor = async (sponsorId, updateData, bannerImage) => {
    const sponsor = await SponsorModel.findById(sponsorId);
    if (!sponsor) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Sponsor not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Upload new banner image if provided
    if (bannerImage) {
      const uploadResult = await CloudinaryService.uploadImage(bannerImage, 'nagaralert/sponsors');
      updateData.bannerImage = uploadResult.url;
    }

    // Update sponsor
    const updatedSponsor = await SponsorModel.findByIdAndUpdate(
      sponsorId,
      { $set: updateData },
      { new: true }
    )
    .populate('municipalityId', 'name location.city')
    .populate('createdBy', 'name email');

    return updatedSponsor;
  };

  deleteSponsor = async (sponsorId) => {
    const sponsor = await SponsorModel.findById(sponsorId);
    if (!sponsor) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Sponsor not found",
        statusCode: HttpResponse.notFound
      };
    }

    await SponsorModel.findByIdAndDelete(sponsorId);
    return true;
  };

  getActiveMunicipalitySponsors = async (municipalityId) => {
    const now = new Date();
    
    const sponsors = await SponsorModel.find({
      $or: [
        { scope: 'global', status: 'active' },
        { scope: 'municipality', municipalityId: municipalityId, status: 'active' }
      ],
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .populate('municipalityId', 'name location.city')
    .sort({ sponsorshipTier: -1, createdAt: -1 });

    return sponsors;
  };

  getGlobalActiveSponsors = async () => {
    const now = new Date();
    
    const sponsors = await SponsorModel.find({
      scope: 'global',
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .sort({ sponsorshipTier: -1, createdAt: -1 });

    return sponsors;
  };
}

const sponsorSvc = new SponsorService();
export default sponsorSvc;