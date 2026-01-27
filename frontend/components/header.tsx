"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, User, Menu, X, Box } from "lucide-react"
import { auth, type AuthUser, apiFetch } from '@/lib/auth';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState<AuthUser | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        loadUser();
        // Listen for custom event to update cart
        window.addEventListener('cart-updated', loadUser);
        return () => window.removeEventListener('cart-updated', loadUser);
    }, []);

    const loadUser = async () => {
        const currentUser = auth.getUser();
        setUser(currentUser);

        if (currentUser) {
            try {
                const response = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart`
                );
                const data = await response.json();
                if (data.success) {
                    setCartItemCount(data.data.length);
                }
            } catch (error) {
                console.error('Failed to fetch cart count:', error);
            }
        } else {
            setCartItemCount(0);
        }
    };

    const handleLogout = () => {
        auth.logout();
        setUser(null);
        router.push('/');
        window.location.href = '/';
    };

    if (!mounted) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <Box className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            모듈러
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">
                                카테고리
                            </button>
                            <div className="absolute top-full left-0 w-48 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                <div className="p-1">
                                    {[
                                        { name: '스마트폰', slug: 'smartphones' },
                                        { name: '노트북', slug: 'laptops' },
                                        { name: '오디오', slug: 'audio' },
                                        { name: '게임기', slug: 'gaming' },
                                        { name: '카메라', slug: 'cameras' },
                                        { name: '웨어러블', slug: 'wearables' },
                                        { name: 'TV/모니터', slug: 'displays' },
                                        { name: 'PC부품', slug: 'pc-parts' },
                                    ].map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/products?category=${category.slug}`}
                                            className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {user?.role === 'SELLER' && (
                            <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                                판매자 대시보드
                            </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                                관리자 패널
                            </Link>
                        )}
                    </nav>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="제품 검색..."
                                className="pl-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                            router.push(`/products?search=${encodeURIComponent(target.value.trim())}`);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {user.role !== 'ADMIN' && (
                                    <>
                                        <Link href="/orders">
                                            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-muted rounded-xl" title="내 주문">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </Button>
                                        </Link>
                                        <Link href="/cart">
                                            <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-xl">
                                                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                                                {cartItemCount > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {cartItemCount}
                                                    </span>
                                                )}
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    className="hidden md:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                >
                                    로그아웃
                                </Button>
                                {user.role === 'SELLER' && (
                                    <Link href="/seller/products/new">
                                        <Button className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all">
                                            판매 시작
                                        </Button>
                                    </Link>
                                )}
                                {user.role !== 'SELLER' && user.role !== 'ADMIN' && (
                                    <Link href="/seller/become">
                                        <Button className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all">
                                            판매자 등록
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="hidden md:flex hover:bg-muted rounded-xl">
                                        로그인
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        회원가입
                                    </Button>
                                </Link>
                            </>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-xl"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-3">
                            {/* Mobile Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="제품 검색..."
                                    className="pl-10 bg-muted/50 border-0 rounded-xl"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            if (target.value.trim()) {
                                                setIsMenuOpen(false);
                                                router.push(`/products?search=${encodeURIComponent(target.value.trim())}`);
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <nav className="flex flex-col">
                                <Link href="/products" className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                    전체 상품
                                </Link>
                                <Link href="/products?sort=newest" className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                    신상품
                                </Link>

                                {user ? (
                                    <>
                                        <div className="px-3 py-2 text-sm font-semibold text-foreground border-t border-border/50 my-2 pt-4">
                                            {user.name}님
                                        </div>
                                        {user.role !== 'ADMIN' && (
                                            <>
                                                <Link href="/orders" className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                                    내 주문
                                                </Link>
                                                <Link href="/cart" className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all flex justify-between items-center">
                                                    장바구니
                                                    {cartItemCount > 0 && (
                                                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                                            {cartItemCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="text-left px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                        >
                                            로그아웃
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="border-t border-border/50 my-2"></div>
                                        <Link href="/auth/login" className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                            로그인
                                        </Link>
                                    </>
                                )}
                            </nav>

                            {!user && (
                                <Link href="/auth/register">
                                    <Button className="w-full bg-primary text-primary-foreground rounded-xl">
                                        회원가입
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
