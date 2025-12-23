export function Textarea({ rows = 3, className, ...props }) {
    return (
        <textarea
            rows={rows}
            className={`border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
            {...props}
        />
    )
}