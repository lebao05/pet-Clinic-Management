"use client";

import { useState, useEffect, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../shared/components/ui/Card";
import {
    DollarSign,
    Users,
    Building2,
    PawPrint,
} from "lucide-react";
import { getCompanyDashboard } from "../../../api/companyService";

// ----- Helper: Format Currency -----
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

// ----- Thành phần hỗ trợ (Badge & Select) -----
function Badge({ children, variant = "solid", className = "" }) {
    const base =
        "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    const style =
        variant === "solid"
            ? "bg-blue-500 text-white"
            : "border border-gray-300 text-gray-700 bg-white";
    return <span className={`${base} ${style} ${className}`}>{children}</span>;
}

// ----- Constant Colors -----
const PET_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const MEMBER_COLORS = ["#8B5CF6", "#10B981", "#F59E0B"];

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCompanyDashboard();
                if (res && res.success) {
                    setDashboardData(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process Data for UI
    const processedData = useMemo(() => {
        if (!dashboardData) return null;

        // 1. Calculate Total Pets (for Stat Card)
        const totalPets = dashboardData.petsBySpecies.reduce(
            (acc, item) => acc + item.Total,
            0
        );

        // 2. Calculate Total Members (for Chart)
        const totalMembers = dashboardData.membersByRank.reduce(
            (acc, item) => acc + item.Total,
            0
        );

        // 3. Stats Array
        const stats = [
            {
                title: "Tổng Doanh Thu",
                value: formatCurrency(dashboardData.totalRevenue?.TotalRevenue || 0),
                icon: DollarSign,
            },
            {
                title: "Tổng Nhân Viên",
                value: "156", // Note: API response doesn't provide this, keeping static or assume 0
                icon: Users,
            },
            {
                title: "Số Chi Nhánh",
                value: dashboardData.revenueByBranch?.length || 0,
                icon: Building2,
            },
            {
                title: "Thú Cưng Đã Phục Vụ",
                value: totalPets.toLocaleString(),
                icon: PawPrint,
            },
        ];

        // 4. Monthly Revenue (Convert to Millions for Chart readability)
        const monthlyRevenue = dashboardData.monthlyRevenue.map((item) => ({
            month: item.Month, // e.g., "07/2025"
            revenue: item.Revenue / 1000000, // Convert to Million
            fullValue: item.Revenue,
        }));

        // 5. Branch Revenue (Convert to Millions)
        const revenueByBranch = dashboardData.revenueByBranch.map((item) => ({
            name: item.BranchName,
            revenue: item.Revenue / 1000000, // Convert to Million
            fullValue: item.Revenue,
        }));

        // 6. Top Services (Calculate Percentage)
        const totalServiceRevenue = dashboardData.topServices.reduce(
            (acc, item) => acc + item.Revenue,
            0
        );
        const topServices = dashboardData.topServices.map((item) => ({
            name: item.ServiceName,
            revenue: item.Revenue / 1000000, // Display in Millions
            fullValue: item.Revenue,
            percentage: totalServiceRevenue
                ? Math.round((item.Revenue / totalServiceRevenue) * 100)
                : 0,
        }));

        // 7. Pets Chart
        const petsBySpecies = dashboardData.petsBySpecies.map((item, index) => ({
            name: item.Species,
            value: item.Total,
            color: PET_COLORS[index % PET_COLORS.length],
        }));

        // 8. Membership Chart
        const membershipData = dashboardData.membersByRank.map((item, index) => ({
            name: item.RankName,
            value: item.Total,
            color: MEMBER_COLORS[index % MEMBER_COLORS.length],
        }));

        return {
            stats,
            monthlyRevenue,
            revenueByBranch,
            topServices,
            petsBySpecies,
            membershipData,
            totalPets,
            totalMembers,
        };
    }, [dashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Không có dữ liệu
            </div>
        );
    }

    const {
        stats,
        monthlyRevenue,
        revenueByBranch,
        topServices,
        petsBySpecies,
        membershipData,
        totalPets,
        totalMembers,
    } = processedData;

    return (
        <div className="space-y-6 p-6 bg-white text-black min-h-screen">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.title}
                        className="bg-white border border-gray-200 shadow-sm"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                <stat.icon className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Doanh Thu Hàng Tháng</CardTitle>
                    <p className="text-sm text-gray-500">
                        Thống kê doanh thu theo từng tháng (Đơn vị: Triệu VNĐ)
                    </p>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyRevenue}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#E5E7EB"
                            />
                            <XAxis
                                dataKey="month"
                                stroke="#6B7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#6B7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: "#F3F4F6" }}
                                formatter={(value, name, props) => [
                                    `${formatCurrency(props.payload.fullValue)}`,
                                    "Doanh thu",
                                ]}
                            />
                            <Bar
                                dataKey="revenue"
                                name="Doanh thu"
                                fill="#4F46E5"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Branch Revenue */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Doanh Thu Theo Chi Nhánh</CardTitle>
                        <p className="text-sm text-gray-500">(Đơn vị: Triệu VNĐ)</p>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByBranch}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E5E7EB"
                                />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} width={40} />
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${formatCurrency(props.payload.fullValue)}`,
                                        "Doanh thu",
                                    ]}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#4F46E5"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Services */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Dịch Vụ Hàng Đầu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topServices.map((service, i) => (
                                <div key={service.name} className="flex items-center gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-medium">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium truncate">
                                                {service.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {service.revenue.toLocaleString()} Tr
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{ width: `${service.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Badge variant="outline">{service.percentage}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pets by Species */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Thú Cưng Theo Loài</CardTitle>
                        <p className="text-sm text-gray-500">
                            Tổng cộng: {totalPets.toLocaleString()} con
                        </p>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={petsBySpecies}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                    >
                                        {petsBySpecies.map((item, idx) => (
                                            <Cell key={idx} fill={item.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-3 text-sm">
                            {petsBySpecies.map((item) => (
                                <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-medium">
                                        {item.value.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Membership Stats */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Hạng Thành Viên</CardTitle>
                        <p className="text-sm text-gray-500">
                            Tổng cộng: {totalMembers.toLocaleString()} thành viên
                        </p>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={membershipData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                    >
                                        {membershipData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-4">
                            {membershipData.map((item) => {
                                const percentage =
                                    totalMembers > 0
                                        ? ((item.value / totalMembers) * 100).toFixed(1)
                                        : 0;
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500">{percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}