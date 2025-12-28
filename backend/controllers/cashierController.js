const { getConnection, sql } = require("../config/database");

function likeQuery(q) {
  if (!q) return "%";
  return `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

const CashierController = {
  // Search pets (similar to doctor search) and include hasHistory
  async searchPets(req, res, next) {
    try {
      const q = (req.query.query || req.query.q || "").toString();
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("Q", sql.NVarChar(200), likeQuery(q))
        .query(
          `SELECT TOP (50) p.PetID, p.PetName, p.Species, p.Breed, u.UserID, u.FullName AS OwnerName, u.Phone AS OwnerPhone,
                  CASE WHEN EXISTS (SELECT 1 FROM dbo.Appointment a WHERE a.PetID = p.PetID) THEN 1 ELSE 0 END AS HasHistory
           FROM dbo.Pet p
           LEFT JOIN dbo.Users u ON u.UserID = p.UserID
           WHERE (CAST(p.PetID AS NVARCHAR(50)) = @Q OR p.PetName LIKE @Q OR u.Phone LIKE @Q)
           ORDER BY p.PetName ASC`);

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
    } catch (err) {
      return next(err);
    }
  },

  // Create a simple walk-in appointment
  async createWalkin(req, res, next) {
    try {
      // accept doctorId instead of staffId (doctor optional)
      const { branchId, userId, petId, serviceId, doctorId } = req.body || {};
      const bId = branchId ? Number(branchId) : null;
      const uId = userId ? Number(userId) : null;
      const pId = petId ? Number(petId) : null;

      if (!bId || !uId || !pId) return res.status(400).json({ message: "branchId, userId and petId are required" });

      const pool = await getConnection();
      const rq = pool.request();
      rq.input("BranchID", sql.Int, bId);
      rq.input("UserID", sql.Int, uId);
      rq.input("PetID", sql.Int, pId);
      rq.input("ServiceID", sql.Int, serviceId ? Number(serviceId) : null);
      rq.input("DoctorID", sql.Int, doctorId ? Number(doctorId) : null);
      // set schedule time to now (today)
      rq.input("ScheduleTime", sql.DateTime, new Date());

      // Insert appointment and optionally record DoctorID (may be NULL)
    const q = `INSERT INTO dbo.Appointment (ScheduleTime, [Status], BranchID, UserID, PetID, ServiceID, DoctorID)
      VALUES (@ScheduleTime, 'Booked', @BranchID, @UserID, @PetID, @ServiceID, @DoctorID);
      SELECT SCOPE_IDENTITY() AS AppointmentID;`;

      const r = await rq.query(q);
      const rawId = r.recordset && r.recordset[0] ? r.recordset[0].AppointmentID || r.recordset[0].AppointmentId || r.recordset[0].AppointmentID : null;
      const appointmentId = rawId ? Number(rawId) : null;
      if (!appointmentId) {
        return res.status(500).json({ message: 'Failed to create appointment' });
      }
      // return created appointment id and basic info
      return res.status(201).json({ appointmentId, appointment: { appointmentId, scheduleTime: rq.parameters?.ScheduleTime?.value || new Date(), status: 'Booked', branchId: bId, userId: uId, petId: pId, serviceId: serviceId ? Number(serviceId) : null, doctorId: doctorId ? Number(doctorId) : null } });
    } catch (err) {
      return next(err);
    }
  },

  // List invoices for a branch (optional date range)
  async listInvoices(req, res, next) {
    try {
      // Allow flexible searching by branchId, userId, petId and date range
  const branchId = req.query.branchId ? Number(req.query.branchId) : null;
  const userId = req.query.userId ? Number(req.query.userId) : null;
  const petId = req.query.petId ? Number(req.query.petId) : null;
  const staffId = req.query.staffId ? Number(req.query.staffId) : null;
  const serviceId = req.query.serviceId ? Number(req.query.serviceId) : null;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;

      const pool = await getConnection();
      const rq = pool.request();
  rq.input("BranchID", sql.Int, branchId);
  rq.input("UserID", sql.Int, userId);
  rq.input("PetID", sql.Int, petId);
  rq.input("StaffID", sql.Int, staffId);
  rq.input("ServiceID", sql.Int, serviceId);
  rq.input("From", sql.DateTime, from);
  rq.input("To", sql.DateTime, to);

      const q = `SELECT TOP (200)
        i.InvoiceID, i.InvoiceDate, i.OriginalAmount, i.DiscountAmount, i.FinalAmount,
        i.PaymentMethod, i.PaymentStatus,
        u.UserID, u.FullName AS CustomerName,
        e.EmployeeID, e.FullName AS StaffName
      FROM dbo.Invoice i
      LEFT JOIN dbo.Users u ON u.UserID = i.UserID
      LEFT JOIN dbo.Employee e ON e.EmployeeID = i.StaffID
      WHERE (@BranchID IS NULL OR i.BranchID = @BranchID)
        AND (@UserID IS NULL OR i.UserID = @UserID)
        AND (@From IS NULL OR i.InvoiceDate >= @From)
        AND (@To IS NULL OR i.InvoiceDate <= @To)
        AND (@PetID IS NULL OR EXISTS (SELECT 1 FROM dbo.InvoicePet ip WHERE ip.InvoiceID = i.InvoiceID AND ip.PetID = @PetID))
        AND (@StaffID IS NULL OR i.StaffID = @StaffID)
        AND (@ServiceID IS NULL OR EXISTS (SELECT 1 FROM dbo.ServiceInvoiceLine sl WHERE sl.InvoiceID = i.InvoiceID AND sl.ServiceID = @ServiceID))
      ORDER BY i.InvoiceDate DESC`;

      const result = await rq.query(q);
      return res.json(
        result.recordset.map((r) => ({
          invoiceId: r.InvoiceID,
          invoiceDate: r.InvoiceDate,
          originalAmount: r.OriginalAmount,
          discountAmount: r.DiscountAmount,
          finalAmount: r.FinalAmount,
          paymentMethod: r.PaymentMethod,
          paymentStatus: r.PaymentStatus,
          user: { userId: r.UserID, fullName: r.CustomerName },
          cashier: { employeeId: r.EmployeeID, fullName: r.StaffName },
        }))
      );
    } catch (err) {
      return next(err);
    }
  },

  // List appointments for cashier search (used to verify walk-in appointments)
  async listAppointments(req, res, next) {
    try {
      const branchId = req.query.branchId ? Number(req.query.branchId) : null;
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const petId = req.query.petId ? Number(req.query.petId) : null;
      const serviceId = req.query.serviceId ? Number(req.query.serviceId) : null;
      const doctorId = req.query.doctorId ? Number(req.query.doctorId) : null;
      const status = req.query.status || null;
      const from = req.query.from ? new Date(req.query.from) : null;
      const to = req.query.to ? new Date(req.query.to) : null;

      const pool = await getConnection();
      const rq = pool.request();
      rq.input("BranchID", sql.Int, branchId);
      rq.input("UserID", sql.Int, userId);
      rq.input("PetID", sql.Int, petId);
      rq.input("ServiceID", sql.Int, serviceId);
      rq.input("DoctorID", sql.Int, doctorId);
      rq.input("Status", sql.NVarChar(50), status);
      rq.input("From", sql.DateTime, from);
      rq.input("To", sql.DateTime, to);

      const q = `SELECT TOP (200)
        a.AppointmentID, a.ScheduleTime, a.Status, a.BranchID, b.BranchName,
        a.ServiceID, s.ServiceName, s.ServiceType,
        a.DoctorID, e.FullName AS DoctorName,
        a.UserID, u.FullName AS UserName,
        a.PetID, p.PetName
      FROM dbo.Appointment a
      LEFT JOIN dbo.Branch b ON b.BranchID = a.BranchID
      LEFT JOIN dbo.Service s ON s.ServiceID = a.ServiceID
      LEFT JOIN dbo.Employee e ON e.EmployeeID = a.DoctorID
      LEFT JOIN dbo.Users u ON u.UserID = a.UserID
      LEFT JOIN dbo.Pet p ON p.PetID = a.PetID
      WHERE (@BranchID IS NULL OR a.BranchID = @BranchID)
        AND (@UserID IS NULL OR a.UserID = @UserID)
        AND (@PetID IS NULL OR a.PetID = @PetID)
        AND (@ServiceID IS NULL OR a.ServiceID = @ServiceID)
        AND (@DoctorID IS NULL OR a.DoctorID = @DoctorID)
        AND (@Status IS NULL OR a.Status = @Status)
        AND (@From IS NULL OR a.ScheduleTime >= @From)
        AND (@To IS NULL OR a.ScheduleTime <= @To)
      ORDER BY a.ScheduleTime DESC`;

      const result = await rq.query(q);
      return res.json(result.recordset.map((r) => ({
        appointmentId: r.AppointmentID,
        scheduleTime: r.ScheduleTime,
        status: r.Status,
        branch: { branchId: r.BranchID, name: r.BranchName },
        service: { serviceId: r.ServiceID, name: r.ServiceName, type: r.ServiceType },
        doctor: r.DoctorID ? { doctorId: r.DoctorID, fullName: r.DoctorName } : null,
        user: { userId: r.UserID, fullName: r.UserName },
        pet: { petId: r.PetID, name: r.PetName },
      })));
    } catch (err) {
      return next(err);
    }
  },

  // Create a simple invoice (demo/testing). Expects JSON body with branchId, userId, staffId (optional),
  // pets: [petId], productLines: [{productId, quantity, unitPrice}], serviceLines: [{serviceId, quantity, unitPrice}]
  async createInvoice(req, res, next) {
    const body = req.body || {};
    const branchId = body.branchId ? Number(body.branchId) : null;
    const userId = body.userId ? Number(body.userId) : null;
  // Invoice table in this DB requires StaffID not null; default to 1 if not provided
  const staffId = body.staffId ? Number(body.staffId) : 1;
    const pets = Array.isArray(body.pets) ? body.pets.map(Number) : [];
    const productLines = Array.isArray(body.productLines) ? body.productLines : [];
    const serviceLines = Array.isArray(body.serviceLines) ? body.serviceLines : [];

    if (!branchId || !userId) return res.status(400).json({ message: "branchId and userId are required" });

    const pool = await getConnection();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();
      const tr = tx.request();

      // Compute amounts
      let originalAmount = 0;
      let discountAmount = 0;

      productLines.forEach((p) => {
        const q = Number(p.quantity) || 1;
        const u = Number(p.unitPrice) || 0;
        originalAmount += q * u;
      });
      serviceLines.forEach((s) => {
        const q = Number(s.quantity) || 1;
        const u = Number(s.unitPrice) || 0;
        originalAmount += q * u;
      });

      const finalAmount = originalAmount - discountAmount;

      tr.input("BranchID", sql.Int, branchId);
      tr.input("UserID", sql.Int, userId);
      tr.input("StaffID", sql.Int, staffId);
  tr.input("OriginalAmount", sql.Decimal(18, 2), originalAmount);
  tr.input("DiscountAmount", sql.Decimal(18, 2), discountAmount);
      tr.input("PaymentMethod", sql.NVarChar(50), body.paymentMethod || "Cash");
      tr.input("PaymentStatus", sql.NVarChar(50), body.paymentStatus || "Pending");

      // Some DB schemas compute FinalAmount; avoid inserting computed columns
      const insertInvoiceQ = `INSERT INTO dbo.Invoice (BranchID, UserID, StaffID, InvoiceDate, OriginalAmount, DiscountAmount, PaymentMethod, PaymentStatus)
        VALUES (@BranchID, @UserID, @StaffID, GETDATE(), @OriginalAmount, @DiscountAmount, @PaymentMethod, @PaymentStatus);
        SELECT SCOPE_IDENTITY() AS InvoiceID;`;

      const r = await tr.query(insertInvoiceQ);
      const invoiceId = r.recordset[0].InvoiceID;

      // Insert pets
      for (const petId of pets) {
        const pr = tx.request();
        pr.input("InvoiceID", sql.Int, invoiceId);
        pr.input("PetID", sql.Int, petId);
        await pr.query(`INSERT INTO dbo.InvoicePet (InvoiceID, PetID) VALUES (@InvoiceID, @PetID);`);
      }

      // Insert product lines
      let lineNo = 1;
      for (const p of productLines) {
        const pr = tx.request();
        pr.input("InvoiceID", sql.Int, invoiceId);
        pr.input("LineNo", sql.Int, lineNo++);
        pr.input("ProductID", sql.Int, Number(p.productId));
        pr.input("Quantity", sql.Int, Number(p.quantity) || 1);
        pr.input("UnitPrice", sql.Decimal(18, 2), Number(p.unitPrice) || 0);
        pr.input("LineAmount", sql.Decimal(18, 2), (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0));
        pr.input("DiscountAmount", sql.Decimal(18, 2), Number(p.discountAmount) || 0);
        await pr.query(`INSERT INTO dbo.ProductInvoiceLine (InvoiceID, [LineNo], [ProductID], [Quantity], [UnitPrice], [LineAmount], [DiscountAmount])
          VALUES (@InvoiceID, @LineNo, @ProductID, @Quantity, @UnitPrice, @LineAmount, @DiscountAmount);`);
      }

      // Insert service lines
      for (const s of serviceLines) {
        const pr = tx.request();
        pr.input("InvoiceID", sql.Int, invoiceId);
        pr.input("LineNo", sql.Int, lineNo++);
        pr.input("ServiceID", sql.Int, Number(s.serviceId));
        pr.input("Quantity", sql.Int, Number(s.quantity) || 1);
        pr.input("UnitPrice", sql.Decimal(18, 2), Number(s.unitPrice) || 0);
        pr.input("LineAmount", sql.Decimal(18, 2), (Number(s.quantity) || 1) * (Number(s.unitPrice) || 0));
        pr.input("DiscountAmount", sql.Decimal(18, 2), Number(s.discountAmount) || 0);
        await pr.query(`INSERT INTO dbo.ServiceInvoiceLine (InvoiceID, [LineNo], [ServiceID], [Quantity], [UnitPrice], [LineAmount], [DiscountAmount])
          VALUES (@InvoiceID, @LineNo, @ServiceID, @Quantity, @UnitPrice, @LineAmount, @DiscountAmount);`);
      }

      await tx.commit();
      return res.status(201).json({ invoiceId });
    } catch (err) {
      try {
        await tx.rollback();
      } catch (_) {}
      return next(err);
    }
  },

  // Check a specific pet and whether it has history (returning customer)
  async checkPet(req, res, next) {
    try {
      const petId = Number(req.params.petId);
      const userId = req.query.userId ? Number(req.query.userId) : null;
      if (!petId || Number.isNaN(petId)) return res.status(400).json({ message: "Invalid pet id" });

      const pool = await getConnection();
      const header = await pool
        .request()
        .input("PetID", sql.Int, petId)
        .query(
          `SELECT p.PetID, p.PetName, p.Species, p.Breed, p.UserID, u.FullName, u.Phone
           FROM dbo.Pet p
           LEFT JOIN dbo.Users u ON u.UserID = p.UserID
           WHERE p.PetID = @PetID;`
        );

      if (!header.recordset.length) return res.status(404).json({ message: "Pet not found" });
      const p = header.recordset[0];

      // hasHistory: previous appointments or invoices
      const hist = await pool
        .request()
        .input("PetID", sql.Int, petId)
        .query(
          `SELECT CASE WHEN EXISTS (SELECT 1 FROM dbo.Appointment a WHERE a.PetID = @PetID)
                         OR EXISTS (SELECT 1 FROM dbo.InvoicePet ip WHERE ip.PetID = @PetID)
                   THEN 1 ELSE 0 END AS HasHistory;`
        );

      const hasHistory = !!hist.recordset[0].HasHistory;
      const isOwnerMatch = userId ? p.UserID === userId : false;

      return res.json({ petId: p.PetID, name: p.PetName, species: p.Species, breed: p.Breed, owner: { userId: p.UserID, fullName: p.FullName, phone: p.Phone }, hasHistory, isOwnerMatch });
    } catch (err) {
      return next(err);
    }
  },

  // Get invoice detail
  async getInvoiceDetail(req, res, next) {
    try {
      const invoiceId = Number(req.params.id);
      if (!invoiceId || Number.isNaN(invoiceId)) return res.status(400).json({ message: "Invalid invoice id" });

      const pool = await getConnection();
      const header = await pool
        .request()
        .input("InvoiceID", sql.Int, invoiceId)
        .query(
          `SELECT
             i.InvoiceID, i.BranchID, b.BranchName,
             i.UserID, u.FullName AS CustomerName, u.Phone AS CustomerPhone,
             i.StaffID, e.FullName AS StaffName,
             i.InvoiceDate, i.OriginalAmount, i.DiscountAmount, i.FinalAmount,
             i.PaymentMethod, i.PaymentStatus
           FROM dbo.Invoice i
           LEFT JOIN dbo.Branch b ON b.BranchID = i.BranchID
           LEFT JOIN dbo.Users u ON u.UserID = i.UserID
           LEFT JOIN dbo.Employee e ON e.EmployeeID = i.StaffID
           WHERE i.InvoiceID = @InvoiceID;`
        );

      if (!header.recordset.length) return res.status(404).json({ message: "Invoice not found" });
      const h = header.recordset[0];

      const pets = await pool
        .request()
        .input("InvoiceID", sql.Int, invoiceId)
        .query(
          `SELECT p.PetID, p.PetName, p.Species, p.Breed
           FROM dbo.InvoicePet ip
           JOIN dbo.Pet p ON p.PetID = ip.PetID
           WHERE ip.InvoiceID = @InvoiceID;`
        );

      const serviceLines = await pool
        .request()
        .input("InvoiceID", sql.Int, invoiceId)
        .query(
          `SELECT l.[LineNo], l.[ServiceID], s.[ServiceName], l.[Quantity], l.[UnitPrice], l.[LineAmount], l.[DiscountAmount]
           FROM dbo.ServiceInvoiceLine l
           LEFT JOIN dbo.Service s ON s.ServiceID = l.ServiceID
           WHERE l.[InvoiceID] = @InvoiceID
           ORDER BY l.[LineNo] ASC;`
        );

      const productLines = await pool
        .request()
        .input("InvoiceID", sql.Int, invoiceId)
        .query(
          `SELECT l.[LineNo], l.[ProductID], p.[ProductName], l.[Quantity], l.[UnitPrice], l.[LineAmount], l.[DiscountAmount]
           FROM dbo.ProductInvoiceLine l
           LEFT JOIN dbo.Product p ON p.ProductID = l.ProductID
           WHERE l.[InvoiceID] = @InvoiceID
           ORDER BY l.[LineNo] ASC;`
        );

      return res.json({
        invoiceId: h.InvoiceID,
        invoiceDate: h.InvoiceDate,
        branch: { branchId: h.BranchID, name: h.BranchName },
        customer: { userId: h.UserID, fullName: h.CustomerName, phone: h.CustomerPhone },
        staff: { employeeId: h.StaffID, fullName: h.StaffName },
        amounts: {
          originalAmount: h.OriginalAmount,
          discountAmount: h.DiscountAmount,
          finalAmount: h.FinalAmount,
        },
        payment: { method: h.PaymentMethod, status: h.PaymentStatus },
        pets: pets.recordset.map((p) => ({ petId: p.PetID, name: p.PetName, species: p.Species, breed: p.Breed })),
        serviceLines: serviceLines.recordset.map((l) => ({
          lineNo: l.LineNo,
          serviceId: l.ServiceID,
          serviceName: l.ServiceName,
          quantity: l.Quantity,
          unitPrice: l.UnitPrice,
          lineAmount: l.LineAmount,
          discountAmount: l.DiscountAmount,
        })),
        productLines: productLines.recordset.map((l) => ({
          lineNo: l.LineNo,
          productId: l.ProductID,
          productName: l.ProductName,
          quantity: l.Quantity,
          unitPrice: l.UnitPrice,
          lineAmount: l.LineAmount,
          discountAmount: l.DiscountAmount,
        })),
      });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = CashierController;
