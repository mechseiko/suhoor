export default function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}
