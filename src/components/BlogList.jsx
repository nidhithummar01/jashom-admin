import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs, deleteBlog } from '../api'
import BlogViewModal from './BlogViewModal'

export default function BlogList() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getBlogs()
      .then(setBlogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const openDeleteConfirm = (blog) => setDeleteConfirm(blog)
  const closeDeleteConfirm = useCallback(() => {
    if (!deletingId) setDeleteConfirm(null)
  }, [deletingId])

  useEffect(() => {
    if (!deleteConfirm) return
    const onKey = (e) => e.key === 'Escape' && closeDeleteConfirm()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteConfirm, closeDeleteConfirm])

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return
    setDeletingId(deleteConfirm.id)
    deleteBlog(deleteConfirm.id)
      .then(() => {
        setDeleteConfirm(null)
        load()
      })
      .catch((e) => setError(e.message || 'Delete failed'))
      .finally(() => setDeletingId(null))
  }

  if (loading) return <p className="list-message">Loading blogs…</p>
  if (error) return <p className="list-message list-message--error">Error: {error}</p>
  if (!blogs.length) return <p className="list-message">No blogs yet. <Link to="/add">Add one</Link>.</p>

  return (
    <>
      <div className="blog-list-wrap">
        <ul className="blog-list">
          {blogs.map((b) => (
            <li key={b.id} className="blog-list-item">
              <div className="blog-list-item__thumb">
                {b.featured_image_url ? (
                  <img src={b.featured_image_url} alt={b.featured_image_alt || ''} />
                ) : (
                  <div className="blog-list-item__thumb-placeholder">No image</div>
                )}
              </div>
              <div className="blog-list-item__body">
                <h3 className="blog-list-item__title">{b.title}</h3>
                <p className="blog-list-item__meta">
                  <span className="blog-list-item__slug">{b.slug}</span>
                  <span className={`blog-list-item__status blog-list-item__status--${b.status}`}>{b.status}</span>
                  {b.published_at && (
                    <span className="blog-list-item__date">
                      {new Date(b.published_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
                {b.excerpt && <p className="blog-list-item__excerpt">{b.excerpt.slice(0, 120)}…</p>}
                <div className="blog-list-item__actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewing(b)}>View</button>
                  <Link to={`/edit/${b.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteConfirm(b)}
                    disabled={deletingId === b.id}
                  >
                    {deletingId === b.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {viewing && (
        <BlogViewModal blog={viewing} onClose={() => setViewing(null)} />
      )}
      {deleteConfirm && (
        <div
          className="modal-backdrop modal-backdrop--center"
          onClick={closeDeleteConfirm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="modal-content modal-content--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="delete-confirm-title" className="modal-title">Delete blog?</h2>
              <button type="button" className="modal-close" onClick={closeDeleteConfirm} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p className="delete-confirm-message">
                &ldquo;{deleteConfirm.title}&rdquo; will be permanently deleted. This cannot be undone.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeDeleteConfirm} disabled={!!deletingId}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={!!deletingId}
                >
                  {deletingId === deleteConfirm.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
