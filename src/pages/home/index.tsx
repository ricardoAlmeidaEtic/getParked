import React, { useEffect, useState } from 'react'
import Head from 'next/head'

type Post = {
  id: number
  title: string
  content: string
  published: boolean
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching posts:', error)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Head>
        <title>Blog Posts</title>
        <meta name="description" content="View all blog posts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Posts</h1>
          {loading ? (
            <p>Loading posts...</p>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <article key={post.id} className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600">{post.content}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 