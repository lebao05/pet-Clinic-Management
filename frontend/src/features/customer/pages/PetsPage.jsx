import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, Plus, X } from "lucide-react";
import userApi from "../../../api/userApi";
import { useAuth } from "../../../contexts/AuthContext";

const PetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newPet, setNewPet] = useState({
    petName: "",
    species: "",
    breed: "",
    birthDate: "",
    gender: "",
    color: "",
    weight: "",
    notes: ""
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get userId từ authenticated user
  const userId = user?.userId;

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
    fetchPets();
  }, [userId]);

  const fetchPets = async () => {
    try {
      if (!userId) {
        setError("Vui lòng đăng nhập để xem thú cưng");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`[PetsPage] Fetching pets for userId: ${userId}`);
      const response = await userApi.getPets(userId);
      console.log(`[PetsPage] Response:`, response.data);
      
      if (response.data.success) {
        setPets(response.data.data || []);
      } else {
        setError("Không thể tải danh sách thú cưng");
      }
    } catch (err) {
      console.error(`[PetsPage] Error:`, err);
      setError("Lỗi khi tải thú cưng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (petId) => {
    navigate(`/customer/pets/${petId}`);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!newPet.petName.trim() || !newPet.species.trim()) {
      setError("Vui lòng nhập tên thú cưng và giống loài");
      return;
    }

    try {
      setAddLoading(true);
      setError("");
      const response = await userApi.createPet(userId, newPet);
      if (response.data.success) {
        setShowAddModal(false);
        setNewPet({
          petName: "",
          species: "",
          breed: "",
          birthDate: "",
          gender: "",
          color: "",
          weight: "",
          notes: ""
        });
        // Reload pets
        fetchPets();
      } else {
        setError(response.data.message || "Lỗi khi thêm thú cưng");
      }
    } catch (err) {
      setError("Lỗi khi thêm thú cưng: " + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          Thú cưng của tôi
        </h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5" />
          Thêm thú cưng
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Chưa có thú cưng nào
          </h3>
          <p className="text-gray-500 mb-6">
            Hãy thêm thú cưng đầu tiên của bạn để bắt đầu đặt lịch khám.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            Thêm thú cưng mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div
              key={pet.PetID}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {pet.PetName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pet.Species} - {pet.Breed}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {pet.Gender === "Male" ? "Đực" : "Cái"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tuổi:</span>
                    <span className="font-medium">
                        {pet.BirthDate ? `${calculateAge(pet.BirthDate)} tuổi` : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cân nặng:</span>
                    <span className="font-medium">
                      {pet.Weight ? `${pet.Weight} kg` : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Màu sắc:</span>
                    <span className="font-medium">
                      {pet.Color || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(pet.PetID)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Thêm thú cưng mới
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thú cưng *
                  </label>
                  <input
                    type="text"
                    value={newPet.petName}
                    onChange={(e) => setNewPet({...newPet, petName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giống loài *
                  </label>
                  <input
                    type="text"
                    value={newPet.species}
                    onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giống cụ thể
                  </label>
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={newPet.birthDate}
                    onChange={(e) => setNewPet({...newPet, birthDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={newPet.gender}
                    onChange={(e) => setNewPet({...newPet, gender: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Đực</option>
                    <option value="Female">Cái</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    value={newPet.color}
                    onChange={(e) => setNewPet({...newPet, color: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={newPet.notes}
                    onChange={(e) => setNewPet({...newPet, notes: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                  >
                    {addLoading ? "Đang thêm..." : "Thêm thú cưng"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetsPage;
