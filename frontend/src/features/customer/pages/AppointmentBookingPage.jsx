import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import userApi from "../../../api/userApi";

const AppointmentBookingPage = () => {
  const [userId] = useState(1);
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
    fetchBranches();
    fetchPets();
  }, []);

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
      const response = await userApi.getPets(userId);
      setPets(response.data.data || []);
    } catch (err) {
      console.error(err);
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
            border: "1px solid",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
            backgroundColor:
              bookingStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
            borderColor:
              bookingStatus.type === "success" ? "#86efac" : "#fecaca",
            color: bookingStatus.type === "success" ? "#166534" : "#b91c1c",
          }}
        >
          {bookingStatus.message}
        </div>
      )}

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "32px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {/* Branch Selection */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              <MapPin size={16} />
              Chọn chi nhánh *
            </label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleInputChange}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: formData.branchId ? "white" : "#f9fafb",
              }}
            >
              <option value="">-- Chọn chi nhánh --</option>
              {branches.map((branch) => (
                <option key={branch.BranchID} value={branch.BranchID}>
                  {branch.BranchName} ({branch.City})
                </option>
              ))}
            </select>
          </div>

          {/* Pet Selection */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              <User size={16} />
              Chọn thú cưng *
            </label>
            {loading ? (
              <div style={{ color: "#6b7280" }}>Đang tải...</div>
            ) : (
              <select
                name="petId"
                value={formData.petId}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: formData.petId ? "white" : "#f9fafb",
                }}
              >
                <option value="">-- Chọn thú cưng --</option>
                {pets.map((pet) => (
                  <option key={pet.PetID} value={pet.PetID}>
                    {pet.PetName} ({pet.Species})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Dịch vụ khám *
            </label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleInputChange}
              disabled={!formData.branchId}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: formData.serviceId ? "white" : "#f9fafb",
                opacity: formData.branchId ? 1 : 0.5,
                cursor: formData.branchId ? "pointer" : "not-allowed",
              }}
            >
              <option value="">
                {formData.branchId
                  ? "-- Chọn dịch vụ --"
                  : "-- Vui lòng chọn chi nhánh --"}
              </option>
              {services.map((service) => (
                <option key={service.ServiceID} value={service.ServiceID}>
                  {service.ServiceName}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              <User size={16} />
              Chọn bác sĩ *
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              disabled={!formData.branchId}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: formData.doctorId ? "white" : "#f9fafb",
                opacity: formData.branchId ? 1 : 0.5,
                cursor: formData.branchId ? "pointer" : "not-allowed",
              }}
            >
              <option value="">
                {formData.branchId
                  ? "-- Chọn bác sĩ --"
                  : "-- Vui lòng chọn chi nhánh --"}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.EmployeeID} value={doctor.EmployeeID}>
                  {doctor.FullName}
                </option>
              ))}
            </select>
          </div>

          {/* DateTime Selection */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              <Calendar size={16} />
              Ngày giờ khám *
            </label>
            <input
              type="datetime-local"
              name="scheduleTime"
              value={formData.scheduleTime}
              onChange={handleInputChange}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang xử lý..." : "Đặt lịch khám"}
          </button>
        </form>
      </div>

      {/* Appointment Tips */}
      <div
        style={{
          marginTop: "32px",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        <h3
          style={{
            fontWeight: "bold",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Clock size={20} />
          Lưu ý
        </h3>
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "14px",
            color: "#374151",
          }}
        >
          <li>• Vui lòng đến trước giờ khám 15 phút</li>
          <li>• Mang theo thẻ căn cước/CCCD của chủ thú cưng</li>
          <li>• Chuẩn bị tất cả các phác đồ tiêm chủng trước đó</li>
          <li>
            • Liên hệ chúng tôi để hủy/dời lịch ít nhất 24 giờ trước
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;
