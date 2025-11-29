import { Router } from "express";
import {
  createMunicipalityDTO,
  updateMunicipalityDTO,
  municipalityFilterDTO,
  municipalityIdDTO
} from "./municipality.request.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import municipalityCtrl from "./municipality.controller.js";

const municipalityRouter = Router();

// SYSTEM ADMIN ONLY - Create Municipality
municipalityRouter.post("/", checkLogin, Require.SystemAdmin, bodyValidator(createMunicipalityDTO), municipalityCtrl.createMunicipality);

// ALL LOGGED IN USERS - Get Municipalities (with filtering)
municipalityRouter.get("/", checkLogin, Require.AllLoggedIn, queryValidator(municipalityFilterDTO), municipalityCtrl.getMunicipalities);

// PUBLIC - Get Municipalities List (for dropdowns)
municipalityRouter.get("/list/all",municipalityCtrl.getMunicipalitiesList);

// ALL LOGGED IN USERS - Get Single Municipality
municipalityRouter.get("/:id", checkLogin, Require.AllLoggedIn, paramsValidator(municipalityIdDTO), municipalityCtrl.getMunicipality);

// SYSTEM ADMIN OR MUNICIPALITY ADMIN - Update Municipality
municipalityRouter.put("/:id", checkLogin, Require.AdminOnly, paramsValidator(municipalityIdDTO), bodyValidator(updateMunicipalityDTO), municipalityCtrl.updateMunicipality);

// SYSTEM ADMIN ONLY - Delete/Deactivate Municipality
municipalityRouter.delete("/:id", checkLogin, Require.SystemAdmin, paramsValidator(municipalityIdDTO), municipalityCtrl.deleteMunicipality);

// MUNICIPALITY STAFF AND ADMIN - Get Stats
municipalityRouter.get("/:id/stats", checkLogin, Require.StaffOnly, paramsValidator(municipalityIdDTO), municipalityCtrl.getMunicipalityStats);

// PUBLIC - Search Municipalities by Location
municipalityRouter.get("/location/search", queryValidator(municipalityFilterDTO), municipalityCtrl.getMunicipalitiesByLocation);

export default municipalityRouter;