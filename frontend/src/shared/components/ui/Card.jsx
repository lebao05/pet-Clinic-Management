// src/shared/components/ui/Card.jsx
import React from "react";

const Card = ({ children, className = "", hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl p-6 shadow-card
        ${hover ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
