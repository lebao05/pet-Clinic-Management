import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Heart } from "lucide-react";
import userApi from "../../../api/userApi";
import { useAuth } from "../../../contexts/AuthContext";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();

  const userId = user?.userId;

  useEffect(() => {
    if (isAuthenticated && userId) {
      console.log("Fetching appointments for userId:", userId);
      fetchAppointments();
    } else {
      console.log("User not authenticated or no userId");
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log("Calling API with userId:", userId);
      const response = await userApi.getAppointments(userId);
      console.log("API response:", response);
      if (response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        setError("Không thể tải danh sách cuộc hẹn");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Lỗi khi tải danh sách cuộc hẹn");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Vui lòng đăng nhập để xem cuộc hẹn</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cuộc hẹn của tôi</h1>
        <p className="text-gray-600">Quản lý các cuộc hẹn đã đặt</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có cuộc hẹn nào</h3>
          <p className="text-gray-600">Bạn chưa đặt lịch hẹn nào. Hãy đặt lịch để chăm sóc thú cưng của bạn!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.AppointmentID}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-gray-900">
                    {formatDate(appointment.ScheduleTime)}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.Status
                  )}`}
                >
                  {appointment.Status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatTime(appointment.ScheduleTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{appointment.BranchName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{appointment.PetName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{appointment.DoctorName || "Chưa chỉ định"}</span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{appointment.ServiceName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;