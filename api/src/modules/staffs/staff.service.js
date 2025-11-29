import UserModel from "../users/user.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import ReportModel from "../reports/report.model.js";
import { generateDateTime, generateRandomString } from "../../utilities/helpers.js";
import mailSvc from "../../services/mail.service.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import bcrypt from "bcryptjs";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";

class StaffService {
  createStaff = async (staffData, file, adminId) => {
    const existingUser = await UserModel.findOne({ email: staffData.email });
    if (existingUser) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Email already registered",
        statusCode: HttpResponse.validationFailed
      };
    }

    const municipality = await MunicipalityModel.findById(staffData.municipalityId);
    if (!municipality) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Municipality not found",
        statusCode: HttpResponse.validationFailed
      };
    }

    const adminUser = await UserModel.findById(adminId);
    if (adminUser.municipalityId.toString() !== staffData.municipalityId.toString()) {
      throw {
        status: HttpResponseCode.FORBIDDEN,
        message: "Cannot create staff for different municipality",
        statusCode: HttpResponse.accessDenied
      };
    }

    staffData.password = bcrypt.hashSync(staffData.password, 12);

    let profileImageUrl = null;
    if (file) {
      const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
      profileImageUrl = uploadResult.url;
    }

    const userObj = new UserModel({
      ...staffData,
      profileImage: profileImageUrl,
      status: "active",
      activationToken: generateRandomString(6).toUpperCase(),
      expiryTime: generateDateTime(5)
    });

    const staff = await userObj.save();
    await this.sendStaffWelcomeEmail(staff, staffData.password);

    return staff;
  };

  getStaff = async (filter = {}, municipalityId) => {
    const { page = 1, limit = 10, department, availability, role, ...otherFilters } = filter;

    const query = { 
      municipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] },
      ...otherFilters 
    };

    if (department) query['staffProfile.department'] = department;
    if (availability !== undefined) query['staffProfile.availability'] = availability;
    if (role) query.role = role;

    const skip = (page - 1) * limit;
    const [staff, total] = await Promise.all([
      UserModel.find(query)
        .select('-password -activationToken -forgetToken -expiryTime')
        .populate('municipalityId', 'name location.city')
        .populate('staffProfile.supervisorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query)
    ]);

    return {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  getStaffById = async (staffId, municipalityId) => {
    const staff = await UserModel.findOne({
      _id: staffId,
      municipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] }
    })
    .select('-password -activationToken -forgetToken -expiryTime')
    .populate('municipalityId', 'name location.city')
    .populate('staffProfile.supervisorId', 'name email phone');

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    return staff;
  };

  updateStaff = async (staffId, updateData, file, adminId, adminMunicipalityId) => {
    const staff = await UserModel.findOne({
      _id: staffId,
      municipalityId: adminMunicipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] }
    });

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    if (updateData.staffProfile?.supervisorId) {
      const supervisor = await UserModel.findOne({
        _id: updateData.staffProfile.supervisorId,
        municipalityId: adminMunicipalityId,
        role: { $in: ['municipality_admin', 'field_staff'] }
      });

      if (!supervisor) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Supervisor not found or invalid",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    if (file) {
      const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
      updateData.profileImage = uploadResult.url;
    }

    const updatedStaff = await UserModel.findByIdAndUpdate(
      staffId,
      { $set: updateData },
      { new: true }
    )
    .select('-password -activationToken -forgetToken -expiryTime')
    .populate('municipalityId', 'name location.city')
    .populate('staffProfile.supervisorId', 'name email phone');

    return updatedStaff;
  };

  deleteStaff = async (staffId, adminMunicipalityId) => {
    const staff = await UserModel.findOne({
      _id: staffId,
      municipalityId: adminMunicipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] }
    });

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    const assignedReports = await ReportModel.countDocuments({
      assignedStaffId: staffId,
      status: { $in: ['assigned', 'in_progress'] }
    });

    if (assignedReports > 0) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot delete staff with assigned active reports",
        statusCode: HttpResponse.validationFailed
      };
    }

    await UserModel.findByIdAndDelete(staffId);
    return true;
  };

  getMyProfile = async (staffId) => {
    const staff = await UserModel.findById(staffId)
      .select('-password -activationToken -forgetToken -expiryTime')
      .populate('municipalityId', 'name location.city')
      .populate('staffProfile.supervisorId', 'name email phone');

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff profile not found",
        statusCode: HttpResponse.notFound
      };
    }

    return staff;
  };

  updateMyProfile = async (staffId, updateData, file) => {
    const allowedFields = ['name', 'phone', 'staffProfile.skills', 'staffProfile.availability'];
    
    const filteredUpdate = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) || key.startsWith('staffProfile.')) {
        filteredUpdate[key] = updateData[key];
      }
    });

    if (file) {
      const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
      filteredUpdate.profileImage = uploadResult.url;
    }

    const updatedStaff = await UserModel.findByIdAndUpdate(
      staffId,
      { $set: filteredUpdate },
      { new: true }
    )
    .select('-password -activationToken -forgetToken -expiryTime')
    .populate('municipalityId', 'name location.city')
    .populate('staffProfile.supervisorId', 'name email phone');

    return updatedStaff;
  };

  getMyAssignedReports = async (staffId, filter = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filter;

    const query = { 
      assignedStaffId: staffId,
      ...otherFilters 
    };

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage phone')
        .populate('municipalityId', 'name location.city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  sendStaffWelcomeEmail = async (staff, tempPassword) => {
    const msg = `
    <div>Welcome to NagarAlert Staff Portal!</div>
    <p>Dear ${staff.name},</p>
    <p>Your staff account has been created successfully.</p>
    <p><strong>Login Details:</strong></p>
    <p>Email: ${staff.email}</p>
    <p>Password: ${tempPassword}</p>
    <p>Role: ${staff.role}</p>
    <p>Department: ${staff.staffProfile?.department}</p>
    <p>Please change your password after first login.</p>
    `;
    
    await mailSvc.sendEmail(staff.email, "Welcome to NagarAlert Staff", msg);
    return true;
  };
}

const staffSvc = new StaffService();
export default staffSvc;