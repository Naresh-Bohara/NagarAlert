import HttpResponse from "../../constants/response-status.contants.js";
import reportSvc from "./report.service.js";

class ReportController {
  createReport = async (req, res, next) => {
    try {
      const citizenId = req.loggedInUser._id;
      const reportData = req.body;
      const files = req.files;

      const report = await reportSvc.createReport(reportData, files, citizenId);

      res.status(201).json({
        data: report,
        message: "Report created successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getReports = async (req, res, next) => {
    try {
      const filter = req.validatedQuery || req.query;
      const result = await reportSvc.getReports(filter);

      res.json({
        data: result.reports,
        pagination: result.pagination,
        message: "Reports fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getReport = async (req, res, next) => {
    try {
      const { id } = req.params;
      const report = await reportSvc.getReportById(id);

      res.json({
        data: report,
        message: "Report fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  updateReport = async (req, res, next) => {
    try {
      const { id } = req.params;
      const citizenId = req.loggedInUser._id;
      const updateData = req.body;
      const files = req.files;

      const report = await reportSvc.updateReport(id, updateData, files, citizenId);

      res.json({
        data: report,
        message: "Report updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  deleteReport = async (req, res, next) => {
    try {
      const { id } = req.params;
      const citizenId = req.loggedInUser._id;

      await reportSvc.deleteReport(id, citizenId);

      res.json({
        data: null,
        message: "Report deleted successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  updateReportStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const staffId = req.loggedInUser._id;
      const updateData = req.body;

      const report = await reportSvc.updateReportStatus(id, updateData, staffId);

      res.json({
        data: report,
        message: "Report status updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMyReports = async (req, res, next) => {
    try {
      const citizenId = req.loggedInUser._id;
      const filter = req.validatedQuery || req.query;

      const result = await reportSvc.getMyReports(citizenId, filter);

      res.json({
        data: result.reports,
        pagination: result.pagination,
        message: "Your reports fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  assignReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignData = req.body;
    const adminMunicipalityId = req.loggedInUser.municipalityId;

    const report = await reportSvc.assignReport(id, assignData, adminMunicipalityId);

    res.json({
      data: report,
      message: "Report assigned successfully",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};

  getAssignedReports = async (req, res, next) => {
    try {
      const staffId = req.loggedInUser._id;
      const filter = req.validatedQuery || req.query;

      const result = await reportSvc.getAssignedReports(staffId, filter);

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
  }
}

const reportCtrl = new ReportController();
export default reportCtrl;