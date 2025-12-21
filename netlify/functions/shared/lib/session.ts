import { v4 as uuidv4 } from 'uuid';
import { parse, serialize } from 'cookie';
import { supabase } from './supabase';

const SESSION_COOKIE_NAME = 'receipt_session';
const SESSION_DURATION_DAYS = 7;

export interface Session {
  session_id: string;
  user_id: string;
  expires_at: string;
}

export function getSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function createSessionCookie(sessionId: string): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);
  
  return serialize(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/'
  });
}

export function clearSessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const { error } = await supabase
    .from('sessions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return data as Session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .delete()
    .eq('session_id', sessionId);
}

export async function cleanupExpiredSessions(): Promise<void> {
  await supabase
    .from('sessions')
    .delete()
    .lt('expires_at', new Date().toISOString());
}
