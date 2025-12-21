import { Handler } from '@netlify/functions';
import { getSessionCookie, deleteSession, clearSessionCookie } from '../../src/lib/session';
import { createErrorHandler } from '../../src/middleware/errorHandler';
import { createAuthHandler } from '../../src/middleware/auth';

const handler: Handler = createErrorHandler(
  createAuthHandler(async (event) => {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || null;
    const sessionId = getSessionCookie(cookieHeader);

    if (sessionId) {
      await deleteSession(sessionId);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie()
      },
      body: JSON.stringify({ message: 'Logged out successfully' })
    };
  })
);

export { handler };
