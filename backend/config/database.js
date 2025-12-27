const sql = require("mssql");

// NOTE: Prefer environment variables. Fallbacks keep the original defaults.
// Recommended .env keys: DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD
const config = {
  // Azure SQL server name, e.g. "petcarex.database.windows.net"
  server: process.env.DB_SERVER || "",
  // Database name, e.g. "PetCareX_Optimized"
  database: process.env.DB_DATABASE || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
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
