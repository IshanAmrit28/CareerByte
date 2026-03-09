import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Folder, Search, FileText, Download, ExternalLink } from 'lucide-react'
import { pdfNotes, categories, searchNotes, getNotesByCategory } from '../../data/notesData'

import './Notes.css'

function Notes() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const displayedNotes = searchQuery
        ? searchNotes(searchQuery)
        : getNotesByCategory(activeCategory)

    return (
        <div className="app-container">

            <div className="notes-layout">

                {/* Sidebar */}
                <div className="notes-sidebar">
                    <div style={{ marginBottom: 16, padding: '0 8px', fontWeight: 600, fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
                        CATEGORIES
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => { setActiveCategory(cat); setSearchQuery('') }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Folder size={14} /> {cat}
                            </div>
                            <span className="count-badge">
                                {cat === 'All' ? pdfNotes.length : pdfNotes.filter(n => n.category === cat).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="notes-content">

                    {/* Search Bar */}
                    <div className="dense-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search by title, category, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14, outline: 'none', color: 'var(--text-main)' }}
                        />
                    </div>

                    {/* Stats */}
                    <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        Showing <strong>{displayedNotes.length}</strong> {displayedNotes.length === 1 ? 'resource' : 'resources'}
                        {activeCategory !== 'All' && ` in ${activeCategory}`}
                    </div>

                    {/* Grid */}
                    <div className="notes-grid">
                        {displayedNotes.map(note => (
                            <div key={note.id} className="note-card pdf-card">
                                <div className="note-header">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            background: 'var(--primary-light)',
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)',
                                            flexShrink: 0
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: 15, lineHeight: 1.3 }}>{note.title}</h3>
                                            <div className="note-meta">
                                                <span className="badge badge-blue">{note.category}</span>
                                                <span className={`badge badge-${note.difficulty === 'Hard' ? 'orange' : note.difficulty === 'Medium' ? 'purple' : 'green'}`}>
                                                    {note.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="note-footer" style={{ marginTop: 12 }}>
                                    {note.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag-pill">#{tag}</span>
                                    ))}
                                </div>

                                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                    <a
                                        href={`/PLACEMENT NOTES/${note.fileName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pdf-action-btn"
                                        style={{ flexGrow: 1 }}
                                    >
                                        <ExternalLink size={14} /> Open PDF
                                    </a>
                                    <a
                                        href={`/PLACEMENT NOTES/${note.fileName}`}
                                        download
                                        className="pdf-action-btn secondary"
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            </div>
                        ))}
                        {displayedNotes.length === 0 && (
                            <div className="dense-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                No resources found matching your search.
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    )
}

export default Notes
