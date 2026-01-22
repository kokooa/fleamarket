import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get top-level categories with their children
        const categories = await prisma.category.findMany({
            where: {
                parentId: null,
            },
            include: {
                children: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        logger.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리를 가져오는 중 오류가 발생했습니다.',
        });
    }
};

export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new ApiError(404, '카테고리를 찾을 수 없습니다.');
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Get category error:', error);
            res.status(500).json({
                success: false,
                message: '카테고리를 가져오는 중 오류가 발생했습니다.',
            });
        }
    }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, slug, description, parentId, order } = req.body;

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                parentId,
                order: order || 0,
            },
        });

        logger.info(`Category created: ${category.name}`);

        res.status(201).json({
            success: true,
            message: '카테고리가 생성되었습니다.',
            data: category,
        });
    } catch (error) {
        logger.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 생성 중 오류가 발생했습니다.',
        });
    }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await prisma.category.update({
            where: { id },
            data: req.body,
        });

        res.json({
            success: true,
            message: '카테고리가 수정되었습니다.',
            data: category,
        });
    } catch (error) {
        logger.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 수정 중 오류가 발생했습니다.',
        });
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.category.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: '카테고리가 삭제되었습니다.',
        });
    } catch (error) {
        logger.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 삭제 중 오류가 발생했습니다.',
        });
    }
};
