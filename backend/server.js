// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const { getConnection } = require("./config/database");
getConnection()
  .then(() => console.log("✅ Database sẵn sàng!\n"))
  .catch((err) => {
    console.error("❌ Lỗi database:", err.message);
    process.exit(1);
  });

// Import routes
// const userRoutes = require("./routes/userRoutes");
// const petRoutes = require("./routes/petRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");
const companyOwnerRoutes = require("./routes/companyOwnerRoute");
<<<<<<< HEAD
const branchManagerRoutes = require("./routes/branchManagerRoutes");

=======
// Demo staff portals (simple)
const doctorRoutes = require("./routes/doctorRoutes");
const cashierRoutes = require("./routes/cashierRoutes");
>>>>>>> Duy
// Use routes
// app.use("/api/users", userRoutes);
// app.use("/api/pets", petRoutes);
// app.use("/api/appointments", appointmentRoutes);
app.use("/api/company-owner", companyOwnerRoutes);
<<<<<<< HEAD
app.use("/api/branch-manager", branchManagerRoutes);
=======
app.use("/api/doctor", doctorRoutes);
app.use("/api/cashier", cashierRoutes);
>>>>>>> Duy
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "PetCareX API v1.0",
    status: "Running",
    endpoints: {
      users: "/api/users",
      pets: "/api/pets",
      appointments: "/api/appointments",
      doctor: "/api/doctor",
      cashier: "/api/cashier",
      health: "/api/health",
    },
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT 1 AS Test");

    res.json({
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: err.message,
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint không tồn tại",
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║           PETCAREX API SERVER                             ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`\n👥 USERS:`);
  console.log(`   GET    /api/users                  - Lấy tất cả users`);
  console.log(`   GET    /api/users/:id              - Lấy user theo ID`);
  console.log(`   POST   /api/users                  - Tạo user mới`);
  console.log(`   PUT    /api/users/:id              - Cập nhật user`);
  console.log(`   DELETE /api/users/:id              - Xóa user`);
  console.log(`   GET    /api/users/:id/pets         - Lấy pets của user`);
  console.log(`   GET    /api/users/:id/appointments - Lấy lịch hẹn của user`);
  console.log(`\n🐾 PETS:`);
  console.log(`   GET    /api/pets                   - Lấy tất cả pets`);
  console.log(`   GET    /api/pets/:id               - Lấy pet theo ID`);
  console.log(`   POST   /api/pets                   - Tạo pet mới`);
  console.log(`   PUT    /api/pets/:id               - Cập nhật pet`);
  console.log(`   DELETE /api/pets/:id               - Xóa pet`);
  console.log(`   GET    /api/pets/:id/medical-history - Lịch sử khám`);
  console.log(`\n📅 APPOINTMENTS:`);
  console.log(`   GET    /api/appointments           - Lấy tất cả appointments`);
  console.log(`   GET    /api/appointments/:id       - Lấy appointment theo ID`);
  console.log(`   POST   /api/appointments           - Tạo appointment`);
  console.log(`   PUT    /api/appointments/:id       - Cập nhật appointment`);
  console.log(`   DELETE /api/appointments/:id       - Hủy appointment`);
  console.log(`   GET    /api/appointments/date/:date - Lấy theo ngày`);
  console.log(`\n💊 HEALTH CHECK:`);
  console.log(`   GET    /api/health                 - Kiểm tra server`);
  console.log("\n═══════════════════════════════════════════════════════════\n");
});
