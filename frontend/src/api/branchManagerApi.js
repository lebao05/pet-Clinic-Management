// frontend/src/api/branchManagerApi.js

import axiosClient from "./axiosClient";

const branchManagerApi = {
  // ============================================
  // 1. DASHBOARD
  // ============================================
  getDashboardSummary: (branchId, date) => {
    return axiosClient.get("/branch-manager/dashboard/summary", {
      params: { branchId, date },
    });
  },

  getRevenueChart: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/dashboard/revenue-chart", {
      params: { branchId, fromDate, toDate },
    });
  },

  getUrgentAlerts: (branchId) => {
    return axiosClient.get("/branch-manager/dashboard/alerts", {
      params: { branchId },
    });
  },

  // ============================================
  // 2. DOANH THU
  // ============================================
  getRevenueByPeriod: (branchId, period, year) => {
    return axiosClient.get("/branch-manager/revenue/by-period", {
      params: { branchId, period, year },
    });
  },

  getRevenueByDoctor: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/revenue/by-doctor", {
      params: { branchId, fromDate, toDate },
    });
  },

  getProductSales: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/revenue/product-sales", {
      params: { branchId, fromDate, toDate },
    });
  },

  // ============================================
  // 3. TIÊM PHÒNG
  // ============================================
  getVaccinatedPets: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/vaccination/pets", {
      params: { branchId, fromDate, toDate },
    });
  },

  getTopVaccines: (branchId, fromDate, toDate, limit = 5) => {
    return axiosClient.get("/branch-manager/vaccination/top-vaccines", {
      params: { branchId, fromDate, toDate, limit },
    });
  },

  searchVaccines: (branchId, searchTerm, manufacturer) => {
    return axiosClient.get("/branch-manager/vaccination/search", {
      params: { branchId, searchTerm, manufacturer },
    });
  },

  // ============================================
  // 4. TỒN KHO
  // ============================================
  getInventory: (branchId) => {
    return axiosClient.get("/branch-manager/inventory", {
      params: { branchId },
    });
  },

  updateInventory: (data) => {
    return axiosClient.put("/branch-manager/inventory/update", data);
  },

  // ============================================
  // 5. LỊCH HẸN
  // ============================================
  getAppointments: (branchId, fromDate, toDate, status) => {
    return axiosClient.get("/branch-manager/appointments", {
      params: { branchId, fromDate, toDate, status },
    });
  },

  getExamStatistics: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/appointments/statistics", {
      params: { branchId, fromDate, toDate },
    });
  },

  // ============================================
  // 6. NHÂN VIÊN
  // ============================================
  getBranchStaff: (branchId) => {
    return axiosClient.get("/branch-manager/staff", {
      params: { branchId },
    });
  },

  getStaffPerformance: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/staff/performance", {
      params: { branchId, fromDate, toDate },
    });
  },

  // ============================================
  // 7. KHÁCH HÀNG
  // ============================================
  getCustomerStatistics: (branchId, days = 90) => {
    return axiosClient.get("/branch-manager/customers/statistics", {
      params: { branchId, days },
    });
  },

  // ============================================
  // 8. ĐÁNH GIÁ
  // ============================================
  getRatings: (branchId, fromDate, toDate) => {
    return axiosClient.get("/branch-manager/ratings", {
      params: { branchId, fromDate, toDate },
    });
  },

  // ============================================
  // 9. HỒ SƠ BỆNH ÁN
  // ============================================
  searchPets: (branchId, searchTerm) => {
    return axiosClient.get("/branch-manager/medical/search-pets", {
      params: { branchId, searchTerm },
    });
  },

  getPetMedicalHistory: (petId, branchId) => {
    return axiosClient.get("/branch-manager/medical/pet-history", {
      params: { petId, branchId },
    });
  },
};

export default branchManagerApi;
