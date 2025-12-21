import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { hashPassword } from '../../../src/lib/password';
import { createSession, createSessionCookie } from '../../../src/lib/session';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createValidatedHandler } from '../../../src/middleware/validate';
import { registerSchema } from '../../../src/utils/validation';
import { withCors } from '../../../src/utils/cors';

const handler: Handler = withCors(
  createErrorHandler(
    createValidatedHandler(registerSchema, async (event, context, data) => {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${data.username},email.eq.${data.email}`)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.error('Error checking existing user:', checkError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Database error',
          details: process.env.NODE_ENV === 'development' ? checkError.message : undefined
        })
      };
    }

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

    if (error) {
      console.error('Error creating user:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to create user',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      };
    }

    if (!user) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User created but not returned' })
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
  )
);

export { handler };

