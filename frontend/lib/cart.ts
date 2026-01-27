import { apiFetch } from './auth';

// 장바구니 API 호출 함수들
export async function getCart() {
    const response = await apiFetch('/cart');
    const data = await response.json();
    return data.success ? data.data : [];
}

export async function addToCart(productId: string, quantity: number = 1) {
    const response = await apiFetch(
        '/cart',
        {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        }
    );
    return await response.json();
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
    const response = await apiFetch(
        `/cart/${itemId}`,
        {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        }
    );
    return await response.json();
}

export async function removeFromCart(itemId: string) {
    const response = await apiFetch(
        `/cart/${itemId}`,
        {
            method: 'DELETE',
        }
    );
    return await response.json();
}

export async function clearCart() {
    const response = await apiFetch(
        '/cart',
        {
            method: 'DELETE',
        }
    );
    return await response.json();
}
