'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, apiFetch } from '@/lib/auth';

interface Category {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    const [defects, setDefects] = useState<Array<{
        defectType: string;
        severity: string;
        description: string;
        imageUrl: string;
    }>>([]);

    const [imageUrls, setImageUrls] = useState<string[]>(['']);

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
        fetchCategories();
    }, [router]);

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
                defects: defects.filter(d => d.description),
            };

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`,
                {
                    method: 'POST',
                    body: JSON.stringify(productData),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                router.push('/seller');
            } else {
                setError(data.message || '제품 등록에 실패했습니다.');
            }
        } catch (err) {
            setError('제품 등록 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const addDefect = () => {
        setDefects([...defects, { defectType: 'OTHER', severity: 'MINOR', description: '', imageUrl: '' }]);
    };

    const removeDefect = (index: number) => {
        setDefects(defects.filter((_, i) => i !== index));
    };

    const updateDefect = (index: number, field: string, value: string) => {
        const updated = [...defects];
        updated[index] = { ...updated[index], [field]: value };
        setDefects(updated);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/seller" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        ← 판매자 대시보드로 돌아가기
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">새 제품 등록</h1>
                    <p className="text-gray-600">결함 전자제품의 상세 정보를 입력해주세요</p>
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
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                                    placeholder="예: iPhone 12 Pro Max"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">브랜드</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="예: Apple"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">모델명</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="예: A2342"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    설명 *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                    placeholder="제품 상태, 특이사항 등을 상세히 입력해주세요..."
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
                                    placeholder="1200000"
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
                                    placeholder="800000"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isForParts}
                                        onChange={(e) => setFormData({ ...formData, isForParts: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">부품용으로 판매</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRepairable}
                                        onChange={(e) => setFormData({ ...formData, isRepairable: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">수리 가능</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 컨디션 정보 */}
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
                                    onChange={(e) => setCondition({ ...condition, functionalStatus: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="FULLY_FUNCTIONAL">완전 정상</option>
                                    <option value="MOSTLY_FUNCTIONAL">대부분 정상</option>
                                    <option value="PARTIALLY_FUNCTIONAL">일부 기능 불량</option>
                                    <option value="NOT_FUNCTIONAL">작동 불가</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    외관 등급 *
                                </label>
                                <select
                                    required
                                    value={condition.cosmeticGrade}
                                    onChange={(e) => setCondition({ ...condition, cosmeticGrade: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="EXCELLENT">매우 깨끗</option>
                                    <option value="GOOD">양호</option>
                                    <option value="FAIR">보통</option>
                                    <option value="POOR">불량</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    배터리 상태 (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={condition.batteryHealth}
                                    onChange={(e) => setCondition({ ...condition, batteryHealth: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="85"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    하드웨어 결함
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { key: 'screenDefect', label: '화면' },
                                        { key: 'cameraDefect', label: '카메라' },
                                        { key: 'speakerDefect', label: '스피커' },
                                        { key: 'portDefect', label: '포트' },
                                        { key: 'buttonDefect', label: '버튼' },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={condition[key as keyof typeof condition] as boolean}
                                                onChange={(e) => setCondition({ ...condition, [key]: e.target.checked })}
                                                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <span className="text-sm text-gray-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 결함 상세 */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">세부 결함 정보</h2>
                            <button
                                type="button"
                                onClick={addDefect}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                + 결함 추가
                            </button>
                        </div>

                        {defects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">결함이 없거나 위 버튼으로 추가하세요</p>
                        ) : (
                            <div className="space-y-4">
                                {defects.map((defect, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    결함 유형
                                                </label>
                                                <select
                                                    value={defect.defectType}
                                                    onChange={(e) => updateDefect(index, 'defectType', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="SCREEN">화면</option>
                                                    <option value="BATTERY">배터리</option>
                                                    <option value="CAMERA">카메라</option>
                                                    <option value="SPEAKER">스피커</option>
                                                    <option value="PORT">포트</option>
                                                    <option value="BUTTON">버튼</option>
                                                    <option value="HOUSING">외관</option>
                                                    <option value="OTHER">기타</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    심각도
                                                </label>
                                                <select
                                                    value={defect.severity}
                                                    onChange={(e) => updateDefect(index, 'severity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="MINOR">경미</option>
                                                    <option value="MODERATE">보통</option>
                                                    <option value="SEVERE">심각</option>
                                                </select>
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeDefect(index)}
                                                    className="w-full px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                결함 설명
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={defect.description}
                                                onChange={(e) => updateDefect(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 resize-none"
                                                placeholder="결함에 대한 상세 설명..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? '등록 중...' : '제품 등록'}
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
