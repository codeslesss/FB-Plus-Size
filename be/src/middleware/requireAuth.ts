import type { RequestHandler } from 'express-serve-static-core'
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../lib/auth.js'
import { UnauthorizedError } from '../lib/errors.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; email: string; name: string }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  if (!token) {
    next(new UnauthorizedError())
    return
  }

  try {
    const payload = verifyAuthToken(token)
    req.user = { id: payload.sub, email: payload.email, name: payload.name }
    next()
  } catch {
    next(new UnauthorizedError('Sessão inválida ou expirada'))
  }
}
