// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
router.get("/dashboard", companyController.getDashboard);
router.get("/branch-summary", companyController.getBranchSummary);
router.get("/employees", companyController.getEmployees);
router.post("/assign-employee", companyController.assignEmployeeToBranch);
router.get("/employee-roles", companyController.getEmployeeRoles);
router.get("/branches", companyController.getBranches);
router.post("/add-branch", companyController.addBranch);
router.post("/add-employee", companyController.addEmployee);
router.put("/update-branch/:branchId", companyController.updateBranch);
module.exports = router;
