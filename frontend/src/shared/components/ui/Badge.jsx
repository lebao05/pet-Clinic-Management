export function Badge({ children, variant }) {
    let baseClass = "px-2 py-1 rounded text-sm font-medium ";
    if (variant === "default") baseClass += "bg-green-100 text-green-800";
    else if (variant === "secondary") baseClass += "bg-gray-200 text-gray-800";
    return <span className={baseClass}>{children}</span>
}