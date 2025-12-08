// controllers/userController.js
const UserModel = require("../models/userModel");

class UserController {
  // GET /api/users
  static async getAll(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      console.error("Error in getAll:", err);
      res.status(500).json({
        success: false,
        error: "Lỗi khi lấy danh sách users",
        message: err.message,
      });
    }
  }

  // GET /api/users/:id
  static async getById(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // POST /api/users
  static async create(req, res) {
    try {
      const { fullName, phone, email, cccd, gender, birthDate } = req.body;

      // Validate
      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          error: "Tên và số điện thoại là bắt buộc",
        });
      }

      // Kiểm tra phone trùng
      const existing = await UserModel.findByPhone(phone);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Số điện thoại đã tồn tại",
        });
      }

      const userId = await UserModel.create({
        fullName,
        phone,
        email,
        cccd,
        gender,
        birthDate,
      });

      res.status(201).json({
        success: true,
        message: "Tạo user thành công",
        userId,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // PUT /api/users/:id
  static async update(req, res) {
    try {
      await UserModel.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật user thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // DELETE /api/users/:id
  static async delete(req, res) {
    try {
      await UserModel.delete(req.params.id);
      res.json({
        success: true,
        message: "Xóa user thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/users/:id/pets
  static async getPets(req, res) {
    try {
      const pets = await UserModel.getPets(req.params.id);
      res.json({
        success: true,
        count: pets.length,
        data: pets,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/users/:id/appointments
  static async getAppointments(req, res) {
    try {
      const appointments = await UserModel.getAppointments(req.params.id);
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

module.exports = UserController;
