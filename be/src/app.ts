import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import type { ErrorRequestHandler } from 'express'
import { HttpError } from './lib/errors.js'
import { requireAuth } from './middleware/requireAuth.js'
import authRouter from './routes/auth.js'
import productsRouter from './routes/products.js'
import inventoryRouter from './routes/inventory.js'
import salesRouter from './routes/sales.js'
import exchangesRouter from './routes/exchanges.js'
import dashboardRouter from './routes/dashboard.js'

export function createApp() {
  const app = express()

  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim())
  app.use(
    cors({
      origin: allowedOrigins ?? true,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/auth', authRouter)

  app.use('/api/products', requireAuth, productsRouter)
  app.use('/api/inventory', requireAuth, inventoryRouter)
  app.use('/api/sales', requireAuth, salesRouter)
  app.use('/api/exchanges', requireAuth, exchangesRouter)
  app.use('/api/dashboard', requireAuth, dashboardRouter)

  app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' })
  })

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message })
      return
    }

    console.error(err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
  app.use(errorHandler)

  return app
}
