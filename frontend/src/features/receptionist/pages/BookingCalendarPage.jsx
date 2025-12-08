// src/features/receptionist/pages/BookingCalendarPage.jsx
import React, { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import AppointmentCard from "../components/AppointmentCard";

const BookingCalendarPage = () => {
  const [currentDate] = useState(new Date(2024, 9, 26)); // Oct 26, 2024
  const [viewMode, setViewMode] = useState("timeline"); // 'day' or 'timeline'
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState("All");

  // Time slots từ 9:00 AM đến 4:00 PM
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

  // Resources (doctors and rooms)
  const resources = [
    { id: 1, name: "Dr. Emily Smith", type: "doctor" },
    { id: 2, name: "Dr. Ben Jones", type: "doctor" },
    { id: 3, name: "Grooming Station 1", type: "room" },
    { id: 4, name: "Exam Room 1", type: "room" },
  ];

  // Appointments data
  const appointments = [
    { id: 1, resourceId: 1, timeSlot: "9:00 AM", petName: "Max", ownerName: "Miller", type: "Check-up", duration: 1 },
    {
      id: 2,
      resourceId: 1,
      timeSlot: "11:00 AM",
      petName: "Bella",
      ownerName: "Jones",
      type: "Vaccination",
      duration: 1,
    },
    {
      id: 3,
      resourceId: 1,
      timeSlot: "1:00 PM",
      petName: "Charlie",
      ownerName: "Williams",
      type: "Follow-up",
      duration: 1,
    },
    {
      id: 4,
      resourceId: 2,
      timeSlot: "10:00 AM",
      petName: "Lucy",
      ownerName: "Brown",
      type: "Dental Cleaning",
      duration: 2,
    },
    {
      id: 5,
      resourceId: 2,
      timeSlot: "1:00 PM",
      petName: "Cooper",
      ownerName: "Davis",
      type: "Urgent Care",
      duration: 1,
    },
    { id: 6, resourceId: 2, timeSlot: "3:00 PM", petName: "Daisy", ownerName: "Garcia", type: "Check-up", duration: 1 },
    {
      id: 7,
      resourceId: 3,
      timeSlot: "9:00 AM",
      petName: "Rocky",
      ownerName: "Rodriguez",
      type: "Grooming",
      duration: 3,
    },
    {
      id: 8,
      resourceId: 3,
      timeSlot: "2:00 PM",
      petName: "Sadie",
      ownerName: "Martinez",
      type: "Bath & Brush",
      duration: 2,
    },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAppointmentsForSlot = (resourceId, timeSlot) => {
    return appointments.find((apt) => apt.resourceId === resourceId && apt.timeSlot === timeSlot);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Booking Calendar</h1>
            <p className="text-neutral-600 mt-1">{formatDate(currentDate)}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition">←</button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition">→</button>
            <Button icon="➕" className="ml-4">
              New Appointment
            </Button>
          </div>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "day" ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "timeline" ? "bg-primary-400 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Timeline
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 text-sm"
            >
              <option>Status: All</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 text-sm"
            >
              <option>Staff: All</option>
              <option>Dr. Emily Smith</option>
              <option>Dr. Ben Jones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="grid grid-cols-9 border-b border-neutral-200 bg-neutral-50">
              <div className="p-4 font-semibold text-neutral-700 border-r border-neutral-200">Resource</div>
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className="p-4 text-center font-semibold text-neutral-700 border-r border-neutral-200 text-sm"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Resource Rows */}
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="grid grid-cols-9 border-b border-neutral-200 hover:bg-neutral-50 transition"
              >
                {/* Resource Name */}
                <div className="p-4 font-medium text-neutral-900 border-r border-neutral-200 flex items-center">
                  <span className="text-lg mr-2">{resource.type === "doctor" ? "👨‍⚕️" : "🏠"}</span>
                  {resource.name}
                </div>

                {/* Time Slots */}
                {timeSlots.map((timeSlot, index) => {
                  const appointment = getAppointmentsForSlot(resource.id, timeSlot);

                  return (
                    <div key={index} className="p-2 border-r border-neutral-200 min-h-[80px]">
                      {appointment && <AppointmentCard appointment={appointment} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="font-semibold text-neutral-900 mb-3">Appointment Types</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Check-up", color: "bg-secondary-500" },
            { label: "Vaccination", color: "bg-warning-500" },
            { label: "Follow-up", color: "bg-success-500" },
            { label: "Dental Cleaning", color: "bg-primary-500" },
            { label: "Urgent Care", color: "bg-danger-500" },
            { label: "Grooming", color: "bg-blue-500" },
          ].map((type, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${type.color}`}></div>
              <span className="text-sm text-neutral-700">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarPage;
