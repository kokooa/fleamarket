'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, type AuthUser, apiFetch } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        setMounted(true);
        loadUser();
    }, []);

    // pathname이 변경될 때마다 사용자 정보 다시 로드
    useEffect(() => {
        if (mounted) {
            loadUser();
        }
    }, [pathname, mounted]);

    const loadUser = async () => {
        const currentUser = auth.getUser();
        setUser(currentUser);

        // 로그인된 사용자인 경우 장바구니 개수 조회
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
        setShowUserMenu(false);
        router.push('/');
        // 강제로 페이지 새로고침하여 상태 초기화
        window.location.href = '/';
    };

    // 서버 사이드 렌더링 중에는 아무것도 표시하지 않음
    if (!mounted) {
        return (
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    중고전자
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                중고전자
                            </span>
                        </Link>
                        <Link
                            href="/products"
                            className="ml-10 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                        >
                            제품 둘러보기
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* 판매자 전용 메뉴 */}
                                {user.role === 'SELLER' && (
                                    <Link
                                        href="/seller"
                                        className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                    >
                                        판매자 대시보드
                                    </Link>
                                )}

                                {/* 관리자 전용 메뉴 */}
                                {user.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                                    >
                                        관리자 패널
                                    </Link>
                                )}

                                {/* 장바구니 */}
                                <Link
                                    href="/cart"
                                    className="relative text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>

                                {/* 사용자 메뉴 */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm text-gray-500">로그인 중:</p>
                                                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {user.role === 'ADMIN' ? '관리자' : user.role === 'SELLER' ? '판매자' : '구매자'}
                                                </p>
                                            </div>

                                            <Link
                                                href="/orders"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                내 주문
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md hover:shadow-lg"
                                >
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-indigo-600 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        <Link
                            href="/products"
                            className="block py-2 text-gray-700 hover:text-indigo-600 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            제품 둘러보기
                        </Link>

                        {user ? (
                            <>
                                <div className="py-2 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">로그인 중:</p>
                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {user.role === 'ADMIN' ? '관리자' : user.role === 'SELLER' ? '판매자' : '구매자'}
                                    </p>
                                </div>

                                {user.role === 'SELLER' && (
                                    <Link
                                        href="/seller"
                                        className="block py-2 text-gray-700 hover:text-indigo-600 font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        판매자 대시보드
                                    </Link>
                                )}

                                {user.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        관리자 패널
                                    </Link>
                                )}

                                <Link
                                    href="/orders"
                                    className="block py-2 text-gray-700 hover:text-indigo-600 font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    내 주문
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="block py-2 text-gray-700 hover:text-indigo-600 font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="block py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
