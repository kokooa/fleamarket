"use client"

import { useEffect, useState } from "react"
import { Package, Users, Percent, Leaf } from "lucide-react"

const stats = [
    { value: 50000, suffix: "+", label: "등록된 제품", icon: Package },
    { value: 30000, suffix: "+", label: "만족한 고객", icon: Users },
    { value: 90, suffix: "%", label: "최대 할인율", icon: Percent },
    { value: 500, suffix: "톤", label: "전자폐기물 절감", icon: Leaf },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value])

    return (
        <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {count.toLocaleString()}{suffix}
        </span>
    )
}

export function StatsSection() {
    return (
        <section className="relative py-16 md:py-24 bg-muted/30 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.55_0.15_250_/_0.05)_0%,_transparent_60%)]" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="text-center p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-3"
                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                        >
                            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            <p className="mt-2 text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
