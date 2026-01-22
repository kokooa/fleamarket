import React from 'react';

type ConditionGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'GRADE_D' | 'GRADE_E';

interface ConditionBadgeProps {
    grade: ConditionGrade;
    size?: 'sm' | 'md' | 'lg';
}

const gradeConfig: Record<ConditionGrade, { label: string; color: string; bgColor: string; description: string }> = {
    GRADE_A: {
        label: 'A급 (신품급)',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100',
        description: '거의 새 제품 수준, 사용 흔적 거의 없음'
    },
    GRADE_B: {
        label: 'B급 (최상)',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        description: '양호한 상태, 미세한 사용 흔적'
    },
    GRADE_C: {
        label: 'C급 (양호)',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        description: '일반적인 사용감, 눈에 띄는 스크래치 있음'
    },
    GRADE_D: {
        label: 'D급 (보통)',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        description: '많은 사용감, 기능은 정상'
    },
    GRADE_E: {
        label: 'E급 (부품용)',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        description: '부품 판매용, 일부 기능 불량'
    }
};

export default function ConditionBadge({ grade, size = 'md' }: ConditionBadgeProps) {
    // 안전하게 config 가져오기 (없으면 기본값)
    const config = gradeConfig[grade] || {
        label: grade || '확인 필요',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        description: '등급 정보 없음'
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <span
            className={`inline-flex items-center font-semibold rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
            title={config.description}
        >
            {config.label}
        </span>
    );
}

export { gradeConfig };
export type { ConditionGrade };
