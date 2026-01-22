import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import stripe from '../config/stripe';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { OrderStatus } from '@prisma/client';

export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { orderId } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new ApiError(404, '주문을 찾을 수 없습니다.');
        }

        if (order.buyerId !== req.user.id) {
            throw new ApiError(403, '결제를 진행할 권한이 없습니다.');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new ApiError(400, '이미 결제되었거나 취소된 주문입니다.');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(order.totalAmount) * 100), // Convert to cents
            currency: 'krw',
            metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: req.user.id,
            },
        });

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            },
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Create payment intent error:', error);
            res.status(500).json({
                success: false,
                message: '결제 준비 중 오류가 발생했습니다.',
            });
        }
    }
};

export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { orderId, paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new ApiError(400, '결제가 완료되지 않았습니다.');
        }

        // Update order status
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.PAID,
            },
        });

        // Update product stock
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
        });

        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                    status: 'SOLD', // Mark as sold if stock becomes 0
                },
            });
        }

        logger.info(`Payment confirmed for order: ${order.orderNumber}`);

        res.json({
            success: true,
            message: '결제가 완료되었습니다.',
            data: order,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Confirm payment error:', error);
            res.status(500).json({
                success: false,
                message: '결제 확인 중 오류가 발생했습니다.',
            });
        }
    }
};
