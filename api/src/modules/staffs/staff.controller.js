import HttpResponse from "../../constants/response-status.contants.js";
import staffSvc from "./staff.service.js";

class StaffController {
  createStaff = async (req, res, next) => {
    try {
      const adminId = req.loggedInUser._id;
      const staffData = req.body;
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

      const result = await staffSvc.getStaff(filter, municipalityId);

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

      const staff = await staffSvc.getStaffById(id, municipalityId);

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
      const adminId = req.loggedInUser._id;
      const adminMunicipalityId = req.loggedInUser.municipalityId;
      const updateData = req.body;
      const file = req.file;

      const staff = await staffSvc.updateStaff(id, updateData, file, adminId, adminMunicipalityId);

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
      const adminMunicipalityId = req.loggedInUser.municipalityId;

      await staffSvc.deleteStaff(id, adminMunicipalityId);

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
      const updateData = req.body;
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
  
}

const staffCtrl = new StaffController();
export default staffCtrl;