import { Handler } from '@netlify/functions';
import { supabase } from '../../src/lib/supabase';
import { hashPassword } from '../../src/lib/password';
import { createSession, createSessionCookie } from '../../src/lib/session';
import { createErrorHandler } from '../../src/middleware/errorHandler';
import { createValidatedHandler } from '../../src/middleware/validate';
import { registerSchema } from '../../src/utils/validation';

const handler: Handler = createErrorHandler(
  createValidatedHandler(registerSchema, async (event, context, data) => {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${data.username},email.eq.${data.email}`)
      .limit(1)
      .single();

    if (existingUser) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username or email already exists' })
      };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(data.password);
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        email: data.email,
        password_hash: passwordHash
      })
      .select('id, username, email, created_at, updated_at')
      .single();

    if (error || !user) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to create user' })
      };
    }

    // Create session
    const sessionId = await createSession(user.id);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(sessionId)
      },
      body: JSON.stringify(user)
    };
  })
);

export { handler };
