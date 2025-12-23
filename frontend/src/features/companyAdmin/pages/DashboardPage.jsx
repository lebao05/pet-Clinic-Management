"use client"

import { useState } from "react";
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
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { DollarSign, Users, Building2, PawPrint, TrendingUp, TrendingDown } from "lucide-react";

// ----- Thành phần hỗ trợ (Badge & Select) -----
function Badge({ children, variant = "solid", className = "" }) {
    const base = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    const style = variant === "solid" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700 bg-white";
    return <span className={`${base} ${style} ${className}`}>{children}</span>;
}

function Select({ options, value, onChange, placeholder }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 bg-white rounded px-3 py-1 w-44 outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

// ----- Dữ liệu mẫu -----
const stats = [
    { title: "Tổng Doanh Thu", value: "2.450.000.000₫", change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Tổng Nhân Viên", value: "156", change: "+8", trend: "up", icon: Users },
    { title: "Số Chi Nhánh", value: "10", change: "0", trend: "neutral", icon: Building2 },
    { title: "Thú Cưng Đã Phục Vụ", value: "8.432", change: "+234", trend: "up", icon: PawPrint },
];

const revenueByBranch = [
    { name: "Q.1", revenue: 450 }, { name: "Q.3", revenue: 320 }, { name: "Q.7", revenue: 520 },
    { name: "Thủ Đức", revenue: 280 }, { name: "Gò Vấp", revenue: 350 }, { name: "Bình Thạnh", revenue: 410 },
    { name: "Tân Bình", revenue: 290 }, { name: "Phú Nhuận", revenue: 380 }, { name: "Q.10", revenue: 260 }, { name: "Q.2", revenue: 340 },
];

const monthlyRevenue = [
    { month: "T7/2024", revenue: 1800 },
    { month: "T8/2024", revenue: 2100 },
    { month: "T9/2024", revenue: 1950 },
    { month: "T10/2024", revenue: 2300 },
    { month: "T11/2024", revenue: 2150 },
    { month: "T12/2024", revenue: 2450 },
];

const topServices = [
    { name: "Khám Tổng Quát", revenue: 580, percentage: 24 },
    { name: "Tiêm Chủng", revenue: 450, percentage: 19 },
    { name: "Spa & Grooming", revenue: 380, percentage: 16 },
    { name: "Phẫu Thuật", revenue: 320, percentage: 13 },
    { name: "Bán Thức Ăn", revenue: 290, percentage: 12 },
    { name: "Phụ Kiện", revenue: 180, percentage: 8 },
];

const petsBySpecies = [
    { name: "Chó", value: 4520, color: "#4F46E5" },
    { name: "Mèo", value: 2890, color: "#10B981" },
    { name: "Chim", value: 580, color: "#F59E0B" },
    { name: "Thỏ", value: 320, color: "#EF4444" },
    { name: "Khác", value: 122, color: "#8B5CF6" },
];

const membershipData = [
    { name: "Cơ bản", value: 4200, color: "#8B5CF6" },
    { name: "Thân thiết", value: 2100, color: "#10B981" },
    { name: "VIP", value: 850, color: "#F59E0B" },
];

export default function DashboardPage() {
    const totalMembers = membershipData.reduce((acc, item) => acc + item.value, 0);
    const totalPets = petsBySpecies.reduce((acc, item) => acc + item.value, 0);
    const [timeRange, setTimeRange] = useState("6months");

    const timeOptions = [
        { label: "1 tháng qua", value: "1month" },
        { label: "3 tháng qua", value: "3months" },
        { label: "6 tháng qua", value: "6months" },
        { label: "1 năm qua", value: "1year" },
    ];

    return (
        <div className="space-y-6 p-6 bg-white text-black min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tổng Quan Hệ Thống</h1>
                    <p className="text-gray-600">Xin chào, đây là báo cáo phân tích dữ liệu của bạn</p>
                </div>
                <Select
                    options={timeOptions}
                    value={timeRange}
                    onChange={setTimeRange}
                    placeholder="Chọn khoảng thời gian"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                <stat.icon className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 text-xs">
                                {stat.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : stat.trend === "down" ? (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                ) : null}
                                <span className={stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"}>
                                    {stat.change}
                                </span>
                                <span className="text-gray-500 ml-1">so với tháng trước</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Monthly Revenue Chart - Simple Bar Chart */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Doanh Thu Hàng Tháng</CardTitle>
                    <p className="text-sm text-gray-500">Thống kê doanh thu theo từng tháng (triệu VNĐ)</p>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                                cursor={{ fill: '#F3F4F6' }}
                                formatter={(value) => [`${value} Tr`, "Doanh thu"]}
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
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByBranch}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip formatter={(value) => [`${value} Tr`, "Doanh thu"]} />
                                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
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
                                            <span className="font-medium truncate">{service.name}</span>
                                            <span className="text-sm text-gray-500">{service.revenue} Tr</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${service.percentage}%` }} />
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
                        <p className="text-sm text-gray-500">Tổng cộng: {totalPets.toLocaleString()} con</p>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={petsBySpecies} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
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
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-medium">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Membership Stats */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Hạng Thành Viên</CardTitle>
                        <p className="text-sm text-gray-500">Tổng cộng: {totalMembers.toLocaleString()} thành viên</p>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={membershipData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
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
                                const percentage = ((item.value / totalMembers) * 100).toFixed(1);
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500">{percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
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