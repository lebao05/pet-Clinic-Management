// controllers/userController.js
const UserModel = require("../models/userModel");
const { getConnection, sql } = require("../config/database");

class UserController {
  // GET /api/users
  static async getAll(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      console.error("Error in getAll:", err);
      res.status(500).json({
        success: false,
        error: "Lỗi khi lấy danh sách users",
        message: err.message,
      });
    }
  }

  // GET /api/users/:id
  static async getById(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // POST /api/users
  static async create(req, res) {
    try {
      const { fullName, phone, email, cccd, gender, birthDate } = req.body;

      // Validate
      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          error: "Tên và số điện thoại là bắt buộc",
        });
      }

      // Kiểm tra phone trùng
      const existing = await UserModel.findByPhone(phone);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Số điện thoại đã tồn tại",
        });
      }

      const userId = await UserModel.create({
        fullName,
        phone,
        email,
        cccd,
        gender,
        birthDate,
      });

      res.status(201).json({
        success: true,
        message: "Tạo user thành công",
        userId,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // PUT /api/users/:id
  static async update(req, res) {
    try {
      await UserModel.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật user thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // DELETE /api/users/:id
  static async delete(req, res) {
    try {
      await UserModel.delete(req.params.id);
      res.json({
        success: true,
        message: "Xóa user thành công",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/users/:id/pets
  static async getPets(req, res) {
    try {
      const pets = await UserModel.getPets(req.params.id);
      res.json({
        success: true,
        count: pets.length,
        data: pets,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // GET /api/users/:id/appointments
  static async getAppointments(req, res) {
    try {
      const appointments = await UserModel.getAppointments(req.params.id);
      res.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

    // 1. Tìm kiếm sản phẩm (Tra cứu từ bảng Product và Inventory)
    static async searchProducts(req, res) {
        try {
            const { branchId, name } = req.query;

            if (!branchId || !name) {
                return res.status(400).json({
                    success: false,
                    message: "branchId và name là bắt buộc"
                });
            }

            const pool = await getConnection();

            const result = await pool.request()
                .input("branchId", sql.Int, parseInt(branchId))
                .input("name", sql.NVarChar(255), name.trim()) // truyền đúng chuỗi gốc
                .query(`
                    SELECT 
                        p.ProductID,
                        p.ProductName,
                        i.StockQty,
                        i.SellingPrice
                    FROM Product p
                    JOIN Inventory i ON p.ProductID = i.ProductID
                    WHERE 
                        i.BranchID = @branchId
                        AND p.ProductName LIKE @name + N'%'
                        AND i.IsActive = 1
                        AND p.BusinessStatus = 'Active'
                    ORDER BY p.ProductName
                `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

  // 2. Tra cứu bác sĩ tại chi nhánh
  static async getDoctorsByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const pool = await getConnection();
      const result = await pool.request()
        .input("branchId", sql.Int, branchId)
        .query(`
          SELECT e.EmployeeID, e.FullName, e.[Role]
          FROM Employee e
          JOIN EmployeeAssignment ea ON e.EmployeeID = ea.EmployeeID
          WHERE ea.BranchID = @branchId AND ea.EndDate IS NULL
          AND e.[Role] LIKE N'%Doctor%' AND e.WorkStatus = 'Active'
        `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Đặt lịch khám (Gọi Store Procedure sp_CreateAppointment)
// controllers/customerController.js
static async bookAppointment(req, res) {
    try {
        const { branchId, userId, petId, serviceId, doctorId, scheduleTime } = req.body;
        const pool = await getConnection();
        
        // Fix: Chuyển "2025-12-30T10:00:00" thành "2025-12-30 10:00:00"
        const formattedTime = scheduleTime.replace('T', ' ');

        await pool.request()
            .input("BranchID", sql.Int, branchId)
            .input("UserID", sql.Int, userId)
            .input("PetID", sql.Int, petId)
            .input("ServiceID", sql.Int, serviceId)
            .input("DoctorID", sql.Int, doctorId)
            // Fix: Sử dụng sql.NVarChar để SQL tự CAST sang DateTime theo giờ "tĩnh"
            .input("ScheduleTime", sql.NVarChar, formattedTime) 
            .execute("sp_CreateAppointment");

        res.json({ success: true, message: "Đặt lịch thành công!" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

  // 4. Đặt mua sản phẩm (Trigger T4 sẽ tự động trừ kho)
  static async checkout(req, res) {
    const { branchId, userId, items, paymentMethod } = req.body;
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      
      // Tạo Invoice Header
      const headerRequest = new sql.Request(transaction);
      const headerResult = await headerRequest
        .input("BranchID", sql.Int, branchId)
        .input("UserID", sql.Int, userId)
        .input("StaffID", sql.Int, 1) 
        .input("PaymentMethod", sql.NVarChar, paymentMethod)
        .output("NewInvoiceID", sql.Int)
        .execute("sp_CreateInvoice");

      const invoiceId = headerResult.output.NewInvoiceID;

      // Thêm chi tiết sản phẩm
      for (const item of items) {
        await new sql.Request(transaction)
          .input("InvoiceID", sql.Int, invoiceId)
          .input("ProductID", sql.Int, item.productId)
          .input("Quantity", sql.Int, item.quantity)
          .execute("sp_AddInvoiceProductLine");
      }
      await transaction.commit();
      res.json({ success: true, invoiceId, message: "Mua hàng thành công. Kho đã trừ tự động." });
    } catch (err) {
      await transaction.rollback();
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 5. Xem lịch sử (Hóa đơn và Hồ sơ khám)
  static async getHistory(req, res) {
    try {
      const { userId } = req.params;
      const pool = await getConnection();
      
      const invoices = await pool.request().input("uid", sql.Int, userId)
        .query("SELECT * FROM Invoice WHERE UserID = @uid ORDER BY InvoiceDate DESC");
        
      const medical = await pool.request().input("uid", sql.Int, userId)
        .query(`
          SELECT a.ScheduleTime, p.PetName, s.ServiceName, er.Diagnosis, er.Prescription
          FROM Appointment a
          JOIN Pet p ON a.PetID = p.PetID
          JOIN Service s ON a.ServiceID = s.ServiceID
          LEFT JOIN ExamRecord er ON a.AppointmentID = er.AppointmentID
          WHERE a.UserID = @uid ORDER BY a.ScheduleTime DESC
        `);
      res.json({ success: true, invoices: invoices.recordset, medical: medical.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

}

module.exports = UserController;
