"use client"

import { useState, useEffect } from "react"
import { LandingProductCard as ProductCard } from "@/components/LandingProductCard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Flame } from "lucide-react"
import Link from "next/link"

interface Product {
    id: string;
    name: string;
    brand?: string;
    sellingPrice: number;
    originalPrice?: number;
    condition?: {
        overallGrade: string;
        functionalStatus: string;
    };
    images?: Array<{ url: string }>;
    createdAt: string;
}

const mapGradeToLevel = (grade: string): "minor" | "moderate" | "major" => {
    switch (grade) {
        case "GRADE_A":
        case "GRADE_B":
            return "minor";
        case "GRADE_C":
        case "GRADE_D":
            return "moderate";
        case "GRADE_E":
            return "major";
        default:
            return "moderate";
    }
};

const mapGradeToLabel = (grade: string): string => {
    switch (grade) {
        case "GRADE_A": return "미세 스크래치";
        case "GRADE_B": return "생활 기스";
        case "GRADE_C": return "사용감 있음";
        case "GRADE_D": return "기능 이상";
        case "GRADE_E": return "파손/부품용";
        default: return "알 수 없음";
    }
}

export function FeaturedProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products from API (defaulting to latest/featured)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products?limit=8`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.data)) {
                        const mappedProducts = data.data.map((p: Product) => ({
                            id: p.id,
                            name: p.name,
                            brand: p.brand || "Unknown",
                            originalPrice: p.originalPrice || p.sellingPrice * 1.2, // Fallback if no original price
                            discountPrice: p.sellingPrice,
                            defectType: p.condition?.functionalStatus || mapGradeToLabel(p.condition?.overallGrade || ''),
                            defectLevel: mapGradeToLevel(p.condition?.overallGrade || ''),
                            imageUrl: p.images?.[0]?.url || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop",
                            isNew: new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // New if within 7 days
                        }));
                        setProducts(mappedProducts);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (!isLoading && products.length === 0) {
        return null; // Don't show section if no products
    }

    return (
        <section className="py-16 md:py-24 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Flame className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-primary">
                                Hot Deals
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                            오늘의 핫딜 제품
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            결함이 있지만 완벽하게 작동하는 제품들을 파격적인 가격에 만나보세요
                        </p>
                    </div>
                    <Link href="/products">
                        <Button variant="outline" className="border-border text-foreground hover:bg-muted group self-start md:self-auto rounded-xl bg-transparent">
                            전체 보기
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {isLoading ? (
                        // Skeleton loading state
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-[300px] bg-muted/50 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        products.map((product, index) => (
                            <div
                                key={product.id}
                                className="animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 75}ms`, animationFillMode: "both" }}
                            >
                                <ProductCard {...product} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
