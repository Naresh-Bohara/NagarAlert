import HttpResponse from "../../constants/response-status.contants.js";
import emergencySvc from "./emergency-services.service.js";

class EmergencyController {
  createEmergencyService = async (req, res, next) => {
    try {
      const serviceData = req.body;
      const service = await emergencySvc.createEmergencyService(serviceData);

      res.status(201).json({
        data: service,
        message: "Emergency service created successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getAllEmergencyServices = async (req, res, next) => {
    try {
      const filter = req.validatedQuery || req.query;
      const result = await emergencySvc.getEmergencyServices(filter);

      res.json({
        data: result.services,
        pagination: result.pagination,
        message: "Emergency services fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getEmergencyServiceById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const service = await emergencySvc.getEmergencyServiceById(id);

      res.json({
        data: service,
        message: "Emergency service fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  updateEmergencyService = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const service = await emergencySvc.updateEmergencyService(id, updateData);

      res.json({
        data: service,
        message: "Emergency service updated successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  deleteEmergencyService = async (req, res, next) => {
    try {
      const { id } = req.params;
      await emergencySvc.deleteEmergencyService(id);

      res.json({
        data: null,
        message: "Emergency service deleted successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getEmergencyByMunicipality = async (req, res, next) => {
    try {
      const { municipalityId } = req.params;
      const services = await emergencySvc.getEmergencyByMunicipality(municipalityId);

      res.json({
        data: services,
        message: "Emergency services fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getEmergencyByCategory = async (req, res, next) => {
    try {
      const { category } = req.params;
      const services = await emergencySvc.getEmergencyByCategory(category);

      res.json({
        data: services,
        message: "Emergency services fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  adminGetAllEmergencyServices = async (req, res, next) => {
    try {
      const filter = req.validatedQuery || req.query;
      const result = await emergencySvc.getEmergencyServices(filter);

      res.json({
        data: result.services,
        pagination: result.pagination,
        message: "Emergency services fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }

  getMunicipalityAdminEmergencyServices = async (req, res, next) => {
    try {
      const municipalityId = req.loggedInUser.municipalityId;
      const services = await emergencySvc.getMunicipalityAdminEmergencyServices(municipalityId);

      res.json({
        data: services,
        message: "Emergency services fetched successfully",
        status: HttpResponse.success,
        options: null
      });

    } catch (exception) {
      next(exception);
    }
  }
}

const emergencyCtrl = new EmergencyController();
export default emergencyCtrl;