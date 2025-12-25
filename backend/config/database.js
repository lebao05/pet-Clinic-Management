const sql = require("mssql");

const config = {
  server: "petcarex.database.windows.net", // Azure SQL server name
  database: "petcarex",
  user: "nhan", // Đổi tên user phù hợp
  password: "Trongnh@n2401", // Lưu ý không commit password thực lên git/public repo!
  options: {
    encrypt: true, // Azure yêu cầu
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      await pool.request().query("SET TEXTSIZE 2147483647");
    }
    return pool;
  } catch (err) {
    // Ghi log chi tiết lỗi và gợi ý hướng xử lý
    if (err.code === "ESOCKET" || err.message.includes("ECONNRESET")) {
      console.error("❌ Lỗi database: Connection lost - read ECONNRESET.");
      console.error(
        "👉 Kiểm tra: Public network access trên Azure SQL, firewall, và trạng thái mạng. Xem chú thích đầu file để biết thêm chi tiết khắc phục."
      );
    } else {
      console.error("❌ Failed to connect to database:", err);
    }
    throw err;
  }
}

module.exports = { getConnection, sql };
