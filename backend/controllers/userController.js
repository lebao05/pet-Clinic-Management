// controllers/userController.js
const UserModel = require("../models/userModel");
const PetModel = require("../models/petModel");
const { getConnection, sql } = require("../config/database");
const bcrypt = require("bcrypt");

class UserController {
  // POST /api/users/register
  static async register(req, res) {
    try {
      const { fullName, phone, email, password, cccd, gender, birthDate } = req.body;

      if (!fullName || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: "Họ tên, số điện thoại và mật khẩu là bắt buộc"
        });
      }

      // Check if phone already exists
      const pool = await getConnection();
      const existingUser = await pool.request()
        .input("phone", sql.NVarChar, phone)
        .query("SELECT UserID FROM Users WHERE Phone = @phone");

      if (existingUser.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại đã được sử dụng"
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await pool.request()
        .input("fullName", sql.NVarChar, fullName)
        .input("phone", sql.NVarChar, phone)
        .input("email", sql.NVarChar, email || null)
        .input("passwordHash", sql.NVarChar, hashedPassword)
        .input("cccd", sql.NVarChar, cccd || null)
        .input("gender", sql.NVarChar, gender || null)
        .input("birthDate", sql.Date, birthDate || null)
        .query(`
          INSERT INTO Users (FullName, Phone, Email, PasswordHash, CCCD, Gender, BirthDate, LoyaltyPoints, IsActive)
          VALUES (@fullName, @phone, @email, @passwordHash, @cccd, @gender, @birthDate, 0, 1);
          SELECT SCOPE_IDENTITY() AS UserID;
        `);

      const userId = result.recordset[0].UserID;

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: { userId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + err.message
      });
    }
  }

  // POST /api/users/login
  static async login(req, res) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập số điện thoại và mật khẩu"
        });
      }

      const pool = await getConnection();
      const result = await pool.request()
        .input("phone", sql.NVarChar, phone)
        .query(`
          SELECT UserID, PasswordHash, FullName, Phone, Email, IsActive
          FROM Users
          WHERE Phone = @phone AND IsActive = 1
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Số điện thoại hoặc mật khẩu không đúng"
        });
      }

      const user = result.recordset[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.PasswordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Số điện thoại hoặc mật khẩu không đúng"
        });
      }

      // Return user info (exclude password)
      const userInfo = {
        userId: user.UserID,
        fullName: user.FullName,
        phone: user.Phone,
        email: user.Email
      };

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: userInfo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + err.message
      });
    }
  }

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

  // POST /api/users/:id/pets
  static async createPet(req, res) {
    try {
      const userId = req.params.id;
      const { petName, species, breed, birthDate, gender, color, weight, notes } = req.body;

      if (!petName || !species) {
        return res.status(400).json({
          success: false,
          message: "Tên thú cưng và giống loài là bắt buộc"
        });
      }

      const petData = {
        userId: parseInt(userId),
        petName,
        species,
        breed: breed || null,
        birthDate: birthDate || null,
        gender: gender || null,
        color: color || null,
        weight: weight ? parseFloat(weight) : null,
        healthStatus: null,
        notes: notes || null
      };

      const petId = await PetModel.create(petData);

      res.status(201).json({
        success: true,
        message: "Thêm thú cưng thành công",
        data: { petId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi thêm thú cưng: " + err.message
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
        .input("name", sql.NVarChar(255), `%${name.trim()}%`)
        .query(`
          SELECT 
            p.ProductID,
            p.ProductName,
            p.ProductType,
            p.Unit,
            i.StockQty,
            i.SellingPrice
          FROM Product p
          JOIN Inventory i ON p.ProductID = i.ProductID
          WHERE 
            i.BranchID = @branchId
            AND p.ProductName LIKE @name
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

  // 2. Lấy dịch vụ tại chi nhánh
  static async getServicesByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const pool = await getConnection();
      const result = await pool.request()
        .input("branchId", sql.Int, branchId)
        .query(`
          SELECT DISTINCT s.ServiceID, s.ServiceName
          FROM Service s
          JOIN BranchService bs ON s.ServiceID = bs.ServiceID
          WHERE bs.BranchID = @branchId
          ORDER BY s.ServiceName
        `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Tra cứu bác sĩ tại chi nhánh
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

  // Search doctors by branch and name
  static async searchDoctors(req, res) {
    try {
      const { branchId } = req.params;
      const { name } = req.query;
      const pool = await getConnection();
      const request = pool.request()
        .input("branchId", sql.Int, branchId);

      let nameFilter = "";
      if (name && name.trim()) {
        request.input("name", sql.NVarChar, `%${name.trim()}%`);
        nameFilter = "AND e.FullName LIKE @name";
      }

      const result = await request.query(`
        SELECT e.EmployeeID, e.FullName, e.[Role]
        FROM Employee e
        JOIN EmployeeAssignment ea ON e.EmployeeID = ea.EmployeeID
        WHERE ea.BranchID = @branchId AND ea.EndDate IS NULL
        AND e.[Role] LIKE N'%Doctor%' AND e.WorkStatus = 'Active'
        ${nameFilter}
      `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get doctor schedule
  static async getDoctorSchedule(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const pool = await getConnection();
      const request = pool.request()
        .input("doctorId", sql.Int, doctorId);

      let dateFilter = "";
      if (date) {
        request.input("date", sql.Date, date);
        dateFilter = "AND CAST(a.ScheduleTime AS date) = @date";
      }
      console.log(date);
      const result = await request.query(`
        SELECT a.AppointmentID, a.ScheduleTime, a.[Status]
        FROM Appointment a
        WHERE a.DoctorID = @doctorId ${dateFilter}
        ORDER BY a.ScheduleTime
      `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get doctor available time slots
  static async getDoctorAvailableSlots(req, res) {
    try {
      const { doctorId } = req.params;
      const { date, branchId } = req.query;
      const pool = await getConnection();

      // Get branch working hours
      const branchResult = await pool.request()
        .input("branchId", sql.Int, branchId)
        .query("SELECT OpenTime, CloseTime FROM Branch WHERE BranchID = @branchId");

      if (branchResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }

      const { OpenTime, CloseTime } = branchResult.recordset[0];

      // Parse times
      const openTime = OpenTime.split(':');
      const closeTime = CloseTime.split(':');
      const openHour = parseInt(openTime[0]);
      const openMinute = parseInt(openTime[1]);
      const closeHour = parseInt(closeTime[0]);
      const closeMinute = parseInt(closeTime[1]);

      // Generate time slots every 30 minutes
      const slots = [];
      let currentHour = openHour;
      let currentMinute = openMinute;

      while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const scheduleTime = `${date}T${timeString}:00`;

        // Check if doctor is available at this time
        const checkResult = await pool.request()
          .input("doctorId", sql.Int, doctorId)
          .input("scheduleTime", sql.NVarChar, scheduleTime)
          .query("SELECT dbo.fn_IsDoctorAvailable(@doctorId, CAST(@scheduleTime AS DATETIME)) as IsAvailable");

        const isAvailable = checkResult.recordset[0].IsAvailable;

        slots.push({
          time: timeString,
          available: isAvailable === 1
        });

        // Add 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour += 1;
        }
      }

      res.json({ success: true, data: slots });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Đặt lịch khám
  static async bookAppointment(req, res) {
    try {
      const { branchId, userId, petId, serviceId, doctorId, scheduleTime } = req.body;
      const pool = await getConnection();
      
      const formattedTime = scheduleTime.replace('T', ' ');

      await pool.request()
        .input("BranchID", sql.Int, branchId)
        .input("UserID", sql.Int, userId)
        .input("PetID", sql.Int, petId)
        .input("ServiceID", sql.Int, serviceId)
        .input("DoctorID", sql.Int, doctorId)
        .input("ScheduleTime", sql.NVarChar, formattedTime) 
        .execute("sp_CreateAppointment");

      res.json({ success: true, message: "Đặt lịch thành công!" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 5. Đặt mua sản phẩm
  static async checkout(req, res) {
    const { branchId, userId, items, paymentMethod } = req.body;
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      
      const headerRequest = new sql.Request(transaction);
      const headerResult = await headerRequest
        .input("BranchID", sql.Int, branchId)
        .input("UserID", sql.Int, userId)
        .input("StaffID", sql.Int, 1) 
        .input("PaymentMethod", sql.NVarChar, paymentMethod)
        .output("NewInvoiceID", sql.Int)
        .execute("sp_CreateInvoice");

      const invoiceId = headerResult.output.NewInvoiceID;

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

  // 6. Xem lịch sử
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

  // 7. Lấy danh sách chi nhánh
  static async getBranches(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT BranchID, BranchName, City
        FROM Branch
        ORDER BY BranchName
      `);
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = UserController;
