import { PrismaClient } from '@prisma/client'

// Configuração simples e direta - sem instância compartilhada
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
})
