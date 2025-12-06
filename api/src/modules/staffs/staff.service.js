// services/staff.service.js
import UserModel from "../users/user.model.js";
import StaffModel from "./staff.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import ReportModel from "../reports/report.model.js";
import { generateRandomString } from "../../utilities/helpers.js";
import mailSvc from "../../services/mail.service.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import bcrypt from "bcryptjs";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";

class StaffService {
  createStaff = async (staffData, file, adminId) => {
    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: staffData.email });
    if (existingUser) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Email already registered",
        statusCode: HttpResponse.validationFailed
      };
    }

    // Validate municipality exists
    const municipality = await MunicipalityModel.findById(staffData.municipalityId);
    if (!municipality) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Municipality not found",
        statusCode: HttpResponse.validationFailed
      };
    }

    // Get admin user for permission check
    const adminUser = await UserModel.findById(adminId);
    if (!adminUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Admin user not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Check permissions based on admin role
    if (adminUser.role === 'system_admin') {
      // System admin can create staff for any municipality - no restriction
    } else if (adminUser.role === 'municipality_admin') {
      // Municipality admin can only create staff for their own municipality
      if (!adminUser.municipalityId) {
        throw {
          status: HttpResponseCode.FORBIDDEN,
          message: "Admin user doesn't have a municipality assigned",
          statusCode: HttpResponse.accessDenied
        };
      }
      
      if (adminUser.municipalityId.toString() !== staffData.municipalityId.toString()) {
        throw {
          status: HttpResponseCode.FORBIDDEN,
          message: "Cannot create staff for different municipality",
          statusCode: HttpResponse.accessDenied
        };
      }
    } else {
      // Other roles cannot create staff
      throw {
        status: HttpResponseCode.FORBIDDEN,
        message: "You don't have permission to create staff",
        statusCode: HttpResponse.accessDenied
      };
    }

    // Validate supervisor exists if provided
    if (staffData.supervisorId) {
      const supervisor = await StaffModel.findOne({ 
        userId: staffData.supervisorId,
        municipalityId: staffData.municipalityId 
      });
      if (!supervisor) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Supervisor not found in this municipality",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    // Check if employeeId already exists
    const existingEmployeeId = await StaffModel.findOne({ employeeId: staffData.employeeId });
    if (existingEmployeeId) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Employee ID already exists",
        statusCode: HttpResponse.validationFailed
      };
    }

    const tempPassword = staffData.password;
    const hashedPassword = bcrypt.hashSync(tempPassword, 12);

    // Handle profile image upload
    let profileImageUrl = null;
    if (file) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
        profileImageUrl = uploadResult.url;
      } catch (uploadError) {
        throw {
          status: HttpResponseCode.INTERNAL_SERVER_ERROR,
          message: "Failed to upload profile image",
          statusCode: HttpResponse.serverError
        };
      }
    }

    // Step 1: Create User account
    const user = await UserModel.create({
      name: staffData.name,
      email: staffData.email,
      password: hashedPassword,
      phone: staffData.phone,
      role: staffData.role,
      municipalityId: staffData.municipalityId,
      profileImage: profileImageUrl,
      status: "active",
      activationToken: generateRandomString(6).toUpperCase()
    });

    // Step 2: Create Staff profile
    const staffProfile = await StaffModel.create({
      userId: user._id,
      employeeId: staffData.employeeId,
      department: staffData.department,
      designation: staffData.designation,
      municipalityId: staffData.municipalityId,
      assignedWards: staffData.assignedWards || [],
      assignedZones: staffData.assignedZones || [],
      skills: staffData.skills || [],
      tools: staffData.tools || [],
      vehicleNumber: staffData.vehicleNumber || null,
      supervisorId: staffData.supervisorId || null,
      joinDate: staffData.joinDate || new Date(),
      salaryGrade: staffData.salaryGrade || null
    });

    // Step 3: Send welcome email
    await this.sendStaffWelcomeEmail(user, staffProfile, tempPassword);

    // Return combined data
    return {
      user: user.toJSON(),
      staff: staffProfile
    };
  };

  getStaff = async (filter = {}, municipalityId, requestingUserId) => {
    const { page = 1, limit = 10, department, availability, role, status, ...otherFilters } = filter;

    const query = { 
      municipalityId,
      ...otherFilters 
    };

    // Filter by department if provided
    if (department) {
      query.department = department;
    }

    // Filter by availability if provided
    if (availability !== undefined) {
      query.availability = availability;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    // Get staff profiles with pagination
    const [staffProfiles, total] = await Promise.all([
      StaffModel.find(query)
        .populate({
          path: 'userId',
          select: 'name email phone profileImage role status lastLogin'
        })
        .populate('supervisorId', 'employeeId designation name')
        .populate('municipalityId', 'name location.city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StaffModel.countDocuments(query)
    ]);

    // Filter by role if provided (after fetching)
    let filteredStaff = staffProfiles;
    if (role) {
      filteredStaff = staffProfiles.filter(staff => 
        staff.userId && staff.userId.role === role
      );
    }

    return {
      staff: filteredStaff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: role ? filteredStaff.length : total,
        pages: Math.ceil((role ? filteredStaff.length : total) / limit)
      }
    };
  };

  getStaffById = async (staffId, municipalityId, requestingUserId) => {
    // Get requesting user for permission check
    const requestingUser = await UserModel.findById(requestingUserId);
    if (!requestingUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Requesting user not found",
        statusCode: HttpResponse.notFound
      };
    }
    
    const query = { _id: staffId };
    
    // Municipality admin and field staff can only see their own municipality staff
    if (requestingUser.role === 'municipality_admin' || requestingUser.role === 'field_staff') {
      if (!municipalityId) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality ID required",
          statusCode: HttpResponse.validationFailed
        };
      }
      query.municipalityId = municipalityId;
    }
    
    const staff = await StaffModel.findOne(query)
      .populate({
        path: 'userId',
        select: 'name email phone profileImage role status lastLogin'
      })
      .populate('supervisorId', 'employeeId designation name')
      .populate('municipalityId', 'name location.city');

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Permission check for field staff
    if (requestingUser.role === 'field_staff' && staff.userId._id.toString() !== requestingUserId) {
      throw {
        status: HttpResponseCode.FORBIDDEN,
        message: "You can only view your own profile",
        statusCode: HttpResponse.accessDenied
      };
    }

    // Get assigned reports count
    const assignedReports = await ReportModel.countDocuments({
      assignedStaffId: staff.userId._id,
      status: { $in: ['assigned', 'in_progress'] }
    });

    // Calculate performance metrics
    const completionRate = staff.getCompletionRate ? staff.getCompletionRate() : 0;

    // Get recent assigned reports
    const recentReports = await ReportModel.find({
      assignedStaffId: staff.userId._id
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title category status priority createdAt');

    return {
      ...staff.toObject(),
      assignedReports,
      completionRate,
      recentReports
    };
  };

  updateStaff = async (staffId, updateData, file, requestingUserId) => {
    // Get requesting user
    const requestingUser = await UserModel.findById(requestingUserId);
    if (!requestingUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Find staff
    const query = { _id: staffId };
    if (requestingUser.role === 'municipality_admin') {
      if (!requestingUser.municipalityId) {
        throw {
          status: HttpResponseCode.FORBIDDEN,
          message: "Admin doesn't have a municipality assigned",
          statusCode: HttpResponse.accessDenied
        };
      }
      query.municipalityId = requestingUser.municipalityId;
    }

    const staff = await StaffModel.findOne(query);
    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Don't allow system admin to modify their own municipality restriction
    if (requestingUser.role === 'system_admin' && updateData.municipalityId) {
      // Check if municipality exists
      const newMunicipality = await MunicipalityModel.findById(updateData.municipalityId);
      if (!newMunicipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality not found",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    // Validate supervisor if updating
    if (updateData.supervisorId) {
      const supervisor = await StaffModel.findOne({
        _id: updateData.supervisorId,
        municipalityId: staff.municipalityId
      });

      if (!supervisor) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Supervisor not found in this municipality",
          statusCode: HttpResponse.validationFailed
        };
      }

      // Prevent circular supervisor reference
      if (updateData.supervisorId === staffId) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Staff cannot be their own supervisor",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    // Update profile image if provided
    if (file) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
        updateData.profileImage = uploadResult.url;
        
        // Update user's profile image
        await UserModel.findByIdAndUpdate(staff.userId, {
          profileImage: uploadResult.url
        });
      } catch (uploadError) {
        throw {
          status: HttpResponseCode.INTERNAL_SERVER_ERROR,
          message: "Failed to upload profile image",
          statusCode: HttpResponse.serverError
        };
      }
    }

    // Separate user updates from staff updates
    const userUpdates = {};
    const staffUpdates = {};

    const userFields = ['name', 'phone', 'profileImage', 'status'];
    const staffFields = [
      'employeeId', 'department', 'designation', 'assignedWards', 
      'assignedZones', 'skills', 'tools', 'vehicleNumber', 'availability',
      'joinDate', 'salaryGrade', 'supervisorId', 'status'
    ];

    Object.keys(updateData).forEach(key => {
      if (userFields.includes(key)) {
        userUpdates[key] = updateData[key];
      } else if (staffFields.includes(key)) {
        staffUpdates[key] = updateData[key];
      }
    });

    // Update user if there are user updates
    if (Object.keys(userUpdates).length > 0) {
      await UserModel.findByIdAndUpdate(staff.userId, { $set: userUpdates });
    }

    // Update staff profile
    const updatedStaff = await StaffModel.findByIdAndUpdate(
      staffId,
      { $set: staffUpdates },
      { new: true }
    )
    .populate({
      path: 'userId',
      select: 'name email phone profileImage role status lastLogin'
    })
    .populate('supervisorId', 'employeeId designation name')
    .populate('municipalityId', 'name location.city');

    return updatedStaff;
  };

  deleteStaff = async (staffId, requestingUserId) => {
    // Get requesting user
    const requestingUser = await UserModel.findById(requestingUserId);
    if (!requestingUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    const query = { _id: staffId };
    if (requestingUser.role === 'municipality_admin') {
      if (!requestingUser.municipalityId) {
        throw {
          status: HttpResponseCode.FORBIDDEN,
          message: "Admin doesn't have a municipality assigned",
          statusCode: HttpResponse.accessDenied
        };
      }
      query.municipalityId = requestingUser.municipalityId;
    }

    const staff = await StaffModel.findOne(query);
    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Check for assigned reports
    const assignedReports = await ReportModel.countDocuments({
      assignedStaffId: staff.userId._id,
      status: { $in: ['assigned', 'in_progress'] }
    });

    if (assignedReports > 0) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot delete staff with assigned active reports",
        statusCode: HttpResponse.validationFailed
      };
    }

    // Don't allow deleting yourself
    if (staff.userId._id.toString() === requestingUserId) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "You cannot delete your own account",
        statusCode: HttpResponse.validationFailed
      };
    }

    // Delete user account
    await UserModel.findByIdAndDelete(staff.userId._id);
    
    // Delete staff profile
    await StaffModel.findByIdAndDelete(staffId);
    
    return true;
  };

  getMyProfile = async (staffId) => {
    const staff = await StaffModel.findOne({ userId: staffId })
      .populate({
        path: 'userId',
        select: 'name email phone profileImage role status lastLogin'
      })
      .populate('supervisorId', 'employeeId designation name')
      .populate('municipalityId', 'name location.city');

    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff profile not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Get performance stats
    const assignedReports = await ReportModel.countDocuments({
      assignedStaffId: staffId,
      status: { $in: ['assigned', 'in_progress'] }
    });

    const completedReports = await ReportModel.countDocuments({
      assignedStaffId: staffId,
      status: 'resolved'
    });

    const completionRate = staff.getCompletionRate ? staff.getCompletionRate() : 0;

    // Get recent activity
    const recentActivity = await ReportModel.find({
      assignedStaffId: staffId
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title category status updatedAt');

    return {
      ...staff.toObject(),
      assignedReports,
      completedReports,
      completionRate,
      recentActivity
    };
  };

  updateMyProfile = async (staffId, updateData, file) => {
    // Find staff
    const staff = await StaffModel.findOne({ userId: staffId });
    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff profile not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Define allowed fields for self-update
    const allowedStaffFields = ['skills', 'availability', 'tools', 'vehicleNumber'];
    const allowedUserFields = ['name', 'phone'];

    // Prepare updates
    const staffUpdates = {};
    const userUpdates = {};

    Object.keys(updateData).forEach(key => {
      if (allowedStaffFields.includes(key)) {
        staffUpdates[key] = updateData[key];
      } else if (allowedUserFields.includes(key)) {
        userUpdates[key] = updateData[key];
      }
    });

    // Handle profile image
    if (file) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/staff');
        userUpdates.profileImage = uploadResult.url;
      } catch (uploadError) {
        throw {
          status: HttpResponseCode.INTERNAL_SERVER_ERROR,
          message: "Failed to upload profile image",
          statusCode: HttpResponse.serverError
        };
      }
    }

    // Update user
    if (Object.keys(userUpdates).length > 0) {
      await UserModel.findByIdAndUpdate(staffId, { $set: userUpdates });
    }

    // Update staff profile
    const updatedStaff = await StaffModel.findOneAndUpdate(
      { userId: staffId },
      { $set: staffUpdates },
      { new: true }
    )
    .populate({
      path: 'userId',
      select: 'name email phone profileImage role status lastLogin'
    })
    .populate('supervisorId', 'employeeId designation name')
    .populate('municipalityId', 'name location.city');

    return updatedStaff;
  };

  getMyAssignedReports = async (staffId, filter = {}) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category, 
      fromDate, 
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      ...otherFilters 
    } = filter;

    const query = { 
      assignedStaffId: staffId,
      ...otherFilters 
    };

    // Handle status filter (single or array)
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Handle priority filter
    if (priority) {
      query.priority = priority;
    }

    // Handle category filter (single or array)
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Handle date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Handle search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    // Define sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage phone')
        .populate('municipalityId', 'name location.city')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    // Calculate stats
    const stats = {
      total: await ReportModel.countDocuments({ assignedStaffId: staffId }),
      pending: await ReportModel.countDocuments({ 
        assignedStaffId: staffId, 
        status: { $in: ['assigned', 'in_progress'] } 
      }),
      resolved: await ReportModel.countDocuments({ 
        assignedStaffId: staffId, 
        status: 'resolved' 
      })
    };

    return {
      reports,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  updateAvailability = async (staffId, availability) => {
    const staff = await StaffModel.findOne({ userId: staffId });
    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff profile not found",
        statusCode: HttpResponse.notFound
      };
    }

    staff.availability = availability;
    await staff.save();

    return {
      availability,
      updatedAt: new Date(),
      message: `Availability ${availability ? 'enabled' : 'disabled'} successfully`
    };
  };

  updateLocation = async (staffId, location) => {
    const staff = await StaffModel.findOne({ userId: staffId });
    if (!staff) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff profile not found",
        statusCode: HttpResponse.notFound
      };
    }

    staff.currentLocation = {
      lat: location.lat,
      lng: location.lng,
      lastUpdated: new Date()
    };
    await staff.save();

    return {
      location: staff.currentLocation,
      updatedAt: new Date(),
      message: "Location updated successfully"
    };
  };

  sendStaffWelcomeEmail = async (user, staffProfile, tempPassword) => {
    try {
      const msg = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to NagarAlert Staff Portal!</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your staff account has been created successfully. Here are your login details:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Employee ID:</strong> ${staffProfile.employeeId}</p>
          <p><strong>Department:</strong> ${staffProfile.department}</p>
          <p><strong>Designation:</strong> ${staffProfile.designation}</p>
          <p><strong>Role:</strong> ${user.role}</p>
        </div>
        
        <p style="color: #e74c3c;"><strong>Important:</strong> Please change your password after first login.</p>
        
        <p>Best regards,<br>NagarAlert Team</p>
      </div>
      `;
      
      await mailSvc.sendEmail(user.email, "Welcome to NagarAlert Staff Portal", msg);
      return true;
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't throw error - staff creation should still succeed even if email fails
      return false;
    }
  };
}

const staffSvc = new StaffService();
export default staffSvc;