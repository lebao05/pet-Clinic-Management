const { getConnection, sql } = require("../config/database");

function likeQuery(q) {
  if (!q) return "%";
  return `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

const DoctorController = {
  // Search pets by exact PetID or exact UserID for the doctor UI.
  // Accepts query params: petId (exact match) and/or userId (exact match).
  // At least one of petId or userId must be provided. Returns exact matches only.
  async searchPets(req, res, next) {
    try {
      // Only allow exact petId search for doctor UI
      const petId = req.query.petId ? Number(req.query.petId) : null;
      if (!petId || Number.isNaN(petId)) {
        return res.status(400).json({ message: "Provide petId (exact match)" });
      }

      const pool = await getConnection();
      const rq = pool.request();
      rq.input("PetID", sql.Int, petId);

      // Return the single pet
      if (petId) {
        const q = `SELECT p.PetID, p.PetName, p.Species, p.Breed, p.UserID, u.FullName AS OwnerName, u.Phone AS OwnerPhone,
                        CASE WHEN EXISTS (SELECT 1 FROM dbo.Appointment a WHERE a.PetID = p.PetID) THEN 1 ELSE 0 END AS HasHistory
                     FROM dbo.Pet p
                     LEFT JOIN dbo.Users u ON u.UserID = p.UserID
                     WHERE p.PetID = @PetID;`;
        const result = await rq.query(q);
        return res.json(
          result.recordset.map((r) => ({
            petId: r.PetID,
            name: r.PetName,
            species: r.Species,
            breed: r.Breed,
            owner: { userId: r.UserID, fullName: r.OwnerName, phone: r.OwnerPhone },
            hasHistory: !!r.HasHistory,
          }))
        );
      }
      // NOTE: this branch should not be reachable because we return above
      return res.json([]);
    } catch (err) {
      return next(err);
    }
  },

  // Get combined exam + vaccination history for a pet
  async getPetHistory(req, res, next) {
    try {
      const petId = Number(req.params.petId);
      if (!petId || Number.isNaN(petId)) return res.status(400).json({ message: "Invalid petId" });

      const pool = await getConnection();

      const exams = await pool
        .request()
        .input("PetID", sql.Int, petId)
        .query(
          `SELECT er.ExamRecordID, er.AppointmentID, er.DoctorID, er.Symptoms, er.Diagnosis, er.Prescription, er.NextVisitDate, a.ScheduleTime
           FROM dbo.ExamRecord er
           JOIN dbo.Appointment a ON a.AppointmentID = er.AppointmentID
           WHERE a.PetID = @PetID
           ORDER BY a.ScheduleTime DESC`);

      const vaccs = await pool
        .request()
        .input("PetID", sql.Int, petId)
        .query(
          `SELECT vr.VaccinationID, vr.AppointmentID, vr.VaccineID, v.VaccineName, vr.Dose, vr.DateGiven, vr.Note, a.ScheduleTime
           FROM dbo.VaccinationRecord vr
           JOIN dbo.Vaccine v ON v.VaccineID = vr.VaccineID
           JOIN dbo.Appointment a ON a.AppointmentID = vr.AppointmentID
           WHERE a.PetID = @PetID
           ORDER BY a.ScheduleTime DESC`);

      return res.json({ exams: exams.recordset, vaccinations: vaccs.recordset });
    } catch (err) {
      return next(err);
    }
  },

  // Get appointments for a specific pet (used to populate appointment dropdown)
  async getAppointmentsForPet(req, res, next) {
    try {
      const petId = Number(req.params.petId);
      if (!petId || Number.isNaN(petId)) return res.status(400).json({ message: "Invalid petId" });

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("PetID", sql.Int, petId)
        .query(
          `SELECT a.AppointmentID, a.ScheduleTime, a.Status, a.BranchID, b.BranchName, a.ServiceID, s.ServiceName, a.DoctorID
           FROM dbo.Appointment a
           LEFT JOIN dbo.Branch b ON b.BranchID = a.BranchID
           LEFT JOIN dbo.Service s ON s.ServiceID = a.ServiceID
           WHERE a.PetID = @PetID
           ORDER BY a.ScheduleTime DESC;`
        );

      return res.json(result.recordset.map((r) => ({
        appointmentId: r.AppointmentID,
        scheduleTime: r.ScheduleTime,
        status: r.Status,
        branchId: r.BranchID,
        branchName: r.BranchName,
        serviceId: r.ServiceID,
        serviceName: r.ServiceName,
        doctorId: r.DoctorID,
      })));
    } catch (err) {
      return next(err);
    }
  },

  // Simple product search used as medicines lookup
  async searchMedicines(req, res, next) {
    try {
      // New behavior: search by exact ProductID when `id` is provided.
      // If `id` missing, return all medicines.
      const idRaw = req.query.id || req.query.productId || null;
      const pool = await getConnection();

      if (idRaw) {
        const id = Number(idRaw);
        if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
        const result = await pool
          .request()
          .input("ProductID", sql.Int, id)
          .query(`SELECT ProductID, ProductName, Unit, ProductType FROM dbo.Product WHERE ProductID = @ProductID AND UPPER(ProductType) = 'MEDICINE';`);

        const rows = result.recordset.map((r) => ({ productId: r.ProductID, name: r.ProductName, unit: r.Unit, type: r.ProductType }));
        // Return as array (single item) to keep frontend handling consistent
        return res.json(rows);
      }

      // No id provided -> return all medicines
      const result = await pool
        .request()
        .query(`SELECT ProductID, ProductName, Unit, ProductType FROM dbo.Product WHERE UPPER(ProductType) = 'MEDICINE' ORDER BY ProductName ASC;`);

      return res.json(result.recordset.map((r) => ({ productId: r.ProductID, name: r.ProductName, unit: r.Unit, type: r.ProductType })));
    } catch (err) {
      return next(err);
    }
  },

  // List available vaccines for catalog
  async listVaccines(req, res, next) {
    try {
      // Support query param `id` to fetch a single vaccine by VaccineID.
      const idRaw = req.query.id || req.query.vaccineId || null;
      const pool = await getConnection();

      if (idRaw) {
        const id = Number(idRaw);
        if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
        const result = await pool
          .request()
          .input("VaccineID", sql.Int, id)
          .query(`SELECT VaccineID, VaccineName, Manufacturer, DefaultDose, DefaultPrice FROM dbo.Vaccine WHERE VaccineID = @VaccineID AND IsActive = 1;`);

        // Return as array (single item) to keep frontend handling consistent
        return res.json(result.recordset.map(r => ({ VaccineID: r.VaccineID, VaccineName: r.VaccineName, Manufacturer: r.Manufacturer, DefaultDose: r.DefaultDose, DefaultPrice: r.DefaultPrice })));
      }

      const result = await pool
        .request()
        .query(`SELECT VaccineID, VaccineName, Manufacturer, DefaultDose, DefaultPrice FROM dbo.Vaccine WHERE IsActive = 1 ORDER BY VaccineName ASC`);

      return res.json(result.recordset.map(r => ({ VaccineID: r.VaccineID, VaccineName: r.VaccineName, Manufacturer: r.Manufacturer, DefaultDose: r.DefaultDose, DefaultPrice: r.DefaultPrice })));
    } catch (err) {
      return next(err);
    }
  },

  // Create or update an exam record for an existing appointment.
  // Flow:
  // - appointmentId is required and must reference an existing appointment.
  // - doctorId is required and must be provided.
  // - If an ExamRecord exists for the appointment, UPDATE it (overwrite). Otherwise INSERT a new record.
  // - After saving the exam record, set the appointment's Status = 'Completed'.
  async createExamRecord(req, res, next) {
    const { appointmentId, doctorId, symptoms, diagnosis, prescription, nextVisitDate } = req.body || {};
    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });
    if (!appointmentId) return res.status(400).json({ message: "appointmentId is required" });

    let tx;
    try {
      const pool = await getConnection();
      tx = new sql.Transaction(pool);
      await tx.begin();
      const rq = new sql.Request(tx);

      const aId = Number(appointmentId);
      // verify appointment exists
      const appt = await rq.input("AppointmentID", sql.Int, aId).query(`SELECT AppointmentID FROM dbo.Appointment WHERE AppointmentID = @AppointmentID;`);
      if (!appt.recordset.length) {
        await tx.rollback();
        return res.status(404).json({ message: "Appointment not found" });
      }

      // check existing exam
      const ex = await rq.input("AppointmentID2", sql.Int, aId).query(`SELECT ExamRecordID FROM dbo.ExamRecord WHERE AppointmentID = @AppointmentID2;`);
      let examRecordId;
      if (ex.recordset.length) {
        examRecordId = ex.recordset[0].ExamRecordID;
        rq.input("ExamRecordID", sql.Int, examRecordId);
        await rq
          .input("DoctorID", sql.Int, Number(doctorId))
          .input("Symptoms", sql.NVarChar(sql.MAX), symptoms || null)
          .input("Diagnosis", sql.NVarChar(sql.MAX), diagnosis || null)
          .input("Prescription", sql.NVarChar(sql.MAX), prescription || null)
          .input("NextVisitDate", sql.Date, nextVisitDate || null)
          .query(`UPDATE dbo.ExamRecord SET DoctorID=@DoctorID, Symptoms=@Symptoms, Diagnosis=@Diagnosis, Prescription=@Prescription, NextVisitDate=@NextVisitDate WHERE ExamRecordID = @ExamRecordID;`);
      } else {
        const insertRes = await rq
          .input("AppointmentID3", sql.Int, aId)
          .input("DoctorID2", sql.Int, Number(doctorId))
          .input("Symptoms2", sql.NVarChar(sql.MAX), symptoms || null)
          .input("Diagnosis2", sql.NVarChar(sql.MAX), diagnosis || null)
          .input("Prescription2", sql.NVarChar(sql.MAX), prescription || null)
          .input("NextVisitDate2", sql.Date, nextVisitDate || null)
          .query(`INSERT INTO dbo.ExamRecord (AppointmentID, DoctorID, Symptoms, Diagnosis, Prescription, NextVisitDate)
                   VALUES (@AppointmentID3, @DoctorID2, @Symptoms2, @Diagnosis2, @Prescription2, @NextVisitDate2);
                   SELECT SCOPE_IDENTITY() AS ExamRecordID;`);
        examRecordId = insertRes.recordset[0].ExamRecordID;
      }

      // set appointment completed
      await rq.input("AppointmentID4", sql.Int, aId).query(`UPDATE dbo.Appointment SET [Status] = 'Completed' WHERE AppointmentID = @AppointmentID4;`);

      await tx.commit();
      return res.status(201).json({ examRecordId, appointmentId: aId });
    } catch (err) {
      try {
        if (tx) await tx.rollback();
      } catch (_) {}
      return next(err);
    }
  },
};

module.exports = DoctorController;
