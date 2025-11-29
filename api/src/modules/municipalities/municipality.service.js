import MunicipalityModel from "./municipality.model.js";
import UserModel from "../users/user.model.js";
import bcrypt from "bcryptjs";
import { generateDateTime, generateRandomString } from "../../utilities/helpers.js";
import mailSvc from "../../services/mail.service.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";
import mongoose from "mongoose";

class MunicipalityService {
createMunicipality = async (data) => {
  let adminUser, municipality;

  try {
    // Validations...
    const existingAdmin = await UserModel.findOne({ email: data.adminUser.email });
    if (existingAdmin) throw { /* error */ };

    const existingMunicipality = await MunicipalityModel.findOne({
      name: data.name, "location.city": data.location.city
    });
    if (existingMunicipality) throw { /* error */ };

    // ✅ STEP 1: Create admin (temporarily without municipalityId)
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

    // ✅ STEP 2: Create municipality with adminId
    municipality = new MunicipalityModel({
      name: data.name,
      location: data.location,
      adminId: adminUser._id, // Set adminId
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      settings: data.settings,
      reportCategories: data.reportCategories
    });
    await municipality.save();

    // ✅ STEP 3: Update admin with municipalityId
    adminUser.municipalityId = municipality._id;
    await adminUser.save();

    await this.sendAdminActivationEmail(adminUser);

    return { municipality, adminUser };

  } catch (error) {
    // Manual cleanup
    if (adminUser?._id) await UserModel.findByIdAndDelete(adminUser._id);
    if (municipality?._id) await MunicipalityModel.findByIdAndDelete(municipality._id);
    throw error;
  }
}

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
      return false;
    }
  }

  getMunicipalityById = async (municipalityId) => {
    const municipality = await MunicipalityModel.findById(municipalityId)
      .populate('adminId', 'name email phone');
    
    if (!municipality) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Municipality not found",
        statusCode: HttpResponse.notFound
      }
    }
    return municipality;
  }

  getMunicipalities = async (filter = {}) => {
  try {
    const municipalities = await MunicipalityModel.find({ isActive: true })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    return {
      municipalities: municipalities || [],
      pagination: {
        page: 1,
        limit: municipalities.length,
        total: municipalities.length,
        pages: 1
      }
    };
  } catch (error) {
    throw error;
  }
}
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
      }
    }
    return municipality;
  }

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
      }
    }
    return municipality;
  }

  getMunicipalitiesList = async () => {
    return await MunicipalityModel.find({ isActive: true })
      .select('name location.city location.province')
      .sort({ name: 1 });
  }

  // Add to municipality.service.js
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
    reportCategories: municipality.reportCategories
  };
}

  getMunicipalitiesByLocation = async (city, province) => {
    const query = { isActive: true };
    if (city) query["location.city"] = new RegExp(city, 'i');
    if (province) query["location.province"] = new RegExp(province, 'i');

    return await MunicipalityModel.find(query)
      .select('name location.city location.province contactEmail contactPhone')
      .sort({ name: 1 });
  }
}

const municipalitySvc = new MunicipalityService();
export default municipalitySvc;