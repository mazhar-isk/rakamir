import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
  const backendUrl = process.env.API_BACKEND_URL || 'https://api-dev.rakamir.com';
  const path = pathSegments.join('/');
  
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const targetUrl = `${backendUrl}/v1/${path}${queryString}`;

  const method = request.method;
  const headers: Record<string, string> = {};
  
  // Forward authorization headers
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['authorization'] = authHeader;
  }
  
  // Forward Content-Type if present, default to application/json
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['content-type'] = contentType;
  } else {
    headers['content-type'] = 'application/json';
  }

  headers['ngrok-skip-browser-warning'] = 'true';

  try {
    let body: any = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.json();
      } catch {
        body = null;
      }
    }

    const response = await axios({
      method,
      url: targetUrl,
      data: body,
      headers,
      validateStatus: () => true, // Return all status codes instead of throwing
    });

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
