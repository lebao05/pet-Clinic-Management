const express = require("express");
const DoctorController = require("../controllers/doctorController");

const router = express.Router();

// Demo doctor endpoints (simplified)
router.get("/search-pets", DoctorController.searchPets);
router.get("/pets/:petId/history", DoctorController.getPetHistory);
router.get('/pets/:petId/appointments', DoctorController.getAppointmentsForPet);
router.get("/medicines", DoctorController.searchMedicines);
router.get("/vaccines", DoctorController.listVaccines);
router.post("/records", DoctorController.createExamRecord);

module.exports = router;
