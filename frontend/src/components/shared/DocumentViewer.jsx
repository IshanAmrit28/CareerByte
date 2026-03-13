import React, { useState, useEffect, useMemo } from 'react'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, FileText } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'
import mammoth from 'mammoth'
import { cn } from "../../lib/utils"

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './DocumentViewer.css'

// Set worker source for pdf.js using a reliable CDN (matching the installed version)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const DocumentViewer = ({ isOpen, onClose, fileUrl, fileName, fileType }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [docxContent, setDocxContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isPdf = fileType === 'pdf' || (fileUrl && fileUrl.toLowerCase().endsWith('.pdf'));
    const isDocx = fileType === 'docx' || (fileUrl && fileUrl.toLowerCase().endsWith('.docx'));

    useEffect(() => {
        if (!isOpen) return;
        
        setLoading(true);
        setError(null);
        setDocxContent('');
        setPageNumber(1);
        setScale(1.0);

        if (isDocx) {
            handleDocxLoad();
        }
    }, [isOpen, fileUrl]);

    const pdfOptions = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
    }), []);

    const handleDocxLoad = async () => {
        try {
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setDocxContent(result.value);
            setLoading(false);
        } catch (err) {
            console.error('Word Doc Load Error:', err);
            setError('Failed to load Word document. Please try downloading instead.');
            setLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = (err) => {
        console.error('PDF Load Error Details:', err);
        setError('Failed to load PDF document. Please try downloading instead.');
        setLoading(false);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed inset-0 z-[101] flex flex-col w-full h-full bg-transparent overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#111] border-b border-white/10 z-[102] shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <FileText className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <DialogPrimitive.Title className="text-white font-bold text-sm truncate max-w-[200px] md:max-w-md">
                                    {fileName || 'Document Viewer'}
                                </DialogPrimitive.Title>
                                <DialogPrimitive.Description className="sr-only">
                                    Viewing {fileName || 'document'} online.
                                </DialogPrimitive.Description>
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                    {isPdf ? 'PDF Document' : isDocx ? 'Word Document' : 'File Preview'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-6">
                            {isPdf && !loading && !error && (
                                <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 gap-4">
                                    <button 
                                        onClick={() => changePage(-1)} 
                                        disabled={pageNumber <= 1}
                                        className="p-1 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="text-white text-xs font-medium tabular-nums">
                                        Page {pageNumber} of {numPages}
                                    </span>
                                    <button 
                                        onClick={() => changePage(1)} 
                                        disabled={pageNumber >= numPages}
                                        className="p-1 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}

                            {isPdf && !loading && !error && (
                                <div className="hidden md:flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/10">
                                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center text-[10px] font-bold text-gray-400">{(scale * 100).toFixed(0)}%</span>
                                    <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <a 
                                    href={fileUrl} 
                                    download 
                                    className="p-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 text-xs md:text-sm font-semibold transition shadow-lg"
                                    title="Download File"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden md:inline">Download</span>
                                </a>
                                <DialogPrimitive.Close className="p-2 md:p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition border border-white/10">
                                    <X className="w-5 h-5" />
                                </DialogPrimitive.Close>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto p-4 md:p-12 flex justify-center custom-scrollbar bg-[#0a0a0a]">
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 absolute inset-0 z-10 bg-[#0a0a0a]">
                                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                                <p className="text-sm font-medium tracking-widest uppercase font-bold">Loading Document...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-md mx-auto z-20">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                    <X className="w-10 h-10 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-white text-lg font-bold mb-2">Something went wrong</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
                                </div>
                                <a 
                                    href={fileUrl} 
                                    download 
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 flex items-center gap-3 transition font-semibold"
                                >
                                    <Download className="w-5 h-5" />
                                    Download to View
                                </a>
                            </div>
                        )}

                        {!error && isPdf && (
                            <div className={cn("pdf-document-wrapper shadow-2xl overflow-visible", loading ? "opacity-0" : "opacity-100")}>
                                <Document
                                    file={{ url: fileUrl }}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    onLoadError={onDocumentLoadError}
                                    loading={null}
                                    options={pdfOptions}
                                >
                                    <Page 
                                        pageNumber={pageNumber} 
                                        scale={scale} 
                                        renderAnnotationLayer={true}
                                        renderTextLayer={true}
                                        className="pdf-page"
                                    />
                                </Document>
                            </div>
                        )}

                        {!loading && !error && isDocx && (
                            <div className="docx-view mx-auto max-w-4xl w-full bg-white text-black p-8 md:p-16 rounded-sm shadow-2xl min-h-screen">
                                <div 
                                    className="docx-content prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: docxContent }} 
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination Floating Bar - Visible on all screens for convenience */}
                    {isPdf && !loading && !error && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-[110] transition-all hover:bg-black/90 hover:border-white/20">
                            <button 
                                onClick={() => changePage(-1)} 
                                disabled={pageNumber <= 1} 
                                className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 text-white transition-colors cursor-pointer"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-white text-xs font-bold tabular-nums min-w-[60px] text-center tracking-widest">
                                {pageNumber} <span className="text-gray-500 mx-1">/</span> {numPages}
                            </span>
                            <button 
                                onClick={() => changePage(1)} 
                                disabled={pageNumber >= numPages} 
                                className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 text-white transition-colors cursor-pointer"
                                title="Next Page"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

export default DocumentViewer
