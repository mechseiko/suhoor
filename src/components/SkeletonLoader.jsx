export default function SkeletonLoader({ variant = 'text', width = 'w-full', height = 'h-4', className = '' }) {
    const baseClasses = 'animate-pulse bg-gray-200 rounded'

    const variantClasses = {
        text: 'h-4',
        circle: 'rounded-full',
        rectangle: 'rounded-lg'
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
        />
    )
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLoader
                    key={i}
                    width={i === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    )
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <SkeletonLoader variant="circle" width="w-12" height="h-12" />
            </div>
            <SkeletonLoader width="w-24" height="h-8" className="mb-2" />
            <SkeletonLoader width="w-32" height="h-4" />
        </div>
    )
}
