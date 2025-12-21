import { Handler, HandlerResponse } from '@netlify/functions';

export function createErrorHandler(handler: Handler): Handler {
  return async (event, context) => {
    try {
      const result = await handler(event, context);
      return result || { statusCode: 200, body: '' };
    } catch (error: any) {
      console.error('Handler error:', error);
      return {
        statusCode: error.statusCode || 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message || 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      };
    }
  };
}
