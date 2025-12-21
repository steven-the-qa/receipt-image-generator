import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { getSessionCookie, getSession } from '../lib/session';

export interface AuthenticatedEvent extends HandlerEvent {
  userId: string;
}

export async function requireAuth(event: HandlerEvent): Promise<{ userId: string } | null> {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || null;
  const sessionId = getSessionCookie(cookieHeader);

  if (!sessionId) {
    return null;
  }

  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  return { userId: session.user_id };
}

export function createAuthHandler(handler: (event: AuthenticatedEvent, context: HandlerContext) => Promise<HandlerResponse>): Handler {
  return async (event, context) => {
    const auth = await requireAuth(event);
    if (!auth) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    return handler({ ...event, userId: auth.userId }, context);
  };
}
