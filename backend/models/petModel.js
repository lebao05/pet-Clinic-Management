const { getConnection, sql } = require("../config/database");

class PetModel {
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query(
      `SELECT p.PetID, p.PetName, p.Species, p.Breed, p.Gender, p.BirthDate, p.HealthStatus,
              p.UserID, u.FullName AS OwnerName, u.Phone AS OwnerPhone
       FROM Pet p
       JOIN Users u ON u.UserID=p.UserID
       WHERE p.IsActive=1
       ORDER BY p.PetID DESC;`
    );
    return result.recordset;
  }

  static async getById(id) {
    const pool = await getConnection();
    const result = await pool.request().input("id", sql.Int, id).query(
      `SELECT p.*, u.FullName AS OwnerName, u.Phone AS OwnerPhone
       FROM Pet p
       JOIN Users u ON u.UserID=p.UserID
       WHERE p.PetID=@id AND p.IsActive=1;`
    );
    return result.recordset[0];
  }

  static async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, data.userId)
      .input("petName", sql.NVarChar, data.petName)
      .input("species", sql.NVarChar, data.species)
      .input("breed", sql.NVarChar, data.breed || null)
      .input("birthDate", sql.Date, data.birthDate || null)
      .input("gender", sql.NVarChar, data.gender || null)
      .input("healthStatus", sql.NVarChar, data.healthStatus || null)
      .query(
        `INSERT INTO Pet (UserID, PetName, Species, Breed, BirthDate, Gender, HealthStatus, IsActive)
         VALUES (@userId, @petName, @species, @breed, @birthDate, @gender, @healthStatus, 1);
         SELECT SCOPE_IDENTITY() AS PetID;`
      );
    return result.recordset[0].PetID;
  }

  static async update(id, data) {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("petName", sql.NVarChar, data.petName)
      .input("species", sql.NVarChar, data.species)
      .input("breed", sql.NVarChar, data.breed)
      .input("birthDate", sql.Date, data.birthDate)
      .input("gender", sql.NVarChar, data.gender)
      .input("healthStatus", sql.NVarChar, data.healthStatus)
      .query(
        `UPDATE Pet
         SET PetName=@petName, Species=@species, Breed=@breed, BirthDate=@birthDate,
             Gender=@gender, HealthStatus=@healthStatus
         WHERE PetID=@id;`
      );
  }

  static async delete(id) {
    const pool = await getConnection();
    await pool.request().input("id", sql.Int, id).query(`UPDATE Pet SET IsActive=0 WHERE PetID=@id;`);
  }

  static async getMedicalHistory(petId) {
    const pool = await getConnection();
    const result = await pool.request().input("petId", sql.Int, petId).query(
      `SELECT a.AppointmentID, a.ScheduleTime, a.Status,
              s.ServiceName, s.ServiceType,
              e.FullName AS DoctorName,
              er.Symptoms, er.Diagnosis, er.Prescription, er.NextVisitDate,
              vr.VaccineID, v.VaccineName, vr.Dose, vr.DateGiven, vr.Note
       FROM Appointment a
       JOIN Service s ON s.ServiceID=a.ServiceID
       LEFT JOIN Employee e ON e.EmployeeID=a.DoctorID
       LEFT JOIN ExamRecord er ON er.AppointmentID=a.AppointmentID
       LEFT JOIN VaccinationRecord vr ON vr.AppointmentID=a.AppointmentID
       LEFT JOIN Vaccine v ON v.VaccineID=vr.VaccineID
       WHERE a.PetID=@petId
       ORDER BY a.ScheduleTime DESC;`
    );
    return result.recordset;
  }
}

module.exports = PetModel;
