const { getConnection, sql } = require("../config/database");

// ==================== DASHBOARD ====================
/**
 * GET /api/branch-manager/summary
 * Query params: branchId, date (optional)
 */
exports.getSummary = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    const pool = await getConnection();

    // Today's revenue
    const revenueQuery = `
      SELECT ISNULL(SUM(FinalAmount), 0) AS todayRevenue
      FROM Invoice
      WHERE BranchID = @branchId 
        AND CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE)
        AND PaymentStatus = 'Paid'
    `;
    const revenueResult = await pool.request().input("branchId", sql.Int, branchId).query(revenueQuery);

    // Active staff count
    const staffQuery = `
      SELECT COUNT(DISTINCT ea.EmployeeID) AS activeStaff
      FROM EmployeeAssignment ea
      WHERE ea.BranchID = @branchId
        AND ea.StartDate <= GETDATE()
        AND (ea.EndDate IS NULL OR ea.EndDate >= GETDATE())
    `;
    const staffResult = await pool.request().input("branchId", sql.Int, branchId).query(staffQuery);

    // Low stock items
    const lowStockQuery = `
      SELECT COUNT(*) AS lowStockItems
      FROM Inventory
      WHERE BranchID = @branchId 
        AND StockQty < 10
        AND IsActive = 1
    `;
    const lowStockResult = await pool.request().input("branchId", sql.Int, branchId).query(lowStockQuery);

    // Low stock list (top 5)
    const lowStockListQuery = `
      SELECT TOP 5 
        p.ProductName AS name, 
        i.StockQty AS stock
      FROM Inventory i
      INNER JOIN Product p ON i.ProductID = p.ProductID
      WHERE i.BranchID = @branchId 
        AND i.StockQty < 10
        AND i.IsActive = 1
      ORDER BY i.StockQty ASC
    `;
    const lowStockListResult = await pool.request().input("branchId", sql.Int, branchId).query(lowStockListQuery);

    // Revenue last 7 days
    const revenue7dQuery = `
      SELECT 
        CAST(InvoiceDate AS DATE) AS date,
        ISNULL(SUM(FinalAmount), 0) AS amount
      FROM Invoice
      WHERE BranchID = @branchId
        AND InvoiceDate >= DATEADD(DAY, -7, GETDATE())
        AND PaymentStatus = 'Paid'
      GROUP BY CAST(InvoiceDate AS DATE)
      ORDER BY date ASC
    `;
    const revenue7dResult = await pool.request().input("branchId", sql.Int, branchId).query(revenue7dQuery);

    res.json({
      success: true,
      data: {
        todayRevenue: revenueResult.recordset[0].todayRevenue,
        activeStaff: staffResult.recordset[0].activeStaff,
        lowStockItems: lowStockResult.recordset[0].lowStockItems,
        lowStockList: lowStockListResult.recordset,
        revenue7d: revenue7dResult.recordset,
      },
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== STAFF ====================
/**
 * GET /api/branch-manager/staff
 * Query params: branchId, date
 */
exports.listStaff = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    const pool = await getConnection();

    const query = `
      SELECT 
        e.EmployeeID,
        e.FullName,
        e.Role,
        e.WorkStatus,
        ea.AssignmentID,
        ea.StartDate,
        ea.EndDate
      FROM Employee e
      INNER JOIN EmployeeAssignment ea ON e.EmployeeID = ea.EmployeeID
      WHERE ea.BranchID = @branchId
        AND ea.StartDate <= @date
        AND (ea.EndDate IS NULL OR ea.EndDate >= @date)
      ORDER BY e.Role, e.FullName
    `;

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("date", sql.Date, date || new Date())
      .query(query);

    res.json({
      success: true,
      data: {
        staff: result.recordset,
      },
    });
  } catch (error) {
    console.error("Error in listStaff:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/branch-manager/assignments
 * Body: { employeeId, branchId, startDate }
 */
exports.createAssignment = async (req, res) => {
  try {
    const { employeeId, branchId, startDate } = req.body;
    const pool = await getConnection();

    const query = `
      INSERT INTO EmployeeAssignment (EmployeeID, BranchID, StartDate)
      VALUES (@employeeId, @branchId, @startDate);
      SELECT SCOPE_IDENTITY() AS AssignmentID;
    `;

    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .input("branchId", sql.Int, branchId)
      .input("startDate", sql.Date, startDate)
      .query(query);

    res.json({
      success: true,
      message: "Assignment created successfully",
      data: {
        assignmentId: result.recordset[0].AssignmentID,
      },
    });
  } catch (error) {
    console.error("Error in createAssignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/branch-manager/assignments/:id/end
 * Body: { endDate }
 */
exports.endAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;
    const pool = await getConnection();

    const query = `
      UPDATE EmployeeAssignment
      SET EndDate = @endDate
      WHERE AssignmentID = @id
    `;

    await pool.request().input("id", sql.Int, id).input("endDate", sql.Date, endDate).query(query);

    res.json({
      success: true,
      message: "Assignment ended successfully",
    });
  } catch (error) {
    console.error("Error in endAssignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== INVENTORY ====================
/**
 * GET /api/branch-manager/inventory
 * Query params: branchId
 */
exports.listInventory = async (req, res) => {
  try {
    const { branchId } = req.query;
    const pool = await getConnection();

    const query = `
      SELECT 
        i.ProductID,
        p.ProductName,
        p.ProductType,
        i.StockQty,
        i.SellingPrice,
        i.IsActive
      FROM Inventory i
      INNER JOIN Product p ON i.ProductID = p.ProductID
      WHERE i.BranchID = @branchId
      ORDER BY p.ProductName
    `;

    const result = await pool.request().input("branchId", sql.Int, branchId).query(query);

    res.json({
      success: true,
      data: {
        items: result.recordset,
      },
    });
  } catch (error) {
    console.error("Error in listInventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/branch-manager/inventory
 * Body: { branchId, productId, stockQty, sellingPrice, isActive }
 */
exports.updateInventory = async (req, res) => {
  try {
    const { branchId, productId, stockQty, sellingPrice, isActive } = req.body;
    const pool = await getConnection();

    const query = `
      UPDATE Inventory
      SET 
        StockQty = @stockQty,
        SellingPrice = @sellingPrice,
        IsActive = @isActive
      WHERE BranchID = @branchId AND ProductID = @productId
    `;

    await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("productId", sql.Int, productId)
      .input("stockQty", sql.Int, stockQty)
      .input("sellingPrice", sql.Decimal(18, 2), sellingPrice)
      .input("isActive", sql.Bit, isActive ? 1 : 0)
      .query(query);

    res.json({
      success: true,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.error("Error in updateInventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SERVICES ====================
/**
 * GET /api/branch-manager/services
 * Query params: branchId
 */
exports.listServices = async (req, res) => {
  try {
    const { branchId } = req.query;
    const pool = await getConnection();

    const query = `
      SELECT 
        bs.ServiceID,
        s.ServiceName,
        s.ServiceType,
        bs.ServicePrice,
        bs.IsAvailable
      FROM BranchService bs
      INNER JOIN Service s ON bs.ServiceID = s.ServiceID
      WHERE bs.BranchID = @branchId
      ORDER BY s.ServiceName
    `;

    const result = await pool.request().input("branchId", sql.Int, branchId).query(query);

    res.json({
      success: true,
      data: {
        services: result.recordset,
      },
    });
  } catch (error) {
    console.error("Error in listServices:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/branch-manager/services
 * Body: { branchId, serviceId, servicePrice, isAvailable }
 */
exports.updateService = async (req, res) => {
  try {
    const { branchId, serviceId, servicePrice, isAvailable } = req.body;
    const pool = await getConnection();

    const query = `
      UPDATE BranchService
      SET 
        ServicePrice = @servicePrice,
        IsAvailable = @isAvailable
      WHERE BranchID = @branchId AND ServiceID = @serviceId
    `;

    await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("serviceId", sql.Int, serviceId)
      .input("servicePrice", sql.Decimal(18, 2), servicePrice)
      .input("isAvailable", sql.Bit, isAvailable ? 1 : 0)
      .query(query);

    res.json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Error in updateService:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== APPOINTMENTS ====================
/**
 * GET /api/branch-manager/appointments
 * Query params: branchId, from, to, status (optional)
 */
exports.listAppointments = async (req, res) => {
  try {
    const { branchId, from, to, status } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        a.AppointmentID,
        a.ScheduleTime,
        a.Status,
        p.PetName,
        p.Species,
        u.FullName AS CustomerName,
        u.Phone,
        s.ServiceName,
        s.ServiceType,
        e.FullName AS DoctorName
      FROM Appointment a
      INNER JOIN Pet p ON a.PetID = p.PetID
      INNER JOIN Users u ON p.UserID = u.UserID
      INNER JOIN Service s ON a.ServiceID = s.ServiceID
      LEFT JOIN Employee e ON a.DoctorID = e.EmployeeID
      WHERE a.BranchID = @branchId
        AND CAST(a.ScheduleTime AS DATE) >= @from
        AND CAST(a.ScheduleTime AS DATE) <= @to
    `;

    if (status) {
      query += ` AND a.Status = @status`;
    }

    query += ` ORDER BY a.ScheduleTime DESC`;

    const request = pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to);

    if (status) {
      request.input("status", sql.VarChar, status);
    }

    const result = await request.query(query);

    res.json({
      success: true,
      data: {
        items: result.recordset,
      },
    });
  } catch (error) {
    console.error("Error in listAppointments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== RATINGS ====================
/**
 * GET /api/branch-manager/ratings
 * Query params: branchId, from, to
 */
exports.listRatings = async (req, res) => {
  try {
    const { branchId, from, to } = req.query;
    const pool = await getConnection();

    // Get ratings list
    const ratingsQuery = `
      SELECT 
        r.RatingID,
        r.RatingDate,
        r.ServiceScore,
        r.AttitudeScore,
        r.OverallScore,
        r.Comment,
        u.FullName AS CustomerName
      FROM Rating r
      INNER JOIN Users u ON r.UserID = u.UserID
      WHERE r.BranchID = @branchId
        AND CAST(r.RatingDate AS DATE) >= @from
        AND CAST(r.RatingDate AS DATE) <= @to
      ORDER BY r.RatingDate DESC
    `;

    const ratingsResult = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(ratingsQuery);

    // Get summary
    const summaryQuery = `
      SELECT 
        AVG(CAST(r.ServiceScore AS FLOAT)) AS avgService,
        AVG(CAST(r.AttitudeScore AS FLOAT)) AS avgAttitude,
        AVG(CAST(r.OverallScore AS FLOAT)) AS avgOverall,
        COUNT(*) AS total
      FROM Rating r
      WHERE r.BranchID = @branchId
        AND CAST(r.RatingDate AS DATE) >= @from
        AND CAST(r.RatingDate AS DATE) <= @to
    `;

    const summaryResult = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(summaryQuery);

    res.json({
      success: true,
      data: {
        ratings: ratingsResult.recordset,
        summary: summaryResult.recordset[0],
      },
    });
  } catch (error) {
    console.error("Error in listRatings:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== REPORTS ====================
/**
 * GET /api/branch-manager/revenue
 * Query params: branchId, from, to
 */
exports.revenueReport = async (req, res) => {
  try {
    const { branchId, from, to } = req.query;
    const pool = await getConnection();

    // Daily revenue
    const dailyQuery = `
      SELECT 
        CAST(InvoiceDate AS DATE) AS date,
        SUM(FinalAmount) AS amount,
        COUNT(*) AS invoiceCount
      FROM Invoice
      WHERE BranchID = @branchId
        AND CAST(InvoiceDate AS DATE) >= @from
        AND CAST(InvoiceDate AS DATE) <= @to
        AND PaymentStatus = 'Paid'
      GROUP BY CAST(InvoiceDate AS DATE)
      ORDER BY date ASC
    `;

    const dailyResult = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(dailyQuery);

    // Totals
    const totalsQuery = `
      SELECT 
        ISNULL(SUM(FinalAmount), 0) AS totalAmount,
        COUNT(*) AS totalInvoices
      FROM Invoice
      WHERE BranchID = @branchId
        AND CAST(InvoiceDate AS DATE) >= @from
        AND CAST(InvoiceDate AS DATE) <= @to
        AND PaymentStatus = 'Paid'
    `;

    const totalsResult = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(totalsQuery);

    res.json({
      success: true,
      data: {
        daily: dailyResult.recordset,
        totals: totalsResult.recordset[0],
      },
    });
  } catch (error) {
    console.error("Error in revenueReport:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
