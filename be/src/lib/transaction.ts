import type { Prisma } from '@prisma/client'
import { prisma } from './prisma.js'
import { BadRequestError } from './errors.js'

export async function transaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(operation)
    } catch (error) {
      if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'P2034') throw error
      if (attempt === 2) throw new BadRequestError('Outra operação alterou os dados. Tente novamente.')
    }
  }
  throw new Error('Transação não concluída')
}
