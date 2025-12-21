import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';
import { receiptUpdateSchema } from '../../../src/utils/validation';

const handler: Handler = createErrorHandler(
  createAuthHandler(async (event) => {
    const receiptId = event.path.split('/').pop();

    if (!receiptId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Receipt ID is required' })
      };
    }

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
      // Update receipt
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
  })
);

export { handler };
