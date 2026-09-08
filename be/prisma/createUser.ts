import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const [name, email, password] = process.argv.slice(2)

  if (!name || !email || !password) {
    console.error('Uso: npm run create-user -- "Nome Completo" email@exemplo.com senha123')
    process.exit(1)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { name, passwordHash, active: true },
    create: { name, email: normalizedEmail, passwordHash },
  })

  console.log(`Usuário pronto: ${user.name} <${user.email}>`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
