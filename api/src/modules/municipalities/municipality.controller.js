import HttpResponse from "../../constants/response-status.contants.js";
import municipalitySvc from "./municipality.service.js";

class MunicipalityController {
  
  createMunicipality = async (req, res, next) => {
    try {
      const result = await municipalitySvc.createMunicipality(req.body);

      res.json({
        data: {
          municipality: {
            _id: result.municipality._id,
            name: result.municipality.name,
            city: result.municipality.location.city,
            province: result.municipality.location.province,
            contactEmail: result.municipality.contactEmail,
            isActive: result.municipality.isActive
          },
          adminUser: result.adminUser
        },
        message: "Municipality created successfully. Admin activation email sent.",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMunicipality = async (req, res, next) => {
    try {
      const { id } = req.params;
      const municipality = await municipalitySvc.getMunicipalityById(id);

      res.json({
        data: municipality,
        message: "Municipality fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMunicipalities = async (req, res, next) => {
    try {
      const result = await municipalitySvc.getMunicipalities(req.query);

      res.json({
        data: result.municipalities,
        pagination: result.pagination,
        message: "Municipalities fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  updateMunicipality = async (req, res, next) => {
    try {
      const { id } = req.params;
      const municipality = await municipalitySvc.updateMunicipality(id, req.body);

      res.json({
        data: municipality,
        message: "Municipality updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  deleteMunicipality = async (req, res, next) => {
    try {
      const { id } = req.params;
      const municipality = await municipalitySvc.deleteMunicipality(id);

      res.json({
        data: municipality,
        message: "Municipality deactivated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMunicipalityStats = async (req, res, next) => {
    try {
      const { id } = req.params;
      const stats = await municipalitySvc.getMunicipalityStats(id);

      res.json({
        data: stats,
        message: "Municipality statistics fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMunicipalitiesByLocation = async (req, res, next) => {
    try {
      const { city, province } = req.query;
      const municipalities = await municipalitySvc.getMunicipalitiesByLocation(city, province);

      res.json({
        data: municipalities,
        message: "Municipalities fetched by location",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  // Get simple municipalities list for dropdowns
  getMunicipalitiesList = async (req, res, next) => {
    try {
      const municipalities = await municipalitySvc.getMunicipalitiesList();

      res.json({
        data: municipalities,
        message: "Municipalities list fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }
}

const municipalityCtrl = new MunicipalityController();
export default municipalityCtrl;