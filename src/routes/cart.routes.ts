import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cart.controller';

const router = Router();

// 모든 라우트는 인증 필요
router.use(authenticate);

// 장바구니 조회
router.get('/', getCart);

// 장바구니에 제품 추가
router.post('/', addToCart);

// 장바구니 아이템 수량 변경
router.put('/:itemId', updateCartItem);

// 장바구니에서 제품 제거
router.delete('/:itemId', removeFromCart);

// 장바구니 전체 비우기
router.delete('/', clearCart);

export default router;
