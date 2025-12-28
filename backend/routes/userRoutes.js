// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.get("/branches", UserController.getBranches);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);
router.get("/:id/pets", UserController.getPets);
router.post("/:id/pets", UserController.createPet);
router.get("/:id/appointments", UserController.getAppointments);

router.get("/products/search", UserController.searchProducts);
router.get("/services/:branchId", UserController.getServicesByBranch);
router.get("/doctors/:branchId", UserController.getDoctorsByBranch);
router.get("/doctors/search/:branchId", UserController.searchDoctors);
router.get("/doctors/schedule/:doctorId", UserController.getDoctorSchedule);
router.get("/doctors/available-slots/:doctorId", UserController.getDoctorAvailableSlots);
router.post("/book", UserController.bookAppointment);
router.post("/checkout", UserController.checkout);
router.get("/history/:userId", UserController.getHistory);
module.exports = router;
