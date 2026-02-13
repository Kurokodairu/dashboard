import { useState } from 'react'
import { Bookmark as BookmarkIcon, Plus, Trash2, ExternalLink } from 'lucide-react'
import useLocalStorage from '../hooks/useLocalStorage'
import logger from '../utils/logger'
import './BookmarksCard.css'

interface Bookmark {
  id: string
  title: string
  url: string
  folder: string
  createdAt: string
}

const BookmarksCard = () => {
  const [storedBookmarks, setBookmarks] = useLocalStorage('dashboard-bookmarks', [])
  const bookmarks: Bookmark[] = Array.isArray(storedBookmarks) ? storedBookmarks : []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    folder: 'default'
  })
  const [selectedFolder, setSelectedFolder] = useState<string>('all')

  // Get unique folders
  const folders = ['all', ...new Set(bookmarks.map(b => b.folder))]

  const filteredBookmarks = selectedFolder === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.folder === selectedFolder)

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBookmark.title || !newBookmark.url) {
      logger.warn('Bookmark title and URL are required')
      return
    }

    // Validate URL
    try {
      new URL(newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`)
    } catch {
      logger.error('Invalid URL format')
      return
    }

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
      folder: newBookmark.folder || 'default',
      createdAt: new Date().toISOString()
    }

    setBookmarks([...bookmarks, bookmark])
    setNewBookmark({ title: '', url: '', folder: 'default' })
    setShowAddForm(false)
    logger.info('Bookmark added:', bookmark.title)
  }

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id))
    logger.info('Bookmark deleted')
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  return (
    <div className="bookmarks-card glass-card">
      <div className="card-header">
        <div className="header-title">
          <BookmarkIcon size={20} />
          <h2>Bookmarks</h2>
        </div>
        <button
          className="add-button"
          onClick={() => setShowAddForm(!showAddForm)}
          title="Add bookmark"
        >
          <Plus size={18} />
        </button>
      </div>

      {showAddForm && (
        <form className="add-bookmark-form" onSubmit={handleAddBookmark}>
          <input
            type="text"
            placeholder="Title"
            value={newBookmark.title}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
            className="bookmark-input"
            autoFocus
          />
          <input
            type="text"
            placeholder="URL (e.g., github.com)"
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
            className="bookmark-input"
          />
          <input
            type="text"
            placeholder="Folder (optional)"
            value={newBookmark.folder}
            onChange={(e) => setNewBookmark({ ...newBookmark, folder: e.target.value })}
            className="bookmark-input"
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Add</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {folders.length > 1 && (
        <div className="folder-tabs">
          {folders.map(folder => (
            <button
              key={folder}
              className={`folder-tab ${selectedFolder === folder ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder)}
            >
              {folder === 'all' ? 'All' : folder}
            </button>
          ))}
        </div>
      )}

      <div className="bookmarks-list">
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <BookmarkIcon size={32} opacity={0.3} />
            <p>No bookmarks yet. Click + to add one!</p>
          </div>
        ) : (
          filteredBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bookmark-item">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bookmark-link"
              >
                {getFaviconUrl(bookmark.url) && (
                  <img
                    src={getFaviconUrl(bookmark.url)!}
                    alt=""
                    className="bookmark-favicon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="bookmark-info">
                  <span className="bookmark-title">{bookmark.title}</span>
                  <span className="bookmark-url">{new URL(bookmark.url).hostname}</span>
                </div>
                <ExternalLink size={14} className="external-icon" />
              </a>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteBookmark(bookmark.id)
                }}
                title="Delete bookmark"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {bookmarks.length > 0 && (
        <div className="bookmarks-footer">
          <span className="bookmark-count">
            {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default BookmarksCard
