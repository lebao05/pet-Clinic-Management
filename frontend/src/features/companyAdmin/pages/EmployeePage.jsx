"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
  Edit,
  ArrowRightLeft,
  Users,
  Stethoscope,
  ShoppingBag,
  Headphones,
  History,
  Calendar,
  Building2,
  X,
} from "lucide-react"

// Mock data
const employees = [
  {
    id: "NV001",
    name: "Nguyễn Văn An",
    email: "nguyenvanan@petcarex.com",
    position: "Bác sĩ thú y",
    branch: "Chi nhánh Quận 1",
    phone: "0901234567",
    joinDate: "2021-03-15",
    salary: 18000000,
    status: "active",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    transferHistory: [
      { from: "Chi nhánh Quận 3", to: "Chi nhánh Quận 1", date: "2023-06-01", reason: "Tăng cường nhân sự" },
      { from: "Chi nhánh Thủ Đức", to: "Chi nhánh Quận 3", date: "2022-01-15", reason: "Yêu cầu cá nhân" },
    ],
  },
  {
    id: "NV002",
    name: "Trần Thị Bình",
    email: "tranthibinh@petcarex.com",
    position: "Nhân viên tiếp tân",
    branch: "Chi nhánh Quận 7",
    phone: "0912345678",
    joinDate: "2022-06-20",
    salary: 9000000,
    status: "active",
    address: "456 Nguyễn Thị Thập, Quận 7, TP.HCM",
    transferHistory: [],
  },
  {
    id: "NV003",
    name: "Lê Hoàng Cường",
    email: "lehoangcuong@petcarex.com",
    position: "Quản lý chi nhánh",
    branch: "Chi nhánh Thủ Đức",
    phone: "0923456789",
    joinDate: "2020-01-10",
    salary: 25000000,
    status: "active",
    address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    transferHistory: [
      { from: "Chi nhánh Gò Vấp", to: "Chi nhánh Thủ Đức", date: "2021-08-01", reason: "Thăng chức quản lý" },
    ],
  },
  {
    id: "NV004",
    name: "Phạm Minh Đức",
    email: "phamminhduc@petcarex.com",
    position: "Nhân viên bán hàng",
    branch: "Chi nhánh Gò Vấp",
    phone: "0934567890",
    joinDate: "2023-02-28",
    salary: 10000000,
    status: "inactive",
    address: "321 Quang Trung, Gò Vấp, TP.HCM",
    transferHistory: [],
  },
]

const branches = [
  "Tất cả chi nhánh",
  "Chi nhánh Quận 1",
  "Chi nhánh Quận 3",
  "Chi nhánh Quận 7",
  "Chi nhánh Thủ Đức",
  "Chi nhánh Gò Vấp",
  "Chi nhánh Bình Thạnh",
]

const positions = ["Tất cả chức vụ", "Bác sĩ thú y", "Nhân viên bán hàng", "Nhân viên tiếp tân", "Quản lý chi nhánh"]

const stats = [
  { title: "Tổng nhân viên", value: 156, icon: Users, color: "text-blue-600" },
  { title: "Bác sĩ thú y", value: 42, icon: Stethoscope, color: "text-green-600" },
  { title: "NV Bán hàng", value: 48, icon: ShoppingBag, color: "text-orange-600" },
  { title: "NV Tiếp tân", value: 36, icon: Headphones, color: "text-purple-600" },
]

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("Tất cả chi nhánh")
  const [selectedPosition, setSelectedPosition] = useState("Tất cả chức vụ")
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    branch: "",
    salary: "",
    address: "",
  })

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch === "Tất cả chi nhánh" || emp.branch === selectedBranch
    const matchesPosition = selectedPosition === "Tất cả chức vụ" || emp.position === selectedPosition
    return matchesSearch && matchesBranch && matchesPosition
  })

  return (
    <div className="min-h-screen bg-white text-black p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân sự</h1>
          <p className="text-gray-500">Quản lý thông tin và phân công nhân viên</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã NV..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full md:w-[200px] p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            className="w-full md:w-[180px] p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold">Danh sách nhân viên ({filteredEmployees.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Mã NV</th>
                <th className="px-6 py-3 font-medium">Họ tên</th>
                <th className="px-6 py-3 font-medium">Chức vụ</th>
                <th className="px-6 py-3 font-medium">Chi nhánh</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{emp.id}</td>
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4">{emp.position}</td>
                  <td className="px-6 py-4 text-gray-500">{emp.branch}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {emp.status === "active" ? "Đang làm" : "Nghỉ việc"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setSelectedEmployee(emp); setIsDetailOpen(true); }} className="p-1 hover:bg-gray-200 rounded"><Eye className="h-4 w-4" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => { setSelectedEmployee(emp); setIsTransferOpen(true); }} className="p-1 hover:bg-gray-200 rounded"><ArrowRightLeft className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Thông tin chi tiết nhân viên</h2>
                <p className="text-sm text-gray-500">Xem đầy đủ thông tin và lịch sử điều chuyển</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6">
              {/* Custom Tabs */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'info' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                >
                  <Users className="h-4 w-4" /> Thông tin
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                >
                  <History className="h-4 w-4" /> Lịch sử chuyển CN
                </button>
              </div>

              {activeTab === "info" ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Mã NV</label>
                    <p className="font-medium">{selectedEmployee?.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Họ tên</label>
                    <p className="font-medium">{selectedEmployee?.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Email</label>
                    <p className="font-medium">{selectedEmployee?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Số điện thoại</label>
                    <p className="font-medium">{selectedEmployee?.phone}</p>
                  </div>
                  <div className="col-span-2 border-t pt-4 mt-2">
                    <label className="text-xs text-gray-400 uppercase">Địa chỉ</label>
                    <p className="font-medium">{selectedEmployee?.address}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEmployee?.transferHistory.map((t, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{t.from}</span>
                        <ArrowRightLeft className="h-3 w-3" />
                        <span className="font-bold">{t.to}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 italic">{t.date} — {t.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Đóng</button>
              <button className="px-4 py-2 bg-black text-white rounded-md">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Thêm nhân viên mới</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Họ và tên *</label>
                <input type="text" placeholder="Nguyễn Văn A" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email *</label>
                <input type="email" placeholder="email@petcarex.com" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Chức vụ *</label>
                <select className="w-full p-2 border rounded-md bg-white outline-none">
                  {positions.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Lương cơ bản *</label>
                <input type="number" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Địa chỉ</label>
                <textarea rows={2} className="w-full p-2 border rounded-md focus:ring-1 focus:ring-black outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Hủy</button>
              <button className="px-4 py-2 bg-black text-white rounded-md">Lưu nhân viên</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}