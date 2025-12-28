// frontend/src/features/branchManager/pages/RatingsPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { useBranch } from "../../../hooks/useBranch";
import { Star, TrendingUp, MessageSquare, User, Calendar, RefreshCw } from "lucide-react";

const RatingsPage = () => {
  const { branchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchRatings();
  }, [dateRange]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getRatings(branchId, dateRange.from, dateRange.to);
      setRatings(res.data.ratings || []);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const renderStars = (score) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < score ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            Đánh giá Khách hàng
          </h1>
          <p className="text-gray-600 mt-1">Xem và phân tích đánh giá từ khách hàng</p>
        </div>
        <button
          onClick={fetchRatings}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <Star className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-4xl font-bold mb-2">{(summary.avgOverall || 0).toFixed(1)}</div>
            <div className="text-sm opacity-90">Điểm trung bình</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <MessageSquare className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-4xl font-bold mb-2">{summary.total}</div>
            <div className="text-sm opacity-90">Tổng đánh giá</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-4xl font-bold mb-2">{(summary.avgService || 0).toFixed(1)}</div>
            <div className="text-sm opacity-90">Chất lượng dịch vụ</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <User className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-4xl font-bold mb-2">{(summary.avgAttitude || 0).toFixed(1)}</div>
            <div className="text-sm opacity-90">Thái độ phục vụ</div>
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Danh sách đánh giá ({ratings.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating.RatingID} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{rating.CustomerName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateTime(rating.RatingDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.OverallScore)}
                        <span className="text-lg font-bold text-gray-900">{rating.OverallScore.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Dịch vụ:</span>
                        {renderStars(rating.ServiceScore)}
                        <span className="font-medium">{rating.ServiceScore.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Thái độ:</span>
                        {renderStars(rating.AttitudeScore)}
                        <span className="font-medium">{rating.AttitudeScore.toFixed(1)}</span>
                      </div>
                    </div>

                    {rating.Comment && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          Nhận xét:
                        </div>
                        <p className="text-gray-900">"{rating.Comment}"</p>
                      </div>
                    )}

                    {rating.EmployeeName && (
                      <div className="mt-2 text-sm text-gray-600">
                        Nhân viên: <span className="font-medium">{rating.EmployeeName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;
