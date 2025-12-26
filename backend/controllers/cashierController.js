const { getConnection, sql } = require("../config/database");

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function decimal(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

const CashierController = {
  async listPetsByUser(req, res, next) {
    try {
      const userId = num(req.query.userId);
      if (!userId) return res.status(400).json({ message: "userId is required" });

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(
           `SELECT PetID, PetName, Species, Breed, Gender, BirthDate
           FROM dbo.Pet
           WHERE UserID = @UserID AND IsActive = 1
           ORDER BY PetName ASC`
        );

      return res.json(
        result.recordset.map((p) => ({
          petId: p.PetID,
          name: p.PetName,
          species: p.Species,
          breed: p.Breed,
          gender: p.Gender,
          birthDate: p.BirthDate,
        }))
      );
    } catch (err) {
      return next(err);
    }
  },

  async listServices(req, res, next) {
    try {
      const branchId = num(req.query.branchId);
      if (!branchId) return res.status(400).json({ message: "branchId is required" });

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("BranchID", sql.Int, branchId)
        .query(
           `SELECT s.ServiceID, s.ServiceName, s.ServiceType, bs.ServicePrice
           FROM dbo.BranchService bs
           JOIN dbo.Service s ON s.ServiceID = bs.ServiceID
           WHERE bs.BranchID = @BranchID
             AND bs.IsAvailable = 1
             AND s.IsActive = 1
           ORDER BY s.ServiceName ASC`
        );

      return res.json(
        result.recordset.map((s) => ({
          serviceId: s.ServiceID,
          name: s.ServiceName,
          type: s.ServiceType,
          price: s.ServicePrice,
        }))
      );
    } catch (err) {
      return next(err);
    }
  },

  async listProducts(req, res, next) {
    try {
      const branchId = num(req.query.branchId);
      if (!branchId) return res.status(400).json({ message: "branchId is required" });

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("BranchID", sql.Int, branchId)
        .query(
           `SELECT p.ProductID, p.ProductName, p.ProductType, p.Unit, i.StockQty, i.SellingPrice
           FROM dbo.Inventory i
           JOIN dbo.Product p ON p.ProductID = i.ProductID
           WHERE i.BranchID = @BranchID AND i.IsActive = 1
           ORDER BY p.ProductName ASC`
        );

      return res.json(
        result.recordset.map((p) => ({
          productId: p.ProductID,
          name: p.ProductName,
          type: p.ProductType,
          unit: p.Unit,
          stockQty: p.StockQty,
          price: p.SellingPrice,
        }))
      );
    } catch (err) {
      return next(err);
    }
  },

  async createInvoice(req, res, next) {
    const {
      branchId,
      userId,
      staffId,
      paymentMethod,
      paymentStatus,
      discountAmount,
      petIds,
      serviceLines,
      productLines,
    } = req.body || {};

    const bId = num(branchId);
    const uId = num(userId);
    const sId = num(staffId);
    if (!bId || !uId || !sId) {
      return res.status(400).json({ message: "branchId, userId, staffId are required" });
    }

    const disc = decimal(discountAmount) || 0;
    const pm = (paymentMethod || "Cash").toString();
    const ps = (paymentStatus || "Paid").toString();

    const svcLines = Array.isArray(serviceLines) ? serviceLines : [];
    const prodLines = Array.isArray(productLines) ? productLines : [];
    const pets = Array.isArray(petIds) ? petIds.map(num).filter(Boolean) : [];

    let tx;
    try {
      const pool = await getConnection();
      tx = new sql.Transaction(pool);
      await tx.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
      const rq = new sql.Request(tx);

      // Resolve prices server-side for safety (demo)
      const resolvedServiceLines = [];
      for (const line of svcLines) {
        const serviceId = num(line.serviceId);
        const quantity = num(line.quantity) || 1;
        if (!serviceId || quantity <= 0) continue;

        const unitPrice = decimal(line.unitPrice);
        let price = unitPrice;
        if (price == null) {
          const r = await new sql.Request(tx)
            .input("BranchID", sql.Int, bId)
            .input("ServiceID", sql.Int, serviceId)
            .query(
              `SELECT ServicePrice FROM dbo.BranchService
               WHERE BranchID = @BranchID AND ServiceID = @ServiceID AND IsAvailable = 1`
            );
          if (!r.recordset.length) {
            return res.status(400).json({ message: `Service ${serviceId} not available at branch ${bId}` });
          }
          price = r.recordset[0].ServicePrice;
        }

        const lineAmount = decimal(quantity * price) || 0;
        resolvedServiceLines.push({ serviceId, quantity, unitPrice: price, lineAmount, discountAmount: 0 });
      }

      const resolvedProductLines = [];
      for (const line of prodLines) {
        const productId = num(line.productId);
        const quantity = num(line.quantity);
        if (!productId || !quantity || quantity <= 0) continue;

        const unitPrice = decimal(line.unitPrice);
        let price = unitPrice;
        let stock = null;

        const inv = await new sql.Request(tx)
          .input("BranchID", sql.Int, bId)
          .input("ProductID", sql.Int, productId)
        .query(
        `SELECT StockQty, SellingPrice
         FROM dbo.Inventory
         WHERE BranchID = @BranchID AND ProductID = @ProductID AND IsActive = 1`
       );

        if (!inv.recordset.length) {
          return res.status(400).json({ message: `Product ${productId} not found in inventory for branch ${bId}` });
        }
        stock = inv.recordset[0].StockQty;
        if (stock < quantity) {
          return res.status(400).json({ message: `Not enough stock for product ${productId}. Stock=${stock}, need=${quantity}` });
        }
        if (price == null) price = inv.recordset[0].SellingPrice;

        const lineAmount = decimal(quantity * price) || 0;
        resolvedProductLines.push({ productId, quantity, unitPrice: price, lineAmount, discountAmount: 0 });
      }

      const originalAmount = decimal(
        resolvedServiceLines.reduce((s, l) => s + Number(l.lineAmount || 0), 0) +
          resolvedProductLines.reduce((s, l) => s + Number(l.lineAmount || 0), 0)
      ) || 0;

      if (disc > originalAmount) {
        return res.status(400).json({ message: "discountAmount cannot exceed originalAmount" });
      }

      // Create invoice
      const invRes = await rq
        .input("BranchID", sql.Int, bId)
        .input("UserID", sql.Int, uId)
        .input("StaffID", sql.Int, sId)
        .input("InvoiceDate", sql.DateTime, new Date())
        .input("OriginalAmount", sql.Decimal(18, 2), originalAmount)
        .input("DiscountAmount", sql.Decimal(18, 2), disc)
        .input("PaymentMethod", sql.NVarChar(30), pm)
        .input("PaymentStatus", sql.NVarChar(20), ps)
         .query(
         `INSERT INTO dbo.Invoice (BranchID, UserID, StaffID, InvoiceDate, OriginalAmount, DiscountAmount, PaymentMethod, PaymentStatus)
          OUTPUT INSERTED.InvoiceID, INSERTED.OriginalAmount, INSERTED.DiscountAmount, INSERTED.FinalAmount
          VALUES (@BranchID, @UserID, @StaffID, @InvoiceDate, @OriginalAmount, @DiscountAmount, @PaymentMethod, @PaymentStatus);`
        );

      const invoice = invRes.recordset[0];
      const invoiceId = invoice.InvoiceID;

      // Link pets
      for (const petId of pets) {
          await new sql.Request(tx)
            .input("InvoiceID", sql.Int, invoiceId)
            .input("PetID", sql.Int, petId)
            .query(`INSERT INTO dbo.InvoicePet (InvoiceID, PetID) VALUES (@InvoiceID, @PetID);`);
      }

      // Insert service lines
      let lineNo = 1;
      for (const line of resolvedServiceLines) {
          await new sql.Request(tx)
            .input("InvoiceID", sql.Int, invoiceId)
            .input("LineNo", sql.Int, lineNo++)
            .input("ServiceID", sql.Int, line.serviceId)
            .input("AppointmentID", sql.Int, null)
            .input("PetID", sql.Int, pets[0] || null)
            .input("Quantity", sql.Int, line.quantity)
            .input("UnitPrice", sql.Decimal(18, 2), line.unitPrice)
            .input("LineAmount", sql.Decimal(18, 2), line.lineAmount)
            .input("DiscountAmount", sql.Decimal(18, 2), line.discountAmount || 0)
              .query(
              `INSERT INTO dbo.ServiceInvoiceLine
                (InvoiceID, LineNo, ServiceID, AppointmentID, PetID, Quantity, UnitPrice, LineAmount, DiscountAmount)
               VALUES
                (@InvoiceID, @LineNo, @ServiceID, @AppointmentID, @PetID, @Quantity, @UnitPrice, @LineAmount, @DiscountAmount);`
            );
      }

      // Insert product lines + update inventory
      let pLineNo = 1;
      for (const line of resolvedProductLines) {
          await new sql.Request(tx)
            .input("InvoiceID", sql.Int, invoiceId)
            .input("LineNo", sql.Int, pLineNo++)
            .input("ProductID", sql.Int, line.productId)
            .input("Quantity", sql.Int, line.quantity)
            .input("UnitPrice", sql.Decimal(18, 2), line.unitPrice)
            .input("LineAmount", sql.Decimal(18, 2), line.lineAmount)
            .input("DiscountAmount", sql.Decimal(18, 2), line.discountAmount || 0)
              .query(
              `INSERT INTO dbo.ProductInvoiceLine
                (InvoiceID, LineNo, ProductID, Quantity, UnitPrice, LineAmount, DiscountAmount)
               VALUES
                (@InvoiceID, @LineNo, @ProductID, @Quantity, @UnitPrice, @LineAmount, @DiscountAmount);`
            );

        await new sql.Request(tx)
          .input("BranchID", sql.Int, bId)
          .input("ProductID", sql.Int, line.productId)
          .input("Quantity", sql.Int, line.quantity)
          .query(
          `UPDATE dbo.Inventory
           SET StockQty = StockQty - @Quantity
           WHERE BranchID = @BranchID AND ProductID = @ProductID;`
         );
      }

      await tx.commit();

      return res.status(201).json({
        invoiceId,
        originalAmount: invoice.OriginalAmount,
        discountAmount: invoice.DiscountAmount,
        finalAmount: invoice.FinalAmount,
      });
    } catch (err) {
      try {
        if (tx) await tx.rollback();
      } catch (_) {
        // ignore rollback errors (demo)
      }
      return next(err);
    }
  },

  async listInvoices(req, res, next) {
    try {
      const branchId = num(req.query.branchId);
      if (!branchId) return res.status(400).json({ message: "branchId is required" });

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("BranchID", sql.Int, branchId)
        .query(
           `SELECT TOP 100
             i.InvoiceID, i.InvoiceDate, i.OriginalAmount, i.DiscountAmount, i.FinalAmount,
             i.PaymentMethod, i.PaymentStatus,
             u.UserID, u.FullName AS CustomerName,
             e.EmployeeID, e.FullName AS StaffName
           FROM dbo.Invoice i
           JOIN dbo.Users u ON u.UserID = i.UserID
           JOIN dbo.Employee e ON e.EmployeeID = i.StaffID
           WHERE i.BranchID = @BranchID
           ORDER BY i.InvoiceDate DESC`
        );

      return res.json(
        result.recordset.map((r) => ({
          invoiceId: r.InvoiceID,
          invoiceDate: r.InvoiceDate,
          originalAmount: r.OriginalAmount,
          discountAmount: r.DiscountAmount,
          finalAmount: r.FinalAmount,
          paymentMethod: r.PaymentMethod,
          paymentStatus: r.PaymentStatus,
          customer: { userId: r.UserID, fullName: r.CustomerName },
          staff: { employeeId: r.EmployeeID, fullName: r.StaffName },
        }))
      );
    } catch (err) {
      return next(err);
    }
  },

  async getInvoiceDetail(req, res, next) {
    try {
      const invoiceId = num(req.params.id);
      if (!invoiceId) return res.status(400).json({ message: "Invalid invoice id" });

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
           JOIN dbo.Branch b ON b.BranchID = i.BranchID
           JOIN dbo.Users u ON u.UserID = i.UserID
           JOIN dbo.Employee e ON e.EmployeeID = i.StaffID
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
          `SELECT l.LineNo, l.ServiceID, s.ServiceName, l.Quantity, l.UnitPrice, l.LineAmount, l.DiscountAmount
           FROM dbo.ServiceInvoiceLine l
           JOIN dbo.Service s ON s.ServiceID = l.ServiceID
           WHERE l.InvoiceID = @InvoiceID
           ORDER BY l.LineNo ASC;`
        );

      const productLines = await pool
        .request()
        .input("InvoiceID", sql.Int, invoiceId)
        .query(
          `SELECT l.LineNo, l.ProductID, p.ProductName, l.Quantity, l.UnitPrice, l.LineAmount, l.DiscountAmount
           FROM dbo.ProductInvoiceLine l
           JOIN dbo.Product p ON p.ProductID = l.ProductID
           WHERE l.InvoiceID = @InvoiceID
           ORDER BY l.LineNo ASC;`
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
