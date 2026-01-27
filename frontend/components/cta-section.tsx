import Link from "next/link"

export function CTASection() {
    return (
        <section className="bg-background border-t border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
                <div className="relative text-center overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 md:p-14">
                    {/* Soft Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
                            지금 바로 시작하세요
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                            더 이상 망설이지 마세요. 결함이 있어도 완벽하게 작동하는 제품들이 여러분을 기다리고 있습니다.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/auth/register"
                                className="px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                무료로 시작하기
                            </Link>
                            <Link
                                href="/products"
                                className="px-7 py-3.5 bg-background border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                            >
                                더 알아보기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
