import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import logger from '../utils/logger';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.',
            });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                password: false,
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.',
            });
            return;
        }

        req.user = user as any;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: '인증에 실패했습니다.',
        });
    }
};
