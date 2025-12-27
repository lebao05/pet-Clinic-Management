"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, X, Loader2, Calendar, MapPin, Briefcase, User, CircleDollarSign, ArrowRightLeft, Edit2, Save, Filter, UserX } from "lucide-react"
// Import API Services - Added resignEmployee
import { getEmployees, getBranches, getEmployeeRoles, addEmployee, assignEmployeeToBranch, updateEmployee, resignEmployee } from "../../../api/companyService"

export default function EmployeesPage() {
  // --- DATA & UI STATES ---
  const [employeeData, setEmployeeData] = useState([])
  const [branches, setBranches] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  // Resign Loading State
  const [isResigning, setIsResigning] = useState(false)

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [isAddOpen, setIsAddOpen] = useState(false)

  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    role: "",
    baseSalary: 0
  })

  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedPosition, setSelectedPosition] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 1 })
  const [movingBranchId, setMovingBranchId] = useState("")

  // --- FETCH DATA ---
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
        
        // Update selected employee data if detail modal is open
        if (selectedEmployee) {
          const updated = res.data.find(e => e.EmployeeID === selectedEmployee.EmployeeID)
          if (updated) setSelectedEmployee(updated)
        }
      }
    } catch (error) { 
      console.error(error) 
    } finally { 
      setIsLoading(false) 
    }
  }

  useEffect(() => {
    const fetchMetadata = async () => {
      const [br, ro] = await Promise.all([getBranches(), getEmployeeRoles()])
      if (br.success) setBranches(br.data)
      if (ro.success) setRoles(ro.data)
    }
    fetchMetadata()
  }, [])

  // Trigger fetch when filters or page changes
  useEffect(() => { 
    fetchEmployees() 
  }, [selectedBranch, selectedPosition, pagination.page])

  // --- HANDLERS FOR FILTERS ---
  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
  }

  const handleRoleChange = (e) => {
    setSelectedPosition(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
  }

  // --- UPDATE LOGIC ---
  const startEditing = () => {
    setEditData({
      fullName: selectedEmployee.FullName,
      gender: selectedEmployee.Gender || "Male",
      dateOfBirth: selectedEmployee.DateOfBirth ? selectedEmployee.DateOfBirth.split('T')[0] : "",
      role: selectedEmployee.Role,
      baseSalary: selectedEmployee.BaseSalary
    })
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    setSubmitting(true)
    try {
      const res = await updateEmployee(selectedEmployee.EmployeeID, {
        ...editData,
        baseSalary: Number(editData.baseSalary)
      })
      if (res.success) {
        alert("Cập nhật thông tin thành công!")
        setIsEditing(false)
        fetchEmployees() 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật")
    } finally { setSubmitting(false) }
  }

  // --- RESIGN LOGIC (NEW) ---
  const handleResign = async () => {
    const confirm = window.confirm(
      `CẢNH BÁO: Bạn có chắc chắn muốn cho nhân viên "${selectedEmployee.FullName}" thôi việc?\n\nHành động này sẽ cập nhật trạng thái nhân viên và không thể hoàn tác ngay lập tức.`
    )
    
    if (!confirm) return

    setIsResigning(true)
    try {
      const res = await resignEmployee(selectedEmployee.EmployeeID)
      // Assuming res.success or similar structure based on previous patterns
      if (res) {
        alert("Đã cập nhật trạng thái thôi việc thành công.")
        setIsDetailOpen(false)
        fetchEmployees() // Refresh list to remove or update status
      }
    } catch (error) {
      console.error("Resign error:", error)
      alert(error.response?.data?.message || "Có lỗi xảy ra khi thực hiện thao tác.")
    } finally {
      setIsResigning(false)
    }
  }

  // --- ASSIGN BRANCH LOGIC ---
  const handleAssignBranch = async () => {
    if (!movingBranchId) return alert("Chọn chi nhánh")
    setIsMoving(true)
    try {
      const res = await assignEmployeeToBranch({ employeeId: selectedEmployee.EmployeeID, branchId: movingBranchId })
      if (res.success) { alert("Thành công"); setMovingBranchId(""); fetchEmployees(); }
    } catch (e) { alert("Lỗi điều chuyển") } finally { setIsMoving(false) }
  }

  // Client-side search filter (applies on top of server-side filters)
  const displayEmployees = employeeData.filter(emp =>
    emp.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.EmployeeID.toString().includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-white text-black p-6 space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân sự</h1>
          <p className="text-gray-500 mt-1">Quản lý danh sách, chức vụ và điều chuyển nhân viên.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-black/20 hover:bg-gray-800 transition-all">
          <Plus className="h-5 w-5" /> Thêm nhân viên
        </button>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc mã NV..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Branch Filter */}
        <div className="md:col-span-3 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:border-black cursor-pointer"
            value={selectedBranch}
            onChange={handleBranchChange}
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map(b => (
              <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Filter className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Role Filter */}
        <div className="md:col-span-3 relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:border-black cursor-pointer"
            value={selectedPosition}
            onChange={handleRoleChange}
          >
            <option value="all">Tất cả chức vụ</option>
            {roles.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Filter className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Results Count */}
        <div className="md:col-span-2 flex items-center justify-end text-sm text-gray-500 font-medium">
           {isLoading ? "Đang tải..." : `${displayEmployees.length} Nhân viên`}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin mb-3"/>
                <p>Đang tải dữ liệu...</p>
            </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold">Mã NV</th>
              <th className="px-6 py-4 font-bold">Họ tên</th>
              <th className="px-6 py-4 font-bold">Chức vụ</th>
              <th className="px-6 py-4 font-bold">Chi nhánh</th>
              <th className="px-6 py-4 text-right font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayEmployees.length > 0 ? (
                displayEmployees.map((emp) => (
                <tr key={emp.EmployeeID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{emp.EmployeeID}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{emp.FullName}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {emp.Role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.BranchName}</td>
                    <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => { setSelectedEmployee(emp); setIsDetailOpen(true); setIsEditing(false); setActiveTab("info"); }} 
                        className="p-2 bg-white border border-gray-200 hover:bg-black hover:text-white hover:border-black rounded-lg transition-all shadow-sm"
                        title="Xem chi tiết"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
             <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
             >Trước</button>
             <span className="px-4 py-2">Trang {pagination.page} / {pagination.totalPages}</span>
             <button 
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
             >Sau</button>
        </div>
      )}

      {/* --- MODAL CHI TIẾT & CẬP NHẬT --- */}
      {isDetailOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedEmployee.FullName?.charAt(0)}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      className="text-xl font-bold border-b-2 border-black outline-none bg-transparent w-full"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-xl font-bold">{selectedEmployee.FullName}</h2>
                  )}
                  <p className="text-sm text-gray-500">Mã NV: #{selectedEmployee.EmployeeID}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing && activeTab === "info" && (
                  <button onClick={startEditing} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-full transition-all shadow-sm">
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => { setIsDetailOpen(false); setIsEditing(false); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6">
              <button disabled={isEditing} onClick={() => setActiveTab("info")} className={`px-4 py-4 text-xs font-black tracking-widest transition-all ${activeTab === 'info' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>THÔNG TIN CHUNG</button>
              <button disabled={isEditing} onClick={() => setActiveTab("history")} className={`px-4 py-4 text-xs font-black tracking-widest transition-all ${activeTab === 'history' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>LỊCH SỬ & ĐIỀU CHUYỂN</button>
            </div>

            {/* Content Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {activeTab === "info" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chức vụ</p>
                      {isEditing ? (
                        <select className="w-full border-b py-1 text-sm outline-none bg-transparent" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : <p className="font-semibold text-gray-900">{selectedEmployee.Role}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CircleDollarSign className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lương cơ bản</p>
                      {isEditing ? (
                        <input type="number" className="w-full border-b py-1 text-sm outline-none bg-transparent" value={editData.baseSalary} onChange={(e) => setEditData({ ...editData, baseSalary: e.target.value })} />
                      ) : <p className="font-semibold text-emerald-600">{selectedEmployee.BaseSalary?.toLocaleString()} VNĐ</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giới tính</p>
                      {isEditing ? (
                        <select className="w-full border-b py-1 text-sm outline-none bg-transparent" value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })}>
                          <option value="Male">Nam</option><option value="Female">Nữ</option><option value="Other">Khác</option>
                        </select>
                      ) : <p className="font-semibold text-gray-900">{selectedEmployee.Gender}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày sinh</p>
                      {isEditing ? (
                        <input type="date" className="w-full border-b py-1 text-sm outline-none bg-transparent" value={editData.dateOfBirth} onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })} />
                      ) : <p className="font-semibold text-gray-900">{selectedEmployee.DateOfBirth ? new Date(selectedEmployee.DateOfBirth).toLocaleDateString('vi-VN') : "N/A"}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 md:col-span-2">
                     <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                     <div className="flex-1 space-y-1">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chi nhánh hiện tại</p>
                       <p className="font-semibold text-gray-900">{selectedEmployee.BranchName}</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Branch Transfer Section */}
                  <div className="p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <ArrowRightLeft className="text-black" size={16} />
                        <span>Điều chuyển nhân sự</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select className="flex-1 border border-gray-300 p-2.5 rounded-lg bg-white text-sm outline-none focus:border-black transition-colors" value={movingBranchId} onChange={(e) => setMovingBranchId(e.target.value)}>
                        <option value="">-- Chọn chi nhánh đích --</option>
                        {branches.filter(b => b.BranchID !== selectedEmployee.BranchID).map(b => (
                          <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                        ))}
                      </select>
                      <button onClick={handleAssignBranch} disabled={isMoving || !movingBranchId} className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all flex items-center justify-center min-w-[100px]">
                        {isMoving ? <Loader2 size={16} className="animate-spin" /> : "Xác nhận"}
                      </button>
                    </div>
                  </div>

                  {/* History Timeline */}
                  <div className="relative border-l-2 border-gray-100 pl-8 ml-2 space-y-8 pb-4">
                    {selectedEmployee.AssignmentHistory && selectedEmployee.AssignmentHistory.length > 0 ? (
                        selectedEmployee.AssignmentHistory.map((h, idx) => (
                        <div key={idx} className="relative group">
                            <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-white border-4 border-black group-hover:scale-110 transition-transform"></div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{h.BranchName}</span>
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 self-start px-2 py-0.5 rounded mt-1">
                                    {new Date(h.StartDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có lịch sử điều chuyển.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
               {/* LEFT SIDE: DANGER ZONE (RESIGN) */}
               <div>
                 {!isEditing && (
                    <button 
                        onClick={handleResign} 
                        disabled={isResigning}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors w-full md:w-auto justify-center"
                    >
                        {isResigning ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserX className="h-4 w-4" />}
                        Thôi việc
                    </button>
                 )}
               </div>

               {/* RIGHT SIDE: ACTIONS */}
               <div className="flex gap-3 justify-end w-full md:w-auto">
                {isEditing ? (
                    <>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-300 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Hủy bỏ</button>
                    <button onClick={handleUpdate} disabled={submitting} className="px-6 py-2.5 bg-black text-white rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-all text-sm shadow-md shadow-black/10">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu thay đổi
                    </button>
                    </>
                ) : (
                    <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all text-sm shadow-md shadow-black/10 w-full md:w-auto">Đóng</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}