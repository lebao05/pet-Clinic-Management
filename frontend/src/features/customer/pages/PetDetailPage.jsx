import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Calendar, Edit, ArrowLeft } from "lucide-react";
import userApi from "../../../api/userApi";
import { useAuth } from "../../../contexts/AuthContext";

const PetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const fetchPetDetail = async () => {
    try {
      setLoading(true);
      const userId = user?.userId;
      
      if (!userId) {
        setError("Vui lòng đăng nhập để xem chi tiết");
        return;
      }

      // Lấy danh sách pets để tìm pet cụ thể
      const petsResponse = await userApi.getPets(userId);
      if (petsResponse.data.success) {
        const foundPet = petsResponse.data.data.find(p => p.PetID == id);
        if (foundPet) {
          setPet(foundPet);
        } else {
          setError("Không tìm thấy thú cưng");
          return;
        }
      } else {
        setError("Không thể tải thông tin thú cưng");
        return;
      }

      // Lấy lịch sử appointments của user và filter theo petId
      const appointmentsResponse = await userApi.getAppointments(userId);
      if (appointmentsResponse.data && appointmentsResponse.data.success) {
        const petAppointments = appointmentsResponse.data.data.filter(
          app => app.PetID == id
        );
        setAppointments(petAppointments || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      setError("Lỗi khi tải chi tiết thú cưng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          {error || "Không tìm thấy thú cưng"}
        </div>
        <button
          onClick={() => navigate("/customer/pets")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/customer/pets")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách thú cưng
        </button>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Heart className="h-12 w-12" />
                <div>
                  <h1 className="text-3xl font-bold">{pet.PetName}</h1>
                  <p className="text-blue-100">
                    {pet.Species} - {pet.Breed}
                  </p>
                </div>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giống loài
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.Species}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giống cụ thể
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.Breed}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuổi
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.BirthDate ? `${calculateAge(pet.BirthDate)} tuổi` : "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.Weight ? `${pet.Weight} kg` : "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.Gender === "Male" ? "Đực" : "Cái"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.Color || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {pet.BirthDate
                      ? new Date(pet.BirthDate).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[2.5rem]">
                    {pet.Notes || "Không có ghi chú"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử khám bệnh ({appointments.length})
              </h3>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử khám bệnh
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments
                    .sort((a, b) => new Date(b.ScheduleTime) - new Date(a.ScheduleTime))
                    .map((appointment) => (
                    <div
                      key={appointment.AppointmentID}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {appointment.ServiceName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.ScheduleTime).toLocaleDateString("vi-VN")} lúc {appointment.ScheduleTime.slice(11, 16)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.Status === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.Status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.Status === 'Completed' ? 'Hoàn thành' :
                           appointment.Status === 'Scheduled' ? 'Đã lên lịch' :
                           appointment.Status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Bác sĩ:</span>
                          <span className="ml-2 font-medium">{appointment.DoctorName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Chi nhánh:</span>
                          <span className="ml-2 font-medium">{appointment.BranchName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailPage;
