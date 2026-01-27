'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            id: string;
            name: string;
            brand?: string;
            images?: Array<{ url: string }>;
        };
    }>;
}

export default function OrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        setUser(currentUser);
        fetchOrders();
    }, [router]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetch('/orders');

            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    const statusLabels: Record<string, { label: string; color: string }> = {
        PENDING: { label: '결제 대기', color: 'bg-yellow-100 text-yellow-700' },
        PAID: { label: '결제 완료', color: 'bg-blue-100 text-blue-700' },
        PROCESSING: { label: '처리 중', color: 'bg-indigo-100 text-indigo-700' },
        SHIPPED: { label: '배송 중', color: 'bg-purple-100 text-purple-700' },
        DELIVERED: { label: '배송 완료', color: 'bg-green-100 text-green-700' },
        CANCELLED: { label: '취소됨', color: 'bg-red-100 text-red-700' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">내 주문</h1>
                    <p className="text-gray-600">주문 내역을 확인하고 관리하세요</p>
                </div>

                {/* 주문 목록 */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">로딩 중...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">주문 내역이 없습니다</h3>
                        <p className="text-gray-600 mb-8">
                            마음에 드는 제품을 찾아 첫 주문을 해보세요!
                        </p>
                        <Link
                            href="/products"
                            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                        >
                            제품 둘러보기
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const status = statusLabels[order.status] || {
                                label: order.status,
                                color: 'bg-gray-100 text-gray-700',
                            };

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                >
                                    {/* 주문 헤더 */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    주문일: {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    주문번호: {order.id.slice(0, 8)}...
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                                <p className="text-lg font-bold text-gray-900 mt-2">
                                                    {order.totalAmount.toLocaleString()}원
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 주문 상품 목록 */}
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {order.orderItems.map((item) => {
                                                const imageUrl =
                                                    item.product.images?.[0]?.url || '/placeholder-product.png';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.product.name}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                {item.product.brand && (
                                                                    <span className="text-gray-600">
                                                                        {item.product.brand}{' '}
                                                                    </span>
                                                                )}
                                                                {item.product.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                수량: {item.quantity}개 × {item.price.toLocaleString()}원
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900">
                                                                {(item.quantity * item.price).toLocaleString()}원
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div className="mt-6 flex gap-3 justify-end">
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                상세보기
                                            </Link>
                                            {order.status === 'PENDING' && (
                                                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                                    주문 취소
                                                </button>
                                            )}
                                            {order.status === 'DELIVERED' && (
                                                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                                    리뷰 작성
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
