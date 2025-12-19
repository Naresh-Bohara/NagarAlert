import { Router } from "express";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { createSponsorDTO, updateSponsorDTO, sponsorFilterDTO, sponsorIdDTO } from "./sponsor.request.js";
import { imagesUpload, sponsorImageUpload } from "../../config/upload.config.js";
import sponsorCtrl from "./sponsor.controller.js";

const sponsorRouter = Router();

// Admin creates new sponsor
sponsorRouter.post("/", checkLogin, Require.AdminOnly, sponsorImageUpload, bodyValidator(createSponsorDTO), sponsorCtrl.createSponsor);

// Get all sponsors with filtering
sponsorRouter.get("/", queryValidator(sponsorFilterDTO), sponsorCtrl.getSponsors);

// Get single sponsor details
sponsorRouter.get("/:id", paramsValidator(sponsorIdDTO), sponsorCtrl.getSponsorById);

// Admin updates sponsor
sponsorRouter.put("/:id", checkLogin, Require.AdminOnly, imagesUpload, paramsValidator(sponsorIdDTO), bodyValidator(updateSponsorDTO), sponsorCtrl.updateSponsor);

// Admin deletes sponsor
sponsorRouter.delete("/:id", checkLogin, Require.AdminOnly, paramsValidator(sponsorIdDTO), sponsorCtrl.deleteSponsor);

// Get active sponsors for municipality
sponsorRouter.get("/municipality/:municipalityId/active", sponsorCtrl.getActiveMunicipalitySponsors);

// Get global active sponsors
sponsorRouter.get("/global/active", sponsorCtrl.getGlobalActiveSponsors);

export default sponsorRouter;