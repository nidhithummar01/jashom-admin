import { useState, useEffect } from 'react'
import { createBlog, updateBlog } from '../api'
import ImagePicker from './ImagePicker'

const STEPS = [
  { id: 0, label: 'Post details', short: 'Post', icon: '✏️' },
  { id: 1, label: 'Media & meta', short: 'Media', icon: '🖼️' },
  { id: 2, label: 'Content sections', short: 'Sections', icon: '📄' },
]

const emptySection = () => ({ title: '', content: '', images: [{ url: '', alt: '', name: '' }] })
const emptyImage = () => ({ url: '', alt: '', name: '' })

function normSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return [emptySection()]
  return sections.map((s) => ({
    title: s.title || '',
    content: s.content || '',
    images: Array.isArray(s.images) && s.images.length
      ? s.images.map((img) => ({ url: img.url || '', alt: img.alt || '', name: img.name || '' }))
      : [emptyImage()],
  }))
}

export default function BlogAddForm({ initialBlog = null, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [featured, setFeatured] = useState(false)
  const [allowComments, setAllowComments] = useState(true)
  const [contentSections, setContentSections] = useState([emptySection()])

  const isEdit = !!initialBlog

  useEffect(() => {
    if (!initialBlog) return
    setTitle(initialBlog.title || '')
    setSlug(initialBlog.slug || '')
    setExcerpt(initialBlog.excerpt || '')
    setContent(initialBlog.content || '')
    setAuthor(initialBlog.author_name || '')
    setImageUrl(initialBlog.featured_image_url || '')
    setImageAlt(initialBlog.featured_image_alt || '')
    setTags(initialBlog.tags || '')
    setFeatured(!!initialBlog.is_featured)
    setAllowComments(initialBlog.allow_comments !== false)
    setPublishedAt(initialBlog.published_at ? new Date(initialBlog.published_at).toISOString().slice(0, 16) : '')
    setContentSections(normSections(initialBlog.content_sections))
  }, [initialBlog])

  const addSection = () => setContentSections((prev) => [...prev, emptySection()])
  const removeSection = (idx) => setContentSections((prev) => prev.filter((_, i) => i !== idx))
  const setSection = (idx, field, value) => {
    setContentSections((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }
  const addImage = (sectionIdx) => {
    setContentSections((prev) => {
      const next = [...prev]
      next[sectionIdx] = { ...next[sectionIdx], images: [...(next[sectionIdx].images || []), emptyImage()] }
      return next
    })
  }
  const removeImage = (sectionIdx, imageIdx) => {
    setContentSections((prev) => {
      const next = [...prev]
      const imgs = (next[sectionIdx].images || []).filter((_, i) => i !== imageIdx)
      next[sectionIdx] = { ...next[sectionIdx], images: imgs.length ? imgs : [emptyImage()] }
      return next
    })
  }
  const setSectionImage = (sectionIdx, imageIdx, field, value) => {
    setContentSections((prev) => {
      const next = [...prev]
      const imgs = [...(next[sectionIdx].images || [])]
      imgs[imageIdx] = { ...imgs[imageIdx], [field]: value }
      next[sectionIdx] = { ...next[sectionIdx], images: imgs }
      return next
    })
  }

  const totalSteps = STEPS.length
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1
  const goNext = () => { if (!isLast) setCurrentStep((s) => s + 1) }
  const goPrev = () => { if (!isFirst) setCurrentStep((s) => s - 1) }

  const buildPayload = (status) => {
    const content_sections = contentSections
      .map((s) => ({
        title: s.title?.trim() || '',
        content: s.content?.trim() || '',
        images: (s.images || [])
          .filter((img) => img.url?.trim())
          .map((img) => ({ url: img.url.trim(), alt: img.alt?.trim() || '', name: img.name?.trim() || '' })),
      }))
      .filter((s) => s.title || s.content || (s.images && s.images.length > 0))
    return {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim() || '',
      author_name: author.trim() || null,
      featured_image_url: imageUrl.trim() || null,
      featured_image_alt: imageAlt.trim() || null,
      tags: tags.trim() || null,
      status,
      published_at: status === 'published' ? (publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString()) : null,
      is_featured: featured,
      allow_comments: allowComments,
      content_sections,
    }
  }

  const handleSubmit = async (e, mode = 'published') => {
    e.preventDefault()
    setSubmitError(null)
    if (!title.trim() || !slug.trim()) {
      setSubmitError('Title and slug are required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = buildPayload(mode)
      if (isEdit) {
        await updateBlog(initialBlog.id, payload)
      } else {
        await createBlog(payload)
      }
      onSuccess?.()
    } catch (err) {
      setSubmitError(err.message || 'Save failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="blog-form blog-form--stepper" onSubmit={(e) => handleSubmit(e, 'published')}>
      {/* Attractive stepper */}
      <div className="stepper-card">
        <div className="stepper-progress-bar">
          <div className="stepper-progress-fill" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
        </div>
        <div className="stepper-steps">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`stepper-step ${currentStep === index ? 'stepper-step--active' : ''} ${index < currentStep ? 'stepper-step--done' : ''}`}
              onClick={() => setCurrentStep(index)}
              aria-current={currentStep === index ? 'step' : undefined}
            >
              <span className="stepper-step__circle">
                {index < currentStep ? '✓' : step.icon}
              </span>
              <span className="stepper-step__label">{step.label}</span>
              <span className="stepper-step__label stepper-step__label--short">{step.short}</span>
            </button>
          ))}
        </div>
        <p className="stepper-progress-text">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Step content */}
      <div className="stepper-panel">
        {currentStep === 0 && (
          <div className="form-section form-section--step">
            <h2 className="form-section-title">Post details</h2>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" type="text" placeholder="Enter blog title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="slug">URL slug</label>
              <input id="slug" type="text" placeholder="blog-url-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea id="excerpt" placeholder="Short description for listings and SEO" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="content">Content</label>
              <textarea id="content" placeholder="Full blog content (markdown or HTML)" value={content} onChange={(e) => setContent(e.target.value)} className="content-area" />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-section form-section--step">
            <h2 className="form-section-title">Media & meta</h2>
            <div className="field">
              <label>Featured image</label>
              <ImagePicker
                value={imageUrl}
                onChange={setImageUrl}
                label="Choose featured image"
                showUrlFallback
                urlPlaceholder="Or paste image URL"
              />
              <div className="field field--mt">
                <label htmlFor="imageAlt">Featured image alt text</label>
                <input id="imageAlt" type="text" placeholder="Alt text for accessibility" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="author">Author</label>
              <input id="author" type="text" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <input id="category" type="text" placeholder="e.g. News, Tutorial" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input id="tags" type="text" placeholder="tag1, tag2, tag3" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="publishedAt">Publish date</label>
              <input id="publishedAt" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
            <div className="field field-row">
              <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <label htmlFor="featured">Featured post</label>
            </div>
            <div className="field field-row">
              <input id="allowComments" type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
              <label htmlFor="allowComments">Allow comments</label>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section form-section--step">
            <h2 className="form-section-title">Content sections</h2>
            <p className="form-section-hint">Add sections (e.g. Introduction, Parallel Processing). Each section can have a title, content, and multiple images.</p>
            {contentSections.map((sec, sIdx) => (
              <div key={sIdx} className="content-section-block">
                <div className="content-section-block__header">
                  <span className="content-section-block__title">Section {sIdx + 1}</span>
                  <button type="button" className="btn btn-remove" onClick={() => removeSection(sIdx)} disabled={contentSections.length <= 1}>Remove</button>
                </div>
                <div className="field">
                  <label>Section title</label>
                  <input type="text" placeholder="e.g. Introduction" value={sec.title} onChange={(e) => setSection(sIdx, 'title', e.target.value)} />
                </div>
                <div className="field">
                  <label>Section content</label>
                  <textarea placeholder="Paragraphs, lists, HTML…" value={sec.content} onChange={(e) => setSection(sIdx, 'content', e.target.value)} rows={4} />
                </div>
                <div className="content-section-block__images">
                  <label>Images in this section</label>
                  {(sec.images || [emptyImage()]).map((img, iIdx) => (
                    <div key={iIdx} className="content-image-row">
                      <div className="content-image-row__header">
                        <span>Image {iIdx + 1}</span>
                        <button type="button" className="btn btn-remove" onClick={() => removeImage(sIdx, iIdx)} disabled={(sec.images || []).length <= 1}>Remove</button>
                      </div>
                      <div className="field">
                        <ImagePicker
                          value={img.url}
                          onChange={(url) => setSectionImage(sIdx, iIdx, 'url', url)}
                          label="Choose image"
                          showUrlFallback
                          urlPlaceholder="Or paste image URL"
                        />
                      </div>
                      <div className="field"><input type="text" placeholder="Alt text" value={img.alt} onChange={(e) => setSectionImage(sIdx, iIdx, 'alt', e.target.value)} /></div>
                      <div className="field"><input type="text" placeholder="Image name" value={img.name} onChange={(e) => setSectionImage(sIdx, iIdx, 'name', e.target.value)} /></div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addImage(sIdx)}>+ Add image</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addSection}>+ Add section</button>
          </div>
        )}
      </div>

      {submitError && <p className="form-submit-error">{submitError}</p>}
      {/* Actions */}
      <div className="form-actions form-actions--stepper">
        <button type="button" className="btn btn-outline" onClick={goPrev} disabled={isFirst} aria-label="Previous step">
          ← Previous
        </button>
        <div className="form-actions__right">
          {isLast ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={(e) => handleSubmit(e, 'draft')} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save draft'}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Update' : 'Publish'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Next →
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
