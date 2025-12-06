import { Router } from "express";
import { 
  createEmergencyDTO, 
  updateEmergencyDTO, 
  emergencyFilterDTO,
  emergencyIdDTO 
} from "./emergency-services.request.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import emergencyCtrl from "./emergency-services.controller.js";

const emergencyRouter = Router();

// Public routes - no authentication required
emergencyRouter.get(
  "/public/all",
  queryValidator(emergencyFilterDTO),
  emergencyCtrl.getAllEmergencyServices
);

emergencyRouter.get(
  "/public/category/:category",
  emergencyCtrl.getEmergencyByCategory
);

emergencyRouter.get(
  "/public/municipality/:municipalityId",
  emergencyCtrl.getEmergencyByMunicipality
);

emergencyRouter.get(
  "/:id",
  paramsValidator(emergencyIdDTO),
  emergencyCtrl.getEmergencyServiceById
);

// System Admin routes
emergencyRouter.post(
  "/",
  checkLogin,
  Require.SystemAdmin,
  bodyValidator(createEmergencyDTO),
  emergencyCtrl.createEmergencyService
);

emergencyRouter.put(
  "/:id",
  checkLogin,
  Require.SystemAdmin,
  paramsValidator(emergencyIdDTO),
  bodyValidator(updateEmergencyDTO),
  emergencyCtrl.updateEmergencyService
);

emergencyRouter.delete(
  "/:id",
  checkLogin,
  Require.SystemAdmin,
  paramsValidator(emergencyIdDTO),
  emergencyCtrl.deleteEmergencyService
);

emergencyRouter.get(
  "/admin/all",
  checkLogin,
  Require.SystemAdmin,
  queryValidator(emergencyFilterDTO),
  emergencyCtrl.adminGetAllEmergencyServices
);

// Municipality Admin can view their city's services
emergencyRouter.get(
  "/municipality-admin/all",
  checkLogin,
  Require.MunicipalityAdmin,
  emergencyCtrl.getMunicipalityAdminEmergencyServices
);

export default emergencyRouter;