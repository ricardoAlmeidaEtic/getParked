import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const posts = await prisma.post.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(posts)

      case 'POST': {
        const { title, content } = req.body
        if (!title || !content) {
          return res.status(400).json({ error: 'Title and content are required' })
        }
        
        const post = await prisma.post.create({
          data: {
            title,
            content,
            published: true
          }
        })
        return res.status(201).json(post)
      }

      case 'PUT': {
        const { id, title, content, published } = req.body
        if (!id) {
          return res.status(400).json({ error: 'Post ID is required' })
        }

        const post = await prisma.post.update({
          where: { id: Number(id) },
          data: {
            title,
            content,
            published
          }
        })
        return res.status(200).json(post)
      }

      case 'DELETE': {
        const { id } = req.query
        if (!id) {
          return res.status(400).json({ error: 'Post ID is required' })
        }

        await prisma.post.delete({
          where: { id: Number(id) }
        })
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
} 