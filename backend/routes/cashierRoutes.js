const express = require("express");
const CashierController = require("../controllers/cashierController");

const router = express.Router();

// Demo cashier endpoints (simplified)
router.get("/search-pets", CashierController.searchPets);
router.post("/walkin", CashierController.createWalkin);
router.get("/invoices", CashierController.listInvoices);
router.get("/appointments", CashierController.listAppointments);
router.post("/invoices", CashierController.createInvoice);
router.get("/invoices/:id", CashierController.getInvoiceDetail);
router.get("/pets/:petId", CashierController.checkPet);

module.exports = router;
