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

// ----- Helper Component: Badge -----
function Badge({ children, variant = "solid", className = "" }) {
    const base = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    const style = variant === "solid"
        ? "bg-blue-500 text-white"
        : "border border-gray-300 text-gray-700 bg-white";
    return <span className={`${base} ${style} ${className}`}>{children}</span>;
}

const PET_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const MEMBER_COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#6366F1"];

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const processedData = useMemo(() => {
        if (!dashboardData) return null;

        // 1. Stats Array
        const totalPets = dashboardData.petsBySpecies.reduce((acc, item) => acc + item.Total, 0);
        const stats = [
            {
                title: "Tổng Doanh Thu",
                value: formatCurrency(dashboardData.totalRevenue?.TotalRevenue || 0),
                icon: DollarSign,
            },
            {
                title: "Tổng Nhân Viên",
                value: dashboardData.summary?.totalEmployees || 0,
                icon: Users,
            },
            {
                title: "Số Chi Nhánh",
                value: dashboardData.summary?.totalBranches || 0,
                icon: Building2,
            },
            {
                title: "Thú Cưng Hệ Thống",
                value: totalPets.toLocaleString(),
                icon: PawPrint,
            },
        ];

        // 2. Monthly Revenue
        const monthlyRevenue = (dashboardData.monthlyRevenue || []).map((item) => ({
            month: item.Month,
            revenue: item.Revenue / 1000000,
            fullValue: item.Revenue,
        }));

        // 3. Branch Revenue
        const revenueByBranch = (dashboardData.revenueByBranch || []).map((item) => ({
            name: item.BranchName,
            revenue: item.Revenue / 1000000,
            fullValue: item.Revenue,
        }));

        // 4. Top Services (Sửa lỗi ServiceName -> ItemName)
        const totalServiceRevenue = (dashboardData.topServices || []).reduce((acc, item) => acc + item.TotalRevenue, 0);
        const topServices = (dashboardData.topServices || []).map((item) => ({
            name: item.ItemName,
            revenue: item.TotalRevenue / 1000000,
            fullValue: item.TotalRevenue,
            percentage: totalServiceRevenue ? Math.round((item.TotalRevenue / totalServiceRevenue) * 100) : 0,
        }));

        // 5. Pets Chart
        const petsBySpecies = (dashboardData.petsBySpecies || []).map((item, index) => ({
            name: item.Species,
            value: item.Total,
            color: PET_COLORS[index % PET_COLORS.length],
        }));

        // 6. Membership Chart (LỌC BỎ RANK NULL HOẶC RỖNG)
        const filteredMembers = (dashboardData.membersByRank || []).filter(
            (item) => item.RankName !== null && item.RankName !== undefined && item.RankName !== ""
        );

        const totalMembers = filteredMembers.reduce((acc, item) => acc + item.Total, 0);
        const membershipData = filteredMembers.map((item, index) => ({
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

    if (loading) return <div className="flex items-center justify-center min-h-screen">Đang tải dữ liệu...</div>;
    if (!processedData) return <div className="flex items-center justify-center min-h-screen">Không có dữ liệu</div>;

    const { stats, monthlyRevenue, revenueByBranch, topServices, petsBySpecies, membershipData, totalPets, totalMembers } = processedData;

    return (
        <div className="space-y-6 p-6 bg-gray-50 text-black min-h-screen">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                            <stat.icon className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Monthly Revenue */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Doanh Thu Hàng Tháng (Triệu VNĐ)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                formatter={(val, name, props) => [formatCurrency(props.payload.fullValue), "Doanh thu"]}
                            />
                            <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Doanh Thu Chi Nhánh</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* 1. Xóa layout="vertical" để quay về mặc định là cột đứng */}
                            <BarChart data={revenueByBranch} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                {/* 2. CartesianGrid: đổi sang kẻ ngang (vertical={false}) */}
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                                {/* 3. XAxis: Bây giờ hiển thị tên chi nhánh */}
                                <XAxis
                                    dataKey="name"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0} // Hiển thị đầy đủ tên các chi nhánh
                                />

                                {/* 4. YAxis: Hiển thị giá trị (triệu VNĐ) */}
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}M`} // Thêm chữ M cho gọn hoặc để trống
                                />

                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    formatter={(val, name, props) => [formatCurrency(props.payload.fullValue), "Doanh thu"]}
                                />

                                {/* 5. Bar: Đổi radius thành [4, 4, 0, 0] để bo góc trên */}
                                <Bar
                                    dataKey="revenue"
                                    fill="#6366F1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Services */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Top Dịch Vụ & Sản Phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5"> {/* Tăng khoảng cách một chút cho thoáng */}
                            {topServices.slice(0, 5).map((service, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-gray-800">
                                                {service.name}
                                            </span>
                                            {/* Hiển thị số tiền doanh thu thực tế */}
                                            <span className="text-xs text-blue-600 font-medium">
                                                {formatCurrency(service.fullValue)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500">
                                            {service.percentage}%
                                        </span>
                                    </div>

                                    {/* Thanh progress bar */}
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${service.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>  {/* Pets by Species */}
                <Card className="border-none shadow-sm">
                    <CardHeader><CardTitle>Cơ Cấu Thú Cưng</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={petsBySpecies} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {petsBySpecies.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            {petsBySpecies.map((item) => (
                                <div key={item.name} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.name}: <strong>{item.value}</strong></span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Membership Rank - ĐÃ LỌC NULL */}
                <Card className="border-none shadow-sm">
                    <CardHeader><CardTitle>Hạng Thành Viên</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={membershipData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {membershipData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full space-y-3 mt-4">
                            {membershipData.map((item) => (
                                <div key={item.name} className="text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span>{item.name}</span>
                                        <span>{((item.value / totalMembers) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full">
                                        <div className="h-full rounded-full" style={{ width: `${(item.value / totalMembers) * 100}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}