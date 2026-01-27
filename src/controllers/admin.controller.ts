import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { ProductStatus } from '@prisma/client';

export const getPendingProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: ProductStatus.PENDING_APPROVAL,
            },
            include: {
                condition: true,
                defects: true,
                images: true,
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        sellerProfile: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        logger.error('Get pending products error:', error);
        res.status(500).json({
            success: false,
            message: '승인 대기 제품 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (status && status !== 'all') {
            if (status === 'pending') where.status = ProductStatus.PENDING_APPROVAL;
            else if (status === 'active') where.status = ProductStatus.ACTIVE;
            else if (status === 'rejected') where.status = ProductStatus.REMOVED; // Mapped REJECTED -> REMOVED? Wait, let's check rejectProduct: it sets REMOVED. Frontend uses REJECTED.
            else if (status === 'sold') where.status = ProductStatus.SOLD;
            else where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { brand: { contains: String(search), mode: 'insensitive' } },
                { model: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    condition: true,
                    category: true,
                    images: { take: 1 },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            sellerProfile: { select: { shopName: true } },
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: '제품 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const approveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await prisma.product.update({
            where: { id },
            data: {
                status: ProductStatus.ACTIVE,
            },
        });

        logger.info(`Product approved: ${id}`);

        res.json({
            success: true,
            message: '제품이 승인되었습니다.',
            data: product,
        });
    } catch (error) {
        logger.error('Approve product error:', error);
        res.status(500).json({
            success: false,
            message: '제품 승인 중 오류가 발생했습니다.',
        });
    }
};

export const rejectProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                status: ProductStatus.REMOVED,
            },
        });

        logger.info(`Product rejected: ${id} - Reason: ${reason}`);

        res.json({
            success: true,
            message: '제품이 거부되었습니다.',
            data: product,
        });
    } catch (error) {
        logger.error('Reject product error:', error);
        res.status(500).json({
            success: false,
            message: '제품 거부 중 오류가 발생했습니다.',
        });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                sellerProfile: true,
                _count: {
                    select: {
                        products: true,
                        orders: true,
                    },
                },
                password: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: '사용자 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orderItems: {

                    include: {
                        product: {
                            include: {
                                seller: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
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
        logger.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: '주문 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [totalUsers, totalProducts, totalOrders, pendingProducts, totalRevenue] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.product.count({ where: { status: ProductStatus.PENDING_APPROVAL } }),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { totalAmount: true },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                pendingProducts,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
            },
        });
    } catch (error) {
        logger.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: '통계를 가져오는 중 오류가 발생했습니다.',
        });
    }
};
