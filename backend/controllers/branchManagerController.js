// backend/src/controllers/branchManagerController.js

const db = require("../config/database");
const sql = require("mssql");

// ============================================
// 1. DASHBOARD - TỔNG QUAN
// ============================================

// 📊 Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];
    const pool = await db.getConnection();

    const result = await pool.request().input("branchId", sql.Int, branchId).input("targetDate", sql.Date, targetDate)
      .query(`
        SELECT 
          -- Doanh thu hôm nay
          ISNULL(SUM(CASE 
            WHEN CAST(i.InvoiceDate AS DATE) = @targetDate 
              AND i.PaymentStatus = 'Paid' 
            THEN i.FinalAmount 
            ELSE 0 
          END), 0) AS todayRevenue,

          -- Tổng doanh thu tháng này
          ISNULL(SUM(CASE 
            WHEN YEAR(i.InvoiceDate) = YEAR(@targetDate) 
              AND MONTH(i.InvoiceDate) = MONTH(@targetDate)
              AND i.PaymentStatus = 'Paid'
            THEN i.FinalAmount 
            ELSE 0 
          END), 0) AS monthRevenue,

          -- Số lịch hẹn hôm nay
          COUNT(DISTINCT CASE 
            WHEN CAST(a.ScheduleTime AS DATE) = @targetDate 
            THEN a.AppointmentID 
          END) AS todayAppointments,

          -- Số khách hàng unique tháng này
          COUNT(DISTINCT CASE 
            WHEN YEAR(i.InvoiceDate) = YEAR(@targetDate) 
              AND MONTH(i.InvoiceDate) = MONTH(@targetDate)
            THEN i.UserID 
          END) AS monthCustomers

        FROM Invoice i WITH (NOLOCK)
        LEFT JOIN Appointment a WITH (NOLOCK) 
          ON i.BranchID = a.BranchID
        WHERE i.BranchID = @branchId
      `);

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📈 Revenue Chart (30 ngày gần nhất)
exports.getRevenueChart = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          CAST(InvoiceDate AS DATE) AS date,
          SUM(FinalAmount) AS revenue,
          COUNT(DISTINCT InvoiceID) AS invoiceCount
        FROM Invoice WITH (NOLOCK)
        WHERE BranchID = @branchId
          AND InvoiceDate BETWEEN @fromDate AND @toDate
          AND PaymentStatus = 'Paid'
        GROUP BY CAST(InvoiceDate AS DATE)
        ORDER BY date ASC
      `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in getRevenueChart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔔 Urgent Alerts
exports.getUrgentAlerts = async (req, res) => {
  try {
    const { branchId } = req.query;
    const pool = await db.getConnection();

    // Tách nhỏ queries để tránh timeout
    const [lowStock, appointments] = await Promise.all([
      // Alert 1: Sản phẩm sắp hết
      pool.request().input("branchId", sql.Int, branchId).query(`
        SELECT TOP 3
          'warning' AS severity,
          'Sản phẩm sắp hết' AS title,
          CONCAT(p.ProductName, ' chỉ còn ', inv.StockQty, ' ', p.Unit) AS message
        FROM Inventory inv WITH (NOLOCK)
        JOIN Product p WITH (NOLOCK) ON inv.ProductID = p.ProductID
        WHERE inv.BranchID = @branchId
          AND inv.StockQty > 0
          AND inv.StockQty <= 10
          AND inv.IsActive = 1
        ORDER BY inv.StockQty ASC
      `),

      // Alert 2: Lịch hẹn hôm nay
      pool.request().input("branchId", sql.Int, branchId).query(`
        SELECT TOP 3
          'info' AS severity,
          'Lịch hẹn hôm nay' AS title,
          CONCAT(
            FORMAT(a.ScheduleTime, 'HH:mm'), ' - ',
            u.FullName, ' - ', p.PetName
          ) AS message
        FROM Appointment a WITH (NOLOCK)
        JOIN Users u WITH (NOLOCK) ON a.UserID = u.UserID
        JOIN Pet p WITH (NOLOCK) ON a.PetID = p.PetID
        WHERE a.BranchID = @branchId
          AND CAST(a.ScheduleTime AS DATE) = CAST(GETDATE() AS DATE)
          AND a.Status = 'Scheduled'
        ORDER BY a.ScheduleTime ASC
      `),
    ]);

    const alerts = [...(lowStock.recordset || []), ...(appointments.recordset || [])];

    res.status(200).json({
      success: true,
      alerts: alerts,
    });
  } catch (error) {
    console.error("Error in getUrgentAlerts:", error);
    res.status(200).json({
      success: true,
      alerts: [],
    });
  }
};

// ============================================
// 2. DOANH THU - REVENUE REPORTS
// ============================================

// 💰 Doanh thu theo kỳ (tháng/quý/năm)
exports.getRevenueByPeriod = async (req, res) => {
  try {
    const { branchId, period, year } = req.query;
    const pool = await db.getConnection();

    let groupBy = "";
    if (period === "month") groupBy = "MONTH(InvoiceDate)";
    else if (period === "quarter") groupBy = "DATEPART(QUARTER, InvoiceDate)";
    else groupBy = "YEAR(InvoiceDate)";

    const result = await pool.request().input("branchId", sql.Int, branchId).input("year", sql.Int, year).query(`
        SELECT 
          ${groupBy} AS period,
          SUM(FinalAmount) AS totalRevenue,
          COUNT(DISTINCT InvoiceID) AS invoiceCount,
          COUNT(DISTINCT UserID) AS customerCount
        FROM Invoice WITH (NOLOCK)
        WHERE BranchID = @branchId
          AND YEAR(InvoiceDate) = @year
          AND PaymentStatus = 'Paid'
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `);

    res.status(200).json({
      success: true,
      items: result.recordset,
    });
  } catch (error) {
    console.error("Error in getRevenueByPeriod:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 👨‍⚕️ Doanh thu theo bác sĩ
exports.getRevenueByDoctor = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          e.EmployeeID,
          e.FullName AS doctorName,
          COUNT(DISTINCT a.AppointmentID) AS appointmentCount,
          SUM(sil.LineAmount) AS serviceRevenue
        FROM Employee e WITH (NOLOCK)
        JOIN Appointment a WITH (NOLOCK) ON e.EmployeeID = a.DoctorID
        JOIN Invoice i WITH (NOLOCK) ON a.BranchID = i.BranchID
        LEFT JOIN ServiceInvoiceLine sil WITH (NOLOCK) 
          ON i.InvoiceID = sil.InvoiceID AND a.AppointmentID = sil.AppointmentID
        WHERE a.BranchID = @branchId
          AND a.ScheduleTime BETWEEN @fromDate AND @toDate
          AND a.Status = 'Completed'
          AND i.PaymentStatus = 'Paid'
        GROUP BY e.EmployeeID, e.FullName
        ORDER BY serviceRevenue DESC
      `);

    res.status(200).json({
      success: true,
      doctors: result.recordset,
    });
  } catch (error) {
    console.error("Error in getRevenueByDoctor:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📦 Doanh thu bán sản phẩm
exports.getProductSales = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          p.ProductID,
          p.ProductName,
          p.ProductType,
          SUM(pil.Quantity) AS totalQuantity,
          SUM(pil.LineAmount) AS totalRevenue,
          COUNT(DISTINCT pil.InvoiceID) AS orderCount
        FROM ProductInvoiceLine pil WITH (NOLOCK)
        JOIN Invoice i WITH (NOLOCK) ON pil.InvoiceID = i.InvoiceID
        JOIN Product p WITH (NOLOCK) ON pil.ProductID = p.ProductID
        WHERE i.BranchID = @branchId
          AND i.InvoiceDate BETWEEN @fromDate AND @toDate
          AND i.PaymentStatus = 'Paid'
        GROUP BY p.ProductID, p.ProductName, p.ProductType
        ORDER BY totalRevenue DESC
      `);

    const summary = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          SUM(pil.LineAmount) AS totalProductRevenue,
          COUNT(DISTINCT i.InvoiceID) AS totalOrders
        FROM ProductInvoiceLine pil WITH (NOLOCK)
        JOIN Invoice i WITH (NOLOCK) ON pil.InvoiceID = i.InvoiceID
        WHERE i.BranchID = @branchId
          AND i.InvoiceDate BETWEEN @fromDate AND @toDate
          AND i.PaymentStatus = 'Paid'
      `);

    res.status(200).json({
      success: true,
      products: result.recordset,
      summary: summary.recordset[0],
    });
  } catch (error) {
    console.error("Error in getProductSales:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 3. TIÊM PHÒNG - VACCINATION
// ============================================

// 💉 Danh sách thú cưng đã tiêm phòng
exports.getVaccinatedPets = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          p.PetID,
          p.PetName,
          p.Species,
          p.Breed,
          u.FullName AS ownerName,
          u.Phone AS ownerPhone,
          v.VaccineName,
          vr.DateGiven,
          vr.Dose
        FROM VaccinationRecord vr WITH (NOLOCK)
        JOIN Appointment a WITH (NOLOCK) ON vr.AppointmentID = a.AppointmentID
        JOIN Pet p WITH (NOLOCK) ON a.PetID = p.PetID
        JOIN Users u WITH (NOLOCK) ON p.UserID = u.UserID
        JOIN Vaccine v WITH (NOLOCK) ON vr.VaccineID = v.VaccineID
        WHERE a.BranchID = @branchId
          AND vr.DateGiven BETWEEN @fromDate AND @toDate
        ORDER BY vr.DateGiven DESC
      `);

    res.status(200).json({
      success: true,
      pets: result.recordset,
      total: result.recordset.length,
    });
  } catch (error) {
    console.error("Error in getVaccinatedPets:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🏆 Top vaccines được sử dụng nhiều nhất
exports.getTopVaccines = async (req, res) => {
  try {
    const { branchId, fromDate, toDate, limit } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate)
      .input("limit", sql.Int, limit || 5).query(`
        SELECT TOP (@limit)
          v.VaccineID,
          v.VaccineName,
          v.Manufacturer,
          COUNT(*) AS usageCount,
          COUNT(DISTINCT a.PetID) AS uniquePets
        FROM VaccinationRecord vr WITH (NOLOCK)
        JOIN Appointment a WITH (NOLOCK) ON vr.AppointmentID = a.AppointmentID
        JOIN Vaccine v WITH (NOLOCK) ON vr.VaccineID = v.VaccineID
        WHERE a.BranchID = @branchId
          AND vr.DateGiven BETWEEN @fromDate AND @toDate
        GROUP BY v.VaccineID, v.VaccineName, v.Manufacturer
        ORDER BY usageCount DESC
      `);

    res.status(200).json({
      success: true,
      vaccines: result.recordset,
    });
  } catch (error) {
    console.error("Error in getTopVaccines:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔍 Tra cứu vaccine
exports.searchVaccines = async (req, res) => {
  try {
    const { branchId, searchTerm, manufacturer } = req.query;
    const pool = await db.getConnection();

    let whereClause = "v.IsActive = 1";
    if (searchTerm) {
      whereClause += ` AND v.VaccineName LIKE N'%${searchTerm}%'`;
    }
    if (manufacturer) {
      whereClause += ` AND v.Manufacturer = N'${manufacturer}'`;
    }

    const result = await pool.request().query(`
      SELECT 
        v.VaccineID,
        v.VaccineName,
        v.Manufacturer,
        v.DefaultDose,
        v.DefaultPrice,
        v.IsActive,
        ISNULL(COUNT(vr.VaccinationID), 0) AS usageCount
      FROM Vaccine v WITH (NOLOCK)
      LEFT JOIN VaccinationRecord vr WITH (NOLOCK) ON v.VaccineID = vr.VaccineID
      WHERE ${whereClause}
      GROUP BY v.VaccineID, v.VaccineName, v.Manufacturer, v.DefaultDose, v.DefaultPrice, v.IsActive
      ORDER BY v.VaccineName ASC
    `);

    res.status(200).json({
      success: true,
      vaccines: result.recordset,
    });
  } catch (error) {
    console.error("Error in searchVaccines:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 4. TỒN KHO - INVENTORY
// ============================================

// 📦 Danh sách tồn kho
exports.getInventory = async (req, res) => {
  try {
    const { branchId } = req.query;
    const pool = await db.getConnection();

    const result = await pool.request().input("branchId", sql.Int, branchId).query(`
        SELECT 
          inv.BranchID,
          inv.ProductID,
          p.ProductName,
          p.ProductType,
          p.Unit,
          inv.StockQty,
          inv.SellingPrice,
          inv.IsActive,
          CASE 
            WHEN inv.StockQty = 0 THEN 'out_of_stock'
            WHEN inv.StockQty <= 10 THEN 'low_stock'
            ELSE 'in_stock'
          END AS stockStatus
        FROM Inventory inv WITH (NOLOCK)
        JOIN Product p WITH (NOLOCK) ON inv.ProductID = p.ProductID
        WHERE inv.BranchID = @branchId
          AND inv.IsActive = 1
        ORDER BY p.ProductName ASC
      `);

    res.status(200).json({
      success: true,
      inventory: result.recordset,
    });
  } catch (error) {
    console.error("Error in getInventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📝 Cập nhật tồn kho
exports.updateInventory = async (req, res) => {
  try {
    const { branchId, productId, stockQty } = req.body;
    const pool = await db.getConnection();

    await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("productId", sql.Int, productId)
      .input("stockQty", sql.Int, stockQty).query(`
        UPDATE Inventory
        SET StockQty = @stockQty
        WHERE BranchID = @branchId AND ProductID = @productId
      `);

    res.status(200).json({
      success: true,
      message: "Cập nhật tồn kho thành công",
    });
  } catch (error) {
    console.error("Error in updateInventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 5. LỊCH HẸN - APPOINTMENTS
// ============================================

// 📅 Danh sách lịch hẹn
exports.getAppointments = async (req, res) => {
  try {
    const { branchId, fromDate, toDate, status } = req.query;
    const pool = await db.getConnection();

    let whereClause = "a.BranchID = @branchId";
    if (fromDate && toDate) {
      whereClause += " AND a.ScheduleTime BETWEEN @fromDate AND @toDate";
    }
    if (status) {
      whereClause += ` AND a.Status = '${status}'`;
    }

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.DateTime, fromDate)
      .input("toDate", sql.DateTime, toDate).query(`
        SELECT 
          a.AppointmentID,
          a.ScheduleTime,
          a.Status,
          u.FullName AS CustomerName,
          u.Phone,
          p.PetName,
          p.Species,
          s.ServiceName,
          e.FullName AS DoctorName
        FROM Appointment a WITH (NOLOCK)
        JOIN Users u WITH (NOLOCK) ON a.UserID = u.UserID
        JOIN Pet p WITH (NOLOCK) ON a.PetID = p.PetID
        JOIN Service s WITH (NOLOCK) ON a.ServiceID = s.ServiceID
        LEFT JOIN Employee e WITH (NOLOCK) ON a.DoctorID = e.EmployeeID
        WHERE ${whereClause}
        ORDER BY a.ScheduleTime DESC
      `);

    res.status(200).json({
      success: true,
      appointments: result.recordset,
    });
  } catch (error) {
    console.error("Error in getAppointments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📊 Thống kê khám bệnh
exports.getExamStatistics = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          COUNT(*) AS totalAppointments,
          SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completedAppointments,
          SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledAppointments,
          COUNT(DISTINCT UserID) AS uniqueCustomers,
          COUNT(DISTINCT PetID) AS uniquePets
        FROM Appointment WITH (NOLOCK)
        WHERE BranchID = @branchId
          AND ScheduleTime BETWEEN @fromDate AND @toDate
      `);

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error in getExamStatistics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 6. NHÂN VIÊN - STAFF MANAGEMENT
// ============================================

// 👥 Danh sách nhân viên chi nhánh
exports.getBranchStaff = async (req, res) => {
  try {
    const { branchId } = req.query;
    const pool = await db.getConnection();

    const result = await pool.request().input("branchId", sql.Int, branchId).query(`
        SELECT 
          e.EmployeeID,
          e.FullName,
          e.DateOfBirth,
          e.Gender,
          e.Role,
          e.BaseSalary,
          e.WorkStatus,
          e.HireDate,
          ea.StartDate,
          ea.EndDate
        FROM Employee e WITH (NOLOCK)
        JOIN EmployeeAssignment ea WITH (NOLOCK) ON e.EmployeeID = ea.EmployeeID
        WHERE ea.BranchID = @branchId
          AND (ea.EndDate IS NULL OR ea.EndDate >= GETDATE())
          AND e.WorkStatus = 'Active'
        ORDER BY e.Role, e.FullName ASC
      `);

    res.status(200).json({
      success: true,
      staff: result.recordset,
    });
  } catch (error) {
    console.error("Error in getBranchStaff:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📈 Hiệu suất nhân viên
exports.getStaffPerformance = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          e.EmployeeID,
          e.FullName,
          e.Role,
          COUNT(DISTINCT i.InvoiceID) AS totalOrders,
          SUM(i.FinalAmount) AS totalRevenue,
          AVG(CAST(r.OverallScore AS FLOAT)) AS avgRating,
          COUNT(DISTINCT r.RatingID) AS ratingCount
        FROM Employee e WITH (NOLOCK)
        JOIN EmployeeAssignment ea WITH (NOLOCK) ON e.EmployeeID = ea.EmployeeID
        LEFT JOIN Invoice i WITH (NOLOCK) 
          ON e.EmployeeID = i.StaffID 
          AND i.InvoiceDate BETWEEN @fromDate AND @toDate
          AND i.PaymentStatus = 'Paid'
        LEFT JOIN Rating r WITH (NOLOCK) 
          ON e.EmployeeID = r.EmployeeID
          AND r.RatingDate BETWEEN @fromDate AND @toDate
        WHERE ea.BranchID = @branchId
          AND (ea.EndDate IS NULL OR ea.EndDate >= GETDATE())
          AND e.WorkStatus = 'Active'
        GROUP BY e.EmployeeID, e.FullName, e.Role
        ORDER BY totalRevenue DESC
      `);

    res.status(200).json({
      success: true,
      performance: result.recordset,
    });
  } catch (error) {
    console.error("Error in getStaffPerformance:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 7. KHÁCH HÀNG - CUSTOMERS
// ============================================

// 📊 Thống kê khách hàng
exports.getCustomerStatistics = async (req, res) => {
  try {
    const { branchId, days } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("days", sql.Int, days || 90).query(`
        WITH CustomerActivity AS (
          SELECT 
            u.UserID,
            u.FullName,
            u.Phone,
            MAX(i.InvoiceDate) AS lastVisit,
            COUNT(DISTINCT i.InvoiceID) AS visitCount,
            SUM(i.FinalAmount) AS totalSpent
          FROM Users u WITH (NOLOCK)
          JOIN Invoice i WITH (NOLOCK) ON u.UserID = i.UserID
          WHERE i.BranchID = @branchId
            AND i.PaymentStatus = 'Paid'
          GROUP BY u.UserID, u.FullName, u.Phone
        )
        SELECT 
          COUNT(*) AS totalCustomers,
          SUM(CASE WHEN DATEDIFF(DAY, lastVisit, GETDATE()) <= @days THEN 1 ELSE 0 END) AS activeCustomers,
          SUM(CASE WHEN DATEDIFF(DAY, lastVisit, GETDATE()) > @days THEN 1 ELSE 0 END) AS inactiveCustomers,
          AVG(totalSpent) AS avgSpentPerCustomer
        FROM CustomerActivity
      `);

    const inactiveCustomers = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("days", sql.Int, days || 90).query(`
        SELECT TOP 10
          u.UserID,
          u.FullName,
          u.Phone,
          MAX(i.InvoiceDate) AS lastVisit,
          DATEDIFF(DAY, MAX(i.InvoiceDate), GETDATE()) AS daysSinceLastVisit
        FROM Users u WITH (NOLOCK)
        JOIN Invoice i WITH (NOLOCK) ON u.UserID = i.UserID
        WHERE i.BranchID = @branchId
          AND i.PaymentStatus = 'Paid'
        GROUP BY u.UserID, u.FullName, u.Phone
        HAVING DATEDIFF(DAY, MAX(i.InvoiceDate), GETDATE()) > @days
        ORDER BY daysSinceLastVisit DESC
      `);

    res.status(200).json({
      success: true,
      summary: result.recordset[0],
      inactiveCustomers: inactiveCustomers.recordset,
    });
  } catch (error) {
    console.error("Error in getCustomerStatistics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 8. ĐÁNH GIÁ - RATINGS
// ============================================

// ⭐ Danh sách đánh giá
exports.getRatings = async (req, res) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    const pool = await db.getConnection();

    const result = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          r.RatingID,
          r.ServiceScore,
          r.AttitudeScore,
          r.OverallScore,
          r.Comment,
          r.RatingDate,
          u.FullName AS CustomerName,
          e.FullName AS EmployeeName
        FROM Rating r WITH (NOLOCK)
        JOIN Users u WITH (NOLOCK) ON r.UserID = u.UserID
        LEFT JOIN Employee e WITH (NOLOCK) ON r.EmployeeID = e.EmployeeID
        WHERE r.BranchID = @branchId
          AND r.RatingDate BETWEEN @fromDate AND @toDate
        ORDER BY r.RatingDate DESC
      `);

    const summary = await pool
      .request()
      .input("branchId", sql.Int, branchId)
      .input("fromDate", sql.Date, fromDate)
      .input("toDate", sql.Date, toDate).query(`
        SELECT 
          AVG(CAST(OverallScore AS FLOAT)) AS avgOverall,
          AVG(CAST(ServiceScore AS FLOAT)) AS avgService,
          AVG(CAST(AttitudeScore AS FLOAT)) AS avgAttitude,
          COUNT(*) AS total
        FROM Rating WITH (NOLOCK)
        WHERE BranchID = @branchId
          AND RatingDate BETWEEN @fromDate AND @toDate
      `);

    res.status(200).json({
      success: true,
      ratings: result.recordset,
      summary: summary.recordset[0],
    });
  } catch (error) {
    console.error("Error in getRatings:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// 9. HỒ SƠ BỆNH ÁN - MEDICAL HISTORY
// ============================================

// 🔍 Tìm kiếm thú cưng
exports.searchPets = async (req, res) => {
  try {
    const { branchId, searchTerm } = req.query;
    const pool = await db.getConnection();

    const result = await pool.request().query(`
      SELECT DISTINCT TOP 20
        p.PetID,
        p.PetName,
        p.Species,
        p.Breed,
        p.BirthDate,
        p.Gender,
        u.FullName AS ownerName,
        u.Phone AS ownerPhone
      FROM Pet p WITH (NOLOCK)
      JOIN Users u WITH (NOLOCK) ON p.UserID = u.UserID
      JOIN Appointment a WITH (NOLOCK) ON p.PetID = a.PetID
      WHERE a.BranchID = ${branchId}
        AND p.IsActive = 1
        AND (
          p.PetName LIKE N'%${searchTerm}%'
          OR u.FullName LIKE N'%${searchTerm}%'
          OR u.Phone LIKE '%${searchTerm}%'
        )
      ORDER BY p.PetName ASC
    `);

    res.status(200).json({
      success: true,
      pets: result.recordset,
    });
  } catch (error) {
    console.error("Error in searchPets:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📋 Hồ sơ bệnh án thú cưng
exports.getPetMedicalHistory = async (req, res) => {
  try {
    const { petId, branchId } = req.query;
    const pool = await db.getConnection();

    // Appointments
    const appointments = await pool.request().input("petId", sql.Int, petId).input("branchId", sql.Int, branchId)
      .query(`
        SELECT 
          a.AppointmentID,
          a.ScheduleTime,
          a.Status,
          s.ServiceName,
          e.FullName AS DoctorName,
          er.Diagnosis,
          er.Prescription,
          er.Symptoms
        FROM Appointment a WITH (NOLOCK)
        JOIN Service s WITH (NOLOCK) ON a.ServiceID = s.ServiceID
        LEFT JOIN Employee e WITH (NOLOCK) ON a.DoctorID = e.EmployeeID
        LEFT JOIN ExamRecord er WITH (NOLOCK) ON a.AppointmentID = er.AppointmentID
        WHERE a.PetID = @petId
          AND a.BranchID = @branchId
        ORDER BY a.ScheduleTime DESC
      `);

    // Vaccinations
    const vaccinations = await pool.request().input("petId", sql.Int, petId).input("branchId", sql.Int, branchId)
      .query(`
        SELECT 
          v.VaccineName,
          vr.DateGiven,
          vr.Dose,
          vr.Note,
          DATEADD(YEAR, 1, vr.DateGiven) AS NextDueDate
        FROM VaccinationRecord vr WITH (NOLOCK)
        JOIN Appointment a WITH (NOLOCK) ON vr.AppointmentID = a.AppointmentID
        JOIN Vaccine v WITH (NOLOCK) ON vr.VaccineID = v.VaccineID
        WHERE a.PetID = @petId
          AND a.BranchID = @branchId
        ORDER BY vr.DateGiven DESC
      `);

    res.status(200).json({
      success: true,
      data: {
        appointments: appointments.recordset,
        vaccinations: vaccinations.recordset,
        totalAppointments: appointments.recordset.length,
        totalVaccinations: vaccinations.recordset.length,
        lastVisit: appointments.recordset[0]?.ScheduleTime,
      },
    });
  } catch (error) {
    console.error("Error in getPetMedicalHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
