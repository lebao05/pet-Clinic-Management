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

module.exports = {
  getDashboard,
};
