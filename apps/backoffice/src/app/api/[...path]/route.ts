import { NextRequest, NextResponse } from 'next/server';
import { resolveMock } from '@ecommerce/api-client/src/mock/handlers';

const getBackendUrl = () => {
  return process.env.API_BACKEND_URL || 'https://1f0d-2402-8780-106f-4c80-8078-aa9c-6729-7ad2.ngrok-free.app';
};

const isMockEnabled = () => {
  return process.env.NEXT_PUBLIC_MOCK_API === 'true';
};

async function handleProxy(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    const searchParams = url.searchParams.toString();
    const backendUrl = `${getBackendUrl()}${path}${searchParams ? `?${searchParams}` : ''}`;

    // Intercept with mock API if enabled
    if (isMockEnabled()) {
      let body: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const text = await request.clone().text();
          body = text ? JSON.parse(text) : undefined;
        } catch (e) {
          // Ignore parsing error
        }
      }
      const mockUrl = `${path}${searchParams ? `?${searchParams}` : ''}`;
      const mock = resolveMock(request.method, mockUrl, body);
      if (mock) {
        return NextResponse.json(mock, {
          status: parseInt(mock.code, 10) || 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
          },
        });
      }
    }

    // Build clean forwarded headers
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('content-type') || 'application/json');
    headers.set('ngrok-skip-browser-warning', 'true');

    // Forward Authorization if present
    const auth = request.headers.get('authorization');
    if (auth) headers.set('Authorization', auth);

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    // Forward the body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      options.body = await request.text();
    }

    // Hit the backend
    const backendResponse = await fetch(backendUrl, options);

    // Buffer the response body so Chrome DevTools can see it
    const responseBody = await backendResponse.arrayBuffer();

    // Build minimal, clean response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    const contentType = backendResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }
    // Set exact content-length from the buffered body
    responseHeaders.set('Content-Length', String(responseBody.byteLength));

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'API Proxy Error', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = async () =>
  new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
