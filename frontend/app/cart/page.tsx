'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';
import ConditionBadge from '@/components/ConditionBadge';

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        brand?: string;
        sellingPrice: number;
        originalPrice?: number;
        status: string;
        condition?: {
            overallGrade: any;
        };
        images?: Array<{ url: string }>;
    };
}

export default function CartPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        setUser(currentUser);
        fetchCart();
    }, [router]);

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart`
            );

            const data = await response.json();
            if (data.success) {
                setCartItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            setUpdatingItems(prev => new Set(prev).add(itemId));

            const response = await apiFetch(
                `/cart/${itemId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ quantity: newQuantity }),
                }
            );

            if (response.ok) {
                setCartItems(items =>
                    items.map(item =>
                        item.id === itemId ? { ...item, quantity: newQuantity } : item
                    )
                );
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const removeItem = async (itemId: string) => {
        if (!confirm('이 제품을 장바구니에서 제거하시겠습니까?')) return;

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart/${itemId}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                setCartItems(items => items.filter(item => item.id !== itemId));
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const clearCart = async () => {
        if (!confirm('장바구니를 모두 비우시겠습니까?')) return;

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert('장바구니에 상품이 없습니다.');
            return;
        }

        try {
            setIsCheckingOut(true);

            // 주문 생성 API 호출
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        items: cartItems.map(item => ({
                            productId: item.product.id,
                            quantity: item.quantity,
                            price: item.product.sellingPrice,
                        })),
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                alert('주문이 성공적으로 완료되었습니다!');
                router.push('/orders');
            } else {
                alert(data.message || '주문에 실패했습니다.');
            }
        } catch (error) {
            alert('주문 처리 중 오류가 발생했습니다.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!user) {
        return null;
    }

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
        0
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">장바구니</h1>
                        <p className="text-gray-600">{cartItems.length}개의 상품</p>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            전체 비우기
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">로딩 중...</p>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                        <p className="text-gray-600 mb-8">마음에 드는 제품을 담아보세요!</p>
                        <Link
                            href="/products"
                            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                        >
                            제품 둘러보기
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 장바구니 아이템 목록 */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => {
                                const imageUrl = item.product.images?.[0]?.url || '/placeholder-product.png';
                                const isUpdating = updatingItems.has(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl"
                                    >
                                        <div className="flex gap-6">
                                            {/* 이미지 */}
                                            <Link href={`/products/${item.product.id}`}>
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product.name}
                                                    className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                                />
                                            </Link>

                                            {/* 정보 */}
                                            <div className="flex-1">
                                                <Link href={`/products/${item.product.id}`}>
                                                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors cursor-pointer">
                                                        {item.product.brand && (
                                                            <span className="text-gray-600">{item.product.brand} </span>
                                                        )}
                                                        {item.product.name}
                                                    </h3>
                                                </Link>

                                                {item.product.condition && (
                                                    <div className="mb-3">
                                                        <ConditionBadge grade={item.product.condition.overallGrade} size="sm" />
                                                    </div>
                                                )}

                                                <p className="text-2xl font-bold text-gray-900 mb-4">
                                                    {Number(item.product.sellingPrice).toLocaleString()}원
                                                </p>

                                                {/* 수량 조절 */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || isUpdating}
                                                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-6 py-2 font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={isUpdating}
                                                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                                                    >
                                                        제거
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 소계 */}
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">소계</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {(Number(item.product.sellingPrice) * item.quantity).toLocaleString()}원
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 주문 요약 */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">주문 요약</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">상품 수</span>
                                        <span className="font-semibold">{cartItems.length}개</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">총 수량</span>
                                        <span className="font-semibold">
                                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}개
                                        </span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-gray-900">총 금액</span>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {totalAmount.toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || cartItems.length === 0}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? '처리 중...' : '주문하기'}
                                </button>

                                <Link
                                    href="/products"
                                    className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    계속 쇼핑하기
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
