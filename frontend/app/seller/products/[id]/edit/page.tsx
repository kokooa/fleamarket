'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';

interface Category {
    id: string;
    name: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingProduct, setLoadingProduct] = useState(true);

    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        description: '',
        brand: '',
        model: '',
        serialNumber: '',
        originalPrice: '',
        sellingPrice: '',
        purchaseDate: '',
        warrantyMonths: '',
        isForParts: false,
        isRepairable: true,
        repairNotes: '',
    });

    const [condition, setCondition] = useState({
        overallGrade: 'GRADE_C',
        functionalStatus: 'FULLY_FUNCTIONAL',
        cosmeticGrade: 'GOOD',
        batteryHealth: '',
        screenDefect: false,
        cameraDefect: false,
        speakerDefect: false,
        portDefect: false,
        buttonDefect: false,
        additionalNotes: '',
    });

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        if (currentUser.role === 'BUYER') {
            router.push('/');
            return;
        }

        setUser(currentUser);
        fetchCategories();
        fetchProduct();
    }, [router, params.id]);

    const fetchCategories = async () => {
        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories`
            );
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoadingProduct(true);
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${params.id}`
            );

            const data = await response.json();
            if (data.success) {
                const product = data.data;

                setFormData({
                    categoryId: product.categoryId || '',
                    name: product.name || '',
                    description: product.description || '',
                    brand: product.brand || '',
                    model: product.model || '',
                    serialNumber: product.serialNumber || '',
                    originalPrice: product.originalPrice?.toString() || '',
                    sellingPrice: product.sellingPrice?.toString() || '',
                    purchaseDate: product.purchaseDate
                        ? new Date(product.purchaseDate).toISOString().split('T')[0]
                        : '',
                    warrantyMonths: product.warrantyMonths?.toString() || '',
                    isForParts: product.isForParts || false,
                    isRepairable: product.isRepairable || true,
                    repairNotes: product.repairNotes || '',
                });

                if (product.condition) {
                    setCondition({
                        overallGrade: product.condition.overallGrade || 'GRADE_C',
                        functionalStatus: product.condition.functionalStatus || 'FULLY_FUNCTIONAL',
                        cosmeticGrade: product.condition.cosmeticGrade || 'GOOD',
                        batteryHealth: product.condition.batteryHealth?.toString() || '',
                        screenDefect: product.condition.screenDefect || false,
                        cameraDefect: product.condition.cameraDefect || false,
                        speakerDefect: product.condition.speakerDefect || false,
                        portDefect: product.condition.portDefect || false,
                        buttonDefect: product.condition.buttonDefect || false,
                        additionalNotes: product.condition.additionalNotes || '',
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setError('제품 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoadingProduct(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const productData = {
                ...formData,
                originalPrice: parseFloat(formData.originalPrice) || undefined,
                sellingPrice: parseFloat(formData.sellingPrice),
                warrantyMonths: parseInt(formData.warrantyMonths) || undefined,
                purchaseDate: formData.purchaseDate || undefined,
                condition: {
                    ...condition,
                    batteryHealth: condition.batteryHealth ? parseInt(condition.batteryHealth) : undefined,
                },
            };

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${params.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(productData),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                router.push('/seller');
            } else {
                setError(data.message || '제품 수정에 실패했습니다.');
            }
        } catch (err) {
            setError('제품 수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || loadingProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/seller" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        ← 판매자 대시보드로 돌아가기
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">제품 수정</h1>
                    <p className="text-gray-600">제품 정보를 수정하세요</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 기본 정보 */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    카테고리 *
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">카테고리를 선택하세요</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    제품명 *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">브랜드</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">모델명</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">설명 *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    정가 (원)
                                </label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    판매가 (원) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 컨디션 정보 - 간략화 */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">컨디션 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    종합 등급 *
                                </label>
                                <select
                                    required
                                    value={condition.overallGrade}
                                    onChange={(e) => setCondition({ ...condition, overallGrade: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="GRADE_A">A급 (신품급)</option>
                                    <option value="GRADE_B">B급 (최상)</option>
                                    <option value="GRADE_C">C급 (양호)</option>
                                    <option value="GRADE_D">D급 (보통)</option>
                                    <option value="GRADE_E">E급 (부품용)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    기능 상태 *
                                </label>
                                <select
                                    required
                                    value={condition.functionalStatus}
                                    onChange={(e) =>
                                        setCondition({ ...condition, functionalStatus: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="FULLY_FUNCTIONAL">완전 정상</option>
                                    <option value="MOSTLY_FUNCTIONAL">대부분 정상</option>
                                    <option value="PARTIALLY_FUNCTIONAL">일부 기능 불량</option>
                                    <option value="NOT_FUNCTIONAL">작동 불가</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? '수정 중...' : '수정 완료'}
                        </button>
                        <Link
                            href="/seller"
                            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                        >
                            취소
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
