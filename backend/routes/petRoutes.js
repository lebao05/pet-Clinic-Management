// routes/petRoutes.js
const express = require("express");
const router = express.Router();
const PetController = require("../controllers/petController");

router.get("/", PetController.getAll);
router.get("/:id", PetController.getById);
router.post("/", PetController.create);
router.put("/:id", PetController.update);
router.delete("/:id", PetController.delete);
router.get("/:id/medical-history", PetController.getMedicalHistory);

module.exports = router;
