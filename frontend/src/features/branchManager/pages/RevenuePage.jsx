// frontend/src/features/branchManager/pages/RevenuePage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { DollarSign, TrendingUp, Users, Package, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RevenuePage = () => {
  const branchId = 10;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("period"); // period, doctor, product

  // Period revenue
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [periodData, setPeriodData] = useState([]);

  // Doctor revenue
  const [doctorData, setDoctorData] = useState([]);

  // Product sales
  const [productData, setProductData] = useState([]);
  const [productSummary, setProductSummary] = useState(null);

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (activeTab === "period") fetchPeriodRevenue();
    else if (activeTab === "doctor") fetchDoctorRevenue();
    else if (activeTab === "product") fetchProductSales();
  }, [activeTab, period, year, dateRange]);

  const fetchPeriodRevenue = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getRevenueByPeriod(branchId, period, year);
      setPeriodData(res.data.items || []);
    } catch (error) {
      console.error("Error fetching period revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorRevenue = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getRevenueByDoctor(branchId, dateRange.from, dateRange.to);
      setDoctorData(res.data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctor revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSales = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getProductSales(branchId, dateRange.from, dateRange.to);
      setProductData(res.data.products || []);
      setProductSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching product sales:", error);
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

  const getPeriodLabel = (value) => {
    if (period === "month") {
      const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      return months[value - 1] || value;
    }
    if (period === "quarter") return `Q${value}`;
    return value;
  };

  const tabs = [
    { id: "period", label: "Theo kỳ", icon: Calendar },
    { id: "doctor", label: "Theo bác sĩ", icon: Users },
    { id: "product", label: "Bán hàng", icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-600" />
          Báo cáo Doanh thu
        </h1>
        <p className="text-gray-600 mt-1">Phân tích doanh thu chi tiết</p>
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
                    ? "text-blue-600 border-b-2 border-blue-600"
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
          {/* Period Revenue */}
          {activeTab === "period" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ báo cáo</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="month">Theo tháng</option>
                    <option value="quarter">Theo quý</option>
                    <option value="year">Theo năm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tickFormatter={(value) => getPeriodLabel(value)} stroke="#6b7280" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="#6b7280" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Doctor Revenue */}
          {activeTab === "doctor" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorData.map((doctor) => (
                    <div
                      key={doctor.EmployeeID}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                          {doctor.doctorName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.doctorName}</h3>
                          <p className="text-sm text-gray-600">{doctor.appointmentCount} lượt khám</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{formatCurrency(doctor.serviceRevenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Sales */}
          {activeTab === "product" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {productSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-6">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Tổng doanh thu</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">
                      {formatCurrency(productSummary.totalProductRevenue)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Package className="w-5 h-5" />
                      <span className="text-sm font-medium">Tổng đơn hàng</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{productSummary.totalOrders}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Loại</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Đã bán</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Doanh thu
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productData.map((product, idx) => (
                        <tr key={product.ProductID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{product.ProductName}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.ProductType}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {product.totalQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(product.totalRevenue)}
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

export default RevenuePage;
