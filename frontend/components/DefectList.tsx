import React from 'react';

type DefectSeverity = 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
type DefectType = 'SCREEN' | 'BATTERY' | 'CAMERA' | 'SPEAKER' | 'PORT' | 'BUTTON' | 'HOUSING' | 'OTHER';

interface Defect {
    id: string;
    defectType: DefectType;
    severity: DefectSeverity;
    description: string;
    imageUrl?: string;
}

interface DefectListProps {
    defects: Defect[];
}

const severityConfig: Record<DefectSeverity, { label: string; color: string; bg: string }> = {
    MINOR: { label: '경미', color: 'text-blue-700', bg: 'bg-blue-100' },
    MODERATE: { label: '보통', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    SEVERE: { label: '심각', color: 'text-orange-700', bg: 'bg-orange-100' },
    CRITICAL: { label: '치명적', color: 'text-red-700', bg: 'bg-red-100' },
};

const defectTypeLabels: Record<DefectType, string> = {
    SCREEN: '화면',
    BATTERY: '배터리',
    CAMERA: '카메라',
    SPEAKER: '스피커',
    PORT: '포트',
    BUTTON: '버튼',
    HOUSING: '외관',
    OTHER: '기타'
};

export default function DefectList({ defects }: DefectListProps) {
    if (!defects || defects.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>등록된 결함 정보가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {defects.map((defect) => {
                const severityStyle = severityConfig[defect.severity];

                return (
                    <div
                        key={defect.id}
                        className={`border rounded-lg p-4 ${severityStyle.bg}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-800">
                                    {defectTypeLabels[defect.defectType]}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig[defect.severity].color} ${severityConfig[defect.severity].bg}`}>
                                    {severityStyle.label}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3">
                            {defect.description}
                        </p>

                        {defect.imageUrl && (
                            <img
                                src={defect.imageUrl}
                                alt={`${defectTypeLabels[defect.defectType]} 결함`}
                                className="rounded-lg max-w-xs h-auto object-cover border border-gray-200"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export type { Defect, DefectSeverity, DefectType };
