import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, UnauthorizedError } from '../lib/errors.js'
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from '../lib/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError('E-mail e senha são obrigatórios')

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) throw new UnauthorizedError('E-mail ou senha inválidos')

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) throw new UnauthorizedError('E-mail ou senha inválidos')

    const token = signAuthToken({ sub: user.id, email: user.email, name: user.name })
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions)

    res.json({ user: { id: user.id, name: user.name, email: user.email } })
  }),
)

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { ...authCookieOptions, maxAge: undefined })
  res.status(204).send()
})

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user || !user.active) throw new UnauthorizedError()

    res.json({ user: { id: user.id, name: user.name, email: user.email } })
  }),
)

export default router
