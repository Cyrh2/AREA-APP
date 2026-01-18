

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Inject Token from LocalStorage
    const token = localStorage.getItem('token');
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    console.log(`[API Request] ${config.method} ${url}`, config.body ? JSON.parse(config.body as string) : '');

    try {
        const response = await fetch(url, config);

        console.log(`[API Response] ${response.status} ${url}`);

        if (!response.ok) {
            if (response.status === 401) {
                // Token invalid or expired
                localStorage.removeItem('token');
                // Redirect to login if we are not already on an auth page
                if (!window.location.pathname.startsWith('/auth') && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
            const errorBody = await response.json().catch(() => ({}));
            console.error(`[API Error] ${response.status} ${url}`, errorBody);
            throw new Error(errorBody.message || errorBody.error || `API Error: ${response.statusText}`);
        }

        // Handle empty responses (e.g. 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json();
        console.log(`[API Data] ${url}`, data);
        return data;
    } catch (error) {
        console.error(`[API Network Error] ${url}`, error);
        throw error;
    }
}

export const api = {
    get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(endpoint, { ...options, method: 'POST', body }),
    put: <T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(endpoint, { ...options, method: 'PUT', body }),
    delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => request<T>(endpoint, { ...options, method: 'DELETE' }),
    patch: <T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(endpoint, { ...options, method: 'PATCH', body }),
};
