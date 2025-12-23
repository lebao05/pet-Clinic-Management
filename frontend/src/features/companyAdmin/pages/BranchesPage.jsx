"use client"

import { useState } from "react"
import { Search, Plus, Eye, Edit, MapPin, Phone, Clock, Users, DollarSign, X } from "lucide-react"

// Mock data
const branchesData = [
  {
    id: "CN001",
    name: "Chi nhánh Quận 1",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    phone: "028 1234 5678",
    openTime: "08:00",
    closeTime: "20:00",
    manager: "Nguyễn Văn Quản",
    employeeCount: 18,
    monthlyRevenue: 450000000,
    services: ["Khám bệnh", "Tiêm phòng", "Spa & Grooming", "Bán hàng"],
    status: "active",
  },
  {
    id: "CN002",
    name: "Chi nhánh Quận 3",
    address: "456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM",
    phone: "028 2345 6789",
    openTime: "08:00",
    closeTime: "21:00",
    manager: "Trần Thị Lan",
    employeeCount: 15,
    monthlyRevenue: 320000000,
    services: ["Khám bệnh", "Tiêm phòng", "Bán hàng"],
    status: "active",
  },
  {
    id: "CN003",
    name: "Chi nhánh Quận 7",
    address: "789 Nguyễn Thị Thập, Phường Tân Phong, Quận 7, TP.HCM",
    phone: "028 3456 7890",
    openTime: "07:30",
    closeTime: "21:30",
    manager: "Lê Hoàng Nam",
    employeeCount: 22,
    monthlyRevenue: 520000000,
    services: ["Khám bệnh", "Tiêm phòng", "Spa & Grooming", "Phẫu thuật", "Bán hàng"],
    status: "active",
  },
  {
    id: "CN004",
    name: "Chi nhánh Thủ Đức",
    address: "321 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức",
    phone: "028 4567 8901",
    openTime: "08:00",
    closeTime: "20:00",
    manager: "Phạm Minh Tuấn",
    employeeCount: 14,
    monthlyRevenue: 280000000,
    services: ["Khám bệnh", "Tiêm phòng", "Bán hàng"],
    status: "active",
  },
]

const allServices = ["Khám bệnh", "Tiêm phòng", "Spa & Grooming", "Phẫu thuật", "Bán hàng", "Nội trú", "Xét nghiệm", "Siêu âm"]

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    openTime: "",
    closeTime: "",
    manager: "",
    services: [],
  })

  const filteredBranches = branchesData.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalEmployees = branchesData.reduce((acc, b) => acc + b.employeeCount, 0)
  const totalRevenue = branchesData.reduce((acc, b) => acc + b.monthlyRevenue, 0)

  const handleServiceToggle = (service) => {
    setNewBranch((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý chi nhánh</h1>
          <p className="text-gray-500">Quản lý thông tin các chi nhánh trong hệ thống</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Thêm chi nhánh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng chi nhánh", value: branchesData.length, icon: <MapPin />, color: "bg-blue-50 text-blue-600" },
          { label: "Tổng nhân viên", value: totalEmployees, icon: <Users />, color: "bg-orange-50 text-orange-600" },
          { label: "Doanh thu tháng", value: `${(totalRevenue / 1000000000).toFixed(2)}B`, icon: <DollarSign />, color: "bg-green-50 text-green-600" }
        ].map((stat, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative border border-gray-200 rounded-lg shadow-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm chi nhánh theo tên hoặc địa chỉ..."
          className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Branch Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg leading-tight">{branch.name}</h3>
                <span className="text-xs font-mono text-gray-400">{branch.id}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">Hoạt động</span>
            </div>
            
            <div className="p-5 space-y-3 flex-grow">
              <div className="flex gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="line-clamp-2">{branch.address}</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{branch.openTime} - {branch.closeTime}</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{branch.employeeCount} nhân viên</span>
              </div>
              
              <div className="pt-3 flex flex-wrap gap-1">
                {branch.services.slice(0, 3).map(s => (
                  <span key={s} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{s}</span>
                ))}
                {branch.services.length > 3 && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">+{branch.services.length - 3}</span>}
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex gap-2 border-t border-gray-100">
              <button 
                onClick={() => { setSelectedBranch(branch); setIsDetailOpen(true); }}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-sm py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> Chi tiết
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-sm py-2 rounded-md hover:bg-gray-100 transition-colors">
                <Edit className="h-3.5 w-3.5" /> Sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Modal Backdrop */}
      {(isDetailOpen || isAddOpen) && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          {/* Detail Dialog */}
          {isDetailOpen && selectedBranch && (
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Thông tin chi tiết</h2>
                  <p className="text-sm text-gray-500">Mã: {selectedBranch.id}</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6 text-sm">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Địa chỉ</label>
                  <p className="font-medium mt-1">{selectedBranch.address}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Quản lý</label>
                  <p className="font-medium mt-1">{selectedBranch.manager}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Doanh thu</label>
                  <p className="font-medium mt-1 text-green-600">{selectedBranch.monthlyRevenue.toLocaleString("vi-VN")}₫</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Dịch vụ cung cấp</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBranch.services.map(s => (
                      <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">Đóng</button>
                <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">Chỉnh sửa</button>
              </div>
            </div>
          )}

          {/* Add Dialog */}
          {isAddOpen && (
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Thêm chi nhánh mới</h2>
                <button onClick={() => setIsAddOpen(false)}><X /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold">Tên chi nhánh *</label>
                    <input type="text" className="w-full border p-2 rounded focus:ring-1 ring-black outline-none" placeholder="Nhập tên..." />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold">Địa chỉ *</label>
                    <textarea className="w-full border p-2 rounded focus:ring-1 ring-black outline-none" rows={2}></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Số điện thoại *</label>
                    <input type="text" className="w-full border p-2 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Quản lý</label>
                    <input type="text" className="w-full border p-2 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Giờ mở cửa</label>
                    <input type="time" className="w-full border p-2 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Giờ đóng cửa</label>
                    <input type="time" className="w-full border p-2 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Dịch vụ cung cấp *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allServices.map(service => (
                      <label key={service} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newBranch.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="w-4 h-4 accent-black"
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-gray-300 bg-white rounded-md">Hủy</button>
                <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-black text-white rounded-md">Thêm chi nhánh</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}