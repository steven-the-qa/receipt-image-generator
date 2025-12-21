import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8888',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8888',
  // Add production domain when deployed
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (origin) {
    // In development, allow localhost origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  } else {
    // Default to allowing all origins in development
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

export function handleOptionsRequest(origin: string | null): HandlerResponse {
  return {
    statusCode: 200,
    headers: getCorsHeaders(origin),
    body: '',
  };
}

export function withCors(handler: Handler): Handler {
  return async (event: HandlerEvent, context) => {
    const origin = event.headers.origin || event.headers.Origin || null;

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return handleOptionsRequest(origin);
    }

    // Execute handler
    const response = await handler(event, context);

    // Add CORS headers to response
    if (response) {
      return {
        ...response,
        headers: {
          ...response.headers,
          ...getCorsHeaders(origin),
        },
      };
    }

    // If handler returns void/undefined, return a default response with CORS
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  };
}
