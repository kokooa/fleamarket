// 토큰 저장/조회/삭제 헬퍼 함수
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    sellerProfile?: {
        id: string;
        shopName: string;
    };
}

export const auth = {
    // 토큰 저장
    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    // 토큰 조회
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    // 사용자 정보 저장
    setUser(user: AuthUser) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    // 사용자 정보 조회
    getUser(): AuthUser | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    },

    // 로그아웃 (토큰 및 사용자 정보 삭제)
    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    },

    // 로그인 여부 확인
    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    // 판매자 권한 확인
    isSeller(): boolean {
        const user = this.getUser();
        return user?.role === 'SELLER' || user?.role === 'ADMIN';
    },

    // 관리자 권한 확인
    isAdmin(): boolean {
        const user = this.getUser();
        return user?.role === 'ADMIN';
    },
};

// API 요청에 자동으로 토큰 추가하는 헬퍼
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = auth.getToken(); // Changed from getToken() to auth.getToken() for correctness
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}

// 로그인 API
export async function login(email: string, password: string) {
    const response = await apiFetch(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }
    );

    const data = await response.json();

    if (response.ok && data.success) {
        auth.setToken(data.data.token);
        auth.setUser(data.data.user);
        return { success: true, data: data.data };
    }

    return { success: false, message: data.message || '로그인에 실패했습니다.' };
}

// 회원가입 API
export async function register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
}) {
    const response = await apiFetch(
        '/auth/register',
        {
            method: 'POST',
            body: JSON.stringify(userData),
        }
    );

    const data = await response.json();

    if (response.ok && data.success) {
        auth.setToken(data.data.token);
        auth.setUser(data.data.user);
        return { success: true, data: data.data };
    }

    return { success: false, message: data.message || '회원가입에 실패했습니다.' };
}

// 내 정보 가져오기
export async function getMe() {
    const response = await apiFetch(
        '/auth/me'
    );

    const data = await response.json();

    if (response.ok && data.success) {
        auth.setUser(data.data);
        return { success: true, data: data.data };
    }

    return { success: false, message: '사용자 정보를 가져오지 못했습니다.' };
}
