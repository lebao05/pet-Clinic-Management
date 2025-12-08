// src/shared/components/ui/Avatar.jsx
import React from "react";

const Avatar = ({ src, name, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-secondary-500 text-white flex items-center justify-center font-semibold`}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
    </div>
  );
};

export default Avatar;
