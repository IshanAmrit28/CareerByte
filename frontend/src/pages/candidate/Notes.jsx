import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, FileText, Download, ExternalLink } from 'lucide-react'
import { pdfNotes, searchNotes } from '../../data/notesData'
import DocumentViewer from '../../components/shared/DocumentViewer'

import './Notes.css'

function Notes() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const openNote = (note) => {
        setSelectedNote(note);
        setViewerOpen(true);
    };

    const displayedNotes = searchQuery
        ? searchNotes(searchQuery)
        : pdfNotes

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto relative z-10 w-full">
                <div className="notes-layout">

                {/* Main Content */}
                <div className="notes-content">

                    {/* Search Bar */}
                    <div className="dense-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search by title or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14, outline: 'none', color: 'var(--text-main)' }}
                        />
                    </div>

                    {/* Stats */}
                    <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        Showing <strong>{displayedNotes.length}</strong> {displayedNotes.length === 1 ? 'resource' : 'resources'}
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
                                    <button
                                        onClick={() => openNote(note)}
                                        className="pdf-action-btn"
                                        style={{ flexGrow: 1, border: 'none', cursor: 'pointer' }}
                                    >
                                        <ExternalLink size={14} /> Open Preview
                                    </button>
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

            <DocumentViewer 
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                fileUrl={selectedNote ? encodeURI(`/PLACEMENT NOTES/${selectedNote.fileName}`) : ''}
                fileName={selectedNote?.title}
            />
        </div>
        </div>
    )
}

export default Notes
