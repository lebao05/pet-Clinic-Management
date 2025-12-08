// models/petModel.js
const { getConnection, sql } = require("../config/database");

class PetModel {
  // Lấy tất cả pets
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
                    SELECT p.*, u.FullName AS OwnerName, u.Phone AS OwnerPhone
                    FROM Pet p
                    INNER JOIN Users u ON p.UserID = u.UserID
                    WHERE p.IsActive = 1
                    ORDER BY p.PetID DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  // Lấy pet theo ID
  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("id", sql.Int, id).query(`
                    SELECT p.*, u.FullName AS OwnerName, u.Phone AS OwnerPhone,
                           u.Email AS OwnerEmail
                    FROM Pet p
                    INNER JOIN Users u ON p.UserID = u.UserID
                    WHERE p.PetID = @id AND p.IsActive = 1
                `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }

  // Tạo pet mới
  static async create(petData) {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("userId", sql.Int, petData.userId)
        .input("petName", sql.NVarChar, petData.petName)
        .input("species", sql.NVarChar, petData.species)
        .input("breed", sql.NVarChar, petData.breed || null)
        .input("birthDate", sql.Date, petData.birthDate || null)
        .input("gender", sql.NVarChar, petData.gender || null)
        .input("healthStatus", sql.NVarChar, petData.healthStatus || "Healthy").query(`
                    INSERT INTO Pet (UserID, PetName, Species, Breed, BirthDate, Gender, HealthStatus)
                    VALUES (@userId, @petName, @species, @breed, @birthDate, @gender, @healthStatus);
                    SELECT SCOPE_IDENTITY() AS PetID;
                `);
      return result.recordset[0].PetID;
    } catch (err) {
      throw err;
    }
  }

  // Cập nhật pet
  static async update(id, petData) {
    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("petName", sql.NVarChar, petData.petName)
        .input("species", sql.NVarChar, petData.species)
        .input("breed", sql.NVarChar, petData.breed)
        .input("birthDate", sql.Date, petData.birthDate)
        .input("gender", sql.NVarChar, petData.gender)
        .input("healthStatus", sql.NVarChar, petData.healthStatus).query(`
                    UPDATE Pet 
                    SET PetName = @petName, Species = @species, Breed = @breed,
                        BirthDate = @birthDate, Gender = @gender, HealthStatus = @healthStatus
                    WHERE PetID = @id
                `);
    } catch (err) {
      throw err;
    }
  }

  // Xóa mềm
  static async delete(id) {
    try {
      const pool = await getConnection();
      await pool.request().input("id", sql.Int, id).query("UPDATE Pet SET IsActive = 0 WHERE PetID = @id");
    } catch (err) {
      throw err;
    }
  }

  // Lấy lịch sử khám của pet
  static async getMedicalHistory(petId) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("petId", sql.Int, petId).query(`
                    SELECT a.AppointmentID, a.ScheduleTime, a.Status,
                           s.ServiceName, s.ServiceType,
                           e.FullName AS DoctorName, b.BranchName,
                           er.Symptoms, er.Diagnosis, er.Prescription
                    FROM Appointment a
                    INNER JOIN Service s ON a.ServiceID = s.ServiceID
                    INNER JOIN Branch b ON a.BranchID = b.BranchID
                    LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
                    LEFT JOIN ExamRecord er ON a.AppointmentID = er.AppointmentID
                    WHERE a.PetID = @petId
                    ORDER BY a.ScheduleTime DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = PetModel;
