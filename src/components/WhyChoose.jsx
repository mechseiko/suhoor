import { Shield, Zap, Heart, Globe } from 'lucide-react'

export default function WhyChoose() {
    const reasons = [
        {
            icon: Shield,
            title: "Privacy First",
            desc: "Your data stays yours. No tracking, no ads, just pure functionality."
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            desc: "Built for speed. Create groups and get started in under a minute."
        },
        {
            icon: Heart,
            title: "Made with Care",
            desc: "Designed by Muslims, for Muslims. We understand your needs."
        },
        {
            icon: Globe,
            title: "Works Everywhere",
            desc: "Access from any device, anywhere in the world. Always free."
        }
    ];

    return (
        <div className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Why Choose Suhoor?
                    </h2>
                    <p className="text-gray-600">
                        Built with the Ummah in mind
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reasons.map((item, idx) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={idx}
                                className="group text-center"
                            >
                                <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4 group-hover:bg-primary transition-colors duration-300">
                                    <Icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
