'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';

export default function BecomeSellerPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        shopName: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        if (currentUser.role !== 'BUYER') {
            router.push('/');
            return;
        }

        setUser(currentUser);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/become-seller`,
                {
                    method: 'POST',
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                // 사용자 정보 업데이트
                auth.setUser(data.data);
                // 판매자 대시보드로 리다이렉트
                router.push('/seller');
                router.refresh();
            } else {
                setError(data.message || '판매자 전환에 실패했습니다.');
            }
        } catch (err) {
            setError('판매자 전환 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* 헤더 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">판매자로 전환하기</h1>
                        <p className="text-gray-600">
                            판매자가 되면 제품을 등록하고 판매할 수 있습니다.
                        </p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* 안내 */}
                    <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">판매자 혜택</h3>
                        <ul className="space-y-2 text-blue-800 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>무제한 제품 등록</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>판매 대시보드 접근</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>판매 통계 및 분석</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>구매자 직접 소통</span>
                            </li>
                        </ul>
                    </div>

                    {/* 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-semibold text-gray-700 mb-2">
                                상점 이름 *
                            </label>
                            <input
                                id="shopName"
                                name="shopName"
                                type="text"
                                required
                                value={formData.shopName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                placeholder="예: 김영희의 전자기기 판매점"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                고객에게 표시될 상점 이름입니다.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                상점 설명
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                                placeholder="상점 소개, 특징, 정책 등을 입력하세요..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                선택사항: 판매자 프로필에 표시됩니다.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? '처리 중...' : '판매자로 전환'}
                            </button>
                            <Link
                                href="/"
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                            >
                                취소
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
