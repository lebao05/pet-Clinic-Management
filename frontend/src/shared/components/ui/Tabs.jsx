export function Tabs({ children, defaultValue }) {
    const [active, setActive] = useState(defaultValue)
    return (
        <div>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { active, setActive })
            )}
        </div>
    )
}

export function TabsList({ children }) {
    return <div className="flex border-b border-gray-200">{children}</div>
}

export function TabsTrigger({ children, value, active, setActive }) {
    const isActive = active === value
    return (
        <button
            className={`px-4 py-2 -mb-px font-medium ${isActive ? "border-b-2 border-blue-500 text-black" : "text-gray-500"}`}
            onClick={() => setActive(value)}
        >
            {children}
        </button>
    )
}

export function TabsContent({ children, value, active }) {
    return active === value ? <div className="p-4">{children}</div> : null
}