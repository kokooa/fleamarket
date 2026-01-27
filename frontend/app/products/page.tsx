'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

interface Product {
    id: string;
    name: string;
    brand?: string;
    sellingPrice: number;
    originalPrice?: number;
    isForParts: boolean;
    condition?: {
        overallGrade: any;
        functionalStatus: string;
    };
    images?: Array<{ url: string }>;
    category?: { name: string };
    seller?: {
        name: string;
        sellerProfile?: { shopName: string };
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch categories first
            let currentCategories: Category[] = [];
            const categoriesRes = await fetch(`${API_URL}/categories`);

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                currentCategories = categoriesData.data || [];
                setCategories(currentCategories);
            }

            // 2. Prepare search params
            const params = new URLSearchParams();

            // Handle both categoryId and category (slug) from URL
            let targetCategoryId = searchParams.get('categoryId');
            const categorySlug = searchParams.get('category');

            // If we have a slug but no ID, try to find the ID from loaded categories
            if (!targetCategoryId && categorySlug && currentCategories.length > 0) {
                const matchedCategory = currentCategories.find(c => c.slug === categorySlug); // Assuming Category interface has slug
                if (matchedCategory) {
                    targetCategoryId = matchedCategory.id;
                }
            }

            if (targetCategoryId) params.set('categoryId', targetCategoryId);

            const overallGrade = searchParams.get('overallGrade');
            const brand = searchParams.get('brand');
            const search = searchParams.get('search');

            if (overallGrade) params.set('overallGrade', overallGrade);
            if (brand) params.set('brand', brand);
            if (search) params.set('search', search);

            // 3. Fetch products
            const productsRes = await fetch(
                `${API_URL}/products?${params.toString()}`
            );

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.data || []);
                setTotal(productsData.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setProducts([]);
            // Keep existing categories if fetch fails
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">전자제품 목록</h1>
                    <p className="text-gray-600 text-lg">
                        결함이 있는 전자제품을 상태별로 확인하고 구매하세요
                    </p>
                    <p className="text-sm text-gray-500 mt-2">총 {total}개의 제품이 있습니다</p>
                </div>

                {/* 필터 */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">필터</h3>
                    <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                카테고리
                            </label>
                            <select
                                name="categoryId"
                                defaultValue={searchParams.get('categoryId') || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">전체</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                상태 등급
                            </label>
                            <select
                                name="overallGrade"
                                defaultValue={searchParams.get('overallGrade') || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">전체</option>
                                <option value="GRADE_A">A급 (신품급)</option>
                                <option value="GRADE_B">B급 (최상)</option>
                                <option value="GRADE_C">C급 (양호)</option>
                                <option value="GRADE_D">D급 (보통)</option>
                                <option value="GRADE_E">E급 (부품용)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                브랜드
                            </label>
                            <input
                                type="text"
                                name="brand"
                                defaultValue={searchParams.get('brand') || ''}
                                placeholder="예: Apple, Samsung"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                검색
                            </button>
                        </div>
                    </form>
                </div>

                {/* 제품 그리드 */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">로딩 중...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">제품이 없습니다</h3>
                        <p className="text-gray-600">
                            필터 조건을 변경하거나 나중에 다시 확인해주세요.
                            <br />
                            <span className="text-sm text-gray-500 mt-2 block">
                                백엔드 서버가 실행 중인지 확인하세요.
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
