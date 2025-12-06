import { Router } from "express";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { staffRegistrationDTO, staffUpdateDTO, staffSelfUpdateDTO, staffQueryFilterDTO, staffIdDTO, staffReportsFilterDTO } from "./staff.request.js";
import { profileImageUpload } from "../../config/upload.config.js";
import staffCtrl from "./staff.controller.js";
import Joi from "joi";

const staffRouter = Router();

// Admin Management
staffRouter.route("/")
  .post(checkLogin, Require.AdminOnly, profileImageUpload, bodyValidator(staffRegistrationDTO), staffCtrl.createStaff)
  .get(checkLogin, Require.AdminOnly, queryValidator(staffQueryFilterDTO), staffCtrl.getStaff);

staffRouter.route("/:id")
  .get(checkLogin, Require.AdminOnly, paramsValidator(staffIdDTO), staffCtrl.getStaffById)
  .put(checkLogin, Require.AdminOnly, profileImageUpload, paramsValidator(staffIdDTO), bodyValidator(staffUpdateDTO), staffCtrl.updateStaff)
  .delete(checkLogin, Require.AdminOnly, paramsValidator(staffIdDTO), staffCtrl.deleteStaff);

// Staff Self-Service
staffRouter.get("/profile/me", checkLogin, Require.StaffOnly, staffCtrl.getMyProfile);
staffRouter.put("/profile/me", checkLogin, Require.StaffOnly, profileImageUpload, bodyValidator(staffSelfUpdateDTO), staffCtrl.updateMyProfile);
staffRouter.get("/reports/assigned", checkLogin, Require.StaffOnly, queryValidator(staffReportsFilterDTO), staffCtrl.getMyAssignedReports);

// Field Staff Operations
staffRouter.patch("/availability", checkLogin, Require.FieldStaff, bodyValidator(Joi.object({ availability: Joi.boolean().required() })), staffCtrl.updateAvailability);
staffRouter.patch("/location", checkLogin, Require.FieldStaff, bodyValidator(Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() })), staffCtrl.updateLocation);

export default staffRouter;