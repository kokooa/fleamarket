'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/auth';

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [conditionAccurate, setConditionAccurate] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${productId}/reviews`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        rating,
                        comment,
                        conditionAccurate,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setComment('');
                setRating(5);
                setConditionAccurate(true);
                if (onSuccess) onSuccess();
            } else {
                setError(data.message || '리뷰 작성에 실패했습니다.');
            }
        } catch (err) {
            setError('리뷰 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">리뷰 작성하기</h3>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* 별점 */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">별점</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <svg
                                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({rating}점)</span>
                </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">리뷰 내용</label>
                <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="제품에 대한 솔직한 평가를 남겨주세요..."
                />
            </div>

            {/* 상태 정확도 */}
            <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={conditionAccurate}
                        onChange={(e) => setConditionAccurate(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">제품 상태 설명이 정확했습니다</span>
                </label>
            </div>

            {/* 제출 버튼 */}
            <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? '등록 중...' : '리뷰 등록'}
            </button>
        </form>
    );
}
