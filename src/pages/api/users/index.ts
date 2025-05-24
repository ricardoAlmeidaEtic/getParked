import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(users)

      case 'POST': {
        const { email, name, role } = req.body
        if (!email || !name) {
          return res.status(400).json({ error: 'Email and name are required' })
        }
        
        const newUser = await prisma.user.create({
          data: {
            email,
            name,
            role: role || 'user'
          }
        })
        return res.status(201).json(newUser)
      }

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' })
    }
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
} 