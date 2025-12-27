const { getConnection, sql } = require("../config/database");

const getDashboard = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("Months", sql.Int, months)
      .query(`
        DECLARE @FromDate DATE =
          DATEADD(
            MONTH,
            -@Months + 1,
            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          );

        /* 1. Tổng doanh thu */
        SELECT 
          SUM(FinalAmount) AS TotalRevenue
        FROM Invoice
        WHERE InvoiceDate >= @FromDate
          AND PaymentStatus = 'Paid';

        /* 2. Doanh thu theo chi nhánh */
        SELECT
          b.BranchName,
          SUM(i.FinalAmount) AS Revenue
        FROM Invoice i
        JOIN Branch b ON i.BranchID = b.BranchID
        WHERE i.InvoiceDate >= @FromDate
          AND i.PaymentStatus = 'Paid'
        GROUP BY b.BranchName;

        /* 3. Dịch vụ hàng đầu */
        SELECT
          s.ServiceName,
          SUM(l.LineAmount) AS Revenue
        FROM ServiceInvoiceLine l
        JOIN Service s ON l.ServiceID = s.ServiceID
        JOIN Invoice i ON l.InvoiceID = i.InvoiceID
        WHERE i.InvoiceDate >= @FromDate
          AND i.PaymentStatus = 'Paid'
        GROUP BY s.ServiceName
        ORDER BY Revenue DESC;

        /* 4. Thú cưng theo loài */
        SELECT 
          Species,
          COUNT(*) AS Total
        FROM Pet
        GROUP BY Species;

        /* 5. Thống kê hạng thành viên */
        SELECT 
          m.RankName,
          COUNT(u.UserID) AS Total
        FROM Users u
        LEFT JOIN Membership m ON u.RankID = m.RankID
        GROUP BY m.RankName;

        /* 6. Doanh thu công ty theo từng tháng */
        SELECT
          FORMAT(i.InvoiceDate, 'MM/yyyy') AS Month,
          YEAR(i.InvoiceDate) AS Year,
          MONTH(i.InvoiceDate) AS MonthNumber,
          SUM(i.FinalAmount) AS Revenue
        FROM Invoice i
        WHERE i.InvoiceDate >= @FromDate
          AND i.PaymentStatus = 'Paid'
        GROUP BY
          YEAR(i.InvoiceDate),
          MONTH(i.InvoiceDate),
          FORMAT(i.InvoiceDate, 'MM/yyyy')
        ORDER BY
          Year,
          MonthNumber;
      `);

    res.json({
      success: true,
      months,
      data: {
        totalRevenue: result.recordsets[0][0],
        revenueByBranch: result.recordsets[1],
        topServices: result.recordsets[2],
        petsBySpecies: result.recordsets[3],
        membersByRank: result.recordsets[4],
        monthlyRevenue: result.recordsets[5], // 👈 THÊM
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      err: err.message,
    });
  }
};
const getBranchSummary = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        b.BranchID,
        b.BranchName,
        b.City,
        b.Address,
        b.Phone,
        b.OpenTime,
        b.CloseTime,
        m.FullName AS ManagerName,
        COUNT(DISTINCT ea.EmployeeID) AS TotalEmployees
      FROM Branch b
      LEFT JOIN Employee m 
        ON b.ManagerID = m.EmployeeID
      LEFT JOIN EmployeeAssignment ea
        ON b.BranchID = ea.BranchID
        AND ea.EndDate IS NULL
      GROUP BY
        b.BranchID,
        b.BranchName,
        b.City,
        b.Address,
        b.Phone,
        b.OpenTime,
        b.CloseTime,
        m.FullName
      ORDER BY b.BranchName
    `);

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (err) {
    console.error("Branch summary error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load branch summary",
    });
  }
};
const getEmployees = async (req, res) => {
  try {
    const pool = await getConnection();

    const {
      role,
      branchId,
      workingStatus, // active | inactive
      page = 1,
      pageSize = 10,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const request = pool.request();

    request.input("Offset", sql.Int, offset);
    request.input("PageSize", sql.Int, parseInt(pageSize));

    let whereClause = "WHERE 1=1";

    if (role) {
      whereClause += " AND e.Role = @Role";
      request.input("Role", sql.NVarChar, role);
    }

    if (branchId) {
      whereClause += " AND cb.BranchID = @BranchID";
      request.input("BranchID", sql.Int, branchId);
    }

    if (workingStatus === "active") {
      whereClause += " AND ca.AssignmentID IS NOT NULL";
    }

    if (workingStatus === "inactive") {
      whereClause += " AND ca.AssignmentID IS NULL";
    }

    const query = `
      /* ===== DATA ===== */
      SELECT
        e.EmployeeID,
        e.FullName,
        e.Gender,
        e.DateOfBirth,
        e.HireDate,
        e.Role,
        e.BaseSalary,
        e.WorkStatus,

        cb.BranchID,
        cb.BranchName,
        cb.City,

        CASE
          WHEN ca.AssignmentID IS NULL
            THEN N'Không làm việc'
          ELSE N'Đang làm việc'
        END AS WorkingStatus,

        /* ===== FULL HISTORY ===== */
        (
          SELECT
            ea2.AssignmentID,
            b2.BranchID,
            b2.BranchName,
            ea2.StartDate,
            ea2.EndDate
          FROM EmployeeAssignment ea2
          JOIN Branch b2 ON ea2.BranchID = b2.BranchID
          WHERE ea2.EmployeeID = e.EmployeeID
          ORDER BY ea2.StartDate DESC
          FOR JSON PATH
        ) AS AssignmentHistory

      FROM Employee e

      /* 🔥 current assignment by TIME */
      LEFT JOIN EmployeeAssignment ca
        ON e.EmployeeID = ca.EmployeeID
        AND ca.StartDate <= CAST(GETDATE() AS DATE)
        AND (ca.EndDate IS NULL OR ca.EndDate >= CAST(GETDATE() AS DATE))

      LEFT JOIN Branch cb
        ON ca.BranchID = cb.BranchID

      ${whereClause}
      ORDER BY e.FullName
      OFFSET @Offset ROWS
      FETCH NEXT @PageSize ROWS ONLY;

      /* ===== COUNT ===== */
      SELECT COUNT(*) AS Total
      FROM Employee e
      LEFT JOIN EmployeeAssignment ca
        ON e.EmployeeID = ca.EmployeeID
        AND ca.StartDate <= CAST(GETDATE() AS DATE)
        AND (ca.EndDate IS NULL OR ca.EndDate >= CAST(GETDATE() AS DATE))
      LEFT JOIN Branch cb
        ON ca.BranchID = cb.BranchID
      ${whereClause};
    `;

    const result = await request.query(query);

    // parse JSON history
    const data = result.recordsets[0].map(e => ({
      ...e,
      AssignmentHistory: e.AssignmentHistory
        ? JSON.parse(e.AssignmentHistory)
        : [],
    }));

    res.json({
      success: true,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: result.recordsets[1][0].Total,
        totalPages: Math.ceil(
          result.recordsets[1][0].Total / pageSize
        ),
      },
      data,
    });
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load employees",
      error: err.message,
    });
  }
};



const assignEmployeeToBranch = async (req, res) => {
  const { employeeId, branchId, startDate } = req.body;

  if (!employeeId || !branchId) {
    return res.status(400).json({
      success: false,
      message: "employeeId và branchId là bắt buộc",
    });
  }

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("EmployeeID", sql.Int, employeeId)
      .input("NewBranchID", sql.Int, branchId)
      .input(
        "StartDate",
        sql.Date,
        startDate ? new Date(startDate) : new Date()
      )
      .execute("sp_AssignEmployeeToBranch");

    res.json({
      success: true,
      message: "Employee assigned to new branch successfully",
      data: {
        employeeId,
        branchId,
        startDate: startDate || new Date().toISOString().slice(0, 10),
      },
    });
  } catch (err) {
    console.error("Assign employee error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to assign employee to branch",
      error: err.message,
    });
  }
};
const getEmployeeRoles = async (req, res) => {
  try {
    const pool = await getConnection();

    const query = `
      SELECT DISTINCT
        Role
      FROM Employee
      WHERE Role IS NOT NULL
      ORDER BY Role;
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset.map(r => r.Role),
    });
  } catch (err) {
    console.error("Get roles error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load roles",
    });
  }
};
const getBranches = async (req, res) => {
  try {
    const pool = await getConnection();

    const query = `
      SELECT
        BranchID,
        BranchName,
        City
      FROM Branch
      ORDER BY BranchName;
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("Get branches error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load branches",
    });
  }
};
const addEmployee = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      hireDate,
      role,
      baseSalary,
      branchId,
      startDate,
    } = req.body;

    await transaction.begin();

    const request = new sql.Request(transaction);

    /* =====================================================
       1️⃣ CHECK MANAGER EXISTENCE (if role = Manager)
    ===================================================== */
    if (role === "Manager") {
      const checkManagerQuery = `
        SELECT TOP 1 e.EmployeeID
        FROM Employee e
        JOIN EmployeeAssignment ea ON e.EmployeeID = ea.EmployeeID
        WHERE e.Role = 'Manager'
          AND ea.BranchID = @BranchID
          AND ea.StartDate <= CAST(GETDATE() AS DATE)
          AND (ea.EndDate IS NULL OR ea.EndDate >= CAST(GETDATE() AS DATE));
      `;

      const check = await request
        .input("BranchID", sql.Int, branchId)
        .query(checkManagerQuery);

      if (check.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Branch already has a manager",
        });
      }
    }

    /* =====================================================
       2️⃣ INSERT EMPLOYEE
    ===================================================== */
    const insertEmployeeQuery = `
      INSERT INTO Employee (
        FullName,
        Gender,
        DateOfBirth,
        HireDate,
        Role,
        BaseSalary,
        WorkStatus
      )
      OUTPUT INSERTED.EmployeeID
      VALUES (
        @FullName,
        @Gender,
        @DateOfBirth,
        @HireDate,
        @Role,
        @BaseSalary,
        N'Active'
      );
    `;

    const employeeResult = await request
      .input("FullName", sql.NVarChar, fullName)
      .input("Gender", sql.NVarChar, gender)
      .input("DateOfBirth", sql.Date, dateOfBirth)
      .input("HireDate", sql.Date, hireDate)
      .input("Role", sql.NVarChar, role)
      .input("BaseSalary", sql.Decimal(18, 2), baseSalary)
      .query(insertEmployeeQuery);

    const employeeId = employeeResult.recordset[0].EmployeeID;

    /* =====================================================
       3️⃣ ASSIGN TO BRANCH
    ===================================================== */
    const assignQuery = `
      INSERT INTO EmployeeAssignment (
        EmployeeID,
        BranchID,
        StartDate
      )
      VALUES (
        @EmployeeID,
        @BranchID,
        @StartDate
      );
    `;

    await request
      .input("EmployeeID", sql.Int, employeeId)
      .input("StartDate", sql.Date, startDate)
      .query(assignQuery);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: {
        employeeId,
      },
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Add employee error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add employee",
      error: err.message,
    });
  }
};
const addBranch = async (req, res) => {
  try {
    const pool = await getConnection();

    const {
      branchName,
      address,
      phone,
      openTime,
      closeTime,
    } = req.body;

    // basic validation
    if (!branchName) {
      return res.status(400).json({
        success: false,
        message: "BranchName is required",
      });
    }

    /* =====================================================
       OPTIONAL: prevent duplicate branch name
    ===================================================== */
    const checkQuery = `
      SELECT 1
      FROM Branch
      WHERE BranchName = @BranchName;
    `;

    const check = await pool.request()
      .input("BranchName", sql.NVarChar, branchName)
      .query(checkQuery);

    if (check.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Branch name already exists",
      });
    }

    /* =====================================================
       INSERT BRANCH
    ===================================================== */
    const insertQuery = `
      INSERT INTO Branch (
        BranchName,
        Address,
        Phone,
        OpenTime,
        CloseTime
      )
      OUTPUT INSERTED.BranchID
      VALUES (
        @BranchName,
        @Address,
        @Phone,
        @OpenTime,
        @CloseTime
      );
    `;

    const result = await pool.request()
      .input("BranchName", sql.NVarChar, branchName)
      .input("Address", sql.NVarChar, address || null)
      .input("Phone", sql.NVarChar, phone || null)
      .input("OpenTime", sql.VarChar, openTime || null)
      .input("CloseTime", sql.VarChar, closeTime || null)
      .query(insertQuery);

    res.status(201).json({
      success: true,
      message: "Branch added successfully",
      data: {
        branchId: result.recordset[0].BranchID,
      },
    });
  } catch (err) {
    console.error("Add branch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add branch",
      error: err.message,
    });
  }
};
const updateBranch = async (req, res) => {
  const { branchId } = req.params;
  const {
    branchName,
    address,
    phone,
    openTime,
    closeTime,
  } = req.body;
  
  if (!branchId) {
    return res.status(400).json({
      success: false,
      message: "branchId is required",
    });
  }

  try {
    const pool = await getConnection();

    /* =====================================
       1️⃣ CHECK BRANCH EXIST
    ===================================== */
    const exist = await pool.request()
      .input("BranchID", sql.Int, branchId)
      .query(`
        SELECT 1 FROM Branch WHERE BranchID = @BranchID
      `);

    if (exist.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    /* =====================================
       2️⃣ CHECK DUPLICATE NAME (IF CHANGE)
    ===================================== */
    if (branchName) {
      const duplicate = await pool.request()
        .input("BranchName", sql.NVarChar, branchName)
        .input("BranchID", sql.Int, branchId)
        .query(`
          SELECT 1
          FROM Branch
          WHERE BranchName = @BranchName
            AND BranchID <> @BranchID
        `);

      if (duplicate.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Branch name already exists",
        });
      }
    }

    /* =====================================
       3️⃣ UPDATE
    ===================================== */
    await pool.request()
      .input("BranchID", sql.Int, branchId)
      .input("BranchName", sql.NVarChar, branchName || null)
      .input("Address", sql.NVarChar, address || null)
      .input("Phone", sql.NVarChar, phone || null)
      .input("OpenTime", sql.VarChar, openTime || null)
      .input("CloseTime", sql.VarChar, closeTime || null)
      .query(`
        UPDATE Branch
        SET
          BranchName = COALESCE(@BranchName, BranchName),
          Address    = COALESCE(@Address, Address),
          Phone      = COALESCE(@Phone, Phone),
          OpenTime   = COALESCE(@OpenTime, OpenTime),
          CloseTime  = COALESCE(@CloseTime, CloseTime)
        WHERE BranchID = @BranchID
      `);

    res.json({
      success: true,
      message: "Branch updated successfully",
    });
  } catch (err) {
    console.error("Update branch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update branch",
      error: err.message,
    });
  }
};

module.exports = {
  getDashboard,
  getBranchSummary,
  getEmployees,
  assignEmployeeToBranch,
  getEmployeeRoles,
  getBranches,
  addEmployee,
  addBranch,
  updateBranch,
};