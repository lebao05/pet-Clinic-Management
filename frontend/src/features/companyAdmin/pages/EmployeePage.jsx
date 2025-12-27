"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Edit, ArrowRightLeft, Users, Stethoscope, ShoppingBag, Headphones, History, X, ChevronLeft, ChevronRight } from "lucide-react"
// Import your axios functions here
import { getEmployees, getBranches, getEmployeeRoles } from "../../../api/companyService"

export default function EmployeesPage() {
  // Data States
  const [employeeData, setEmployeeData] = useState([])
  const [branches, setBranches] = useState([])
  const [roles, setRoles] = useState([])

  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedPosition, setSelectedPosition] = useState("all")

  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)

  // UI States
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [isAddOpen, setIsAddOpen] = useState(false)

  // 1. Load Initial Metadata (Branches & Roles)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [branchRes, roleRes] = await Promise.all([getBranches(), getEmployeeRoles()])
        if (branchRes.success) setBranches(branchRes.data)
        if (roleRes.success) setRoles(roleRes.data)
      } catch (error) {
        console.error("Failed to load metadata", error)
      }
    }
    fetchMetadata()
  }, [])

  // 2. Load Employees when filters or page changes
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true)
      try {
        const params = {
          role: selectedPosition === "all" ? undefined : selectedPosition,
          branchId: selectedBranch === "all" ? undefined : selectedBranch,
          page: pagination.page,
          pageSize: pagination.pageSize
        }
        const res = await getEmployees(params)
        if (res.success) {
          setEmployeeData(res.data)
          setPagination(prev => ({ ...prev, totalPages: res.pagination.totalPages }))
        }
      } catch (error) {
        console.error("Error fetching employees", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployees()
  }, [selectedBranch, selectedPosition, pagination.page])

  // Local filtering for Search Term (client-side)
  const displayEmployees = employeeData.filter(emp =>
    emp.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.EmployeeID.toString().includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-white text-black p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân sự</h1>
          <p className="text-gray-500">Quản lý thông tin và phân công nhân viên</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã NV..."
            className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full md:w-[200px] p-2 border rounded-md bg-white"
          value={selectedBranch}
          onChange={(e) => { setSelectedBranch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <option value="all">Tất cả chi nhánh</option>
          {branches.map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
        </select>
        <select
          className="w-full md:w-[180px] p-2 border rounded-md bg-white"
          value={selectedPosition}
          onChange={(e) => { setSelectedPosition(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <option value="all">Tất cả chức vụ</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Mã NV</th>
                <th className="px-6 py-3 font-medium">Họ tên</th>
                <th className="px-6 py-3 font-medium">Chức vụ</th>
                <th className="px-6 py-3 font-medium">Chi nhánh</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Đang tải...</td></tr>
              ) : displayEmployees.map((emp) => (
                <tr key={`${emp.EmployeeID}-${emp.BranchID}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{emp.EmployeeID}</td>
                  <td className="px-6 py-4">{emp.FullName}</td>
                  <td className="px-6 py-4">{emp.Role}</td>
                  <td className="px-6 py-4 text-gray-500">{emp.BranchName}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setSelectedEmployee(emp); setIsDetailOpen(true); }} className="p-1 hover:bg-gray-200 rounded"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">Trang {pagination.page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="p-2 border rounded bg-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="p-2 border rounded bg-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết: {selectedEmployee.FullName}</h2>
              <button onClick={() => setIsDetailOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab("info")} className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>Thông tin</button>
                <button onClick={() => setActiveTab("history")} className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>Lịch sử điều chuyển</button>
              </div>

              {activeTab === "info" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400">GIỚI TÍNH</label><p>{selectedEmployee.Gender}</p></div>
                  <div><label className="text-xs text-gray-400">LƯƠNG CƠ BẢN</label><p>{selectedEmployee.BaseSalary?.toLocaleString()} VNĐ</p></div>
                  <div><label className="text-xs text-gray-400">NGÀY VÀO LÀM</label><p>{new Date(selectedEmployee.HireDate).toLocaleDateString()}</p></div>
                  <div><label className="text-xs text-gray-400">TRẠNG THÁI</label><p>{selectedEmployee.WorkingStatus}</p></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEmployee.AssignmentHistory?.map((h) => (
                    <div key={h.AssignmentID} className="bg-gray-50 p-3 rounded border">
                      <p className="font-bold">{h.BranchName}</p>
                      <p className="text-sm text-gray-500">Bắt đầu: {h.StartDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}{/* Modal: Thêm chi nhánh */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Thêm chi nhánh mới</h2>
              <button type="button" onClick={() => setIsAddOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Tên chi nhánh *</label>
                <input required name="branchName" value={newBranchData.branchName} onChange={handleAddInputChange} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" placeholder="Tên chi nhánh..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Địa chỉ *</label>
                <input required name="address" value={newBranchData.address} onChange={handleAddInputChange} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" placeholder="Địa chỉ chi tiết..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Số điện thoại *</label>
                <input required name="phone" value={newBranchData.phone} onChange={handleAddInputChange} className="w-full border p-2 rounded-md outline-none focus:ring-1 ring-black" placeholder="Số điện thoại..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Giờ mở cửa</label>
                  <input type="time" name="openTime" value={newBranchData.openTime} onChange={handleAddInputChange} className="w-full border p-2 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Giờ đóng cửa</label>
                  <input type="time" name="closeTime" value={newBranchData.closeTime} onChange={handleAddInputChange} className="w-full border p-2 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100">Hủy</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-400">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Xác nhận thêm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}