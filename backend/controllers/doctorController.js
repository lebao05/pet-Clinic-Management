const { getConnection, sql } = require("../config/database");

function toDateOnly(isoDate) {
  // Expect YYYY-MM-DD
  if (!isoDate) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  return isoDate;
}

const DoctorController = {
  async listVaccines(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(
  `SELECT VaccineID, VaccineName, Manufacturer, DefaultDose, DefaultPrice
   FROM dbo.Vaccine
   WHERE IsActive = 1
   ORDER BY VaccineName ASC`
      );
      return res.json(result.recordset);
    } catch (err) {
      return next(err);
    }
  },

  async listAppointments(req, res, next) {
    try {
      const doctorId = Number(req.query.doctorId);
      const date = toDateOnly(req.query.date);

      if (!doctorId || Number.isNaN(doctorId)) {
        return res.status(400).json({ message: "doctorId is required (number)" });
      }

      const pool = await getConnection();
      const request = pool.request().input("DoctorID", sql.Int, doctorId);

      let dateFilter = "";
      if (date) {
        request.input("Date", sql.Date, date);
        dateFilter = "AND CAST(a.ScheduleTime AS date) = @Date";
      }

      const q = `
        SELECT
          a.AppointmentID,
          a.ScheduleTime,
          a.[Status],
          a.BranchID,
          b.BranchName,
          a.UserID,
          u.FullName AS UserFullName,
          u.Phone AS UserPhone,
          a.PetID,
          p.PetName,
          p.Species,
          p.Breed,
          a.ServiceID,
          s.ServiceName,
          s.ServiceType
  FROM dbo.Appointment a
  JOIN dbo.Users u ON u.UserID = a.UserID
  JOIN dbo.Pet p ON p.PetID = a.PetID
  JOIN dbo.Service s ON s.ServiceID = a.ServiceID
  JOIN dbo.Branch b ON b.BranchID = a.BranchID
        WHERE a.DoctorID = @DoctorID
          ${dateFilter}
        ORDER BY a.ScheduleTime ASC;
      `;

      const result = await request.query(q);
      const rows = result.recordset.map((r) => ({
        appointmentId: r.AppointmentID,
        scheduleTime: r.ScheduleTime,
        status: r.Status,
        branch: { branchId: r.BranchID, name: r.BranchName },
        user: { userId: r.UserID, fullName: r.UserFullName, phone: r.UserPhone },
        pet: { petId: r.PetID, name: r.PetName, species: r.Species, breed: r.Breed },
        service: { serviceId: r.ServiceID, name: r.ServiceName, type: r.ServiceType },
      }));
      return res.json(rows);
    } catch (err) {
      return next(err);
    }
  },

  async getAppointmentDetail(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment id" });
      }

      const pool = await getConnection();
      const base = await pool
        .request()
        .input("AppointmentID", sql.Int, id)
        .query(
          `
          SELECT
            a.AppointmentID,
            a.ScheduleTime,
            a.[Status],
            a.DoctorID,
            a.BranchID,
            b.BranchName,
            a.UserID,
            u.FullName AS UserFullName,
            u.Phone AS UserPhone,
            a.PetID,
            p.PetName,
            p.Species,
            p.Breed,
            a.ServiceID,
            s.ServiceName,
            s.ServiceType
          FROM dbo.Appointment a
          JOIN dbo.Users u ON u.UserID = a.UserID
          JOIN dbo.Pet p ON p.PetID = a.PetID
          JOIN dbo.Service s ON s.ServiceID = a.ServiceID
          JOIN dbo.Branch b ON b.BranchID = a.BranchID
          WHERE a.AppointmentID = @AppointmentID;
          `
        );

      if (!base.recordset.length) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const a = base.recordset[0];

      const exam = await pool
        .request()
        .input("AppointmentID", sql.Int, id)
        .query(
          `
          SELECT ExamRecordID, DoctorID, Symptoms, Diagnosis, Prescription, NextVisitDate
          FROM dbo.ExamRecord
          WHERE AppointmentID = @AppointmentID;
          `
        );

      const vacc = await pool
        .request()
        .input("AppointmentID", sql.Int, id)
        .query(
          `
          SELECT vr.VaccinationID, vr.DoctorID, vr.VaccineID, v.VaccineName, vr.Dose, vr.DateGiven, vr.Note,
                 vr.SubscriptionID, vr.PackageID, vr.SequenceNo
          FROM dbo.VaccinationRecord vr
          JOIN dbo.Vaccine v ON v.VaccineID = vr.VaccineID
          WHERE vr.AppointmentID = @AppointmentID;
          `
        );

      return res.json({
        appointmentId: a.AppointmentID,
        scheduleTime: a.ScheduleTime,
        status: a.Status,
        doctorId: a.DoctorID,
        branch: { branchId: a.BranchID, name: a.BranchName },
        user: { userId: a.UserID, fullName: a.UserFullName, phone: a.UserPhone },
        pet: { petId: a.PetID, name: a.PetName, species: a.Species, breed: a.Breed },
        service: { serviceId: a.ServiceID, name: a.ServiceName, type: a.ServiceType },
        examRecord: exam.recordset[0] || null,
        vaccinationRecord: vacc.recordset[0] || null,
      });
    } catch (err) {
      return next(err);
    }
  },

  async updateAppointmentStatus(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body || {};
      const allowed = new Set(["Booked", "Completed", "Cancelled"]);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment id" });
      }
      if (!allowed.has(status)) {
        return res.status(400).json({ message: "status must be Booked|Completed|Cancelled" });
      }

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("AppointmentID", sql.Int, id)
        .input("Status", sql.NVarChar(20), status)
        .query(
          `
          UPDATE dbo.Appointment
          SET [Status] = @Status
          WHERE AppointmentID = @AppointmentID;

          SELECT AppointmentID, [Status]
          FROM dbo.Appointment
          WHERE AppointmentID = @AppointmentID;
          `
        );

      if (!result.recordset.length) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      return res.json({ appointmentId: result.recordset[0].AppointmentID, status: result.recordset[0].Status });
    } catch (err) {
      return next(err);
    }
  },

  async upsertExamRecord(req, res, next) {
    const { appointmentId, doctorId, symptoms, diagnosis, prescription, nextVisitDate } = req.body || {};
    if (!appointmentId || !doctorId) {
      return res.status(400).json({ message: "appointmentId and doctorId are required" });
    }

    let tx;
    try {
      const pool = await getConnection();
      tx = new sql.Transaction(pool);
      await tx.begin();
      const rq = new sql.Request(tx);
      rq.input("AppointmentID", sql.Int, Number(appointmentId));
      rq.input("DoctorID", sql.Int, Number(doctorId));
      rq.input("Symptoms", sql.NVarChar(sql.MAX), symptoms || null);
      rq.input("Diagnosis", sql.NVarChar(sql.MAX), diagnosis || null);
      rq.input("Prescription", sql.NVarChar(sql.MAX), prescription || null);
      rq.input("NextVisitDate", sql.Date, nextVisitDate || null);

      const q = `
  IF EXISTS (SELECT 1 FROM dbo.ExamRecord WHERE AppointmentID = @AppointmentID)
        BEGIN
          UPDATE ExamRecord
          SET DoctorID = @DoctorID,
              Symptoms = @Symptoms,
              Diagnosis = @Diagnosis,
              Prescription = @Prescription,
              NextVisitDate = @NextVisitDate
          WHERE AppointmentID = @AppointmentID;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ExamRecord (AppointmentID, DoctorID, Symptoms, Diagnosis, Prescription, NextVisitDate)
          VALUES (@AppointmentID, @DoctorID, @Symptoms, @Diagnosis, @Prescription, @NextVisitDate);
        END

  SELECT ExamRecordID, AppointmentID, DoctorID, Symptoms, Diagnosis, Prescription, NextVisitDate
  FROM dbo.ExamRecord
        WHERE AppointmentID = @AppointmentID;
      `;

      const result = await rq.query(q);
      await tx.commit();
      return res.json(result.recordset[0]);
    } catch (err) {
      try {
        if (tx) await tx.rollback();
      } catch (_) {
        // ignore rollback errors (demo)
      }
      return next(err);
    }
  },

  async upsertVaccinationRecord(req, res, next) {
    const {
      appointmentId,
      doctorId,
      vaccineId,
      dateGiven,
      dose,
      note,
      subscriptionId,
      packageId,
      sequenceNo,
    } = req.body || {};

    if (!appointmentId || !doctorId || !vaccineId) {
      return res.status(400).json({ message: "appointmentId, doctorId, vaccineId are required" });
    }

    let tx;
    try {
      const pool = await getConnection();
      tx = new sql.Transaction(pool);
      await tx.begin();

      const rq = new sql.Request(tx);
      rq.input("AppointmentID", sql.Int, Number(appointmentId));
      rq.input("DoctorID", sql.Int, Number(doctorId));
      rq.input("VaccineID", sql.Int, Number(vaccineId));
      rq.input("SubscriptionID", sql.Int, subscriptionId ? Number(subscriptionId) : null);
      rq.input("PackageID", sql.Int, packageId ? Number(packageId) : null);
      rq.input("SequenceNo", sql.Int, sequenceNo ? Number(sequenceNo) : null);
      rq.input("Dose", sql.NVarChar(50), dose || null);
      rq.input("DateGiven", sql.Date, dateGiven || new Date());
      rq.input("Note", sql.NVarChar(500), note || null);

      const q = `
  IF EXISTS (SELECT 1 FROM dbo.VaccinationRecord WHERE AppointmentID = @AppointmentID)
        BEGIN
          UPDATE dbo.VaccinationRecord
          SET DoctorID = @DoctorID,
              VaccineID = @VaccineID,
              SubscriptionID = @SubscriptionID,
              PackageID = @PackageID,
              SequenceNo = @SequenceNo,
              Dose = @Dose,
              DateGiven = @DateGiven,
              Note = @Note
          WHERE AppointmentID = @AppointmentID;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.VaccinationRecord
            (AppointmentID, DoctorID, VaccineID, SubscriptionID, PackageID, SequenceNo, Dose, DateGiven, Note)
          VALUES
            (@AppointmentID, @DoctorID, @VaccineID, @SubscriptionID, @PackageID, @SequenceNo, @Dose, @DateGiven, @Note);
        END

        SELECT vr.VaccinationID, vr.AppointmentID, vr.DoctorID, vr.VaccineID, v.VaccineName, vr.Dose, vr.DateGiven, vr.Note,
               vr.SubscriptionID, vr.PackageID, vr.SequenceNo
  FROM dbo.VaccinationRecord vr
  JOIN dbo.Vaccine v ON v.VaccineID = vr.VaccineID
        WHERE vr.AppointmentID = @AppointmentID;
      `;

      const result = await rq.query(q);
      await tx.commit();
      return res.json(result.recordset[0]);
    } catch (err) {
      try {
        if (tx) await tx.rollback();
      } catch (_) {
        // ignore rollback errors (demo)
      }
      return next(err);
    }
  },
};

module.exports = DoctorController;
