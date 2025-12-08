// controllers/appointmentController.js
const AppointmentModel = require("../models/appointmentModel");

class AppointmentController {
  // GET /api/appointments
  static async getAll(req, res) {
    try {
      const appointments = await AppointmentModel.getAll();
      res.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/appointments/:id
  static async getById(req, res) {
    try {
      const appointment = await AppointmentModel.getById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy appointment",
        });
      }

      res.json({
        success: true,
        data: appointment,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // POST /api/appointments
  static async create(req, res) {
    try {
      const { branchId, userId, petId, serviceId, doctorId, scheduleTime, status } = req.body;

      if (!branchId || !userId || !petId || !serviceId || !scheduleTime) {
        return res.status(400).json({
          success: false,
          error: "Thiếu thông tin bắt buộc",
        });
      }

      const appointmentId = await AppointmentModel.create({
        branchId,
        userId,
        petId,
        serviceId,
        doctorId,
        scheduleTime,
        status,
      });

      res.status(201).json({
        success: true,
        message: "Tạo appointment thành công",
        appointmentId,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // PUT /api/appointments/:id
  static async update(req, res) {
    try {
      await AppointmentModel.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật appointment thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // DELETE /api/appointments/:id (Cancel)
  static async cancel(req, res) {
    try {
      await AppointmentModel.cancel(req.params.id);
      res.json({
        success: true,
        message: "Hủy appointment thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/appointments/date/:date
  static async getByDate(req, res) {
    try {
      const { date } = req.params;
      const { branchId } = req.query;

      const appointments = await AppointmentModel.getByDate(date, branchId);
      res.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
}

module.exports = AppointmentController;
