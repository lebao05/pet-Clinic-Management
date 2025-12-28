// frontend/src/features/branchManager/pages/AppointmentsPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Heart,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const AppointmentsPage = () => {
  const branchId = 10;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchAppointments();
  }, [dateRange, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getAppointments(branchId, dateRange.from, dateRange.to, statusFilter);
      setAppointments(res.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const config = {
      Scheduled: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "Đã đặt" },
      Completed: { bg: "bg-emerald-100", text: "text-emerald-800", icon: CheckCircle, label: "Hoàn thành" },
      Cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "Đã hủy" },
    };
    const c = config[status] || config.Scheduled;
    const Icon = c.icon;
    return (
      <span className={`${c.bg} ${c.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1`}>
        <Icon className="w-4 h-4" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Quản lý Lịch hẹn
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi lịch hẹn khám bệnh</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="Scheduled">Đã đặt</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Danh sách lịch hẹn ({appointments.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có lịch hẹn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thú cưng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dịch vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bác sĩ</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.AppointmentID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {formatDateTime(apt.ScheduleTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User className="w-4 h-4 text-gray-500" />
                          {apt.CustomerName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="w-3 h-3" />
                          {apt.Phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <div>
                          <div className="font-medium text-gray-900">{apt.PetName}</div>
                          <div className="text-sm text-gray-500">{apt.Species}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{apt.ServiceName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{apt.DoctorName || "Chưa phân công"}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(apt.Status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
