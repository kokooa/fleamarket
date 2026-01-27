import Link from "next/link"
import { Box } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-card border-t border-border">


            {/* Main Footer */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 lg:mb-0">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Box className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold text-foreground">모듈러</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            결함이 있어도 가치가 있다. 전자제품의 새로운 생명을 찾아주는 마켓플레이스.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4 text-sm">마켓플레이스</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">전체 상품</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">신상품</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">카테고리</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4 text-sm">판매자</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">판매 시작</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">판매자 가이드</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">판매자 센터</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4 text-sm">고객지원</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">자주 묻는 질문</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">1:1 문의</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">배송 안내</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">환불 정책</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4 text-sm">회사</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">제휴 문의</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        2026 모듈러. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
