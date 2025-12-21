import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';
import { withCors } from '../../../src/utils/cors';

const handler: Handler = withCors(
  createErrorHandler(
  createAuthHandler(async (event) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, created_at, updated_at')
      .eq('id', event.userId)
      .single();

    if (error || !user) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    };
    })
  )
);

export { handler };

