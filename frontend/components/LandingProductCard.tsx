"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Info } from "lucide-react"
import { auth, apiFetch } from '@/lib/auth';
import { toast } from "sonner"

interface ProductCardProps {
    id: string
    name: string
    brand: string
    originalPrice: number
    discountPrice: number
    defectType: string
    defectLevel: "minor" | "moderate" | "major"
    imageUrl: string
    isNew?: boolean
}

export function LandingProductCard({
    id,
    name,
    brand,
    originalPrice,
    discountPrice,
    defectType,
    defectLevel,
    imageUrl,
    isNew = false,
}: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const discountPercent = Math.round((1 - discountPrice / originalPrice) * 100)
    const [adding, setAdding] = useState(false);
    const router = useRouter();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (adding) return;
        setAdding(true);

        const user = auth.getUser();
        if (!user) {
            toast.error("로그인이 필요합니다.", {
                action: {
                    label: "로그인",
                    onClick: () => router.push('/auth/login')
                }
            });
            return;
        }

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart`,
                {
                    method: 'POST',
                    body: JSON.stringify({ productId: id, quantity: 1 }),
                }
            );

            if (response.ok) {
                // Trigger cart update event
                window.dispatchEvent(new Event('cart-updated'));
                toast.success("장바구니에 담겼습니다.");
            } else {
                toast.error("장바구니에 담지 못했습니다.");
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error("오류가 발생했습니다.");
        } finally {
            setAdding(false);
        }
    };

    const defectLevelStyles = {
        minor: "bg-emerald-50 text-emerald-600 border-emerald-200",
        moderate: "bg-amber-50 text-amber-600 border-amber-200",
        major: "bg-rose-50 text-rose-600 border-rose-200",
    }

    const defectLevelLabels = {
        minor: "경미",
        moderate: "보통",
        major: "심각",
    }

    return (
        <div className="group relative bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80 h-full flex flex-col">
            {/* Image Container */}
            <Link href={`/products/${id}`} className="relative aspect-square bg-muted overflow-hidden block">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <Badge className="bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm">
                        -{discountPercent}%
                    </Badge>
                    {isNew && (
                        <Badge className="bg-foreground text-background font-semibold rounded-lg shadow-sm">
                            NEW
                        </Badge>
                    )}
                </div>

                {/* Like Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-border shadow-sm transition-all hover:scale-105 z-10"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                            }`}
                    />
                </button>

                {/* Quick Add Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                    <Button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-lg"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {adding ? '담는 중...' : '장바구니 담기'}
                    </Button>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Brand */}
                <p className="text-xs text-muted-foreground mb-1 font-medium">{brand}</p>

                {/* Name */}
                <Link href={`/products/${id}`} className="block">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
                        {name}
                    </h3>
                </Link>

                {/* Defect Info */}
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{defectType}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-md border ${defectLevelStyles[defectLevel]}`}>
                        {defectLevelLabels[defectLevel]}
                    </Badge>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mt-auto">
                    <span className="text-xl font-bold text-foreground">
                        {discountPrice.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground ml-0.5">원</span>
                    </span>
                    <span className="text-sm text-muted-foreground line-through mb-0.5">
                        {originalPrice.toLocaleString()}원
                    </span>
                </div>
            </div>
        </div>
    )
}
