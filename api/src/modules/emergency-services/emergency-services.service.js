import EmergencyServiceModel from "./emergency-services.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";

class EmergencyService {
  createEmergencyService = async (serviceData) => {
    try {
      // Check municipality exists if provided
      if (serviceData.municipalityId) {
        const municipality = await MunicipalityModel.findById(serviceData.municipalityId);
        if (!municipality) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Municipality not found",
            statusCode: HttpResponse.validationFailed
          }
        }
      }

      const service = new EmergencyServiceModel(serviceData);
      await service.save();
      return service;

    } catch (error) {
      throw error;
    }
  }

  getEmergencyServices = async (filter = {}) => {
    const { page = 1, limit = 20, municipalityId, category, isActive, search, ...otherFilters } = filter;

    const query = { ...otherFilters };
    if (municipalityId) query.municipalityId = municipalityId;
    if (category) query.category = category;
    if (typeof isActive !== 'undefined') query.isActive = isActive;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      EmergencyServiceModel.find(query)
        .populate('municipalityId', 'name location.city')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      EmergencyServiceModel.countDocuments(query)
    ]);

    return {
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  getEmergencyServiceById = async (serviceId) => {
    const service = await EmergencyServiceModel.findById(serviceId)
      .populate('municipalityId', 'name location.city contactPhone');

    if (!service) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Emergency service not found",
        statusCode: HttpResponse.notFound
      }
    }

    return service;
  }

  updateEmergencyService = async (serviceId, updateData) => {
    const service = await EmergencyServiceModel.findById(serviceId);

    if (!service) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Emergency service not found",
        statusCode: HttpResponse.notFound
      }
    }

    // Check municipality exists if updating
    if (updateData.municipalityId) {
      const municipality = await MunicipalityModel.findById(updateData.municipalityId);
      if (!municipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality not found",
          statusCode: HttpResponse.validationFailed
        }
      }
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        service[key] = updateData[key];
      }
    });

    await service.save();
    return service;
  }

  deleteEmergencyService = async (serviceId) => {
    const service = await EmergencyServiceModel.findById(serviceId);

    if (!service) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Emergency service not found",
        statusCode: HttpResponse.notFound
      }
    }

    await EmergencyServiceModel.findByIdAndDelete(serviceId);
    return true;
  }

  getEmergencyByMunicipality = async (municipalityId) => {
    const services = await EmergencyServiceModel.find({
      $or: [
        { municipalityId },
        { municipalityId: null }
      ],
      isActive: true
    })
    .populate('municipalityId', 'name')
    .sort({ category: 1 });

    return services;
  }

  getEmergencyByCategory = async (category) => {
    const services = await EmergencyServiceModel.find({
      category,
      isActive: true
    })
    .populate('municipalityId', 'name location.city')
    .sort({ municipalityId: 1 });

    return services;
  }

  getMunicipalityAdminEmergencyServices = async (municipalityId) => {
    const services = await EmergencyServiceModel.find({
      $or: [
        { municipalityId },
        { municipalityId: null }
      ]
    })
    .populate('municipalityId', 'name')
    .sort({ name: 1 });

    return services;
  }
}

const emergencySvc = new EmergencyService();
export default emergencySvc;