import { useState } from "react";

export function Checkbox({ label, checked, onChange, className, ...props }) {
    return (
        <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                {...props}
            />
            {label && <span className="select-none text-black">{label}</span>}
        </label>
    );
}