// models/appointmentModel.js
const { getConnection, sql } = require("../config/database");

class AppointmentModel {
  // Lấy tất cả appointments
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
                    SELECT a.*, 
                           u.FullName AS CustomerName, u.Phone AS CustomerPhone,
                           p.PetName, p.Species,
                           s.ServiceName, s.ServiceType,
                           b.BranchName,
                           e.FullName AS DoctorName
                    FROM Appointment a
                    INNER JOIN Users u ON a.UserID = u.UserID
                    INNER JOIN Pet p ON a.PetID = p.PetID
                    INNER JOIN Service s ON a.ServiceID = s.ServiceID
                    INNER JOIN Branch b ON a.BranchID = b.BranchID
                    LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
                    ORDER BY a.ScheduleTime DESC
                `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  // Lấy appointment theo ID
  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request().input("id", sql.Int, id).query(`
                    SELECT a.*, 
                           u.FullName AS CustomerName, u.Phone AS CustomerPhone, u.Email,
                           p.PetName, p.Species, p.Breed, p.BirthDate AS PetBirthDate,
                           s.ServiceName, s.ServiceType,
                           b.BranchName, b.Address, b.Phone AS BranchPhone,
                           e.FullName AS DoctorName
                    FROM Appointment a
                    INNER JOIN Users u ON a.UserID = u.UserID
                    INNER JOIN Pet p ON a.PetID = p.PetID
                    INNER JOIN Service s ON a.ServiceID = s.ServiceID
                    INNER JOIN Branch b ON a.BranchID = b.BranchID
                    LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
                    WHERE a.AppointmentID = @id
                `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }

  // Tạo appointment mới
  static async create(appointmentData) {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("branchId", sql.Int, appointmentData.branchId)
        .input("userId", sql.Int, appointmentData.userId)
        .input("petId", sql.Int, appointmentData.petId)
        .input("serviceId", sql.Int, appointmentData.serviceId)
        .input("doctorId", sql.Int, appointmentData.doctorId || null)
        .input("scheduleTime", sql.DateTime, appointmentData.scheduleTime)
        .input("status", sql.NVarChar, appointmentData.status || "Booked").query(`
                    INSERT INTO Appointment (BranchID, UserID, PetID, ServiceID, DoctorID, ScheduleTime, Status)
                    VALUES (@branchId, @userId, @petId, @serviceId, @doctorId, @scheduleTime, @status);
                    SELECT SCOPE_IDENTITY() AS AppointmentID;
                `);
      return result.recordset[0].AppointmentID;
    } catch (err) {
      throw err;
    }
  }

  // Cập nhật appointment
  static async update(id, appointmentData) {
    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("scheduleTime", sql.DateTime, appointmentData.scheduleTime)
        .input("doctorId", sql.Int, appointmentData.doctorId)
        .input("status", sql.NVarChar, appointmentData.status).query(`
                    UPDATE Appointment 
                    SET ScheduleTime = @scheduleTime, 
                        DoctorID = @doctorId,
                        Status = @status
                    WHERE AppointmentID = @id
                `);
    } catch (err) {
      throw err;
    }
  }

  // Hủy appointment
  static async cancel(id) {
    try {
      const pool = await getConnection();
      await pool
        .request()
        .input("id", sql.Int, id)
        .query(`UPDATE Appointment SET Status = 'Cancelled' WHERE AppointmentID = @id`);
    } catch (err) {
      throw err;
    }
  }

  // Lấy appointments theo ngày
  static async getByDate(date, branchId = null) {
    try {
      const pool = await getConnection();
      let query = `
                SELECT a.*, 
                       u.FullName AS CustomerName, u.Phone AS CustomerPhone,
                       p.PetName, s.ServiceName, e.FullName AS DoctorName
                FROM Appointment a
                INNER JOIN Users u ON a.UserID = u.UserID
                INNER JOIN Pet p ON a.PetID = p.PetID
                INNER JOIN Service s ON a.ServiceID = s.ServiceID
                LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
                WHERE CAST(a.ScheduleTime AS DATE) = @date
            `;

      if (branchId) {
        query += " AND a.BranchID = @branchId";
      }

      query += " ORDER BY a.ScheduleTime";

      const request = pool.request().input("date", sql.Date, date);
      if (branchId) {
        request.input("branchId", sql.Int, branchId);
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = AppointmentModel;
