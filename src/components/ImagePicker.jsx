import { useRef, useState } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

export default function ImagePicker({ value, onChange, label = 'Choose image', showUrlFallback = false, urlPlaceholder = 'Or paste image URL' }) {
  const inputRef = useRef(null)
  const [showUrl, setShowUrl] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, or GIF).')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
    } catch (err) {
      alert(err.message || 'Could not read image.')
    }
    e.target.value = ''
  }

  return (
    <div className="image-picker">
      <div className="image-picker__row">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="image-picker__input"
          aria-label={label}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm image-picker__btn"
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Change image' : label}
        </button>
        {showUrlFallback && (
          <label className="image-picker__url-toggle">
            <input
              type="checkbox"
              checked={showUrl}
              onChange={(e) => setShowUrl(e.target.checked)}
            />
            Paste URL instead
          </label>
        )}
      </div>
      {showUrlFallback && showUrl && (
        <div className="image-picker__url-fallback">
          <input
            type="url"
            placeholder={urlPlaceholder}
            value={typeof value === 'string' && value && !value.startsWith('data:') ? value : ''}
            onChange={(e) => onChange(e.target.value.trim() || '')}
            className="image-picker__url-input"
          />
        </div>
      )}
      {value && (
        <div className="image-preview image-picker__preview">
          <img src={value} alt="" onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}
    </div>
  )
}
