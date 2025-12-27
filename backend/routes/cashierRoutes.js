const express = require("express");
const CashierController = require("../controllers/cashierController");

const router = express.Router();

// Simple demo endpoints for Cashier POS
router.get("/pets", CashierController.listPetsByUser);
router.get("/services", CashierController.listServices);
router.get("/products", CashierController.listProducts);
router.post("/invoices", CashierController.createInvoice);
router.get("/invoices", CashierController.listInvoices);
router.get("/invoices/:id", CashierController.getInvoiceDetail);

module.exports = router;
