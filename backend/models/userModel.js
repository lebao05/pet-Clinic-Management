// models/userModel.js
const { getConnection, sql } = require("../config/database");

class UserModel {
  // Lấy tất cả users
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
                    SELECT u.UserID, u.FullName, u.Phone, u.Email, u.Gender, 
                           u.BirthDate, u.LoyaltyPoints, m.RankName,
                           m.DiscountPercent
                    FROM Users u
                    LEFT JOIN Membership m ON u.RankID = m.RankID
                    WHERE u.IsActive = 1
                    ORDER BY u.UserID DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  // Lấy user theo ID với thông tin chi tiết
  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("id", sql.Int, id).query(`
                    SELECT u.*, m.RankName, m.DiscountPercent,
                           m.MinSpendPerYear, m.KeepSpendPerYear
                    FROM Users u
                    LEFT JOIN Membership m ON u.RankID = m.RankID
                    WHERE u.UserID  = @id AND u.IsActive = 1
                `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }

  // Tìm user theo phone
  static async findByPhone(phone) {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("phone", sql.NVarChar, phone)
        .query("SELECT * FROM Users WHERE Phone = @phone AND IsActive = 1");
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }

  // Tạo user mới
  static async create(userData) {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("fullName", sql.NVarChar, userData.fullName)
        .input("phone", sql.NVarChar, userData.phone)
        .input("email", sql.NVarChar, userData.email || null)
        .input("cccd", sql.NVarChar, userData.cccd || null)
        .input("gender", sql.NVarChar, userData.gender || null)
        .input("birthDate", sql.Date, userData.birthDate || null).query(`
                    INSERT INTO Users (FullName, Phone, Email, CCCD, Gender, BirthDate, RankID, LoyaltyPoints)
                    VALUES (@fullName, @phone, @email, @cccd, @gender, @birthDate, 1, 0);
                    SELECT SCOPE_IDENTITY() AS UserID;
                `);
      return result.recordset[0].UserID;
    } catch (err) {
      throw err;
    }
  }

  // Cập nhật user
  static async update(id, userData) {
    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("fullName", sql.NVarChar, userData.fullName)
        .input("phone", sql.NVarChar, userData.phone)
        .input("email", sql.NVarChar, userData.email)
        .input("gender", sql.NVarChar, userData.gender)
        .input("birthDate", sql.Date, userData.birthDate).query(`
                    UPDATE Users 
                    SET FullName = @fullName, Phone = @phone, 
                        Email = @email, Gender = @gender, BirthDate = @birthDate
                    WHERE UserID = @id
                `);
    } catch (err) {
      throw err;
    }
  }

  // Xóa mềm
  static async delete(id) {
    try {
      const pool = await getConnection();
      await pool.request().input("id", sql.Int, id).query("UPDATE Users SET IsActive = 0 WHERE UserID = @id");
    } catch (err) {
      throw err;
    }
  }

  // Lấy pets của user
  static async getPets(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("userId", sql.Int, userId).query(`
                    SELECT * FROM Pet 
                    WHERE UserID = @userId AND IsActive = 1
                    ORDER BY PetID DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  // Lấy lịch hẹn của user
  static async getAppointments(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("userId", sql.Int, userId).query(`
                    SELECT a.*, s.ServiceName, b.BranchName, 
                           p.PetName, e.FullName AS DoctorName
                    FROM Appointment a
                    INNER JOIN Service s ON a.ServiceID = s.ServiceID
                    INNER JOIN Branch b ON a.BranchID = b.BranchID
                    INNER JOIN Pet p ON a.PetID = p.PetID
                    LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
                    WHERE a.UserID = @userId
                    ORDER BY a.ScheduleTime DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = UserModel;
