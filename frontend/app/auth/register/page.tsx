'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'BUYER' as 'BUYER' | 'SELLER',
        shopName: '',
        shopDescription: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 비밀번호 확인
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 길이 확인
        if (formData.password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: formData.role,
                shopName: formData.role === 'SELLER' ? formData.shopName : undefined,
                shopDescription: formData.role === 'SELLER' ? formData.shopDescription : undefined,
            });

            if (result.success) {
                // 회원가입 성공 - 강제로 페이지 새로고침하여 상태 업데이트
                window.location.href = '/';
            } else {
                setError(result.message || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* 헤더 */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">회원가입</h2>
                        <p className="text-gray-600">중고 전자제품 마켓플레이스에 가입하세요</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* 회원가입 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                이름 *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="홍길동"
                            />
                        </div>

                        {/* 역할 선택 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                가입 유형 *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${formData.role === 'BUYER'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    🛍️ 구매자
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${formData.role === 'SELLER'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    🏪 판매자
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                이메일 *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                전화번호 (선택)
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="010-1234-5678"
                            />
                        </div>

                        {/* 판매자 정보 (판매자 선택 시만 표시) */}
                        {formData.role === 'SELLER' && (
                            <>
                                <div>
                                    <label htmlFor="shopName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        상점 이름 *
                                    </label>
                                    <input
                                        id="shopName"
                                        name="shopName"
                                        type="text"
                                        required={formData.role === 'SELLER'}
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                        placeholder="예: 철수의 중고전자"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shopDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                                        상점 소개 (선택)
                                    </label>
                                    <textarea
                                        id="shopDescription"
                                        name="shopDescription"
                                        rows={3}
                                        value={formData.shopDescription}
                                        onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 resize-none"
                                        placeholder="상점을 간략히 소개해주세요"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                비밀번호 *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="최소 6자 이상"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                비밀번호 확인 *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="비밀번호 재입력"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? '가입 중...' : '회원가입'}
                        </button>
                    </form>

                    {/* 로그인 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                로그인
                            </Link>
                        </p>
                    </div>

                    {/* 홈으로 돌아가기 */}
                    <div className="mt-4 text-center">
                        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                            ← 홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
