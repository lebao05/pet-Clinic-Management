import axiosClient from "./axiosClient";

export const branchManagerApi = {
  getSummary: (branchId, date) => axiosClient.get(`/branch-manager/summary`, { params: { branchId, date } }),

  listStaff: (branchId, date) => axiosClient.get(`/branch-manager/staff`, { params: { branchId, date } }),

  createAssignment: (payload) => axiosClient.post(`/branch-manager/assignments`, payload),
  endAssignment: (assignmentId, endDate) =>
    axiosClient.patch(`/branch-manager/assignments/${assignmentId}/end`, { endDate }),

  listInventory: (branchId) => axiosClient.get(`/branch-manager/inventory`, { params: { branchId } }),
  updateInventory: (payload) => axiosClient.patch(`/branch-manager/inventory`, payload),

  listServices: (branchId) => axiosClient.get(`/branch-manager/services`, { params: { branchId } }),
  updateService: (payload) => axiosClient.patch(`/branch-manager/services`, payload),

  listAppointments: (params) => axiosClient.get(`/branch-manager/appointments`, { params }),

  listRatings: (params) => axiosClient.get(`/branch-manager/ratings`, { params }),
  revenueReport: (params) => axiosClient.get(`/branch-manager/revenue`, { params }),
};
