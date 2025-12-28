import React, { useState, useEffect } from "react";
import { Search, Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import userApi from "../../../api/userApi";

const DoctorSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const doctorsPerPage = 6;

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showDialog) {
        closeDialog();
      }
    };

    if (showDialog) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDialog]);

  const fetchBranches = async () => {
    try {
      const response = await userApi.getBranches();
      if (response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách chi nhánh");
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!branchId) {
      setError("Vui lòng chọn chi nhánh");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCurrentPage(1);
      const response = await userApi.getDoctorsByBranch(parseInt(branchId));
      if (response.data.success) {
        let doctorsData = response.data.data || [];
        // Filter by name if search term is provided
        if (searchTerm.trim()) {
          doctorsData = doctorsData.filter(doctor =>
            doctor.FullName.toLowerCase().includes(searchTerm.toLowerCase().trim())
          );
        }
        setDoctors(doctorsData);
        // Set selected branch for working hours
        const branch = branches.find(b => b.BranchID == branchId);
        setSelectedBranch(branch);
      } else {
        setError(response.data.message || "Không tìm thấy bác sĩ");
        setDoctors([]);
      }
    } catch (err) {
      setError("Lỗi khi tìm kiếm bác sĩ");
      console.error(err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = async (doctor) => {
    setSelectedDoctor(doctor);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Load existing appointments
      const scheduleResponse = await userApi.getDoctorSchedule(doctor.EmployeeID, today);
      if (scheduleResponse.data.success) {
        setDoctorSchedule(scheduleResponse.data.data);
      } else {
        setDoctorSchedule([]);
      }

      // // Load available time slots
      // if (selectedBranch) {
      //   const slotsResponse = await userApi.getDoctorAvailableSlots(doctor.EmployeeID, today, selectedBranch.BranchID);
      //   if (slotsResponse.data.success) {
      //     setAvailableSlots(slotsResponse.data.data);
      //   } else {
      //     setAvailableSlots([]);
      //   }
      // } else {
      //   setAvailableSlots([]);
      // }
    } catch (err) {
      console.error("Lỗi khi tải lịch bác sĩ", err);
      setDoctorSchedule([]);
      // setAvailableSlots([]);
    }
    setShowDialog(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);
  const startIndex = (currentPage - 1) * doctorsPerPage;
  const endIndex = startIndex + doctorsPerPage;
  const currentDoctors = doctors.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedDoctor(null);
    setDoctorSchedule([]);
    setAvailableSlots([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Tra cứu lịch bác sĩ
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn chi nhánh
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bác sĩ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên bác sĩ..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Doctors List */}
        {doctors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách bác sĩ ({doctors.length} kết quả)
              </h2>
              {selectedBranch && (
                <div className="text-sm text-gray-600">
                  Giờ làm việc: {selectedBranch.OpenTime} - {selectedBranch.CloseTime}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentDoctors.map((doctor) => (
                <div
                  key={doctor.EmployeeID}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewSchedule(doctor)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {doctor.FullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {doctor.FullName}
                      </h3>
                      <p className="text-sm text-gray-600">{doctor.Role}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-5 w-5 text-green-600 inline mr-2" />
                    <span className="text-sm text-green-600">Click để xem lịch</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-md border ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Doctor Schedule Dialog */}
        {showDialog && selectedDoctor && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lịch làm việc của {selectedDoctor.FullName}
                  </h2>
                  <button
                    onClick={closeDialog}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Chức vụ:</strong> {selectedDoctor.Role}
                  </p>
                  {/* {selectedBranch && (
                    <p className="text-sm text-gray-600">
                      <strong>Giờ làm việc chi nhánh:</strong> {selectedBranch.OpenTime} - {selectedBranch.CloseTime}
                    </p>
                  )} */}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Lịch hẹn hôm nay ({new Date().toLocaleDateString('vi-VN')})
                  </h3>

                  {/* Booked Appointments */}
                  {doctorSchedule.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Lịch hẹn đã đặt:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {doctorSchedule.map((appointment) => (
                          <div key={appointment.AppointmentID} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                            <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <span className="font-medium text-red-800">
                                  {appointment.ScheduleTime.slice(11, 16)}
                                </span>

                            </div>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              Đã đặt
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Chưa có lịch hẹn nào.</p>
                  )}

                  {/* Available Time Slots
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Khung giờ trống:</h4>
                    {availableSlots.length === 0 ? (
                      <p className="text-gray-600 text-sm">Đang tải...</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {availableSlots.map((slot, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg text-center text-sm font-medium ${
                              slot.available
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {slot.time}
                            {slot.available && (
                              <span className="block text-xs text-green-600">Trống</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearchPage;