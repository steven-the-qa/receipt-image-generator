import { Handler } from '@netlify/functions';
import { supabase } from '../../../src/lib/supabase';
import { hashPassword } from '../../../src/lib/password';
import { createErrorHandler } from '../../../src/middleware/errorHandler';
import { createAuthHandler } from '../../../src/middleware/auth';
import { updateProfileSchema } from '../../../src/utils/validation';
import { withCors } from '../../../src/utils/cors';
import { ZodError } from 'zod';

const handler: Handler = withCors(
  createErrorHandler(
  createAuthHandler(async (event) => {
    // Validate request body
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

    let data;
    try {
      data = updateProfileSchema.parse(body);
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

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Check for username/email conflicts if updating
    if (data.username || data.email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`username.eq.${data.username || ''},email.eq.${data.email || ''}`)
        .neq('id', event.userId)
        .limit(1)
        .single();

      if (existingUser) {
        return {
          statusCode: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Username or email already exists' })
        };
      }
    }

    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', event.userId)
      .select('id, username, email, created_at, updated_at')
      .single();

    if (error || !user) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to update profile' })
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
