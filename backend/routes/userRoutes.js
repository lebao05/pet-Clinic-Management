// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);
router.get("/:id/pets", UserController.getPets);
router.get("/:id/appointments", UserController.getAppointments);

router.get("/products/search", UserController.searchProducts);
router.get("/doctors/:branchId", UserController.getDoctorsByBranch);
router.post("/book", UserController.bookAppointment);
router.post("/checkout", UserController.checkout);
router.get("/history/:userId", UserController.getHistory);
module.exports = router;
