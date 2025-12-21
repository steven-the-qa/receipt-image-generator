import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';
import { receiptSchema, receiptUpdateSchema } from '../../../src/utils/validation';
import type { Receipt } from '../../../src/types/receipt';
import { withCors } from '../../../src/utils/cors';

const handler: Handler = withCors(
  createErrorHandler(
  createAuthHandler(async (event) => {
    // Check if path contains a receipt ID (UUID)
    // Path could be: /api/receipts/{id} or /api/receipts/receipt-by-id/{id}
    const uuidMatch = event.path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const receiptId = uuidMatch ? uuidMatch[0] : null;

    // If there's a receipt ID in the path, handle single receipt operations
    if (receiptId) {
      if (event.httpMethod === 'GET') {
        // Get single receipt
        const { data: receipt, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('id', receiptId)
          .eq('user_id', event.userId)
          .single();

        if (error || !receipt) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Receipt not found' })
          };
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receipt)
        };
      } else if (event.httpMethod === 'PUT') {
        // Update receipt (including is_favorite)
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
          const validatedData = receiptUpdateSchema.parse(body);
          const updateData = {
            ...validatedData,
            updated_at: new Date().toISOString()
          };

          const { data: receipt, error } = await supabase
            .from('receipts')
            .update(updateData)
            .eq('id', receiptId)
            .eq('user_id', event.userId)
            .select()
            .single();

          if (error || !receipt) {
            return {
              statusCode: 404,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Receipt not found' })
            };
          }

          return {
            statusCode: 200,
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
      } else if (event.httpMethod === 'DELETE') {
        // Delete receipt
        const { error } = await supabase
          .from('receipts')
          .delete()
          .eq('id', receiptId)
          .eq('user_id', event.userId);

        if (error) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Receipt not found' })
          };
        }

        return {
          statusCode: 204,
          headers: { 'Content-Type': 'application/json' },
          body: ''
        };
      } else {
        return {
          statusCode: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      }
    }

    // No receipt ID in path - handle list/create operations
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
  )
);

export { handler };
