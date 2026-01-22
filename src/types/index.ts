import { Request } from 'express';
import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>;
        }
    }
}

export interface AuthRequest extends Request {
    user?: Omit<User, 'password'>;
}

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    overallGrade?: string[];
    functionalStatus?: string[];
    isForParts?: boolean;
    brand?: string;
    search?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
