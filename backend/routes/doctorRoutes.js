const express = require("express");
const DoctorController = require("../controllers/doctorController");

const router = express.Router();

// Simple demo endpoints for Doctor portal
router.get("/vaccines", DoctorController.listVaccines);
router.get("/appointments", DoctorController.listAppointments);
router.get("/appointments/:id", DoctorController.getAppointmentDetail);
router.patch("/appointments/:id/status", DoctorController.updateAppointmentStatus);
router.post("/exam-records", DoctorController.upsertExamRecord);
router.post("/vaccination-records", DoctorController.upsertVaccinationRecord);

module.exports = router;
