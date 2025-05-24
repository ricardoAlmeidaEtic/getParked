import React, { useState, useEffect } from 'react'
import type { User } from '@prisma/client'

type NewUser = Pick<User, 'email' | 'name' | 'role'>

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string>('')
  const [newUser, setNewUser] = useState<NewUser>({ 
    email: '', 
    name: '', 
    role: 'user' 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()
      if (response.ok) {
        setUsers([data, ...users])
        setNewUser({ email: '', name: '', role: 'user' })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to create user')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add User
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 text-sm">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {user.role}
              </span>
              <span className="text-gray-500 ml-4">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 