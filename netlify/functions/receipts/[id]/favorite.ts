import { Handler } from '@netlify/functions';
import { supabase } from '../../../../src/lib/supabase';
import { createErrorHandler } from '../../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../../src/middleware/auth';
import { withCors } from '../../../../src/utils/cors';

const handler: Handler = withCors(
  createErrorHandler(
  createAuthHandler(async (event) => {
    const receiptId = event.path.split('/').slice(-2, -1)[0];

    if (!receiptId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Receipt ID is required' })
      };
    }

    if (event.httpMethod === 'POST') {
      // Mark as favorite
      const { data: receipt, error } = await supabase
        .from('receipts')
        .update({ is_favorite: true, updated_at: new Date().toISOString() })
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
    } else if (event.httpMethod === 'DELETE') {
      // Unmark as favorite
      const { data: receipt, error } = await supabase
        .from('receipts')
        .update({ is_favorite: false, updated_at: new Date().toISOString() })
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
