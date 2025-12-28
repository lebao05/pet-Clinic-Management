// frontend/src/features/branchManager/pages/MedicalHistoryPage.jsx

import React, { useState } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { useBranch } from "../../../hooks/useBranch";
import { Heart, Search, Calendar, Syringe, FileText, User, Phone, Stethoscope } from "lucide-react";

const MedicalHistoryPage = () => {
  const { branchId } = useBranch();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Vui lòng nhập tên thú cưng hoặc chủ");
      return;
    }

    try {
      setSearching(true);
      const res = await branchManagerApi.searchPets(branchId, searchTerm);
      setSearchResults(res.data.pets || []);
      setSelectedPet(null);
      setMedicalHistory(null);
    } catch (error) {
      console.error("Error searching pets:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleViewHistory = async (pet) => {
    try {
      setLoading(true);
      setSelectedPet(pet);
      const res = await branchManagerApi.getPetMedicalHistory(pet.PetID, branchId);
      setMedicalHistory(res.data.data);
    } catch (error) {
      console.error("Error fetching medical history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-pink-600" />
          Hồ sơ Bệnh án Thú cưng
        </h1>
        <p className="text-gray-600 mt-1">Tra cứu lịch sử khám bệnh và điều trị</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên thú cưng hoặc tên chủ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Search className="w-5 h-5" />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Kết quả tìm kiếm ({searchResults.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {searchResults.map((pet) => (
              <div
                key={pet.PetID}
                onClick={() => handleViewHistory(pet)}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{pet.PetName}</h3>
                    <p className="text-sm text-gray-600">
                      {pet.Species} • {pet.Breed || "N/A"}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{pet.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{pet.ownerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Sinh: {formatDate(pet.BirthDate)}</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
                  Xem hồ sơ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical History */}
      {selectedPet && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Pet Info Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPet.PetName}</h2>
                <p className="text-gray-600">
                  {selectedPet.Species} • {selectedPet.Breed || "N/A"} • {selectedPet.Gender}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Chủ: {selectedPet.ownerName}</span>
                  <span>•</span>
                  <span>SĐT: {selectedPet.ownerPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              </div>
            ) : medicalHistory ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Stethoscope className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{medicalHistory.totalAppointments || 0}</p>
                    <p className="text-sm text-blue-600">Lịch hẹn</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <Syringe className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="text-2xl font-bold text-emerald-700">{medicalHistory.totalVaccinations || 0}</p>
                    <p className="text-sm text-emerald-600">Vắc-xin</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <FileText className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{medicalHistory.totalPrescriptions || 0}</p>
                    <p className="text-sm text-purple-600">Đơn thuốc</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <Calendar className="w-5 h-5 text-amber-600 mb-2" />
                    <p className="text-sm font-bold text-amber-700">{formatDate(medicalHistory.lastVisit)}</p>
                    <p className="text-sm text-amber-600">Lần khám cuối</p>
                  </div>
                </div>

                {/* Appointments */}
                {medicalHistory.appointments?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      Lịch sử khám bệnh ({medicalHistory.appointments.length})
                    </h3>
                    <div className="space-y-4">
                      {medicalHistory.appointments.map((apt) => (
                        <div key={apt.AppointmentID} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-gray-900">{apt.ServiceName}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                {formatDateTime(apt.ScheduleTime)}
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                apt.Status === "Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {apt.Status === "Completed" ? "Hoàn thành" : "Đã đặt"}
                            </span>
                          </div>

                          {apt.Diagnosis && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Chẩn đoán:</span>
                              <p className="text-sm text-gray-600 mt-1">{apt.Diagnosis}</p>
                            </div>
                          )}

                          {apt.Prescription && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Đơn thuốc:</span>
                              <p className="text-sm text-gray-600 mt-1">{apt.Prescription}</p>
                            </div>
                          )}

                          <div className="text-sm text-gray-600">Bác sĩ: {apt.DoctorName || "N/A"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vaccinations */}
                {medicalHistory.vaccinations?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Syringe className="w-5 h-5 text-gray-600" />
                      Lịch sử tiêm phòng ({medicalHistory.vaccinations.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Vắc-xin
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Ngày tiêm
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Ngày tiêm tiếp
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Liều lượng
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {medicalHistory.vaccinations.map((vacc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{vacc.VaccineName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(vacc.DateGiven)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(vacc.NextDueDate) || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vacc.Dose || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && searchResults.length === 0 && !selectedPet && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tìm kiếm hồ sơ thú cưng</h3>
          <p className="text-gray-600">Nhập tên thú cưng hoặc tên chủ để xem hồ sơ bệnh án</p>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;
