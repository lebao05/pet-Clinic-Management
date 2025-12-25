import axios from "./axiosClient";

export const getCompanyDashboard = async () => {
    const response = await axios.get("/company-owner/dashboard");
    console.log("Dashboard Response:", response);
    return response.data;
}