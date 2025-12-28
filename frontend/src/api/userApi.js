import axiosClient from "./axiosClient";

const userApi = {
  // Đăng ký
  register: (userData) => {
    return axiosClient.post("/user/register", userData);
  },

  // Đăng nhập
  login: (phone, password) => {
    return axiosClient.post("/user/login", { phone, password });
  },

  // Lấy danh sách chi nhánh
  getBranches: () => {
    return axiosClient.get("/user/branches");
  },

  // Tìm kiếm sản phẩm
  searchProducts: (branchId, name) => {
    return axiosClient.get("/user/products/search", {
      params: { branchId, name },
    });
  },

  // Tra cứu dịch vụ
  getServicesByBranch: (branchId) => {
    return axiosClient.get(`/user/services/${branchId}`);
  },

  // Tra cứu bác sĩ
  getDoctorsByBranch: (branchId) => {
    return axiosClient.get(`/user/doctors/${branchId}`);
  },

  // Tìm kiếm bác sĩ theo tên
  searchDoctors: (branchId, name) => {
    return axiosClient.get(`/user/doctors/search/${branchId}`, {
      params: { name },
    });
  },

  // Lấy lịch của bác sĩ
  getDoctorSchedule: (doctorId, date) => {
    return axiosClient.get(`/user/doctors/schedule/${doctorId}`, {
      params: { date },
    });
  },

  // Lấy các khung giờ trống của bác sĩ
  getDoctorAvailableSlots: (doctorId, date, branchId) => {
    return axiosClient.get(`/user/doctors/available-slots/${doctorId}`, {
      params: { date, branchId },
    });
  },

  // Đặt lịch khám
  bookAppointment: (data) => {
    return axiosClient.post("/user/book", data);
  },

  // Đặt mua sản phẩm
  checkout: (data) => {
    return axiosClient.post("/user/checkout", data);
  },

  // Xem lịch sử
  getHistory: (userId) => {
    return axiosClient.get(`/user/history/${userId}`);
  },

  // Lấy pets của user
  getPets: (userId) => {
    return axiosClient.get(`/user/${userId}/pets`);
  },

  // Thêm pet mới
  createPet: (userId, petData) => {
    return axiosClient.post(`/user/${userId}/pets`, petData);
  },

  // Lấy appointments của user
  getAppointments: (userId) => {
    return axiosClient.get(`/user/${userId}/appointments`);
  },
};

export default userApi;
