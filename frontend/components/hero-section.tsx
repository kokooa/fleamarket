"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, BadgePercent, Recycle, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
            {/* Soft Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl float-animation" />
                <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-secondary rounded-full blur-3xl float-animation" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/50 rounded-full blur-3xl" />

                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.9_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0_0)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">친환경 스마트 쇼핑</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <span className="text-foreground">결함이 있어도</span>
                    <br />
                    <span className="text-primary">가치</span>
                    <span className="text-foreground">가 있다</span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    검증된 하자 제품을 <span className="text-foreground font-medium">최대 90% 할인</span>된 가격에 만나보세요.
                    <br className="hidden sm:block" />
                    새 제품과 다름없는 품질, 합리적인 가격의 현명한 선택.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <Link href="/products">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group">
                            지금 둘러보기
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="/seller/become">
                        <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted text-base px-8 py-6 rounded-xl bg-background transition-all">
                            판매 등록하기
                        </Button>
                    </Link>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl shadow-sm">
                        <BadgePercent className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">최대 90% 할인</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl shadow-sm">
                        <Recycle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">친환경 소비</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl shadow-sm">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">품질 보증</span>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>
    )
}
