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
    seller?: {
        name: string;
        email: string;
        sellerProfile?: {
            shopName: string;
        };
    };
    createdAt: string;
}

interface Stats {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    pendingApproval: number;
    activeProducts: number;
    revenue: number;
}

export default function AdminPanel() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Server-side Filtering & Pagination State
    const [statusFilter, setStatusFilter] = useState<string>('all'); // all, pending, active, rejected, sold
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; // Fixed items per page as requested

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        if (currentUser.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        setUser(currentUser);
        fetchStats();
    }, [router]);

    // Fetch products whenever filter, search or page changes
    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user, statusFilter, debouncedSearch, page]);

    const fetchStats = async () => {
        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/stats`
            );

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', LIMIT.toString());
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (debouncedSearch) params.set('search', debouncedSearch);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/products?${params.toString()}`
            );

            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (productId: string) => {
        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/products/${productId}/approve`,
                { method: 'PUT' } // Changed POST to PUT to match routes
            );

            if (response.ok) {
                fetchProducts();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to approve product:', error);
        }
    };

    const handleReject = async (productId: string) => {
        const reason = prompt('거절 사유를 입력하세요:');
        if (!reason) return;

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/products/${productId}/reject`,
                {
                    method: 'PUT', // Changed POST to PUT to match routes
                    body: JSON.stringify({ reason }),
                }
            );

            if (response.ok) {
                fetchProducts();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to reject product:', error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">관리자 패널</h1>
                    <p className="text-gray-600">
                        플랫폼 전체를 관리하고 제품 승인/거절을 처리하세요
                    </p>
                </div>

                {/* 통계 카드 */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                        {/* Stats UI remains same */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 mb-1">총 제품</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 mb-1">총 사용자</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 mb-1">총 주문</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6 ring-2 ring-yellow-400">
                            <div className="text-sm text-yellow-700 mb-1">승인 대기</div>
                            <div className="text-3xl font-bold text-yellow-600">{stats.pendingApproval}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 mb-1">판매 중</div>
                            <div className="text-3xl font-bold text-green-600">{stats.activeProducts}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 mb-1">총 매출</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.revenue.toLocaleString()}원
                            </div>
                        </div>
                    </div>
                )}

                {/* 필터 및 검색 */}
                <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                            {[
                                { key: 'all', label: '전체' },
                                { key: 'pending', label: '승인 대기' },
                                { key: 'active', label: '판매 중' },
                                { key: 'rejected', label: '거절됨' },
                                { key: 'sold', label: '판매완료' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setStatusFilter(key);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${statusFilter === key
                                        ? 'bg-red-100 text-red-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-64">
                            <input
                                type="text"
                                placeholder="제품명, 설명, 브랜드 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">로딩 중...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">해당 조건의 제품이 없습니다.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {products.map((product) => {
                                        const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';
                                        const shopName = product.seller?.sellerProfile?.shopName || product.seller?.name || '판매자';
                                        const statusLabels: Record<string, { label: string; color: string }> = {
                                            ACTIVE: { label: '판매중', color: 'bg-green-100 text-green-700' },
                                            PENDING_APPROVAL: { label: '승인대기', color: 'bg-yellow-100 text-yellow-700' },
                                            REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-700' },
                                            REMOVED: { label: '삭제됨', color: 'bg-red-100 text-red-700' },
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
                                                        <span className="text-xs text-gray-400 ml-2">(ID: {product.id.slice(0, 8)})</span>
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
                                                        <span>판매자: {shopName}</span>
                                                        <span>등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}</span>
                                                    </div>
                                                </div>

                                                {/* 액션 버튼 */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                                    >
                                                        상세보기
                                                    </Link>
                                                    {product.status === 'PENDING_APPROVAL' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(product.id)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                            >
                                                                승인
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(product.id)}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                            >
                                                                거절
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8 gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                        >
                                            이전
                                        </button>
                                        <span className="px-4 py-2">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                        >
                                            다음
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
