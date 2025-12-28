import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import userApi from "../../../api/userApi";
import { useAuth } from "../../../contexts/AuthContext";

const AppointmentBookingPage = () => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [branches, setBranches] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    branchId: "",
    petId: "",
    serviceId: "",
    doctorId: "",
    scheduleTime: "",
  });

  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchBranches();
    fetchPets();
  }, [userId]);

  useEffect(() => {
    if (formData.branchId) {
      fetchServices();
      fetchDoctors();
    }
  }, [formData.branchId]);

  const fetchBranches = async () => {
    try {
      const response = await userApi.getBranches();
      if (response.data.success) {
        setBranches(response.data.data || []);
        setError("");
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách chi nhánh");
      console.error(err);
    }
  };

  const fetchPets = async () => {
    try {
      if (!userId) {
        setError("Vui lòng đăng nhập để xem danh sách thú cưng");
        return;
      }
      console.log(`[AppointmentBookingPage] Fetching pets for userId: ${userId}`);
      const response = await userApi.getPets(userId);
      console.log(`[AppointmentBookingPage] Got pets:`, response.data);
      setPets(response.data.data || []);
    } catch (err) {
      console.error("Error fetching pets:", err);
      setError("Lỗi khi tải danh sách thú cưng");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    if (!formData.branchId) return;
    try {
      const response = await userApi.getServicesByBranch(formData.branchId);
      setServices(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    if (!formData.branchId) return;
    try {
      const response = await userApi.getDoctorsByBranch(formData.branchId);
      setDoctors(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const formatScheduleTime = (value) => {
    if (!value) return null;

    return value.length === 16 ? value + ":00" : value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "branchId" && { doctorId: "", serviceId: "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.branchId ||
      !formData.petId ||
      !formData.serviceId ||
      !formData.doctorId ||
      !formData.scheduleTime
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
        const data = {
        branchId: parseInt(formData.branchId),
        userId: parseInt(userId),
        petId: parseInt(formData.petId),
        serviceId: parseInt(formData.serviceId),
        doctorId: parseInt(formData.doctorId),
        scheduleTime: formatScheduleTime(formData.scheduleTime)
        }
        console.log(data)
      const response = await userApi.bookAppointment(data);
      if (response.data.success) {
        setBookingStatus({ type: "success", message: response.data.message });
        setFormData({
          branchId: "",
          petId: "",
          serviceId: "",
          doctorId: "",
          scheduleTime: "",
        });
      } else {
        setBookingStatus({ type: "error", message: response.data.message });
      }
    } 
catch (err) {
  const backendMessage =
    err.response?.data?.message || "Đặt lịch thất bại";

  setBookingStatus({
    type: "error",
    message: backendMessage,
  });
}
 finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div style={{ maxWidth: "768px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            color: "#b91c1c",
          }}
        >
          Vui lòng đăng nhập để đặt lịch khám
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "768px", margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginBottom: "32px",
        }}
      >
        Đặt lịch khám cho thú cưng
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {bookingStatus && (
        <div
          style={{
            backgroundColor: bookingStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${bookingStatus.type === "success" ? "#86efac" : "#fecaca"}`,
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
            color: bookingStatus.type === "success" ? "#166534" : "#b91c1c",
          }}
        >
          {bookingStatus.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "32px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Chọn chi nhánh */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="branchId"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Chi nhánh *
          </label>
          <select
            id="branchId"
            name="branchId"
            value={formData.branchId}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
            required
          >
            <option value="">Chọn chi nhánh</option>
            {branches.map((branch) => (
              <option key={branch.BranchID} value={branch.BranchID}>
                {branch.BranchName}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn thú cưng */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="petId"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Thú cưng *
          </label>
          <select
            id="petId"
            name="petId"
            value={formData.petId}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
            required
          >
            <option value="">Chọn thú cưng</option>
            {pets.map((pet) => (
              <option key={pet.PetID} value={pet.PetID}>
                {pet.PetName}
              </option>
            ))}
          </select>
          {pets.length === 0 && userId && (
            <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
              Bạn chưa có thú cưng nào. Hãy thêm thú cưng trước.
            </p>
          )}
        </div>

        {/* Chọn dịch vụ */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="serviceId"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Dịch vụ *
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleInputChange}
            disabled={!formData.branchId}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: !formData.branchId ? "#f3f4f6" : "#ffffff",
            }}
            required
          >
            <option value="">Chọn dịch vụ</option>
            {services.map((service) => (
              <option key={service.ServiceID} value={service.ServiceID}>
                {service.ServiceName}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn bác sĩ */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="doctorId"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Bác sĩ *
          </label>
          <select
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleInputChange}
            disabled={!formData.branchId}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: !formData.branchId ? "#f3f4f6" : "#ffffff",
            }}
            required
          >
            <option value="">Chọn bác sĩ</option>
            {doctors.map((doctor) => (
              <option key={doctor.EmployeeID} value={doctor.EmployeeID}>
                {doctor.FullName}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn thời gian */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="scheduleTime"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Thời gian khám *
          </label>
          <input
            type="datetime-local"
            id="scheduleTime"
            name="scheduleTime"
            value={formData.scheduleTime}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
            required
          />
        </div>

        {/* Nút đặt lịch */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "4px",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Đang xử lý..." : "Đặt lịch khám"}
        </button>
      </form>
    </div>
  );
};

export default AppointmentBookingPage;
