import { Handler } from '@netlify/functions';
import { supabase } from '../../src/lib/supabase';
import { verifyPassword } from '../../src/lib/password';
import { createSession, createSessionCookie } from '../../src/lib/session';
import { createErrorHandler } from '../../src/middleware/errorHandler';
import { createValidatedHandler } from '../../src/middleware/validate';
import { loginSchema } from '../../src/utils/validation';

const handler: Handler = createErrorHandler(
  createValidatedHandler(loginSchema, async (event, context, data) => {
    // Find user by email or username
    let query = supabase.from('users').select('*');
    
    if (data.email) {
      query = query.eq('email', data.email);
    } else if (data.username) {
      query = query.eq('username', data.username);
    }

    const { data: users, error } = await query.limit(1);

    if (error || !users || users.length === 0) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const user = users[0];

    // Verify password
    const isValid = await verifyPassword(data.password, user.password_hash);
    if (!isValid) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Create session
    const sessionId = await createSession(user.id);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(sessionId)
      },
      body: JSON.stringify(userWithoutPassword)
    };
  })
);

export { handler };
