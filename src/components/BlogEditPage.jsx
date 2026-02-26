import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBlog } from '../api'
import BlogAddForm from './BlogAddForm'

export default function BlogEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getBlog(id)
      .then(setBlog)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="list-message">Loading blog…</p>
  if (error) return <p className="list-message list-message--error">Error: {error}</p>
  if (!blog) return null

  return (
    <BlogAddForm
      initialBlog={blog}
      onSuccess={() => navigate('/', { replace: true })}
    />
  )
}
