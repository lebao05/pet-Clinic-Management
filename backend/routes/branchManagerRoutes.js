// backend/src/routes/branchManagerRoutes.js

const express = require("express");
const router = express.Router();
const branchManagerController = require("../controllers/branchManagerController");

// ============================================
// 1. DASHBOARD
// ============================================

// 📊 Dashboard Summary
router.get("/dashboard/summary", branchManagerController.getDashboardSummary);

// 📈 Revenue Chart
router.get("/dashboard/revenue-chart", branchManagerController.getRevenueChart);

// 🔔 Urgent Alerts
router.get("/dashboard/alerts", branchManagerController.getUrgentAlerts);

// ============================================
// 2. DOANH THU - REVENUE
// ============================================

// 💰 Doanh thu theo kỳ (tháng/quý/năm)
router.get("/revenue/by-period", branchManagerController.getRevenueByPeriod);

// 👨‍⚕️ Doanh thu theo bác sĩ
router.get("/revenue/by-doctor", branchManagerController.getRevenueByDoctor);

// 📦 Doanh thu bán sản phẩm
router.get("/revenue/product-sales", branchManagerController.getProductSales);

// ============================================
// 3. TIÊM PHÒNG - VACCINATION
// ============================================

// 💉 Danh sách thú cưng đã tiêm phòng
router.get("/vaccination/pets", branchManagerController.getVaccinatedPets);

// 🏆 Top vaccines được sử dụng nhiều nhất
router.get("/vaccination/top-vaccines", branchManagerController.getTopVaccines);

// 🔍 Tra cứu vaccine
router.get("/vaccination/search", branchManagerController.searchVaccines);

// ============================================
// 4. TỒN KHO - INVENTORY
// ============================================

// 📦 Danh sách tồn kho
router.get("/inventory", branchManagerController.getInventory);

// 📝 Cập nhật tồn kho
router.put("/inventory/update", branchManagerController.updateInventory);

// ============================================
// 5. LỊCH HẸN - APPOINTMENTS
// ============================================

// 📅 Danh sách lịch hẹn
router.get("/appointments", branchManagerController.getAppointments);

// 📊 Thống kê khám bệnh
router.get("/appointments/statistics", branchManagerController.getExamStatistics);

// ============================================
// 6. NHÂN VIÊN - STAFF
// ============================================

// 👥 Danh sách nhân viên chi nhánh
router.get("/staff", branchManagerController.getBranchStaff);

// 📈 Hiệu suất nhân viên
router.get("/staff/performance", branchManagerController.getStaffPerformance);

// ============================================
// 7. KHÁCH HÀNG - CUSTOMERS
// ============================================

// 📊 Thống kê khách hàng
router.get("/customers/statistics", branchManagerController.getCustomerStatistics);

// ============================================
// 8. ĐÁNH GIÁ - RATINGS
// ============================================

// ⭐ Danh sách đánh giá
router.get("/ratings", branchManagerController.getRatings);

// ============================================
// 9. HỒ SƠ BỆNH ÁN - MEDICAL HISTORY
// ============================================

// 🔍 Tìm kiếm thú cưng
router.get("/medical/search-pets", branchManagerController.searchPets);

// 📋 Hồ sơ bệnh án thú cưng
router.get("/medical/pet-history", branchManagerController.getPetMedicalHistory);

// ============================================
// TEST ROUTE
// ============================================

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Branch Manager API is working! ✅",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
