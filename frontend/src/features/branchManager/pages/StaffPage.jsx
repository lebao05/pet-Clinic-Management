// frontend/src/features/branchManager/pages/StaffPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { useBranch } from "../../../hooks/useBranch";
import { Users, TrendingUp, DollarSign, Star, Calendar, RefreshCw, Award } from "lucide-react";

const StaffPage = () => {
  const { branchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list"); // list, performance
  const [staff, setStaff] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (activeTab === "list") fetchStaff();
    else fetchPerformance();
  }, [activeTab, dateRange]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getBranchStaff(branchId);
      setStaff(res.data.staff || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getStaffPerformance(branchId, dateRange.from, dateRange.to);
      setPerformance(res.data.performance || []);
    } catch (error) {
      console.error("Error fetching performance:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getRoleBadge = (role) => {
    const config = {
      Doctor: { bg: "bg-blue-100", text: "text-blue-800", label: "Bác sĩ" },
      Receptionist: { bg: "bg-purple-100", text: "text-purple-800", label: "Lễ tân" },
      Cashier: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Thu ngân" },
      Manager: { bg: "bg-amber-100", text: "text-amber-800", label: "Quản lý" },
    };
    const c = config[role] || { bg: "bg-gray-100", text: "text-gray-800", label: role };
    return <span className={`${c.bg} ${c.text} px-3 py-1 rounded-full text-sm font-medium`}>{c.label}</span>;
  };

  const tabs = [
    { id: "list", label: "Danh sách", icon: Users },
    { id: "performance", label: "Hiệu suất", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Quản lý Nhân viên
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi nhân sự và hiệu suất làm việc</p>
        </div>
        <button
          onClick={() => (activeTab === "list" ? fetchStaff() : fetchPerformance())}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Staff List */}
          {activeTab === "list" && (
            <div>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <div
                      key={member.EmployeeID}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl">
                          {member.FullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{member.FullName}</h3>
                          <div className="mt-1">{getRoleBadge(member.Role)}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Sinh: {formatDate(member.DateOfBirth)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Lương: {formatCurrency(member.BaseSalary)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Vào làm: {formatDate(member.StartDate)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            member.WorkStatus === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.WorkStatus === "Active" ? "Đang làm việc" : "Nghỉ việc"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Performance */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nhân viên</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chức vụ</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Doanh thu
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          Đánh giá
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {performance.map((perf, idx) => (
                        <tr key={perf.EmployeeID} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {idx < 3 && (
                                <Award
                                  className={`w-5 h-5 ${
                                    idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-400" : "text-amber-600"
                                  }`}
                                />
                              )}
                              <div className="font-medium text-gray-900">{perf.FullName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getRoleBadge(perf.Role)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-gray-900">{perf.totalOrders}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-emerald-700">
                            {formatCurrency(perf.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {perf.avgRating ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold text-gray-900">{perf.avgRating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">({perf.ratingCount})</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Chưa có</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
