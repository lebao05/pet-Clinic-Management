// frontend/src/features/branchManager/pages/VaccinationPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { Syringe, Search, Calendar, Heart, TrendingUp, User, Phone } from "lucide-react";

const VaccinationPage = () => {
  const branchId = 10;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pets"); // pets, vaccines, search

  // Pets vaccinated
  const [pets, setPets] = useState([]);
  const [petsTotal, setPetsTotal] = useState(0);

  // Top vaccines
  const [topVaccines, setTopVaccines] = useState([]);

  // Search vaccines
  const [searchTerm, setSearchTerm] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [vaccines, setVaccines] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (activeTab === "pets") fetchVaccinatedPets();
    else if (activeTab === "vaccines") fetchTopVaccines();
  }, [activeTab, dateRange]);

  const fetchVaccinatedPets = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getVaccinatedPets(branchId, dateRange.from, dateRange.to);
      setPets(res.data.pets || []);
      setPetsTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching vaccinated pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopVaccines = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getTopVaccines(branchId, dateRange.from, dateRange.to, 10);
      setTopVaccines(res.data.vaccines || []);
    } catch (error) {
      console.error("Error fetching top vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchVaccines = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.searchVaccines(branchId, searchTerm, manufacturer);
      setVaccines(res.data.vaccines || []);

      // Extract manufacturers
      const uniqueMfr = [...new Set(res.data.vaccines.map((v) => v.Manufacturer).filter(Boolean))];
      setManufacturers(uniqueMfr);
    } catch (error) {
      console.error("Error searching vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const tabs = [
    { id: "pets", label: "Thú cưng đã tiêm", icon: Heart },
    { id: "vaccines", label: "Top Vaccines", icon: TrendingUp },
    { id: "search", label: "Tra cứu Vaccine", icon: Search },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Syringe className="w-8 h-8 text-purple-600" />
          Quản lý Tiêm phòng
        </h1>
        <p className="text-gray-600 mt-1">Theo dõi lịch sử tiêm phòng và vaccine</p>
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
                    ? "text-purple-600 border-b-2 border-purple-600"
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
          {/* Date Range Filter */}
          {(activeTab === "pets" || activeTab === "vaccines") && (
            <div className="flex items-center gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Vaccinated Pets */}
          {activeTab === "pets" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Danh sách thú cưng đã tiêm ({petsTotal})</h3>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thú cưng</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chủ</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vaccine</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ngày tiêm</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Liều lượng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pets.map((pet) => (
                        <tr key={pet.PetID} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <div>
                                <div className="font-medium text-gray-900">{pet.PetName}</div>
                                <div className="text-sm text-gray-500">
                                  {pet.Species} • {pet.Breed}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{pet.ownerName}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {pet.ownerPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pet.VaccineName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pet.DateGiven)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{pet.Dose || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Top Vaccines */}
          {activeTab === "vaccines" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Top 10 Vaccine phổ biến</h3>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {topVaccines.map((vaccine, idx) => (
                    <div
                      key={vaccine.VaccineID}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Syringe className="w-6 h-6 text-purple-600" />
                        <span className="text-xs font-bold text-purple-600">#{idx + 1}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{vaccine.VaccineName}</h4>
                      <div className="text-sm text-gray-600 mb-2">{vaccine.Manufacturer}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-700">{vaccine.usageCount}</div>
                          <div className="text-xs text-purple-600">lần sử dụng</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-700">{vaccine.uniquePets}</div>
                          <div className="text-xs text-purple-600">thú cưng</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Vaccines */}
          {activeTab === "search" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm vaccine</label>
                  <input
                    type="text"
                    placeholder="Nhập tên vaccine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearchVaccines()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhà sản xuất</label>
                  <select
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tất cả</option>
                    {manufacturers.map((mfr, idx) => (
                      <option key={idx} value={mfr}>
                        {mfr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    onClick={handleSearchVaccines}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : vaccines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vaccines.map((vaccine) => (
                    <div
                      key={vaccine.VaccineID}
                      className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Syringe className="w-6 h-6 text-purple-600" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vaccine.IsActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {vaccine.IsActive ? "Hoạt động" : "Ngừng"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{vaccine.VaccineName}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium">NSX:</span> {vaccine.Manufacturer}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Liều:</span> {vaccine.DefaultDose || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Giá:</span> {formatCurrency(vaccine.DefaultPrice)}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Đã dùng:</span> {vaccine.usageCount} lần
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Syringe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nhập từ khóa để tìm kiếm vaccine</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationPage;
