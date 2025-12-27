import axios from "./axiosClient";

export const getCompanyDashboard = async () => {
    const response = await axios.get("/company-owner/dashboard");
    console.log("Dashboard Response:", response);
    return response.data;
}

export const getBranchSummary = async () => {
    const response = await axios.get("/company-owner/branch-summary");
    console.log("Branch Summary Response:", response);
    return response.data;
}
export const addBranch = async ({ branchName, address, phone, openTime, closeTime }) => {
    const response = await axios.post("/company-owner/add-branch", { branchName, address, phone, openTime, closeTime });
    console.log("Add Branch Response:", response);
    return response.data;
}

export const addEmployee = async ({ name, email, phone, role, branchId }) => {
    const response = await axios.post("/company-owner/add-employee", { name, email, phone, role, branchId });
    console.log("Add Employee Response:", response);
    return response.data;
}
export const getEmployees = async ({ role, branchId, page, pageSize }) => {
    const response = await axios.get("/company-owner/employees", {
        params: { role, branchId, page, pageSize }
    });
    console.log("Employees Response:", response);
    return response.data;
}

export const assignEmployeeToBranch = async ({ employeeId, branchId }) => {
    const response = await axios.post("/company-owner/assign-employee", { employeeId, branchId });
    console.log("Assign Employee Response:", response);
    return response.data;
}

export const getEmployeeRoles = async () => {
    const response = await axios.get("/company-owner/employee-roles");
    console.log("Employee Roles Response:", response);
    return response.data;
}
export const getBranches = async () => {
    const response = await axios.get("/company-owner/branches");
    console.log("Branches Response:", response);
    return response.data;
}
export const updateBranch = async (branchId, { branchName, address, phone, openTime, closeTime }) => {
    const response = await axios.put(`/company-owner/update-branch/${branchId}`, { branchName, address, phone, openTime, closeTime });
    console.log("Update Branch Response:", response);
    return response.data;
}