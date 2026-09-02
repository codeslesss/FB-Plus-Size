import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import { HttpError } from './lib/errors.js'
import productsRouter from './routes/products.js'
import inventoryRouter from './routes/inventory.js'
import salesRouter from './routes/sales.js'
import exchangesRouter from './routes/exchanges.js'
import dashboardRouter from './routes/dashboard.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/products', productsRouter)
  app.use('/api/inventory', inventoryRouter)
  app.use('/api/sales', salesRouter)
  app.use('/api/exchanges', exchangesRouter)
  app.use('/api/dashboard', dashboardRouter)

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
