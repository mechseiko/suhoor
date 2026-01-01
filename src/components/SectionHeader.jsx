export default function SectionHeader({ title, subtitle, className = "" }) {
    return (
        <div className={`text-center md:mb-10 mb-8 ${className}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {title}
            </h2>
            {subtitle && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    )
}

