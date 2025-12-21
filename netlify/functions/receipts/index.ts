import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';
import { receiptSchema } from '../../../src/utils/validation';
import type { Receipt } from '../../../src/types/receipt';

const handler: Handler = createErrorHandler(
  createAuthHandler(async (event) => {
    if (event.httpMethod === 'GET') {
      // List receipts
      const favoriteOnly = event.queryStringParameters?.favorite === 'true';
      
      let query = supabase
        .from('receipts')
        .select('*')
        .eq('user_id', event.userId)
        .order('created_at', { ascending: false });

      if (favoriteOnly) {
        query = query.eq('is_favorite', true);
      }

      const { data: receipts, error } = await query;

      if (error) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to fetch receipts' })
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipts || [])
      };
    } else if (event.httpMethod === 'POST') {
      // Create receipt
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
        const validatedData = receiptSchema.parse(body);
        const receiptData: Receipt = {
          ...validatedData,
          user_id: event.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: receipt, error } = await supabase
          .from('receipts')
          .insert(receiptData)
          .select()
          .single();

        if (error || !receipt) {
          return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to create receipt' })
          };
        }

        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receipt)
        };
      } catch (error: any) {
        if (error.name === 'ZodError') {
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
    } else {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  })
);

export { handler };
