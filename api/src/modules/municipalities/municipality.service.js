import MunicipalityModel from "./municipality.model.js";
import UserModel from "../users/user.model.js";
import bcrypt from "bcryptjs";
import { generateDateTime, generateRandomString } from "../../utilities/helpers.js";
import mailSvc from "../../services/mail.service.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";

class MunicipalityService {
  createMunicipality = async (data) => {
    let adminUser, municipality;

    try {
      // Auto-calculate boundary if not provided
      if (!data.boundaryBox && data.location?.coordinates) {
        data.boundaryBox = this.calculateDefaultBoundary(
          data.location.coordinates.lat,
          data.location.coordinates.lng
        );
      }

      // Check if admin email already exists
      const existingAdmin = await UserModel.findOne({ email: data.adminUser.email });
      if (existingAdmin) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Admin email already exists",
          statusCode: HttpResponse.validationFailed
        };
      }

      // Check if municipality already exists
      const existingMunicipality = await MunicipalityModel.findOne({
        name: data.name, 
        "location.city": data.location.city
      });
      
      if (existingMunicipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality already exists in this city",
          statusCode: HttpResponse.validationFailed
        };
      }

      // Create admin user
      adminUser = new UserModel({
        name: data.adminUser.name,
        email: data.adminUser.email,
        password: bcrypt.hashSync(data.adminUser.password, 12),
        role: 'municipality_admin',
        phone: data.adminUser.phone,
        status: "pending",
        activationToken: generateRandomString(6).toUpperCase(),
        expiryTime: generateDateTime(5)
      });
      await adminUser.save();

      // Create municipality with boundaryBox
      municipality = new MunicipalityModel({
        name: data.name,
        location: data.location,
        adminId: adminUser._id,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        settings: data.settings,
        reportCategories: data.reportCategories,
        boundaryBox: data.boundaryBox
      });
      await municipality.save();

      // Update admin with municipalityId
      adminUser.municipalityId = municipality._id;
      await adminUser.save();

      // Send activation email
      await this.sendAdminActivationEmail(adminUser);

      return { municipality, adminUser };

    } catch (error) {
      // Cleanup if anything fails
      if (adminUser?._id) {
        await UserModel.findByIdAndDelete(adminUser._id);
      }
      if (municipality?._id) {
        await MunicipalityModel.findByIdAndDelete(municipality._id);
      }
      throw error;
    }
  }

  // Helper to calculate default boundary
  calculateDefaultBoundary = (lat, lng) => {
    const range = 0.1; // ~10km radius
    return {
      minLat: lat - range,
      maxLat: lat + range,
      minLng: lng - range,
      maxLng: lng + range
    };
  }

  // Send activation email to admin
  sendAdminActivationEmail = async (adminUser) => {
    try {
      const msg = `
      <div>Welcome to NagarAlert as Municipality Admin!</div>
      <p>Dear ${adminUser.name},</p>
      <p>Your activation code: <strong>${adminUser.activationToken}</strong></p>
      <p>Valid for 5 minutes</p>
      `;
      
      await mailSvc.sendEmail(adminUser.email, "Activate Your Municipality Admin Account", msg);
      return true;
    } catch (error) {
      console.error('Failed to send activation email:', error);
      return false;
    }
  }

  // Get municipality by ID
  getMunicipalityById = async (municipalityId) => {
    const municipality = await MunicipalityModel.findById(municipalityId)
      .populate('adminId', 'name email phone');
    
    if (!municipality) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Municipality not found",
        statusCode: HttpResponse.notFound
      };
    }
    return municipality;
  }

  // Get all municipalities with pagination
  getMunicipalities = async (filter = {}) => {
    try {
      const { page = 1, limit = 10, ...query } = filter;
      const skip = (page - 1) * limit;
      
      // Build query
      const searchQuery = { isActive: true };
      if (query.city) searchQuery["location.city"] = new RegExp(query.city, 'i');
      if (query.province) searchQuery["location.province"] = new RegExp(query.province, 'i');
      if (query.search) {
        searchQuery.$or = [
          { name: new RegExp(query.search, 'i') },
          { "location.city": new RegExp(query.search, 'i') }
        ];
      }

      const [municipalities, total] = await Promise.all([
        MunicipalityModel.find(searchQuery)
          .populate('adminId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        MunicipalityModel.countDocuments(searchQuery)
      ]);

      return {
        municipalities: municipalities || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update municipality
  updateMunicipality = async (municipalityId, data) => {
    const municipality = await MunicipalityModel.findByIdAndUpdate(
      municipalityId,
      { $set: data },
      { new: true }
    ).populate('adminId', 'name email');

    if (!municipality) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Municipality not found",
        statusCode: HttpResponse.notFound
      };
    }
    return municipality;
  }

  // Check if location is within municipality boundary
  isLocationWithinMunicipality = async (municipalityId, lat, lng) => {
    const municipality = await MunicipalityModel.findById(municipalityId);
    
    if (!municipality || !municipality.boundaryBox) {
      return true; // No boundary set = allow all
    }
    
    return lat >= municipality.boundaryBox.minLat && 
           lat <= municipality.boundaryBox.maxLat && 
           lng >= municipality.boundaryBox.minLng && 
           lng <= municipality.boundaryBox.maxLng;
  }

  // Soft delete (deactivate) municipality
  deleteMunicipality = async (municipalityId) => {
    const municipality = await MunicipalityModel.findByIdAndUpdate(
      municipalityId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!municipality) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Municipality not found",
        statusCode: HttpResponse.notFound
      };
    }
    return municipality;
  }

  // Get municipalities list for dropdowns
  getMunicipalitiesList = async () => {
    return await MunicipalityModel.find({ isActive: true })
      .select('name location.city location.province')
      .sort({ name: 1 });
  }

  // Get municipality statistics
  getMunicipalityStats = async (municipalityId) => {
    const municipality = await this.getMunicipalityById(municipalityId);
    
    return {
      basic: {
        name: municipality.name,
        city: municipality.location.city,
        province: municipality.location.province,
        contactEmail: municipality.contactEmail,
        contactPhone: municipality.contactPhone
      },
      settings: municipality.settings,
      reportCategories: municipality.reportCategories,
      boundaryBox: municipality.boundaryBox
    };
  }

  // Get municipalities by location
  getMunicipalitiesByLocation = async (city, province) => {
    const query = { isActive: true };
    if (city) query["location.city"] = new RegExp(city, 'i');
    if (province) query["location.province"] = new RegExp(province, 'i');

    return await MunicipalityModel.find(query)
      .select('name location.city location.province contactEmail contactPhone boundaryBox')
      .sort({ name: 1 });
  }
}

const municipalitySvc = new MunicipalityService();
export default municipalitySvc;