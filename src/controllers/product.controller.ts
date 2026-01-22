import { Response } from 'express';
import { AuthRequest, ProductFilters } from '../types';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { ProductStatus, Prisma } from '@prisma/client';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const {
            categoryId,
            name,
            description,
            brand,
            model,
            serialNumber,
            originalPrice,
            sellingPrice,
            purchaseDate,
            warrantyMonths,
            isForParts,
            isRepairable,
            repairNotes,
            condition,
            defects,
        } = req.body;

        const product = await prisma.product.create({
            data: {
                sellerId: req.user.id,
                categoryId,
                name,
                description,
                brand,
                model,
                serialNumber,
                originalPrice,
                sellingPrice,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                warrantyMonths,
                isForParts,
                isRepairable,
                repairNotes,
                status: ProductStatus.PENDING_APPROVAL,
                condition: condition
                    ? {
                        create: {
                            overallGrade: condition.overallGrade,
                            functionalStatus: condition.functionalStatus,
                            cosmeticGrade: condition.cosmeticGrade,
                            batteryHealth: condition.batteryHealth,
                            screenDefect: condition.screenDefect || false,
                            cameraDefect: condition.cameraDefect || false,
                            speakerDefect: condition.speakerDefect || false,
                            portDefect: condition.portDefect || false,
                            buttonDefect: condition.buttonDefect || false,
                            additionalNotes: condition.additionalNotes,
                        },
                    }
                    : undefined,
                defects: defects
                    ? {
                        create: defects.map((defect: any) => ({
                            defectType: defect.defectType,
                            severity: defect.severity,
                            description: defect.description,
                            imageUrl: defect.imageUrl,
                        })),
                    }
                    : undefined,
            },
            include: {
                condition: true,
                defects: true,
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
        });

        logger.info(`Product created: ${product.id} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: '제품이 등록되었습니다. 관리자 승인 후 판매가 시작됩니다.',
            data: product,
        });
    } catch (error) {
        logger.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: '제품 등록 중 오류가 발생했습니다.',
        });
    }
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            page = 1,
            limit = 20,
            categoryId,
            minPrice,
            maxPrice,
            overallGrade,
            functionalStatus,
            isForParts,
            brand,
            search,
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            status: ProductStatus.ACTIVE,
        };

        if (categoryId) {
            where.categoryId = String(categoryId);
        }

        if (minPrice || maxPrice) {
            where.sellingPrice = {};
            if (minPrice) where.sellingPrice.gte = Number(minPrice);
            if (maxPrice) where.sellingPrice.lte = Number(maxPrice);
        }

        if (isForParts !== undefined) {
            where.isForParts = isForParts === 'true';
        }

        if (brand) {
            where.brand = { contains: String(brand), mode: 'insensitive' };
        }

        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { brand: { contains: String(search), mode: 'insensitive' } },
                { model: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (overallGrade || functionalStatus) {
            where.condition = {};

            if (overallGrade) {
                const grades = Array.isArray(overallGrade) ? overallGrade : [overallGrade];
                where.condition.overallGrade = { in: grades };
            }

            if (functionalStatus) {
                const statuses = Array.isArray(functionalStatus) ? functionalStatus : [functionalStatus];
                where.condition.functionalStatus = { in: statuses };
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    condition: true,
                    category: true,
                    images: {
                        where: { imageType: 'MAIN' },
                        take: 1,
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            sellerProfile: {
                                select: {
                                    shopName: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: {
                    createdAt: 'desc',
                },
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
        logger.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: '제품 목록을 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                condition: true,
                defects: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                images: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        sellerProfile: true,
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!product) {
            throw new ApiError(404, '제품을 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Get product error:', error);
            res.status(500).json({
                success: false,
                message: '제품을 가져오는 중 오류가 발생했습니다.',
            });
        }
    }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(404, '제품을 찾을 수 없습니다.');
        }

        if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new ApiError(403, '제품을 수정할 권한이 없습니다.');
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: req.body,
            include: {
                condition: true,
                defects: true,
                category: true,
            },
        });

        logger.info(`Product updated: ${id}`);

        res.json({
            success: true,
            message: '제품이 수정되었습니다.',
            data: updatedProduct,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Update product error:', error);
            res.status(500).json({
                success: false,
                message: '제품 수정 중 오류가 발생했습니다.',
            });
        }
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(404, '제품을 찾을 수 없습니다.');
        }

        if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new ApiError(403, '제품을 삭제할 권한이 없습니다.');
        }

        await prisma.product.delete({
            where: { id },
        });

        logger.info(`Product deleted: ${id}`);

        res.json({
            success: true,
            message: '제품이 삭제되었습니다.',
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: '제품 삭제 중 오류가 발생했습니다.',
            });
        }
    }
};

export const addProductImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const { id } = req.params;
        const { images } = req.body;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(404, '제품을 찾을 수 없습니다.');
        }

        if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new ApiError(403, '이미지를 추가할 권한이 없습니다.');
        }

        const createdImages = await prisma.productImage.createMany({
            data: images.map((img: any, index: number) => ({
                productId: id,
                url: img.url,
                imageType: img.imageType || 'GENERAL',
                order: img.order || index,
            })),
        });

        res.json({
            success: true,
            message: '이미지가 추가되었습니다.',
            data: createdImages,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Add product images error:', error);
            res.status(500).json({
                success: false,
                message: '이미지 추가 중 오류가 발생했습니다.',
            });
        }
    }
};
