export function Dialog({ open, onOpenChange, children }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow w-full max-w-lg">{children}</div>
        </div>
    )
}
export function DialogContent({ children, className }) {
    return <div className={`p-4 ${className}`}>{children}</div>
}
export function DialogHeader({ children }) {
    return <div className="mb-4">{children}</div>
}
export function DialogTitle({ children }) {
    return <h2 className="text-lg font-bold">{children}</h2>
}
export function DialogDescription({ children }) {
    return <p className="text-gray-600">{children}</p>
}
export function DialogFooter({ children }) {
    return <div className="flex justify-end gap-2 mt-4">{children}</div>
}