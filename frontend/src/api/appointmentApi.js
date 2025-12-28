import axiosClient from "./axiosClient";

const appointmentApi = {
  // Lấy danh sách appointments của user
  getByUserId: (userId) => {
    return axiosClient.get(`/appointments/user/${userId}`);
  },

  // Tạo appointment mới
  create: (appointmentData) => {
    return axiosClient.post("/appointments", appointmentData);
  },

  // Cập nhật appointment
  update: (id, appointmentData) => {
    return axiosClient.put(`/appointments/${id}`, appointmentData);
  },

  // Hủy appointment
  cancel: (id) => {
    return axiosClient.delete(`/appointments/${id}`);
  },
};

export default appointmentApi;