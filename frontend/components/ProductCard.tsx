import React from 'react';
import Link from 'next/link';
import ConditionBadge, { type ConditionGrade } from './ConditionBadge';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        brand?: string;
        sellingPrice: number;
        originalPrice?: number;
        isForParts: boolean;
        condition?: {
            overallGrade: ConditionGrade;
            functionalStatus: string;
        };
        images?: Array<{ url: string }>;
        category?: { name: string };
        seller?: {
            name: string;
            sellerProfile?: { shopName: string };
        };
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';
    const shopName = product.seller?.sellerProfile?.shopName || product.seller?.name || '판매자';
    const discount = product.originalPrice
        ? Math.round((1 - product.sellingPrice / product.originalPrice) * 100)
        : 0;

    return (
        <Link href={`/products/${product.id}`}>
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200">
                {/* 이미지 */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const text = encodeURIComponent(product.brand || product.name.substring(0, 20));
                            target.src = `https://placehold.co/400x400/e0e7ff/4f46e5?text=${text}`;
                        }}
                    />

                    {/* 할인율 배지 */}
                    {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {discount}% OFF
                        </div>
                    )}

                    {/* 부품용 배지 */}
                    {product.isForParts && (
                        <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            부품용
                        </div>
                    )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                    {/* 카테고리 */}
                    {product.category && (
                        <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                    )}

                    {/* 브랜드 & 제품명 */}
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.brand && <span className="text-gray-600">{product.brand} </span>}
                        {product.name}
                    </h3>

                    {/* 컨디션 등급 */}
                    {product.condition && (
                        <div className="mb-3">
                            <ConditionBadge grade={product.condition.overallGrade} size="sm" />
                        </div>
                    )}

                    {/* 가격 */}
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {product.sellingPrice.toLocaleString()}원
                        </span>
                        {product.originalPrice && product.originalPrice > product.sellingPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {product.originalPrice.toLocaleString()}원
                            </span>
                        )}
                    </div>

                    {/* 판매자 */}
                    <p className="text-xs text-gray-500">
                        판매자: {shopName}
                    </p>
                </div>
            </div>
        </Link>
    );
}
