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
    LineChart,
    Line,
    Legend,
} from "recharts";
function Card({ children, className = "" }) {
    return (
        <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ children, className = "" }) {
    return (
        <div className={`flex justify-between items-center ${className}`}>
            {children}
        </div>
    );
}
function CardContent({ children, className = "" }) {
    return <div className={`p-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
    return <h3 className={`text-lg font-bold ${className}`}>{children}</h3>;
}

function CardDescription({ children, className = "" }) {
    return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}

// ----- Manual Badge -----
function Badge({ children, variant = "solid", className = "" }) {
    const base = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    const style =
        variant === "solid"
            ? "bg-blue-500 text-white"
            : "border border-gray-300 text-gray-700 bg-white";
    return <span className={`${base} ${style} ${className}`}>{children}</span>;
}

// ----- Manual Select -----
function Select({ options, value, onChange, placeholder }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 bg-white rounded px-3 py-1 w-44"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

// ----- Dummy Data -----
const revenueByBranch = [
    { name: "Q.1", revenue: 450 },
    { name: "Q.3", revenue: 320 },
    { name: "Q.7", revenue: 520 },
    { name: "Thu Duc", revenue: 280 },
    { name: "Go Vap", revenue: 350 },
    { name: "Binh Thanh", revenue: 410 },
    { name: "Tan Binh", revenue: 290 },
    { name: "Phu Nhuan", revenue: 380 },
    { name: "Q.10", revenue: 260 },
    { name: "Q.2", revenue: 340 },
];

const monthlyRevenue = [
    { month: "T7/2024", revenue: 1800, target: 2000 },
    { month: "T8/2024", revenue: 2100, target: 2000 },
    { month: "T9/2024", revenue: 1950, target: 2100 },
    { month: "T10/2024", revenue: 2300, target: 2100 },
    { month: "T11/2024", revenue: 2150, target: 2200 },
    { month: "T12/2024", revenue: 2450, target: 2200 },
];

const topServices = [
    { name: "General Checkup", revenue: 580, percentage: 24 },
    { name: "Vaccination", revenue: 450, percentage: 19 },
    { name: "Spa & Grooming", revenue: 380, percentage: 16 },
    { name: "Surgery", revenue: 320, percentage: 13 },
    { name: "Food Sales", revenue: 290, percentage: 12 },
    { name: "Accessories", revenue: 180, percentage: 8 },
];

const petsBySpecies = [
    { name: "Dog", value: 4520, color: "#4F46E5" },
    { name: "Cat", value: 2890, color: "#10B981" },
    { name: "Bird", value: 580, color: "#F59E0B" },
    { name: "Rabbit", value: 320, color: "#EF4444" },
    { name: "Other", value: 122, color: "#8B5CF6" },
];

const topBreeds = [
    { breed: "Poodle", species: "Dog", count: 890 },
    { breed: "Corgi", species: "Dog", count: 720 },
    { breed: "British Shorthair", species: "Cat", count: 650 },
    { breed: "Golden Retriever", species: "Dog", count: 580 },
    { breed: "Persian Cat", species: "Cat", count: 520 },
];

const membershipData = [
    { name: "Basic", value: 4200, color: "#8B5CF6" },
    { name: "Loyal", value: 2100, color: "#10B981" },
    { name: "VIP", value: 850, color: "#F59E0B" },
];

export default function StatisticsPage() {
    const totalMembers = membershipData.reduce((acc, item) => acc + item.value, 0);
    const totalPets = petsBySpecies.reduce((acc, item) => acc + item.value, 0);

    const [timeRange, setTimeRange] = useState("6months");

    const timeOptions = [
        { label: "Last 1 month", value: "1month" },
        { label: "Last 3 months", value: "3months" },
        { label: "Last 6 months", value: "6months" },
        { label: "Last 1 year", value: "1year" },
    ];

    return (
        <div className="space-y-6 p-6 bg-white text-black">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Statistics</h1>
                    <p className="text-gray-600">System-wide data analysis</p>
                </div>
                <Select
                    options={timeOptions}
                    value={timeRange}
                    onChange={setTimeRange}
                    placeholder="Select Time Range"
                />
            </div>

            {/* Monthly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Revenue vs Target (million VND)</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2} />
                            <Line type="monotone" dataKey="target" name="Target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Branch Revenue */}
            <Card>
                <CardHeader>
                    <CardTitle>Branch Revenue</CardTitle>
                    <CardDescription>Total revenue by branch (6 months)</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByBranch}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <Tooltip formatter={(value) => [`${value}M`, "Revenue"]} />
                            <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 2-column grid for top services, pets, breeds, membership */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Services</CardTitle>
                        <CardDescription>Top services in last 6 months</CardDescription>
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
                                            <span className="text-sm text-gray-500">{service.revenue}M</span>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Pets by Species</CardTitle>
                        <CardDescription>Total: {totalPets.toLocaleString()} pets</CardDescription>
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
                        <div className="flex-1 space-y-3">
                            {petsBySpecies.map((item) => (
                                <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Breeds */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Breeds</CardTitle>
                        <CardDescription>Most cared breeds</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {topBreeds.map((item, i) => (
                            <div
                                key={item.breed}
                                className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium">{item.breed}</p>
                                        <p className="text-xs text-gray-500">{item.species}</p>
                                    </div>
                                </div>
                                <Badge variant="outline">{item.count.toLocaleString()}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Membership Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Membership</CardTitle>
                        <CardDescription>Total: {totalMembers.toLocaleString()} members</CardDescription>
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
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                                        </div>
                                        <p className="text-xs text-gray-500">{item.value.toLocaleString()} members</p>
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
