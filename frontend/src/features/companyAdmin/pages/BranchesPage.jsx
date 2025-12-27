"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, MapPin, Phone, Clock, Users, X, Loader2, User } from "lucide-react"
import { getBranchSummary, addBranch, updateBranch } from "../../../api/companyService"

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Form States cho Thêm mới
  const [newBranchData, setNewBranchData] = useState({
    branchName: "",
    address: "",
    phone: "",
    openTime: "08:00",
    closeTime: "20:00"
  })

  // Form States cho Chỉnh sửa
  const [editBranchData, setEditBranchData] = useState({
    branchId: "",
    branchName: "",
    address: "",
    phone: "",
    openTime: "",
    closeTime: ""
  })

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await getBranchSummary()
      if (response.success) {
        setBranches(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  // --- LOGIC THÊM MỚI ---
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const response = await addBranch(newBranchData)
      if (response.success) {
        setIsAddOpen(false)
        setNewBranchData({ branchName: "", address: "", phone: "", openTime: "08:00", closeTime: "20:00" })
        fetchBranches()
        alert("Thêm chi nhánh thành công!")
      }
    } catch (error) {
      alert("Lỗi khi thêm: " + (error.response?.data?.message || "Vui lòng thử lại"))
    } finally {
      setSubmitting(false)
    }
  }

  // --- LOGIC CẬP NHẬT ---
  const handleEditClick = (branch) => {
    setEditBranchData({
      branchId: branch.BranchID,
      branchName: branch.BranchName,
      address: branch.Address,
      phone: branch.Phone,
      // Fix format time từ ISO string (1970-01-01T08:00:00.000Z) sang HH:mm
      openTime: branch.OpenTime ? new Date(branch.OpenTime).toLocaleTimeString('it-IT').slice(0, 5) : "08:00",
      closeTime: branch.CloseTime ? new Date(branch.CloseTime).toLocaleTimeString('it-IT').slice(0, 5) : "20:00"
    })
    setIsEditOpen(true)
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const { branchId } = editBranchData
      // Gọi service updateBranch(id, payload)
      const response = await updateBranch(branchId, editBranchData)
      if (response) {
        setIsEditOpen(false)
        fetchBranches()
        alert("Cập nhật thành công!")
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"))
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return "--:--"
    const date = new Date(isoString)
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  const filteredBranches = branches.filter(
    (branch) =>
      branch.BranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.Address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-white text-black p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý chi nhánh</h1>
          <p className="text-gray-500">Hiển thị {filteredBranches.length} chi nhánh</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm chi nhánh..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-1 ring-black outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Grid Danh sách */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <div key={branch.BranchID} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{branch.BranchName}</h3>
                  <span className="text-xs font-mono text-gray-400">ID: {branch.BranchID}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">{branch.City || "N/A"}</span>
              </div>

              <div className="p-5 space-y-3 flex-grow">
                <div className="flex gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{branch.Address}</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{branch.Phone}</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{formatTime(branch.OpenTime)} - {formatTime(branch.CloseTime)}</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <Users className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{branch.TotalEmployees || 0} nhân viên</span>
                </div>

                <div className="text-sm font-medium pt-2 border-t border-dashed border-gray-100 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Quản lý: <span className="text-gray-600 font-normal">{branch.ManagerName || "Chưa có"}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleEditClick(branch)}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-sm py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
                >
                  <Edit className="h-3.5 w-3.5" /> Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Thêm chi nhánh */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Thêm chi nhánh mới</h2>
              <button type="button" onClick={() => setIsAddOpen(false)}><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Tên chi nhánh *</label>
                <input required value={newBranchData.branchName} onChange={(e) => setNewBranchData({ ...newBranchData, branchName: e.target.value })} className="w-full border p-2 rounded-md outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Địa chỉ *</label>
                <input required value={newBranchData.address} onChange={(e) => setNewBranchData({ ...newBranchData, address: e.target.value })} className="w-full border p-2 rounded-md outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Số điện thoại *</label>
                <input required value={newBranchData.phone} onChange={(e) => setNewBranchData({ ...newBranchData, phone: e.target.value })} className="w-full border p-2 rounded-md outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Giờ mở cửa</label>
                  <input type="time" value={newBranchData.openTime} onChange={(e) => setNewBranchData({ ...newBranchData, openTime: e.target.value })} className="w-full border p-2 rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Giờ đóng cửa</label>
                  <input type="time" value={newBranchData.closeTime} onChange={(e) => setNewBranchData({ ...newBranchData, closeTime: e.target.value })} className="w-full border p-2 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-md">Hủy</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Xác nhận thêm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Chỉnh sửa */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateSubmit} className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Cập nhật chi nhánh</h2>
                <p className="text-xs text-gray-400 uppercase font-bold">Mã: {editBranchData.branchId}</p>
              </div>
              <button type="button" onClick={() => setIsEditOpen(false)}><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Tên chi nhánh</label>
                <input required value={editBranchData.branchName} onChange={(e) => setEditBranchData({ ...editBranchData, branchName: e.target.value })} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Địa chỉ</label>
                <input required value={editBranchData.address} onChange={(e) => setEditBranchData({ ...editBranchData, address: e.target.value })} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Số điện thoại</label>
                <input required value={editBranchData.phone} onChange={(e) => setEditBranchData({ ...editBranchData, phone: e.target.value })} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Mở cửa</label>
                  <input type="time" value={editBranchData.openTime} onChange={(e) => setEditBranchData({ ...editBranchData, openTime: e.target.value })} className="w-full border p-2 rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Đóng cửa</label>
                  <input type="time" value={editBranchData.closeTime} onChange={(e) => setEditBranchData({ ...editBranchData, closeTime: e.target.value })} className="w-full border p-2 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border rounded-md bg-white">Hủy</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}