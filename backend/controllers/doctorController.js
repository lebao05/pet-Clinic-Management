const { query } = require("../utils/db");

class DoctorController {
  // GET /api/doctor/appointments?doctorId=&date=YYYY-MM-DD
  static async listAppointments(req, res) {
    try {
      const doctorId = req.query.doctorId ? Number(req.query.doctorId) : null;
      const date = req.query.date; // YYYY-MM-DD

      if (!doctorId) {
        return res.status(400).json({ success: false, error: "doctorId is required" });
      }

      let where = "WHERE a.DoctorID = @doctorId";
      const params = { doctorId };

      if (date) {
        where += " AND CAST(a.ScheduleTime AS DATE) = @date";
        params.date = date;
      }

      const rows = await query(
        `
        SELECT
          a.AppointmentID,
          a.ScheduleTime,
          a.Status,
          s.ServiceID,
          s.ServiceName,
          s.ServiceType,
          p.PetID,
          p.PetName,
          p.Species,
          u.UserID,
          u.FullName AS OwnerName,
          u.Phone AS OwnerPhone,
          b.BranchID,
          b.BranchName
        FROM Appointment a
        JOIN Service s ON s.ServiceID = a.ServiceID
        JOIN Pet p ON p.PetID = a.PetID
        JOIN Users u ON u.UserID = a.UserID
        JOIN Branch b ON b.BranchID = a.BranchID
        ${where}
        ORDER BY a.ScheduleTime ASC;
        `,
        params
      );

      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/doctor/appointments/:id
  static async getAppointmentDetail(req, res) {
    try {
      const id = Number(req.params.id);
      const rows = await query(
        `
        SELECT
          a.AppointmentID,
          a.ScheduleTime,
          a.Status,
          a.DoctorID,
          s.ServiceID,
          s.ServiceName,
          s.ServiceType,
          p.PetID,
          p.PetName,
          p.Species,
          p.Breed,
          u.UserID,
          u.FullName AS OwnerName,
          u.Phone AS OwnerPhone,
          u.Email AS OwnerEmail,
          b.BranchID,
          b.BranchName
        FROM Appointment a
        JOIN Service s ON s.ServiceID = a.ServiceID
        JOIN Pet p ON p.PetID = a.PetID
        JOIN Users u ON u.UserID = a.UserID
        JOIN Branch b ON b.BranchID = a.BranchID
        WHERE a.AppointmentID = @id;
        `,
        { id }
      );
      if (!rows.length) return res.status(404).json({ success: false, error: "Not found" });

      const exam = await query(
        `SELECT ExamRecordID, Symptoms, Diagnosis, Prescription, NextVisitDate
         FROM ExamRecord WHERE AppointmentID = @id;`,
        { id }
      );
      const vacc = await query(
        `SELECT VaccinationID, VaccineID, Dose, DateGiven, Note, SubscriptionID, PackageID, SequenceNo
         FROM VaccinationRecord WHERE AppointmentID = @id;`,
        { id }
      );

      return res.json({ success: true, data: { appointment: rows[0], exam: exam[0] || null, vaccination: vacc[0] || null } });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/doctor/exam-records
  static async upsertExamRecord(req, res) {
    try {
      const { appointmentId, doctorId, symptoms, diagnosis, prescription, nextVisitDate } = req.body;
      if (!appointmentId || !doctorId) {
        return res.status(400).json({ success: false, error: "appointmentId and doctorId are required" });
      }

      const existing = await query(
        `SELECT ExamRecordID FROM ExamRecord WHERE AppointmentID = @appointmentId;`,
        { appointmentId }
      );

      if (existing.length) {
        await query(
          `
          UPDATE ExamRecord
          SET DoctorID=@doctorId, Symptoms=@symptoms, Diagnosis=@diagnosis, Prescription=@prescription, NextVisitDate=@nextVisitDate
          WHERE AppointmentID=@appointmentId;
          `,
          { appointmentId, doctorId, symptoms: symptoms || null, diagnosis: diagnosis || null, prescription: prescription || null, nextVisitDate: nextVisitDate || null }
        );
        return res.json({ success: true, message: "Updated" });
      }

      const inserted = await query(
        `
        INSERT INTO ExamRecord (AppointmentID, DoctorID, Symptoms, Diagnosis, Prescription, NextVisitDate)
        OUTPUT INSERTED.ExamRecordID
        VALUES (@appointmentId, @doctorId, @symptoms, @diagnosis, @prescription, @nextVisitDate);
        `,
        { appointmentId, doctorId, symptoms: symptoms || null, diagnosis: diagnosis || null, prescription: prescription || null, nextVisitDate: nextVisitDate || null }
      );
      return res.status(201).json({ success: true, examRecordId: inserted[0].ExamRecordID });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/doctor/vaccination-records
  static async upsertVaccinationRecord(req, res) {
    try {
      const { appointmentId, doctorId, vaccineId, dose, dateGiven, note, subscriptionId, packageId, sequenceNo } = req.body;
      if (!appointmentId || !doctorId || !vaccineId || !dateGiven) {
        return res.status(400).json({ success: false, error: "appointmentId, doctorId, vaccineId, dateGiven are required" });
      }

      const existing = await query(
        `SELECT VaccinationID FROM VaccinationRecord WHERE AppointmentID = @appointmentId;`,
        { appointmentId }
      );

      const params = {
        appointmentId,
        doctorId,
        vaccineId,
        dose: dose || null,
        dateGiven,
        note: note || null,
        subscriptionId: subscriptionId || null,
        packageId: packageId || null,
        sequenceNo: sequenceNo || null,
      };

      if (existing.length) {
        await query(
          `
          UPDATE VaccinationRecord
          SET DoctorID=@doctorId, VaccineID=@vaccineId, Dose=@dose, DateGiven=@dateGiven, Note=@note,
              SubscriptionID=@subscriptionId, PackageID=@packageId, SequenceNo=@sequenceNo
          WHERE AppointmentID=@appointmentId;
          `,
          params
        );
        return res.json({ success: true, message: "Updated" });
      }

      const inserted = await query(
        `
        INSERT INTO VaccinationRecord (AppointmentID, DoctorID, VaccineID, SubscriptionID, PackageID, SequenceNo, Dose, DateGiven, Note)
        OUTPUT INSERTED.VaccinationID
        VALUES (@appointmentId, @doctorId, @vaccineId, @subscriptionId, @packageId, @sequenceNo, @dose, @dateGiven, @note);
        `,
        params
      );
      return res.status(201).json({ success: true, vaccinationId: inserted[0].VaccinationID });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // PATCH /api/doctor/appointments/:id/status
  static async updateAppointmentStatus(req, res) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, error: "status is required" });

      await query(`UPDATE Appointment SET Status=@status WHERE AppointmentID=@id;`, { id, status });
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/doctor/vaccines
  static async listVaccines(req, res) {
    try {
      const rows = await query(
        `SELECT VaccineID, VaccineName, Manufacturer, DefaultDose, DefaultPrice FROM Vaccine WHERE IsActive = 1 ORDER BY VaccineName;`
      );
      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}

module.exports = DoctorController;
