const express = require("express");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const CashierController = require("../controllers/cashierController");

const router = express.Router();
router.use(apiKeyAuth);

router.get("/services", CashierController.listServices);
router.get("/products", CashierController.listProducts);
router.post("/invoices", CashierController.createInvoice);
router.get("/invoices", CashierController.listInvoices);
router.get("/invoices/:id", CashierController.getInvoiceDetail);

module.exports = router;
