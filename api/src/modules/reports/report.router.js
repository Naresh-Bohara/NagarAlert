import { Router } from "express";
import { 
  createReportDTO, 
  updateReportDTO, 
  staffUpdateReportDTO,
  reportFilterDTO,
  reportIdDTO, 
  assignReportDTO
} from "./report.request.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import { reportUpload } from "../../config/upload.config.js"; 
import reportCtrl from "./report.controller.js";

const reportRouter = Router();

// CITIZEN - Create Report (with file upload)
reportRouter.post("/", checkLogin, Require.Citizen, reportUpload, bodyValidator(createReportDTO),reportCtrl.createReport);

// ALL LOGGED IN - Get Reports (with filtering)
reportRouter.get("/", checkLogin, queryValidator(reportFilterDTO), reportCtrl.getReports);

// ALL LOGGED IN - Get Single Report
reportRouter.get("/:id",checkLogin,paramsValidator(reportIdDTO),reportCtrl.getReport);

// CITIZEN - Update Own Report
reportRouter.put("/:id",checkLogin,Require.Citizen,paramsValidator(reportIdDTO),reportUpload, bodyValidator(updateReportDTO), reportCtrl.updateReport);

// CITIZEN - Delete Own Report
reportRouter.delete("/:id",checkLogin,Require.Citizen,paramsValidator(reportIdDTO),reportCtrl.deleteReport);

// STAFF & ADMIN - Update Report Status & Assign
reportRouter.put("/:id/status", checkLogin, Require.StaffOnly, paramsValidator(reportIdDTO),bodyValidator(staffUpdateReportDTO),reportCtrl.updateReportStatus);

// CITIZEN - Get My Reports
reportRouter.get("/my/reports",checkLogin,Require.Citizen,queryValidator(reportFilterDTO),reportCtrl.getMyReports);

// ADMIN ONLY - Assign Report to Staff
reportRouter.put("/:id/assign", checkLogin, Require.AdminOnly, paramsValidator(reportIdDTO),bodyValidator(assignReportDTO), reportCtrl.assignReport);

// STAFF - Get Assigned Reports
reportRouter.get("/assigned/me", checkLogin, Require.StaffOnly, queryValidator(reportFilterDTO),reportCtrl.getAssignedReports);

export default reportRouter;