// frontend/src/features/branchManager/pages/CustomersPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { useBranch } from "../../../hooks/useBranch";
import { Users, TrendingUp, AlertCircle, Calendar, Phone, DollarSign } from "lucide-react";

const CustomersPage = () => {
  const { branchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [inactiveCustomers, setInactiveCustomers] = useState([]);
  const [days, setDays] = useState(90);

  useEffect(() => {
    fetchStatistics();
  }, [days]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getCustomerStatistics(branchId, days);
      setStatistics(res.data.summary);
      setInactiveCustomers(res.data.inactiveCustomers || []);
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-600" />
          Thống kê Khách hàng
        </h1>
        <p className="text-gray-600 mt-1">Phân tích hành vi và xu hướng khách hàng</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Khách hàng không quay lại trong:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value={30}>30 ngày</option>
            <option value={60}>60 ngày</option>
            <option value={90}>90 ngày</option>
            <option value={180}>180 ngày</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 opacity-80" />
              <div>
                <div className="text-3xl font-bold">{statistics.totalCustomers}</div>
                <div className="text-sm opacity-90">Tổng khách hàng</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-12 h-12 opacity-80" />
              <div>
                <div className="text-3xl font-bold">{statistics.activeCustomers}</div>
                <div className="text-sm opacity-90">Khách hoạt động</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-12 h-12 opacity-80" />
              <div>
                <div className="text-3xl font-bold">{statistics.inactiveCustomers}</div>
                <div className="text-sm opacity-90">Lâu chưa quay lại</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <DollarSign className="w-12 h-12 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(statistics.avgSpentPerCustomer)}</div>
                <div className="text-sm opacity-90">Chi tiêu TB/KH</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Customers */}
      {inactiveCustomers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Khách hàng lâu chưa quay lại (Top 10)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Những khách hàng không quay lại trong {days} ngày qua</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lần cuối đến</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Số ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inactiveCustomers.map((customer) => (
                  <tr key={customer.UserID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.FullName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {customer.Phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(customer.lastVisit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {customer.daysSinceLastVisit} ngày
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
