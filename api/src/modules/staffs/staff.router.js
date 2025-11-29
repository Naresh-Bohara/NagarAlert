import { Router } from "express";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { 
  staffRegistrationDTO, 
  staffUpdateDTO, 
  staffFilterDTO, 
  staffIdDTO 
} from "./staff.request.js";

import { profileImageUpload } from "../../config/upload.config.js";
import staffCtrl from "./staff.controller.js";

const staffRouter = Router();

// Admin creates new staff
staffRouter.post("/",checkLogin, Require.AdminOnly,profileImageUpload,bodyValidator(staffRegistrationDTO),staffCtrl.createStaff);

// Admin gets all staff with filtering
staffRouter.get("/",checkLogin,Require.AdminOnly,queryValidator(staffFilterDTO),staffCtrl.getStaff);

// Admin gets single staff details
staffRouter.get("/:id",checkLogin,Require.AdminOnly,paramsValidator(staffIdDTO),staffCtrl.getStaffById);

// Admin updates staff
staffRouter.put("/:id",checkLogin,Require.AdminOnly,profileImageUpload,paramsValidator(staffIdDTO),bodyValidator(staffUpdateDTO),staffCtrl.updateStaff);

// Admin deletes staff
staffRouter.delete("/:id",checkLogin,Require.AdminOnly,paramsValidator(staffIdDTO),staffCtrl.deleteStaff);

// Staff gets own profile
staffRouter.get("/profile/me",checkLogin,Require.StaffOnly,staffCtrl.getMyProfile);

// Staff updates own profile
staffRouter.put("/profile/me",checkLogin,Require.StaffOnly,profileImageUpload,bodyValidator(staffUpdateDTO),staffCtrl.updateMyProfile);

// Staff gets assigned reports
staffRouter.get("/reports/assigned",checkLogin,Require.StaffOnly,queryValidator(staffFilterDTO),staffCtrl.getMyAssignedReports);

export default staffRouter;