import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { items, shippingAddress, buyerNotes } = req.body;

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product || product.status !== 'ACTIVE') {
                throw new ApiError(400, `제품을 찾을 수 없거나 판매 중이 아닙니다: ${item.productId}`);
            }

            if (product.stock < item.quantity) {
                throw new ApiError(400, `재고가 부족합니다: ${product.name}`);
            }

            totalAmount += Number(product.sellingPrice) * item.quantity;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: product.sellingPrice,
            });
        }

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const order = await prisma.order.create({
            data: {
                buyerId: req.user.id,
                orderNumber,
                totalAmount,
                shippingAddress,
                buyerNotes,
                status: OrderStatus.PENDING,
                orderItems: {
                    create: orderItems,
                },
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                condition: true,
                                images: {
                                    where: { imageType: 'MAIN' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        logger.info(`Order created: ${order.orderNumber}`);

        res.status(201).json({
            success: true,
            message: '주문이 생성되었습니다.',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Create order error:', error);
            res.status(500).json({
                success: false,
                message: '주문 생성 중 오류가 발생했습니다.',
            });
        }
    }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const orders = await prisma.order.findMany({
            where: {
                buyerId: req.user.id,
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { imageType: 'MAIN' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: '주문 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                condition: true,
                                defects: true,
                                images: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            throw new ApiError(404, '주문을 찾을 수 없습니다.');
        }

        if (order.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new ApiError(403, '주문을 확인할 권한이 없습니다.');
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Get order error:', error);
            res.status(500).json({
                success: false,
                message: '주문을 가져오는 중 오류가 발생했습니다.',
            });
        }
    }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new ApiError(404, '주문을 찾을 수 없습니다.');
        }

        if (order.buyerId !== req.user.id) {
            throw new ApiError(403, '주문을 취소할 권한이 없습니다.');
        }

        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED) {
            throw new ApiError(400, '배송 중이거나 완료된 주문은 취소할 수 없습니다.');
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: OrderStatus.CANCELLED,
            },
        });

        logger.info(`Order cancelled: ${order.orderNumber}`);

        res.json({
            success: true,
            message: '주문이 취소되었습니다.',
            data: updatedOrder,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Cancel order error:', error);
            res.status(500).json({
                success: false,
                message: '주문 취소 중 오류가 발생했습니다.',
            });
        }
    }
};
