-- ============================================================
-- PETCAREX - PERFORMANCE OPTIMIZATION INDEXES
-- Tạo indexes để tăng tốc queries cho Branch Manager
-- ============================================================

USE PetCareX_Optimized;
GO

PRINT '========================================';
PRINT 'Creating Performance Indexes...';
PRINT '========================================';
GO

-- ============================================================
-- 1. INDEXES CHO DOANH THU (Invoice, InvoiceLine)
-- ============================================================

-- Invoice: Truy vấn doanh thu theo chi nhánh, ngày, trạng thái
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Invoice_BranchID_Date_Status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoice_BranchID_Date_Status
    ON Invoice (BranchID, InvoiceDate, PaymentStatus)
    INCLUDE (UserID, StaffID, FinalAmount, OriginalAmount, DiscountAmount);
    PRINT '✓ Created: IX_Invoice_BranchID_Date_Status';
END

-- ServiceInvoiceLine: Tính doanh thu dịch vụ
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ServiceInvoiceLine_Service')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ServiceInvoiceLine_Service
    ON ServiceInvoiceLine (ServiceID, InvoiceID)
    INCLUDE (Quantity, LineAmount, UnitPrice);
    PRINT '✓ Created: IX_ServiceInvoiceLine_Service';
END

-- ProductInvoiceLine: Tính doanh thu sản phẩm
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductInvoiceLine_Product')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ProductInvoiceLine_Product
    ON ProductInvoiceLine (ProductID, InvoiceID)
    INCLUDE (Quantity, LineAmount, UnitPrice);
    PRINT '✓ Created: IX_ProductInvoiceLine_Product';
END

-- ============================================================
-- 2. INDEXES CHO LỊCH HẸN (Appointment)
-- ============================================================

-- Appointment: Truy vấn theo chi nhánh, ngày, trạng thái
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointment_BranchID_Schedule')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Appointment_BranchID_Schedule
    ON Appointment (BranchID, ScheduleTime, Status)
    INCLUDE (UserID, PetID, ServiceID, DoctorID);
    PRINT '✓ Created: IX_Appointment_BranchID_Schedule';
END

-- Appointment: Tìm theo bác sĩ
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointment_DoctorID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Appointment_DoctorID
    ON Appointment (DoctorID, BranchID, Status)
    INCLUDE (ScheduleTime, ServiceID);
    PRINT '✓ Created: IX_Appointment_DoctorID';
END

-- ============================================================
-- 3. INDEXES CHO TỒN KHO (Inventory)
-- ============================================================

-- Inventory: Tra cứu tồn kho theo chi nhánh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventory_BranchID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inventory_BranchID
    ON Inventory (BranchID, IsActive)
    INCLUDE (ProductID, StockQty, SellingPrice);
    PRINT '✓ Created: IX_Inventory_BranchID';
END

-- ============================================================
-- 4. INDEXES CHO TIÊM PHÒNG (VaccinationRecord, Vaccine)
-- ============================================================

-- VaccinationRecord: Tra cứu theo appointment
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VaccinationRecord_Appointment')
BEGIN
    CREATE NONCLUSTERED INDEX IX_VaccinationRecord_Appointment
    ON VaccinationRecord (AppointmentID)
    INCLUDE (VaccineID, DateGiven, DoctorID, Dose);
    PRINT '✓ Created: IX_VaccinationRecord_Appointment';
END

-- VaccinationRecord: Thống kê vaccine
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VaccinationRecord_Vaccine_Date')
BEGIN
    CREATE NONCLUSTERED INDEX IX_VaccinationRecord_Vaccine_Date
    ON VaccinationRecord (VaccineID, DateGiven)
    INCLUDE (AppointmentID, DoctorID);
    PRINT '✓ Created: IX_VaccinationRecord_Vaccine_Date';
END

-- ============================================================
-- 5. INDEXES CHO NHÂN VIÊN (Employee, EmployeeAssignment)
-- ============================================================

-- EmployeeAssignment: Tìm nhân viên theo chi nhánh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EmployeeAssignment_Branch')
BEGIN
    CREATE NONCLUSTERED INDEX IX_EmployeeAssignment_Branch
    ON EmployeeAssignment (BranchID, EndDate)
    INCLUDE (EmployeeID, StartDate);
    PRINT '✓ Created: IX_EmployeeAssignment_Branch';
END

-- Employee: Tìm theo role
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employee_Role_Status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Employee_Role_Status
    ON Employee (Role, WorkStatus)
    INCLUDE (EmployeeID, FullName, BaseSalary);
    PRINT '✓ Created: IX_Employee_Role_Status';
END

-- ============================================================
-- 6. INDEXES CHO ĐÁNH GIÁ (Rating)
-- ============================================================

-- Rating: Tra cứu theo chi nhánh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rating_BranchID_Date')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Rating_BranchID_Date
    ON Rating (BranchID, RatingDate)
    INCLUDE (ServiceScore, AttitudeScore, OverallScore, EmployeeID, Comment);
    PRINT '✓ Created: IX_Rating_BranchID_Date';
END

-- ============================================================
-- 7. INDEXES CHO THÚ CƯNG (Pet)
-- ============================================================

-- Pet: Tìm thú cưng theo chủ
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pet_UserID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Pet_UserID
    ON Pet (UserID, IsActive)
    INCLUDE (PetName, Species, Breed, BirthDate);
    PRINT '✓ Created: IX_Pet_UserID';
END

-- Pet: Tìm theo tên (cho search)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pet_Name')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Pet_Name
    ON Pet (PetName, IsActive)
    INCLUDE (PetID, UserID, Species);
    PRINT '✓ Created: IX_Pet_Name';
END

-- ============================================================
-- 8. INDEXES CHO KHÁCH HÀNG (Users)
-- ============================================================

-- Users: Tìm khách hàng
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_FullName')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_FullName
    ON Users (FullName, IsActive)
    INCLUDE (Phone, Email, RankID);
    PRINT '✓ Created: IX_Users_FullName';
END

-- Users: Tìm theo phone
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Phone')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Phone
    ON Users (Phone)
    INCLUDE (UserID, FullName, Email);
    PRINT '✓ Created: IX_Users_Phone';
END

-- ============================================================
-- 9. INDEXES CHO DỊCH VỤ (BranchService)
-- ============================================================

-- BranchService: Tra cứu dịch vụ theo chi nhánh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BranchService_BranchID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_BranchService_BranchID
    ON BranchService (BranchID, IsAvailable)
    INCLUDE (ServiceID, ServicePrice);
    PRINT '✓ Created: IX_BranchService_BranchID';
END

GO

-- ============================================================
-- 10. KIỂM TRA INDEXES ĐÃ TẠO
-- ============================================================
PRINT '';
PRINT '========================================';
PRINT 'Summary of Created Indexes:';
PRINT '========================================';

