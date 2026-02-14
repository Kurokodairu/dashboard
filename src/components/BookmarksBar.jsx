import { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import useSettingsStore from '../stores/settingsStore'
import logger from '../utils/logger'
import './BookmarksBar.css'

const MAX_VISIBLE = 7

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

const FallbackIcon = ({ title }) => (
  <span className="bookmark-fallback-icon">{(title || '?')[0]}</span>
)

const FaviconImg = ({ url, title }) => {
  const [failed, setFailed] = useState(false)
  const src = getFaviconUrl(url)

  if (!src || failed) return <FallbackIcon title={title} />
  return <img src={src} alt="" onError={() => setFailed(true)} />
}

const BookmarksBar = () => {
  const { bookmarks, setBookmarks } = useSettingsStore()
  const list = Array.isArray(bookmarks) ? bookmarks : []

  const [showMore, setShowMore] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const moreRef = useRef(null)
  const addRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false)
      if (addRef.current && !addRef.current.contains(e.target)) setShowAdd(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const visible = list.slice(0, MAX_VISIBLE)
  const overflow = list.slice(MAX_VISIBLE)

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) return
    const url = newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`
    try {
      new URL(url)
    } catch {
      logger.error('Invalid URL')
      return
    }
    const bookmark = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url,
      folder: 'default',
      createdAt: new Date().toISOString()
    }
    setBookmarks([...list, bookmark])
    setNewTitle('')
    setNewUrl('')
    setShowAdd(false)
    logger.info('Bookmark added:', bookmark.title)
  }

  if (list.length === 0) {
    return (
      <div className="bookmarks-bar">
        <div ref={addRef} style={{ position: 'relative' }}>
          <button
            className="bookmark-add-btn"
            title="Add bookmark"
            onClick={() => setShowAdd((v) => !v)}
          >
            <Plus size={18} />
          </button>
          {showAdd && (
            <div className="bookmark-add-popover">
              <input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <input
                placeholder="URL (e.g. github.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="bookmark-add-popover-actions">
                <button className="bap-save" onClick={handleAdd}>Add</button>
                <button className="bap-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks-bar">
      {visible.map((bm) => (
        <a
          key={bm.id}
          href={bm.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bookmark-icon-link"
          title={bm.title}
        >
          <FaviconImg url={bm.url} title={bm.title} />
          <span className="bookmark-tooltip">{bm.title}</span>
        </a>
      ))}

      {overflow.length > 0 && (
        <div className="bookmarks-more-wrapper" ref={moreRef}>
          <button
            className="bookmarks-more-btn"
            onClick={() => { setShowMore((v) => !v); setShowAdd(false) }}
            title="More bookmarks"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMore && (
            <div className="bookmarks-dropdown">
              {overflow.map((bm) => (
                <a
                  key={bm.id}
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bookmarks-dropdown-item"
                >
                  <FaviconImg url={bm.url} title={bm.title} />
                  <span>{bm.title}</span>
                </a>
              ))}
              {/* Add button inside the dropdown too */}
              <button
                className="bookmarks-dropdown-item"
                onClick={() => { setShowMore(false); setShowAdd(true) }}
              >
                <Plus size={16} />
                <span>Add bookmark</span>
              </button>
            </div>
          )}
        </div>
      )}

      {overflow.length === 0 && (
        <div ref={addRef} style={{ position: 'relative' }}>
          <button
            className="bookmark-add-btn"
            title="Add bookmark"
            onClick={() => { setShowAdd((v) => !v); setShowMore(false) }}
          >
            <Plus size={18} />
          </button>
          {showAdd && (
            <div className="bookmark-add-popover">
              <input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <input
                placeholder="URL (e.g. github.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="bookmark-add-popover-actions">
                <button className="bap-save" onClick={handleAdd}>Add</button>
                <button className="bap-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookmarksBar
