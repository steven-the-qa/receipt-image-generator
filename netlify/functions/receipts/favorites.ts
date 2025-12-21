import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';

const handler: Handler = createErrorHandler(
  createAuthHandler(async (event) => {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', event.userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch favorite receipts' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receipts || [])
    };
  })
);

export { handler };
