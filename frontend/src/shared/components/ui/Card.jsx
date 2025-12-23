// Card components
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`flex items-center justify-between mb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`text-sm font-medium ${className}`}>{children}</h2>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`mt-2 ${className}`}>{children}</div>;
}
