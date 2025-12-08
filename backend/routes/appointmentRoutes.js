// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");

router.get("/", AppointmentController.getAll);
router.get("/date/:date", AppointmentController.getByDate);
router.get("/:id", AppointmentController.getById);
router.post("/", AppointmentController.create);
router.put("/:id", AppointmentController.update);
router.delete("/:id", AppointmentController.cancel);

module.exports = router;
