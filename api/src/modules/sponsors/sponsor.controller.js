import HttpResponse from "../../constants/response-status.contants.js";
import sponsorSvc from "./sponsor.service.js";

class SponsorController {
createSponsor = async (req, res, next) => {
  try {
    const adminId = req.loggedInUser._id;
    const sponsorData = req.body;
    const bannerImage = req.file ? req.file.path : null;
    
    console.log('Uploaded file:', req.file); // Debug log
    console.log('Banner image path:', bannerImage); // Debug log
    
    const sponsor = await sponsorSvc.createSponsor(sponsorData, bannerImage, adminId);

    res.status(201).json({
      data: sponsor,
      message: "Sponsor created successfully",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};

  getSponsors = async (req, res, next) => {
    try {
      const filter = req.validatedQuery || req.query;
      const result = await sponsorSvc.getSponsors(filter);

      res.json({
        data: result.sponsors,
        pagination: result.pagination,
        message: "Sponsors fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getSponsorById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const sponsor = await sponsorSvc.getSponsorById(id);

      res.json({
        data: sponsor,
        message: "Sponsor details fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

 updateSponsor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const bannerImage = req.file ? req.file.path : null;
    
    const sponsor = await sponsorSvc.updateSponsor(id, updateData, bannerImage);

    res.json({
      data: sponsor,
      message: "Sponsor updated successfully",
      status: HttpResponse.success,
      options: null
    });

  } catch (exception) {
    next(exception);
  }
};

  deleteSponsor = async (req, res, next) => {
    try {
      const { id } = req.params;
      await sponsorSvc.deleteSponsor(id);

      res.json({
        data: null,
        message: "Sponsor deleted successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getActiveMunicipalitySponsors = async (req, res, next) => {
    try {
      const { municipalityId } = req.params;
      const sponsors = await sponsorSvc.getActiveMunicipalitySponsors(municipalityId);

      res.json({
        data: sponsors,
        message: "Active municipality sponsors fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };

  getGlobalActiveSponsors = async (req, res, next) => {
    try {
      const sponsors = await sponsorSvc.getGlobalActiveSponsors();

      res.json({
        data: sponsors,
        message: "Global active sponsors fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  };
}

const sponsorCtrl = new SponsorController();
export default sponsorCtrl;