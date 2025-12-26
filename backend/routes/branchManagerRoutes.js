const express = require("express");
const router = express.Router();
const branchManagerController = require("../controllers/branchManagerController");

// ==================== DASHBOARD ====================
/**
 * GET /api/branch-manager/summary
 * Lấy tổng quan dashboard: doanh thu hôm nay, nhân viên, hàng tồn kho
 */
router.get("/summary", branchManagerController.getSummary);

// ==================== STAFF ====================
/**
 * GET /api/branch-manager/staff
 * Lấy danh sách nhân viên đang làm việc tại chi nhánh
 */
router.get("/staff", branchManagerController.listStaff);

/**
 * POST /api/branch-manager/assignments
 * Gán nhân viên vào chi nhánh
 */
router.post("/assignments", branchManagerController.createAssignment);

/**
 * PATCH /api/branch-manager/assignments/:id/end
 * Kết thúc gán việc của nhân viên
 */
router.patch("/assignments/:id/end", branchManagerController.endAssignment);

// ==================== INVENTORY ====================
/**
 * GET /api/branch-manager/inventory
 * Lấy danh sách hàng tồn kho theo chi nhánh
 */
router.get("/inventory", branchManagerController.listInventory);

/**
 * PATCH /api/branch-manager/inventory
 * Cập nhật số lượng và giá bán sản phẩm
 */
router.patch("/inventory", branchManagerController.updateInventory);

// ==================== SERVICES ====================
/**
 * GET /api/branch-manager/services
 * Lấy danh sách dịch vụ tại chi nhánh
 */
router.get("/services", branchManagerController.listServices);

/**
 * PATCH /api/branch-manager/services
 * Cập nhật giá dịch vụ và trạng thái
 */
router.patch("/services", branchManagerController.updateService);

// ==================== APPOINTMENTS ====================
/**
 * GET /api/branch-manager/appointments
 * Lấy danh sách lịch hẹn theo khoảng thời gian
 */
router.get("/appointments", branchManagerController.listAppointments);

// ==================== RATINGS ====================
/**
 * GET /api/branch-manager/ratings
 * Lấy đánh giá của khách hàng
 */
router.get("/ratings", branchManagerController.listRatings);

// ==================== REPORTS ====================
/**
 * GET /api/branch-manager/revenue
 * Báo cáo doanh thu theo ngày
 */
router.get("/revenue", branchManagerController.revenueReport);

module.exports = router;
