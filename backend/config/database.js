// config/database.js
const sql = require("mssql");

const config = {
  server: "localhost",
  database: "PetCareX_Optimized",
  user: "sa",
  password: "123456",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: "SQLEXPRESS",
    useUTC: false,
    // ← Thêm dòng này
    cryptoCredentialsDetails: {
      minVersion: "TLSv1",
    },
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
      console.log("🔄 Đang kết nối SQL Server...");
      console.log("   Server: localhost");
      console.log("   Instance: SQLEXPRESS");
      console.log("   Database: PetCareX_Optimized");
      console.log("   User: sa");
      console.log("");

      pool = await sql.connect(config);

      // Set UTF-8 encoding
      await pool.request().query("SET TEXTSIZE 2147483647");

      const result = await pool.request().query("SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DB");
      console.log("✅ KẾT NỐI THÀNH CÔNG!");
      console.log("   Server thực tế:", result.recordset[0].ServerName);
      console.log("   Database:", result.recordset[0].DB);
      console.log("");
    }
    return pool;
  } catch (err) {
    console.error("❌ LỖI KẾT NỐI DATABASE!");
    console.error("   Error:", err.message);
    throw err;
  }
}

module.exports = { getConnection, sql };
