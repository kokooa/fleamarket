import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

// 장바구니 조회
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: true,
                        condition: true,
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: cartItems,
        });
    } catch (error: any) {
        logger.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: '장바구니 조회에 실패했습니다.',
        });
    }
};

// 장바구니에 제품 추가
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            res.status(400).json({
                success: false,
                message: '제품 ID가 필요합니다.',
            });
            return;
        }

        // 제품 존재 확인
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            res.status(404).json({
                success: false,
                message: '제품을 찾을 수 없습니다.',
            });
            return;
        }

        // 판매 가능 상태 확인
        if (product.status !== 'ACTIVE') {
            res.status(400).json({
                success: false,
                message: '현재 판매 중이 아닌 제품입니다.',
            });
            return;
        }

        // 이미 장바구니에 있는지 확인
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        let cartItem;

        if (existingItem) {
            res.status(409).json({
                success: false,
                message: '이미 장바구니에 담긴 상품입니다.',
            });
            return;
        }

        // 새로 추가
        cartItem = await prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity: 1, // Enforce quantity 1
            },
            include: {
                product: {
                    include: {
                        images: true,
                        condition: true,
                    },
                },
            },
        });

        logger.info(`Product added to cart: ${productId} by user ${userId}`);

        res.status(201).json({
            success: true,
            message: '장바구니에 추가되었습니다.',
            data: cartItem,
        });
    } catch (error: any) {
        logger.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: '장바구니 추가에 실패했습니다.',
        });
    }
};

// 장바구니 아이템 수량 변경
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            res.status(400).json({
                success: false,
                message: '수량은 1 이상이어야 합니다.',
            });
            return;
        }

        // 자신의 장바구니 아이템인지 확인
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                userId,
            },
        });

        if (!existingItem) {
            res.status(404).json({
                success: false,
                message: '장바구니 아이템을 찾을 수 없습니다.',
            });
            return;
        }

        const cartItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: {
                    include: {
                        images: true,
                        condition: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: '수량이 변경되었습니다.',
            data: cartItem,
        });
    } catch (error: any) {
        logger.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: '수량 변경에 실패했습니다.',
        });
    }
};

// 장바구니에서 제품 제거
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        // 자신의 장바구니 아이템인지 확인
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                userId,
            },
        });

        if (!existingItem) {
            res.status(404).json({
                success: false,
                message: '장바구니 아이템을 찾을 수 없습니다.',
            });
            return;
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        logger.info(`Product removed from cart: ${itemId} by user ${userId}`);

        res.json({
            success: true,
            message: '장바구니에서 제거되었습니다.',
        });
    } catch (error: any) {
        logger.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: '장바구니에서 제거하는데 실패했습니다.',
        });
    }
};

// 장바구니 전체 비우기
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        await prisma.cartItem.deleteMany({
            where: { userId },
        });

        logger.info(`Cart cleared by user ${userId}`);

        res.json({
            success: true,
            message: '장바구니가 비워졌습니다.',
        });
    } catch (error: any) {
        logger.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: '장바구니 비우기에 실패했습니다.',
        });
    }
};
