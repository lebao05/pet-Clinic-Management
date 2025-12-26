const express = require("express");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const DoctorController = require("../controllers/doctorController");

const router = express.Router();
router.use(apiKeyAuth);

router.get("/appointments", DoctorController.listAppointments);
router.get("/appointments/:id", DoctorController.getAppointmentDetail);
router.patch("/appointments/:id/status", DoctorController.updateAppointmentStatus);
router.post("/exam-records", DoctorController.upsertExamRecord);
router.post("/vaccination-records", DoctorController.upsertVaccinationRecord);
router.get("/vaccines", DoctorController.listVaccines);

module.exports = router;
