import { useState, useEffect, useRef } from 'react'
import { Plus, MoreHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BookmarkBar = ({ bookmarks, onAddBookmark, onRemoveBookmark }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const dropdownRef = useRef(null)

  const MAX_VISIBLE = 7

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const visibleBookmarks = bookmarks.slice(0, MAX_VISIBLE)
  const hiddenBookmarks = bookmarks.slice(MAX_VISIBLE)

  const handleBookmarkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const BookmarkIcon = ({ bookmark, onRemove, showDelete }) => {
    const [isHovering, setIsHovering] = useState(false)
    
    // Generate a favicon URL from the bookmark URL
    const getFaviconUrl = (url) => {
      try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {
        return null
      }
    }

    return (
      <div
        className="bookmark-icon-wrapper"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className="bookmark-icon"
          onClick={() => handleBookmarkClick(bookmark.url)}
          title={bookmark.name}
        >
          {bookmark.icon ? (
            <span className="bookmark-emoji">{bookmark.icon}</span>
          ) : (
            <img
              src={getFaviconUrl(bookmark.url)}
              alt={bookmark.name}
              className="bookmark-favicon"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          )}
          <div className="bookmark-letter" style={{ display: bookmark.icon ? 'none' : 'flex' }}>
            {bookmark.name.charAt(0).toUpperCase()}
          </div>
        </div>
        {showDelete && isHovering && (
          <button
            className="bookmark-delete"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(bookmark.id)
            }}
          >
            <X size={12} />
          </button>
        )}
        <div className="bookmark-tooltip">{bookmark.name}</div>
      </div>
    )
  }

  const AddBookmarkDialog = ({ onClose, onAdd }) => {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      if (name.trim() && url.trim()) {
        onAdd({
          id: Date.now().toString(),
          name: name.trim(),
          url: url.trim(),
          icon: icon.trim()
        })
        onClose()
      }
    }

    return (
      <div className="bookmark-dialog-backdrop" onClick={onClose}>
        <motion.div
          className="bookmark-dialog"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="bookmark-dialog-header">
            <h3>Add Bookmark</h3>
            <button className="bookmark-dialog-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="bookmark-dialog-field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="GitHub"
                autoFocus
                required
              />
            </div>
            <div className="bookmark-dialog-field">
              <label>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com"
                required
              />
            </div>
            <div className="bookmark-dialog-field">
              <label>Icon (emoji, optional)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🔖"
                maxLength="2"
              />
            </div>
            <div className="bookmark-dialog-actions">
              <button type="button" onClick={onClose} className="bookmark-dialog-cancel">
                Cancel
              </button>
              <button type="submit" className="bookmark-dialog-submit">
                Add
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="bookmark-bar">
        {visibleBookmarks.map(bookmark => (
          <BookmarkIcon
            key={bookmark.id}
            bookmark={bookmark}
            onRemove={onRemoveBookmark}
            showDelete={false}
          />
        ))}

        {hiddenBookmarks.length > 0 && (
          <div className="bookmark-dropdown-wrapper" ref={dropdownRef}>
            <div
              className="bookmark-icon bookmark-more"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More bookmarks"
            >
              <MoreHorizontal size={20} />
            </div>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  className="bookmark-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {hiddenBookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="bookmark-dropdown-item"
                      onClick={() => handleBookmarkClick(bookmark.url)}
                    >
                      {bookmark.icon ? (
                        <span className="bookmark-emoji">{bookmark.icon}</span>
                      ) : (
                        <div className="bookmark-letter">
                          {bookmark.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{bookmark.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div
          className="bookmark-icon bookmark-add"
          onClick={() => setShowAddDialog(true)}
          title="Add bookmark"
        >
          <Plus size={20} />
        </div>
      </div>

      <AnimatePresence>
        {showAddDialog && (
          <AddBookmarkDialog
            onClose={() => setShowAddDialog(false)}
            onAdd={onAddBookmark}
          />
        )}
      </AnimatePresence>

      <style>{`
        .bookmark-bar {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .bookmark-icon-wrapper {
          position: relative;
        }

        .bookmark-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .bookmark-icon:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .bookmark-emoji {
          font-size: 20px;
        }

        .bookmark-favicon {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .bookmark-letter {
          font-size: 18px;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bookmark-add {
          background: rgba(255, 255, 255, 0.15);
        }

        .bookmark-add:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .bookmark-more {
          background: rgba(255, 255, 255, 0.15);
        }

        .bookmark-delete {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 107, 107, 0.9);
          border: 2px solid white;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .bookmark-delete:hover {
          background: rgba(255, 80, 80, 1);
          transform: scale(1.1);
        }

        .bookmark-tooltip {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 10;
        }

        .bookmark-icon-wrapper:hover .bookmark-tooltip {
          opacity: 1;
        }

        .bookmark-dropdown-wrapper {
          position: relative;
        }

        .bookmark-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.5rem;
          min-width: 200px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .bookmark-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
          color: white;
        }

        .bookmark-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .bookmark-dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .bookmark-dialog {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          color: white;
        }

        .bookmark-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .bookmark-dialog-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .bookmark-dialog-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bookmark-dialog-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .bookmark-dialog-field {
          margin-bottom: 1.25rem;
        }

        .bookmark-dialog-field label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .bookmark-dialog-field input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .bookmark-dialog-field input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .bookmark-dialog-field input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .bookmark-dialog-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .bookmark-dialog-cancel,
        .bookmark-dialog-submit {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .bookmark-dialog-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .bookmark-dialog-cancel:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .bookmark-dialog-submit {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .bookmark-dialog-submit:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        @media (max-width: 480px) {
          .bookmark-bar {
            gap: 0.5rem;
          }

          .bookmark-icon {
            width: 36px;
            height: 36px;
          }

          .bookmark-dialog {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}

export default BookmarkBar
