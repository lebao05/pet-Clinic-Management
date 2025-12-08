// src/features/receptionist/components/AppointmentCard.jsx
import React from "react";

const AppointmentCard = ({ appointment }) => {
  const getStatusColor = (status) => {
    const colors = {
      "Check-up": "bg-secondary-500",
      Vaccination: "bg-warning-500",
      "Follow-up": "bg-success-500",
      "Dental Cleaning": "bg-primary-500",
      "Urgent Care": "bg-danger-500",
      Grooming: "bg-blue-500",
      "Bath & Brush": "bg-warning-500",
    };
    return colors[appointment.type] || "bg-neutral-500";
  };

  return (
    <div
      className={`${getStatusColor(
        appointment.type
      )} text-white rounded-lg p-3 text-sm hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between`}
    >
      <div>
        <p className="font-bold truncate">
          {appointment.petName} ({appointment.ownerName})
        </p>
        <p className="text-xs opacity-90 truncate mt-1">{appointment.type}</p>
      </div>
    </div>
  );
};

export default AppointmentCard;
