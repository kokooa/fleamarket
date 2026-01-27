"use client"

import { Smartphone, Laptop, Headphones, Gamepad2, Camera, Watch, Tv, Cpu, ArrowRight } from "lucide-react"

const categories = [
    {
        name: "스마트폰",
        icon: Smartphone,
        count: 12450,
        color: "bg-rose-50 text-rose-600",
    },
    {
        name: "노트북",
        icon: Laptop,
        count: 8320,
        color: "bg-blue-50 text-blue-600",
    },
    {
        name: "오디오",
        icon: Headphones,
        count: 5680,
        color: "bg-violet-50 text-violet-600",
    },
    {
        name: "게임기",
        icon: Gamepad2,
        count: 3420,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        name: "카메라",
        icon: Camera,
        count: 2890,
        color: "bg-amber-50 text-amber-600",
    },
    {
        name: "웨어러블",
        icon: Watch,
        count: 4560,
        color: "bg-cyan-50 text-cyan-600",
    },
    {
        name: "TV/모니터",
        icon: Tv,
        count: 1980,
        color: "bg-pink-50 text-pink-600",
    },
    {
        name: "PC부품",
        icon: Cpu,
        count: 6740,
        color: "bg-orange-50 text-orange-600",
    },
]

export function CategorySection() {
    return (
        <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="text-sm font-semibold text-primary mb-3 block">
                        Categories
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
                        카테고리별 탐색
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        원하는 카테고리를 선택하고 최적의 하자 제품을 찾아보세요
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category, index) => (
                        <button
                            key={category.name}
                            className="group relative p-5 md:p-6 bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 text-left animate-in fade-in slide-in-from-bottom-3"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                                <category.icon className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {category.count.toLocaleString()}개 제품
                            </p>

                            {/* Hover Arrow */}
                            <div className="absolute top-5 right-5 w-8 h-8 bg-muted rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}
