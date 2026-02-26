import { useEffect } from 'react'

export default function BlogViewModal({ blog, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sections = Array.isArray(blog.content_sections) ? blog.content_sections : []

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content blog-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{blog.title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <p className="blog-view-meta">
            <span className="blog-view-status">{blog.status}</span>
            {blog.slug && <span>Slug: {blog.slug}</span>}
            {blog.published_at && <span>{new Date(blog.published_at).toLocaleString()}</span>}
          </p>
          {blog.excerpt && <p className="blog-view-excerpt">{blog.excerpt}</p>}
          {blog.featured_image_url && (
            <div className="blog-view-featured">
              <img src={blog.featured_image_url} alt={blog.featured_image_alt || ''} />
            </div>
          )}
          <div className="blog-view-content">
            {sections.map((sec, i) => (
              <div key={i} className="blog-view-section">
                {sec.title && <h3>{sec.title}</h3>}
                {sec.content && <div dangerouslySetInnerHTML={{ __html: sec.content }} />}
                {sec.images?.length > 0 && (
                  <div className="blog-view-section-images">
                    {sec.images.map((img, j) => (
                      <img key={j} src={img.url} alt={img.alt || ''} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
