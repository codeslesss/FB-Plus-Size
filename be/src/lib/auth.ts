import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express-serve-static-core'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado no ambiente')
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 dias

export const AUTH_COOKIE_NAME = 'fb_session'

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: TOKEN_TTL_SECONDS * 1000,
  path: '/',
}

export interface AuthTokenPayload {
  sub: string
  email: string
  name: string
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: TOKEN_TTL_SECONDS })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload
}
