const { query, transaction, requestInTx } = require("../utils/db");

class CashierController {
  // GET /api/cashier/services?branchId=
  static async listServices(req, res) {
    try {
      const branchId = req.query.branchId ? Number(req.query.branchId) : null;
      if (!branchId) return res.status(400).json({ success: false, error: "branchId is required" });

      const rows = await query(
        `
        SELECT bs.ServiceID, s.ServiceName, s.ServiceType, bs.ServicePrice
        FROM BranchService bs
        JOIN Service s ON s.ServiceID = bs.ServiceID
        WHERE bs.BranchID=@branchId AND bs.IsAvailable=1 AND s.IsActive=1
        ORDER BY s.ServiceName;
        `,
        { branchId }
      );
      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/cashier/products?branchId=
  static async listProducts(req, res) {
    try {
      const branchId = req.query.branchId ? Number(req.query.branchId) : null;
      if (!branchId) return res.status(400).json({ success: false, error: "branchId is required" });

      const rows = await query(
        `
        SELECT i.ProductID, p.ProductName, p.ProductType, p.Unit, i.StockQty, i.SellingPrice
        FROM Inventory i
        JOIN Product p ON p.ProductID = i.ProductID
        WHERE i.BranchID=@branchId AND i.IsActive=1 AND p.BusinessStatus='Active'
        ORDER BY p.ProductName;
        `,
        { branchId }
      );
      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/cashier/invoices
  // Body:
  // { branchId,userId,staffId,paymentMethod,paymentStatus,discountAmount,
  //   pets:[petId...], serviceLines:[{serviceId, appointmentId?, petId?, quantity, unitPrice, discountAmount}],
  //   productLines:[{productId, quantity, unitPrice, discountAmount}] }
  static async createInvoice(req, res) {
    try {
      const body = req.body || {};
      const branchId = Number(body.branchId);
      const userId = Number(body.userId);
      const staffId = Number(body.staffId);
      const paymentMethod = body.paymentMethod;
      const paymentStatus = body.paymentStatus;
      const discountAmount = body.discountAmount ? Number(body.discountAmount) : 0;
      const pets = Array.isArray(body.pets) ? body.pets.map(Number) : [];
      const serviceLines = Array.isArray(body.serviceLines) ? body.serviceLines : [];
      const productLines = Array.isArray(body.productLines) ? body.productLines : [];

      if (!branchId || !userId || !staffId || !paymentMethod || !paymentStatus) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const invoiceId = await transaction(async (tx) => {
        // compute amounts
        let original = 0;

        const normalizedService = serviceLines.map((l) => {
          const qty = l.quantity ? Number(l.quantity) : 1;
          const unitPrice = Number(l.unitPrice);
          const lineAmount = qty * unitPrice;
          const disc = l.discountAmount ? Number(l.discountAmount) : 0;
          original += lineAmount;
          return { ...l, qty, unitPrice, lineAmount, disc };
        });

        const normalizedProduct = productLines.map((l) => {
          const qty = Number(l.quantity);
          const unitPrice = Number(l.unitPrice);
          const lineAmount = qty * unitPrice;
          const disc = l.discountAmount ? Number(l.discountAmount) : 0;
          original += lineAmount;
          return { ...l, qty, unitPrice, lineAmount, disc };
        });

        const totalDiscount = discountAmount +
          normalizedService.reduce((a, x) => a + x.disc, 0) +
          normalizedProduct.reduce((a, x) => a + x.disc, 0);

        if (totalDiscount > original) {
          throw new Error("Discount exceeds original amount");
        }

        // insert invoice
        const reqInvoice = requestInTx(tx, {
          branchId,
          userId,
          staffId,
          invoiceDate: new Date(),
          originalAmount: original,
          discountAmount: totalDiscount,
          paymentMethod,
          paymentStatus,
        });
        const invRes = await reqInvoice.query(
          `
          INSERT INTO Invoice (BranchID, UserID, StaffID, InvoiceDate, OriginalAmount, DiscountAmount, PaymentMethod, PaymentStatus)
          OUTPUT INSERTED.InvoiceID
          VALUES (@branchId, @userId, @staffId, @invoiceDate, @originalAmount, @discountAmount, @paymentMethod, @paymentStatus);
          `
        );
        const invoiceId = invRes.recordset[0].InvoiceID;

        // invoice-pet
        for (const petId of pets) {
          const reqPet = requestInTx(tx, { invoiceId, petId });
          await reqPet.query(
            `INSERT INTO InvoicePet (InvoiceID, PetID) VALUES (@invoiceId, @petId);`
          );
        }

        // service lines
        let lineNo = 1;
        for (const l of normalizedService) {
          const reqLine = requestInTx(tx, {
            invoiceId,
            lineNo,
            serviceId: Number(l.serviceId),
            appointmentId: l.appointmentId ? Number(l.appointmentId) : null,
            petId: l.petId ? Number(l.petId) : null,
            quantity: l.qty,
            unitPrice: l.unitPrice,
            lineAmount: l.lineAmount,
            discountAmount: l.disc,
          });
          await reqLine.query(
            `
            INSERT INTO ServiceInvoiceLine (InvoiceID, [LineNo], ServiceID, AppointmentID, PetID, Quantity, UnitPrice, LineAmount, DiscountAmount)
            VALUES (@invoiceId, @lineNo, @serviceId, @appointmentId, @petId, @quantity, @unitPrice, @lineAmount, @discountAmount);
            `
          );
          lineNo += 1;
        }

        // product lines + stock deduction
        let pLineNo = 1;
        for (const l of normalizedProduct) {
          const productId = Number(l.productId);

          // stock check
          const stockReq = requestInTx(tx, { branchId, productId });
          const stockRes = await stockReq.query(
            `SELECT StockQty FROM Inventory WHERE BranchID=@branchId AND ProductID=@productId;`
          );
          if (!stockRes.recordset.length) throw new Error("Product not in inventory");
          const stockQty = Number(stockRes.recordset[0].StockQty);
          if (l.qty > stockQty) throw new Error("Insufficient stock");

          const reqLine = requestInTx(tx, {
            invoiceId,
            lineNo: pLineNo,
            productId,
            quantity: l.qty,
            unitPrice: l.unitPrice,
            lineAmount: l.lineAmount,
            discountAmount: l.disc,
          });
          await reqLine.query(
            `
            INSERT INTO ProductInvoiceLine (InvoiceID, [LineNo], ProductID, Quantity, UnitPrice, LineAmount, DiscountAmount)
            VALUES (@invoiceId, @lineNo, @productId, @quantity, @unitPrice, @lineAmount, @discountAmount);
            `
          );

          const deductReq = requestInTx(tx, { branchId, productId, qty: l.qty });
          await deductReq.query(
            `UPDATE Inventory SET StockQty = StockQty - @qty WHERE BranchID=@branchId AND ProductID=@productId;`
          );

          pLineNo += 1;
        }

        return invoiceId;
      });

      return res.status(201).json({ success: true, invoiceId });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/cashier/invoices?branchId=&from=YYYY-MM-DD&to=YYYY-MM-DD
  static async listInvoices(req, res) {
    try {
      const branchId = req.query.branchId ? Number(req.query.branchId) : null;
      if (!branchId) return res.status(400).json({ success: false, error: "branchId is required" });
      const from = req.query.from || null;
      const to = req.query.to || null;

      let where = "WHERE i.BranchID=@branchId";
      const params = { branchId };
      if (from) {
        where += " AND CAST(i.InvoiceDate AS DATE) >= @from";
        params.from = from;
      }
      if (to) {
        where += " AND CAST(i.InvoiceDate AS DATE) <= @to";
        params.to = to;
      }

      const rows = await query(
        `
        SELECT i.InvoiceID, i.InvoiceDate, i.OriginalAmount, i.DiscountAmount, i.FinalAmount, i.PaymentMethod, i.PaymentStatus,
               u.UserID, u.FullName AS CustomerName, u.Phone AS CustomerPhone,
               e.EmployeeID AS StaffID, e.FullName AS StaffName
        FROM Invoice i
        JOIN Users u ON u.UserID = i.UserID
        JOIN Employee e ON e.EmployeeID = i.StaffID
        ${where}
        ORDER BY i.InvoiceDate DESC;
        `,
        params
      );
      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/cashier/invoices/:id
  static async getInvoiceDetail(req, res) {
    try {
      const id = Number(req.params.id);
      const inv = await query(
        `
        SELECT i.InvoiceID, i.InvoiceDate, i.OriginalAmount, i.DiscountAmount, i.FinalAmount, i.PaymentMethod, i.PaymentStatus,
               i.BranchID, b.BranchName,
               u.UserID, u.FullName AS CustomerName, u.Phone AS CustomerPhone,
               e.EmployeeID AS StaffID, e.FullName AS StaffName
        FROM Invoice i
        JOIN Branch b ON b.BranchID=i.BranchID
        JOIN Users u ON u.UserID=i.UserID
        JOIN Employee e ON e.EmployeeID=i.StaffID
        WHERE i.InvoiceID=@id;
        `,
        { id }
      );
      if (!inv.length) return res.status(404).json({ success: false, error: "Not found" });

      const pets = await query(
        `SELECT p.PetID, p.PetName, p.Species FROM InvoicePet ip JOIN Pet p ON p.PetID=ip.PetID WHERE ip.InvoiceID=@id;`,
        { id }
      );
      const serviceLines = await query(
        `
        SELECT l.LineNo, l.ServiceID, s.ServiceName, l.AppointmentID, l.PetID, l.Quantity, l.UnitPrice, l.LineAmount, l.DiscountAmount
        FROM ServiceInvoiceLine l
        JOIN Service s ON s.ServiceID=l.ServiceID
        WHERE l.InvoiceID=@id
        ORDER BY l.LineNo;
        `,
        { id }
      );
      const productLines = await query(
        `
        SELECT l.LineNo, l.ProductID, p.ProductName, l.Quantity, l.UnitPrice, l.LineAmount, l.DiscountAmount
        FROM ProductInvoiceLine l
        JOIN Product p ON p.ProductID=l.ProductID
        WHERE l.InvoiceID=@id
        ORDER BY l.LineNo;
        `,
        { id }
      );

      return res.json({ success: true, data: { invoice: inv[0], pets, serviceLines, productLines } });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}

module.exports = CashierController;
