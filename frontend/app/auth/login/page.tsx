'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // 로그인 성공 - 강제로 페이지 새로고침하여 상태 업데이트
                window.location.href = '/';
            } else {
                setError(result.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
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
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">로그인</h2>
                        <p className="text-gray-600">중고 전자제품 마켓플레이스에 오신 것을 환영합니다</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                이메일
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
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* 테스트 계정 안내 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-2">테스트 계정</p>
                        <div className="text-xs text-blue-800 space-y-1">
                            <p>• 관리자: admin@marketplace.com / password123</p>
                            <p>• 판매자1: seller1@gmail.com / password123</p>
                            <p>• 판매자2: seller2@gmail.com / password123</p>
                            <p>• 구매자: buyer@gmail.com / password123</p>
                        </div>
                    </div>

                    {/* 회원가입 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            계정이 없으신가요?{' '}
                            <Link href="/auth/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                회원가입
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
