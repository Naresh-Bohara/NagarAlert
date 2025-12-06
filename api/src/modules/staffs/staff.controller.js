import HttpResponse from "../../constants/response-status.contants.js";
import staffSvc from "./staff.service.js";
import Joi from "joi";

class StaffController {
  createStaff = async (req, res, next) => {
    try {
      const adminId = req.loggedInUser._id;
      const staffData = req.validatedBody || req.body;
      const file = req.file;

      const staff = await staffSvc.createStaff(staffData, file, adminId);

      res.status(201).json({
        data: staff,
        message: "Staff created successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getStaff = async (req, res, next) => {
    try {
      const municipalityId = req.loggedInUser.municipalityId;
      const filter = req.validatedQuery || req.query;
      const requestingUserId = req.loggedInUser._id;

      // Convert comma-separated strings to arrays for query
      if (filter.assignedWards && typeof filter.assignedWards === 'string') {
        filter.assignedWards = filter.assignedWards.split(',').map(w => w.trim());
      }
      if (filter.skills && typeof filter.skills === 'string') {
        filter.skills = filter.skills.split(',').map(s => s.trim());
      }

      const result = await staffSvc.getStaff(filter, municipalityId, requestingUserId);

      res.json({
        data: result.staff,
        pagination: result.pagination,
        message: "Staff fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getStaffById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const municipalityId = req.loggedInUser.municipalityId;
      const requestingUserId = req.loggedInUser._id;

      const staff = await staffSvc.getStaffById(id, municipalityId, requestingUserId);

      res.json({
        data: staff,
        message: "Staff details fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateStaff = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requestingUserId = req.loggedInUser._id;
      const updateData = req.validatedBody || req.body;
      const file = req.file;

      const staff = await staffSvc.updateStaff(id, updateData, file, requestingUserId);

      res.json({
        data: staff,
        message: "Staff updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  deleteStaff = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requestingUserId = req.loggedInUser._id;

      await staffSvc.deleteStaff(id, requestingUserId);

      res.json({
        data: null,
        message: "Staff deleted successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getMyProfile = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;

      const staff = await staffSvc.getMyProfile(staffId);

      res.json({
        data: staff,
        message: "Profile fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;
      const updateData = req.validatedBody || req.body;
      const file = req.file;

      const staff = await staffSvc.updateMyProfile(staffId, updateData, file);

      res.json({
        data: staff,
        message: "Profile updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getMyAssignedReports = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;
      const filter = req.validatedQuery || req.query;

      // Handle comma-separated statuses/categories
      if (filter.status && typeof filter.status === 'string' && filter.status.includes(',')) {
        filter.status = filter.status.split(',').map(s => s.trim());
      }
      if (filter.category && typeof filter.category === 'string' && filter.category.includes(',')) {
        filter.category = filter.category.split(',').map(c => c.trim());
      }

      const result = await staffSvc.getMyAssignedReports(staffId, filter);

      res.json({
        data: result.reports,
        pagination: result.pagination,
        message: "Assigned reports fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateAvailability = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;
      const { availability } = req.validatedBody || req.body;

      const result = await staffSvc.updateAvailability(staffId, availability);

      res.json({
        data: result,
        message: `Availability ${availability ? 'enabled' : 'disabled'} successfully`,
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  updateLocation = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;
      const location = req.validatedBody || req.body;

      const result = await staffSvc.updateLocation(staffId, location);

      res.json({
        data: result,
        message: "Location updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

}

const staffCtrl = new StaffController();
export default staffCtrl;