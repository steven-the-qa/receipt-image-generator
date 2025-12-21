import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { ZodSchema, ZodError } from 'zod';

export function createValidatedHandler<T>(
  schema: ZodSchema<T>,
  handler: (event: HandlerEvent, context: HandlerContext, data: T) => Promise<HandlerResponse>
): Handler {
  return async (event, context) => {
    let body: any;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (error) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    try {
      const validatedData = schema.parse(body);
      return handler(event, context, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Validation failed',
            details: error.errors
          })
        };
      }
      throw error;
    }
  };
}
