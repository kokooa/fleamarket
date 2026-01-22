'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';
import ConditionBadge from '@/components/ConditionBadge';

interface Product {
    id: string;
    name: string;
    brand?: string;
    sellingPrice: number;
    status: string;
    condition?: {
        overallGrade: any;
    };
    images?: Array<{ url: string }>;
    createdAt: string;
}

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        if (currentUser.role === 'BUYER') {
            router.push('/seller/become');
            return;
        }

        setUser(currentUser);
        fetchMyProducts();
    }, [router]);

    const fetchMyProducts = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products?sellerId=${auth.getUser()?.id}`
            );

            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    const filteredProducts = products.filter((product) => {
        if (filter === 'all') return true;
        if (filter === 'active') return product.status === 'ACTIVE';
        if (filter === 'pending') return product.status === 'PENDING_APPROVAL';
        if (filter === 'sold') return product.status === 'SOLD';
        return true;
    });

    const statuses = [
        { key: 'all', label: '전체', count: products.length },
        { key: 'active', label: '판매중', count: products.filter((p) => p.status === 'ACTIVE').length },
        { key: 'pending', label: '승인대기', count: products.filter((p) => p.status === 'PENDING_APPROVAL').length },
        { key: 'sold', label: '판매완료', count: products.filter((p) => p.status === 'SOLD').length },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">판매자 대시보드</h1>
                    <p className="text-gray-600">
                        안녕하세요, <span className="font-semibold">{user.sellerProfile?.shopName || user.name}</span>님!
                    </p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {statuses.map((status) => (
                        <button
                            key={status.key}
                            onClick={() => setFilter(status.key)}
                            className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${filter === status.key ? 'ring-2 ring-indigo-500' : ''
                                }`}
                        >
                            <div className="text-sm text-gray-600 mb-1">{status.label}</div>
                            <div className="text-3xl font-bold text-gray-900">{status.count}</div>
                        </button>
                    ))}
                </div>

                {/* 액션 버튼 */}
                <div className="mb-8 flex gap-4">
                    <Link
                        href="/seller/products/new"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        새 제품 등록
                    </Link>
                </div>

                {/* 제품 목록 */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">내 제품 목록</h2>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">로딩 중...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">
                                    {filter === 'all' ? '등록된 제품이 없습니다.' : `${statuses.find((s) => s.key === filter)?.label} 제품이 없습니다.`}
                                </p>
                                <Link
                                    href="/seller/products/new"
                                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    첫 번째 제품 등록하기
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map((product) => {
                                    const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';
                                    const statusLabels: Record<string, { label: string; color: string }> = {
                                        ACTIVE: { label: '판매중', color: 'bg-green-100 text-green-700' },
                                        PENDING_APPROVAL: { label: '승인대기', color: 'bg-yellow-100 text-yellow-700' },
                                        REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-700' },
                                        SOLD: { label: '판매완료', color: 'bg-gray-100 text-gray-700' },
                                    };

                                    const status = statusLabels[product.status] || { label: product.status, color: 'bg-gray-100 text-gray-700' };

                                    return (
                                        <div key={product.id} className="flex items-center gap-6 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                            {/* 이미지 */}
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />

                                            {/* 정보 */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {product.brand && <span className="text-gray-600">{product.brand} </span>}
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {product.sellingPrice.toLocaleString()}원
                                                    </span>
                                                    {product.condition && (
                                                        <ConditionBadge grade={product.condition.overallGrade} size="sm" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className={`px-3 py-1 rounded-full font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    <span>등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}</span>
                                                </div>
                                            </div>

                                            {/* 액션 버튼 */}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                                >
                                                    보기
                                                </Link>
                                                {product.status !== 'SOLD' && (
                                                    <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium">
                                                        수정
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
