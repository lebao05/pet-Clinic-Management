export function Select({ value, onValueChange, children }) {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    )
}

export function SelectItem({ value, children }) {
    return <option value={value}>{children}</option>
}
