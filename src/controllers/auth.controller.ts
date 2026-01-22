import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { UserRole } from '@prisma/client';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ApiError(400, '이미 등록된 이메일입니다.');
        }

        const hashedPw = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPw,
                name,
                phone,
                role: UserRole.BUYER,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                password: false,
            },
        });

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        logger.info(`New user registered: ${user.email}`);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: { user, token },
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: '회원가입 중 오류가 발생했습니다.',
            });
        }
    }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const { password: _, ...userWithoutPassword } = user;

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            message: '로그인 성공',
            data: { user: userWithoutPassword, token },
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: '로그인 중 오류가 발생했습니다.',
            });
        }
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                sellerProfile: true,
            },
        });

        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: userWithoutPassword,
            });
        } else {
            res.json({
                success: true,
                data: null,
            });
        }
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Get me error:', error);
            res.status(500).json({
                success: false,
                message: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
            });
        }
    }
};

export const becomeSeller = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, '인증이 필요합니다.');
        }

        if (req.user.role !== UserRole.BUYER) {
            throw new ApiError(400, '이미 판매자이거나 관리자입니다.');
        }

        const { shopName, description } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                role: UserRole.SELLER,
                sellerProfile: {
                    create: {
                        shopName,
                        description,
                    },
                },
            },
            include: {
                sellerProfile: true,
            },
        });

        const { password, ...userWithoutPassword } = updatedUser;

        logger.info(`User became seller: ${req.user.email}`);

        res.json({
            success: true,
            message: '판매자 전환이 완료되었습니다.',
            data: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        } else {
            logger.error('Become seller error:', error);
            res.status(500).json({
                success: false,
                message: '판매자 전환 중 오류가 발생했습니다.',
            });
        }
    }
};
