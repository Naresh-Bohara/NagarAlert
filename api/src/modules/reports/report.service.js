import ReportModel from "./report.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";
import UserModel from "../users/user.model.js";
import exifr from 'exifr'; 

class ReportService {
  createReport = async (reportData, files, citizenId) => {
    try {
      // 1. Check for similar active reports
      const existingReport = await ReportModel.findOne({
        citizenId: citizenId,
        category: reportData.category,
        status: { $in: ['pending', 'assigned', 'in_progress'] },
        $or: [
          ...(reportData.location?.coordinates ? [{
            'location.coordinates.lat': {
              $gte: reportData.location.coordinates.lat - 0.001,
              $lte: reportData.location.coordinates.lat + 0.001
            },
            'location.coordinates.lng': {
              $gte: reportData.location.coordinates.lng - 0.001,
              $lte: reportData.location.coordinates.lng + 0.001
            }
          }] : []),
          
          ...(reportData.location?.address ? [{
            'location.address': {
              $regex: new RegExp(reportData.location.address.split(' ').slice(0, 3).join('.*'), 'i')
            }
          }] : []),
          
          ...(reportData.title ? [{
            title: {
              $regex: new RegExp(reportData.title.split(' ').slice(0, 3).join('.*'), 'i')
            }
          }] : [])
        ],
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (existingReport) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "You already have an active report for this issue/location. Please check your existing reports.",
          statusCode: HttpResponse.validationFailed,
          data: {
            existingReportId: existingReport._id,
            submittedAt: existingReport.createdAt,
            status: existingReport.status
          }
        };
      }

      // 2. Check municipality exists and supports category
      const municipality = await MunicipalityModel.findById(reportData.municipalityId);
      if (!municipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality not found",
          statusCode: HttpResponse.validationFailed
        };
      }

      if (!municipality.reportCategories.includes(reportData.category)) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: `This municipality doesn't accept ${reportData.category} reports. Available categories: ${municipality.reportCategories.join(', ')}`,
          statusCode: HttpResponse.validationFailed
        };
      }

      // 3. VALIDATE REPORT LOCATION IS WITHIN MUNICIPALITY BOUNDARY
      if (!reportData.location?.coordinates) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Report coordinates are required for location validation",
          statusCode: HttpResponse.validationFailed
        };
      }

      const isWithinBoundary = this.isLocationWithinBoundary(
        reportData.location.coordinates.lat,
        reportData.location.coordinates.lng,
        municipality.boundaryBox
      );

      if (!isWithinBoundary) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Report location is outside the municipality's jurisdiction.",
          statusCode: HttpResponse.validationFailed,
          data: {
            municipalityName: municipality.name,
            boundaryBox: municipality.boundaryBox
          }
        };
      }

      // 4. VALIDATE IMAGE GPS LOCATIONS (REJECT IF OUTSIDE)
      let imageValidationResults = {
        valid: [],
        invalid: [],
        noGPS: []
      };

      if (files?.photos && files.photos.length > 0) {
        imageValidationResults = await this.validateAllImageLocations(
          files.photos,
          municipality.boundaryBox
        );

        // REJECT if any images are outside boundary
        if (imageValidationResults.invalid.length > 0) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: `${imageValidationResults.invalid.length} image(s) were taken outside ${municipality.name}. Please upload images taken within the municipality.`,
            statusCode: HttpResponse.validationFailed,
            data: {
              invalidImages: imageValidationResults.invalid
            }
          };
        }
      }

      // 5. Upload files to Cloudinary
      const uploadedPhotos = [];
      if (files?.photos) {
        for (const photo of files.photos) {
          const uploadResult = await CloudinaryService.uploadReportImage(photo.path, `report_${Date.now()}`);
          uploadedPhotos.push(uploadResult.url);
        }
      }

      const uploadedVideos = [];
      if (files?.videos) {
        for (const video of files.videos) {
          const uploadResult = await CloudinaryService.uploadReportVideo(video.path, `report_${Date.now()}`);
          uploadedVideos.push(uploadResult.url);
        }
      }

      // 6. Create and save report
      const report = new ReportModel({
        ...reportData,
        citizenId,
        photos: uploadedPhotos,
        videos: uploadedVideos,
        validationInfo: {
          locationValidated: true,
          boundaryBox: municipality.boundaryBox,
          imageValidation: {
            totalImages: files?.photos?.length || 0,
            imagesWithGPS: imageValidationResults.valid.length,
            imagesNoGPS: imageValidationResults.noGPS.length,
            allWithinBoundary: imageValidationResults.invalid.length === 0
          }
        }
      });

      await report.save();
      return report;

    } catch (error) {
      throw error;
    }
  }

  // Check if location is within boundary box
  isLocationWithinBoundary = (lat, lng, boundaryBox) => {
    if (!boundaryBox) {
      // No boundary set - allow with warning
      console.warn('No boundary box set for municipality');
      return true;
    }

    return lat >= boundaryBox.minLat && 
           lat <= boundaryBox.maxLat && 
           lng >= boundaryBox.minLng && 
           lng <= boundaryBox.maxLng;
  }

  // VALIDATE ALL IMAGE LOCATIONS
  validateAllImageLocations = async (photos, municipalityBoundaryBox) => {
    const results = {
      valid: [],    // Images with GPS within boundary
      invalid: [],  // Images with GPS outside boundary
      noGPS: []     // Images without GPS data
    };

    for (const photo of photos) {
      try {
        // Extract EXIF data including GPS
        const exifData = await exifr.parse(photo.path);
        
        if (exifData?.latitude && exifData?.longitude) {
          const imageLat = exifData.latitude;
          const imageLng = exifData.longitude;
          
          // Check if image location is within municipality boundary
          const isWithin = this.isLocationWithinBoundary(
            imageLat, 
            imageLng, 
            municipalityBoundaryBox
          );
          
          if (isWithin) {
            results.valid.push({
              filename: photo.originalname,
              coordinates: { lat: imageLat, lng: imageLng }
            });
          } else {
            results.invalid.push({
              filename: photo.originalname,
              coordinates: { lat: imageLat, lng: imageLng }
            });
          }
        } else {
          results.noGPS.push({
            filename: photo.originalname
          });
        }
      } catch (error) {
        results.noGPS.push({
          filename: photo.originalname,
          error: error.message
        });
      }
    }

    return results;
  }

  // Update report method with location validation
  updateReport = async (reportId, updateData, files, citizenId) => {
    const report = await ReportModel.findOne({ _id: reportId, citizenId });

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found or you don't have permission",
        statusCode: HttpResponse.notFound
      };
    }

    if (report.status !== 'pending') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot update report after it has been processed",
        statusCode: HttpResponse.validationFailed
      };
    }

    // If updating location, validate it's within municipality boundary
    if (updateData.location?.coordinates) {
      const municipality = await MunicipalityModel.findById(report.municipalityId);
      
      if (municipality?.boundaryBox) {
        const isWithin = this.isLocationWithinBoundary(
          updateData.location.coordinates.lat,
          updateData.location.coordinates.lng,
          municipality.boundaryBox
        );

        if (!isWithin) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Updated location is outside the municipality's jurisdiction",
            statusCode: HttpResponse.validationFailed
          };
        }
      }
    }

    // Validate new images if provided
    if (files?.photos && files.photos.length > 0) {
      const municipality = await MunicipalityModel.findById(report.municipalityId);
      const imageValidationResults = await this.validateAllImageLocations(
        files.photos,
        municipality?.boundaryBox
      );

      if (imageValidationResults.invalid.length > 0) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: `${imageValidationResults.invalid.length} new image(s) are outside municipality jurisdiction`,
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    // Upload new photos if provided
    if (files?.photos) {
      for (const photo of files.photos) {
        const uploadResult = await CloudinaryService.uploadReportImage(photo.path, `report_${Date.now()}`);
        report.photos.push(uploadResult.url);
      }
    }

    // Upload new videos if provided
    if (files?.videos) {
      for (const video of files.videos) {
        const uploadResult = await CloudinaryService.uploadReportVideo(video.path, `report_${Date.now()}`);
        report.videos.push(uploadResult.url);
      }
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        report[key] = updateData[key];
      }
    });

    await report.save();
    return report;
  }

  getReports = async (filter = {}) => {
    const { page = 1, limit = 10, category, status, severity, ...otherFilters } = filter;

    const query = { ...otherFilters };
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage')
        .populate('municipalityId', 'name location.city')
        .populate('assignedStaffId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  getReportById = async (reportId) => {
    const report = await ReportModel.findById(reportId)
      .populate('citizenId', 'name profileImage phone')
      .populate('municipalityId', 'name location contactEmail contactPhone')
      .populate('assignedStaffId', 'name profileImage phone');

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    return report;
  }

  deleteReport = async (reportId, citizenId) => {
    const report = await ReportModel.findOne({ _id: reportId, citizenId });

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found or you don't have permission",
        statusCode: HttpResponse.notFound
      };
    }

    if (report.status !== 'pending') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot delete report after it has been processed",
        statusCode: HttpResponse.validationFailed
      };
    }

    await ReportModel.findByIdAndDelete(reportId);
    return true;
  };

  updateReportStatus = async (reportId, updateData, staffId) => {
    const report = await ReportModel.findById(reportId);

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    const staffUser = await UserModel.findById(staffId);
    if (!staffUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff user not found",
        statusCode: HttpResponse.notFound
      };
    }

    if (!staffUser.municipalityId || !report.municipalityId) {
      throw {
        status: HttpResponseCode.INTERNAL_SERVER_ERROR,
        message: "Municipality data missing",
        statusCode: HttpResponse.serverError
      };
    }

    if (staffUser.municipalityId.toString() !== report.municipalityId.toString()) {
      throw {
        status: HttpResponseCode.FORBIDDEN,
        message: "Access denied. You can only manage reports from your municipality",
        statusCode: HttpResponse.accessDenied
      };
    }

    if (updateData.assignedStaffId) {
      const assignedStaff = await UserModel.findById(updateData.assignedStaffId);
      
      if (!assignedStaff) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Assigned staff member not found",
          statusCode: HttpResponse.validationFailed
        };
      }

      if (!assignedStaff.municipalityId) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Assigned staff has no municipality",
          statusCode: HttpResponse.validationFailed
        };
      }

      if (assignedStaff.municipalityId.toString() !== report.municipalityId.toString()) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Cannot assign report to staff from different municipality",
          statusCode: HttpResponse.validationFailed
        };
      }
    }

    const validTransitions = {
      'pending': ['assigned', 'resolved'],
      'assigned': ['in_progress', 'resolved'],
      'in_progress': ['resolved'],
      'resolved': []
    };

    if (updateData.status && !validTransitions[report.status]?.includes(updateData.status)) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: `Invalid status transition from ${report.status} to ${updateData.status}`,
        statusCode: HttpResponse.validationFailed
      };
    }

    const statusUpdates = { ...updateData };

    if (updateData.status === 'assigned' && report.status !== 'assigned') {
      statusUpdates.assignedAt = new Date();
    }

    if (updateData.status === 'in_progress' && report.status !== 'in_progress') {
      statusUpdates.inProgressAt = new Date();
    }

    if (updateData.status === 'resolved' && report.status !== 'resolved') {
      statusUpdates.resolvedAt = new Date();
      const pointsAwarded = this.calculatePoints(report.category);
      statusUpdates.pointsAwarded = pointsAwarded;
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      reportId,
      { $set: statusUpdates },
      { new: true }
    )
    .populate('assignedStaffId', 'name profileImage phone')
    .populate('citizenId', 'name profileImage')
    .populate('municipalityId', 'name location.city');

    return updatedReport;
  };

  calculatePoints = (category) => {
    const pointsMap = {
      'emergency': 20,
      'safety': 15,
      'road': 10,
      'water': 10,
      'electricity': 10,
      'sanitation': 8,
      'illegal_activity': 12
    };
    return pointsMap[category] || 5;
  };

  getMyReports = async (citizenId, filter = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filter;

    const query = { citizenId, ...otherFilters };
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('municipalityId', 'name location.city')
        .populate('assignedStaffId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  assignReport = async (reportId, assignData, adminMunicipalityId) => {
    const { assignedStaffId, priority, dueDate, notes } = assignData;

    const report = await ReportModel.findOne({
      _id: reportId,
      municipalityId: adminMunicipalityId
    })
    .populate('citizenId', 'name email phone');

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    if (report.status === 'resolved') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot assign a report that has already been resolved",
        statusCode: HttpResponse.validationFailed,
        data: {
          currentStatus: report.status,
          resolvedAt: report.resolvedAt
        }
      };
    }

    if (report.assignedStaffId?.toString() === assignedStaffId) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Report is already assigned to this staff member",
        statusCode: HttpResponse.validationFailed
      };
    }

    const staff = await UserModel.findOne({
      _id: assignedStaffId,
      municipalityId: adminMunicipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] }
    })
    .select('name email phone profileImage staffProfile');

    if (!staff) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Staff member not found or invalid",
        statusCode: HttpResponse.validationFailed
      };
    }

    if (staff.staffProfile?.availability === false) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Staff member is currently unavailable for assignments",
        statusCode: HttpResponse.validationFailed,
        data: {
          staffName: staff.name,
          department: staff.staffProfile?.department
        }
      };
    }

    const maxDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const finalDueDate = dueDate || report.dueDate;
    
    if (finalDueDate && finalDueDate > maxDueDate) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Due date cannot be more than 30 days in the future",
        statusCode: HttpResponse.validationFailed
      };
    }

    const updateData = {
      assignedStaffId,
      status: 'assigned',
      priority: priority || report.priority,
      assignmentNotes: notes,
      assignedAt: new Date()
    };

    if (dueDate || !report.dueDate) {
      updateData.dueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      reportId,
      { $set: updateData },
      { new: true }
    )
    .populate('citizenId', 'name profileImage phone email')
    .populate('municipalityId', 'name location.city contactPhone')
    .populate('assignedStaffId', 'name email phone profileImage staffProfile.department staffProfile.designation');

    try {
      await this.sendAssignmentNotifications(updatedReport, staff, report.citizenId);
    } catch (notificationError) {
      console.error('Failed to send assignment notifications:', notificationError);
    }

    return updatedReport;
  };

  sendAssignmentNotifications = async (report, staff, citizen) => {
    const staffMessage = `You have been assigned a new report: "${report.title}". Due: ${new Date(report.dueDate).toLocaleDateString()}. Priority: ${report.priority}`;
    
    const citizenMessage = `Your report "${report.title}" has been assigned to ${staff.name} (${staff.staffProfile?.department}). We'll keep you updated on the progress.`;

    console.log('Assignment notifications:', {
      staff: staffMessage,
      citizen: citizenMessage
    });
    
    return true;
  };

  getAssignedReports = async (staffId, filter = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filter;
    const query = { 
      assignedStaffId: staffId, 
      ...otherFilters 
    };

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage phone')
        .populate('municipalityId', 'name location.city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };
}

const reportSvc = new ReportService();
export default reportSvc;