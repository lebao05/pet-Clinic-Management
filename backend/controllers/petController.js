// controllers/petController.js
const PetModel = require("../models/petModel");

class PetController {
  // GET /api/pets
  static async getAll(req, res) {
    try {
      const pets = await PetModel.getAll();
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

  // GET /api/pets/:id
  static async getById(req, res) {
    try {
      const pet = await PetModel.getById(req.params.id);

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy pet",
        });
      }

      res.json({
        success: true,
        data: pet,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // POST /api/pets
  static async create(req, res) {
    try {
      const { userId, petName, species, breed, birthDate, gender, healthStatus } = req.body;

      if (!userId || !petName || !species) {
        return res.status(400).json({
          success: false,
          error: "UserID, tên pet và loài là bắt buộc",
        });
      }

      const petId = await PetModel.create({
        userId,
        petName,
        species,
        breed,
        birthDate,
        gender,
        healthStatus,
      });

      res.status(201).json({
        success: true,
        message: "Tạo pet thành công",
        petId,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // PUT /api/pets/:id
  static async update(req, res) {
    try {
      await PetModel.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật pet thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // DELETE /api/pets/:id
  static async delete(req, res) {
    try {
      await PetModel.delete(req.params.id);
      res.json({
        success: true,
        message: "Xóa pet thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/pets/:id/medical-history
  static async getMedicalHistory(req, res) {
    try {
      const history = await PetModel.getMedicalHistory(req.params.id);
      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
}

module.exports = PetController;
