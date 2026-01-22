'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import ConditionBadge from '@/components/ConditionBadge';
import DefectList from '@/components/DefectList';
import ReviewForm from '@/components/ReviewForm';
import { auth } from '@/lib/auth';
import { addToCart } from '@/lib/cart';

interface Product {
    id: string;
    name: string;
    description: string;
    brand?: string;
    model?: string;
    sellingPrice: number;
    originalPrice?: number;
    status: string;
    isForParts: boolean;
    isRepairable: boolean;
    repairNotes?: string;
    warrantyMonths?: number;
    purchaseDate?: string;
    condition?: {
        overallGrade: any;
        functionalStatus: string;
        cosmeticGrade: string;
        batteryHealth?: number;
        screenDefect: boolean;
        cameraDefect: boolean;
        speakerDefect: boolean;
        portDefect: boolean;
        buttonDefect: boolean;
        additionalNotes?: string;
    };
    defects?: Array<{
        id: string;
        defectType: any;
        severity: any;
        description: string;
        imageUrl?: string;
    }>;
    images?: Array<{
        id: string;
        url: string;
        imageType: string;
    }>;
    category?: {
        id: string;
        name: string;
    };
    seller?: {
        id: string;
        name: string;
        phone?: string;
        sellerProfile?: {
            id: string;
            shopName: string;
            description?: string;
        };
    };
    reviews?: Array<{
        id: string;
        rating: number;
        comment: string;
        user: {
            name: string;
        };
        createdAt: string;
    }>;
}

