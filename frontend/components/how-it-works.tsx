"use client"

import { Search, ShieldCheck, Package, Sparkles } from "lucide-react"

const steps = [
    {
        number: "01",
        icon: Search,
        title: "제품 탐색",
        description: "다양한 카테고리에서 원하는 하자 제품을 검색하고, 상세한 결함 정보를 확인하세요.",
        color: "bg-blue-50 text-blue-600",
    },
    {
        number: "02",
        icon: ShieldCheck,
        title: "결함 확인",
        description: "각 제품의 결함 상태, 작동 여부, 수리 가능성을 투명하게 확인할 수 있습니다.",
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        number: "03",
        icon: Package,
        title: "안전 거래",
        description: "에스크로 결제와 품질 보증으로 안전하게 거래하세요. 문제 시 전액 환불.",
        color: "bg-violet-50 text-violet-600",
    },
    {
        number: "04",
        icon: Sparkles,
        title: "새 생명 부여",
        description: "저렴하게 구매한 제품으로 수리, DIY, 또는 그대로 사용하며 가치를 발견하세요.",
        color: "bg-amber-50 text-amber-600",
    },
]

export function HowItWorks() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="text-sm font-semibold text-primary mb-3 block">
                        How It Works
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
                        이용 방법
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        간단한 4단계로 하자 제품의 새로운 가치를 발견하세요
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                    {/* Connection Line - Desktop */}
                    <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px bg-border" />

                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className="relative group animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                        >
                            {/* Step Card */}
                            <div className="relative p-6 bg-card border border-border rounded-2xl transition-all duration-300 hover:shadow-md hover:border-primary/30">
                                {/* Number Badge */}
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-5 mt-2 transition-transform group-hover:scale-105`}>
                                    <step.icon className="w-7 h-7" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Dot on line - Desktop */}
                            <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-2 border-primary rounded-full group-hover:bg-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
