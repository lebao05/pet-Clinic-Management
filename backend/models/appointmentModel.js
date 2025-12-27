const { getConnection, sql } = require("../config/database");

class AppointmentModel {
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query(
      `SELECT a.AppointmentID, a.ScheduleTime, a.Status, a.BranchID, b.BranchName,
              a.ServiceID, s.ServiceName, a.UserID, u.FullName AS CustomerName,
              a.PetID, p.PetName, a.DoctorID, e.FullName AS DoctorName
       FROM Appointment a
       JOIN Branch b ON b.BranchID=a.BranchID
       JOIN Service s ON s.ServiceID=a.ServiceID
       JOIN Users u ON u.UserID=a.UserID
       JOIN Pet p ON p.PetID=a.PetID
       LEFT JOIN Employee e ON e.EmployeeID=a.DoctorID
       ORDER BY a.ScheduleTime DESC;`
    );
    return result.recordset;
  }

  static async getById(id) {
    const pool = await getConnection();
    const result = await pool.request().input("id", sql.Int, id).query(
      `SELECT * FROM Appointment WHERE AppointmentID=@id;`
    );
    return result.recordset[0];
  }

  static async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("branchId", sql.Int, data.branchId)
      .input("userId", sql.Int, data.userId)
      .input("petId", sql.Int, data.petId)
      .input("serviceId", sql.Int, data.serviceId)
      .input("doctorId", sql.Int, data.doctorId || null)
      .input("scheduleTime", sql.DateTime2, data.scheduleTime)
      .input("status", sql.NVarChar, data.status || "Booked")
      .query(
        `INSERT INTO Appointment (BranchID, UserID, PetID, ServiceID, DoctorID, ScheduleTime, Status)
         VALUES (@branchId, @userId, @petId, @serviceId, @doctorId, @scheduleTime, @status);
         SELECT SCOPE_IDENTITY() AS AppointmentID;`
      );
    return result.recordset[0].AppointmentID;
  }

  static async update(id, data) {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("branchId", sql.Int, data.branchId)
      .input("userId", sql.Int, data.userId)
      .input("petId", sql.Int, data.petId)
      .input("serviceId", sql.Int, data.serviceId)
      .input("doctorId", sql.Int, data.doctorId || null)
      .input("scheduleTime", sql.DateTime2, data.scheduleTime)
      .input("status", sql.NVarChar, data.status)
      .query(
        `UPDATE Appointment
         SET BranchID=@branchId, UserID=@userId, PetID=@petId, ServiceID=@serviceId,
             DoctorID=@doctorId, ScheduleTime=@scheduleTime, Status=@status
         WHERE AppointmentID=@id;`
      );
  }

  static async cancel(id) {
    const pool = await getConnection();
    await pool.request().input("id", sql.Int, id).query(`UPDATE Appointment SET Status='Cancelled' WHERE AppointmentID=@id;`);
  }

  static async getByDate(date, branchId) {
    const pool = await getConnection();
    const req = pool.request().input("date", sql.Date, date);
    let where = "WHERE CAST(a.ScheduleTime AS DATE) = @date";
    if (branchId) {
      req.input("branchId", sql.Int, branchId);
      where += " AND a.BranchID=@branchId";
    }
    const result = await req.query(
      `SELECT a.AppointmentID, a.ScheduleTime, a.Status, b.BranchName, s.ServiceName, p.PetName, u.FullName AS CustomerName
       FROM Appointment a
       JOIN Branch b ON b.BranchID=a.BranchID
       JOIN Service s ON s.ServiceID=a.ServiceID
       JOIN Pet p ON p.PetID=a.PetID
       JOIN Users u ON u.UserID=a.UserID
       ${where}
       ORDER BY a.ScheduleTime ASC;`
    );
    return result.recordset;
  }
}

module.exports = AppointmentModel;
