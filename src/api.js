/**
 * API client for Jashom backend. Base URL from env — no hardcoded URLs.
 */
const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    console.warn('VITE_API_URL is not set. Using http://localhost:5000 as fallback.')
    return 'http://localhost:5000'
  }
  return url.replace(/\/$/, '')
}

const api = (path, options = {}) => {
  const base = getBaseUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export const getBlogs = (params = {}) => {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.slug) q.set('slug', params.slug)
  if (params.limit != null) q.set('limit', params.limit)
  if (params.offset != null) q.set('offset', params.offset)
  const query = q.toString()
  return api(`/v1/admin/blogs${query ? `?${query}` : ''}`).then((r) => {
    if (!r.ok) throw new Error(r.statusText || 'Failed to fetch blogs')
    return r.json()
  })
}

export const getBlog = (id) =>
  api(`/v1/admin/blogs/${id}`).then((r) => {
    if (!r.ok) throw new Error(r.statusText || 'Failed to fetch blog')
    return r.json()
  })

export const createBlog = (data) =>
  api('/v1/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((r) => {
    if (!r.ok) return r.json().then((b) => { throw new Error(b.error || r.statusText) })
    return r.json()
  })

export const updateBlog = (id, data) =>
  api(`/v1/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then((r) => {
    if (!r.ok) return r.json().then((b) => { throw new Error(b.error || r.statusText) })
    return r.json()
  })

export const deleteBlog = (id) =>
  api(`/v1/admin/blogs/${id}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(r.statusText || 'Failed to delete blog')
  })
