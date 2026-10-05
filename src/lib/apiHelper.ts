import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { verifyToken } from './verifyToken';
import { NextResponse } from 'next/server';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  // Replace any with unknown or specific type
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig['responseType'];
}

const API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_HOST;

export const apiHelper = async (url: string, options: ApiRequestOptions = {}) => {
  try {
    const token = (await cookies()).get('token')?.value;
    const refreshToken = (await cookies()).get('refreshToken')?.value;

    if (!token && refreshToken) {
      const result = await verifyToken(refreshToken);
      if (result.valid && result.refreshed && result.headers?.['Set-Cookie']) {
        const response = NextResponse.next();
        response.headers.set('Set-Cookie', result.headers['Set-Cookie']);
        return response;
      }
    }

    if (!token) throw new Error('Authorization token is missing.');

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token has expired.');
      }
    } catch {
      throw new Error('Invalid token format.');
    }

    // Construct query string for GET requests
    let queryString = '';
    if (options.method === 'GET' && options.body && !(options.body instanceof FormData)) {
      queryString = `?${new URLSearchParams(options.body as Record<string, string>).toString()}`;
    }

    // Determine content type based on body type
    const isFormData = options.body instanceof FormData;
    const contentType = isFormData ? 'multipart/form-data' : 'application/json';

    // Axios request config
    const config: AxiosRequestConfig = {
      method: options.method || 'GET',
      url: `${API_URL}/${url}${queryString}`,
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      data: options.method !== 'GET' ? options.body : undefined,
      responseType: options.responseType || 'json',
    };

    const response = await axios(config);
    console.log('response', response);
    return response.data;
  } catch (error) {
    console.log('error', error);
    if (axios.isAxiosError(error)) {
      if (error.status === 401 && !url.includes('login')) {
        const cookieStore = await cookies();
        cookieStore.delete('token');
        cookieStore.delete('refreshToken');
        console.log('cookieStore', cookieStore);

        // Throw custom UnauthorizedError instead of redirect
        redirect('/', RedirectType.replace);
      }
      console.error('API Error Response:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    } else if (error instanceof Error) {
      console.error('General Error:', error.message);
    } else {
      console.error('Unknown error', error);
    }

    throw error;
  }
};