async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${id}`,
            { cache: 'no-store' }
        );

        if (!res.ok) return null;

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
    }
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const [user, setUser] = useState<any>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const currentUser = auth.getUser();
        setUser(currentUser);
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${productId}`,
                { cache: 'no-store' }
            );

            if (!res.ok) {
                setProduct(null);
                return;
            }

            const data = await res.json();
            setProduct(data.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setProduct(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            setAddingToCart(true);
            const result = await addToCart(productId);

            if (result.success) {
                alert('장바구니에 추가되었습니다!');
                // 새로고침하여 Navbar의 장바구니 개수 업데이트
                window.location.reload();
            } else {
                alert(result.message || '장바구니 추가에 실패했습니다.');
            }
        } catch (error) {
            alert('장바구니 추가 중 오류가 발생했습니다.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            setAddingToCart(true);
            const result = await addToCart(productId);

            if (result.success) {
                router.push('/cart');
            } else {
                alert(result.message || '구매 처리에 실패했습니다.');
            }
        } catch (error) {
            alert('구매 처리 중 오류가 발생했습니다.');
        } finally {
            setAddingToCart(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">제품을 찾을 수 없습니다</h1>
                    <p className="text-gray-600 mb-8">요청하신 제품이 존재하지 않거나 삭제되었습니다.</p>
                    <Link
                        href="/products"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        제품 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const mainImage = product.images?.find(img => img.imageType === 'MAIN') || product.images?.[0];
    const shopName = product.seller?.sellerProfile?.shopName || product.seller?.name || '판매자';
    const discount = product.originalPrice
        ? Math.round((1 - product.sellingPrice / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 뒤로 가기 */}
                <Link
                    href="/products"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
                >
                    ← 제품 목록으로
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* 왼쪽: 이미지 갤러리 */}
                    <div className="p-8">
                        <div className="sticky top-8">
                            {/* 메인 이미지 */}
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                                <img
                                    src={mainImage?.url || '/placeholder-product.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const text = encodeURIComponent(product.brand || product.name.substring(0, 20));
                                        target.src = `https://placehold.co/800x800/e0e7ff/4f46e5?text=${text}`;
                                    }}
                                />
                                {product.isForParts && (
                                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                                        부품용
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                        {discount}% OFF
                                    </div>
                                )}
                            </div>

                            {/* 썸네일 이미지들 */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.slice(0, 4).map((image) => (
                                        <div
                                            key={image.id}
                                            className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
                                        >
                                            <img
                                                src={image.url}
                                                alt="제품 이미지"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    const text = encodeURIComponent(product.brand || 'Image');
                                                    target.src = `https://placehold.co/200x200/e0e7ff/4f46e5?text=${text}`;
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 제품 정보 */}
                    <div className="p-8">
                        {/* 카테고리 */}
                        {product.category && (
                            <p className="text-sm text-indigo-600 font-medium mb-2">{product.category.name}</p>
                        )}

                        {/* 제품명 */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {product.brand && <span className="text-gray-600">{product.brand} </span>}
                            {product.name}
                        </h1>

                        {/* 모델명 */}
                        {product.model && (
                            <p className="text-gray-600 mb-6">모델: {product.model}</p>
                        )}

                        {/* 컨디션 등급 */}
                        {product.condition && (
                            <div className="mb-6">
                                <ConditionBadge grade={product.condition.overallGrade} size="lg" />
                            </div>
                        )}

                        {/* 가격 */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-baseline gap-4 mb-2">
                                <span className="text-5xl font-bold text-gray-900">
                                    {product.sellingPrice.toLocaleString()}원
                                </span>
                                {product.originalPrice && product.originalPrice > product.sellingPrice && (
                                    <span className="text-2xl text-gray-400 line-through">
                                        {product.originalPrice.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                            {discount > 0 && (
                                <p className="text-red-600 font-semibold">{discount}% 할인가</p>
                            )}
                        </div>

                        {/* 제품 설명 */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">제품 설명</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* 구매 버튼 */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.status !== 'ACTIVE'}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingToCart ? '추가 중...' : '장바구니 담기'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={addingToCart || product.status !== 'ACTIVE'}
                                className="px-6 border-2 border-indigo-600 text-indigo-600 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                바로 구매
                            </button>
                        </div>

                        {/* 판매자 정보 */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">판매자 정보</h3>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-semibold">상점:</span> {shopName}
                                </p>
                                {product.seller?.sellerProfile?.description && (
                                    <p className="text-gray-600 text-sm">
                                        {product.seller.sellerProfile.description}
                                    </p>
                                )}
                                {product.seller?.phone && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">연락처:</span> {product.seller.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 상세 정보 탭 */}
                <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* 컨디션 상세 */}
                        {product.condition && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">컨디션 상세 정보</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b border-gray-200">
                                        <span className="font-semibold text-gray-700">기능 상태:</span>
                                        <span className="text-gray-900">{product.condition.functionalStatus}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-200">
                                        <span className="font-semibold text-gray-700">외관 등급:</span>
                                        <span className="text-gray-900">{product.condition.cosmeticGrade}</span>
                                    </div>
                                    {product.condition.batteryHealth && (
                                        <div className="flex justify-between py-3 border-b border-gray-200">
                                            <span className="font-semibold text-gray-700">배터리 상태:</span>
                                            <span className="text-gray-900">{product.condition.batteryHealth}%</span>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <h3 className="font-semibold text-gray-700 mb-3">하드웨어 체크:</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: '화면', value: product.condition.screenDefect },
                                                { label: '카메라', value: product.condition.cameraDefect },
                                                { label: '스피커', value: product.condition.speakerDefect },
                                                { label: '포트', value: product.condition.portDefect },
                                                { label: '버튼', value: product.condition.buttonDefect },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${value ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <span className="text-sm text-gray-700">{label}: {value ? '결함' : '정상'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {product.condition.additionalNotes && (
                                        <div className="pt-4">
                                            <h3 className="font-semibold text-gray-700 mb-2">추가 노트:</h3>
                                            <p className="text-gray-600 text-sm">{product.condition.additionalNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 추가 정보 */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">추가 정보</h2>
                            <div className="space-y-4">
                                {product.purchaseDate && (
                                    <div className="flex justify-between py-3 border-b border-gray-200">
                                        <span className="font-semibold text-gray-700">구매일:</span>
                                        <span className="text-gray-900">
                                            {new Date(product.purchaseDate).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                )}
                                {product.warrantyMonths && (
                                    <div className="flex justify-between py-3 border-b border-gray-200">
                                        <span className="font-semibold text-gray-700">보증 기간:</span>
                                        <span className="text-gray-900">{product.warrantyMonths}개월</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="font-semibold text-gray-700">수리 가능:</span>
                                    <span className="text-gray-900">{product.isRepairable ? '예' : '아니오'}</span>
                                </div>
                                {product.repairNotes && (
                                    <div className="pt-4">
                                        <h3 className="font-semibold text-gray-700 mb-2">수리 정보:</h3>
                                        <p className="text-gray-600 text-sm">{product.repairNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결함 정보 */}
                {product.defects && product.defects.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">세부 결함 정보</h2>
                        <DefectList defects={product.defects} />
                    </div>
                )}

                {/* 리뷰 섹션 */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            리뷰 ({product.reviews.length})
                        </h2>
                        <div className="space-y-6">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="font-semibold text-gray-900">{review.user.name}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
