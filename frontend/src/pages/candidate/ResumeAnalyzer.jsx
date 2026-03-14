import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react'
import { API_BASE_URL } from '../../constants'

import Button from '../../components/Button'
import './ResumeAnalyzer.css'

function ResumeAnalyzer() {
    const [file, setFile] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
            setFile(selectedFile)
            setAnalysis(null)
        } else {
            alert('Please upload a PDF or TXT file')
        }
    }

    const analyzeResume = async () => {
        if (!file) {
            alert('Please select a file first.')
            return
        }

        setAnalyzing(true)

        try {
            const formData = new FormData()
            formData.append("resume", file)

            const token = localStorage.getItem("token") || ""

            const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
                method: "POST",
                headers: {
                    // Multipart form data doesn't require Content-Type header manually, fetch does it
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Analysis failed from backend')
            }

            setAnalysis(data.analysis)
        } catch (error) {
            console.error('Analysis error:', error)
            alert('Error analyzing resume. Please ensure you are logged in and the backend is running.')
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />
            
            <div className="max-w-[800px] mx-auto relative z-10 w-full">


            {/* API Settings Modal Removed - Managed by Backend Now */}

            <div className="resume-analyzer-container w-full">
                {/* Upload Section */}
                <div className="upload-section">
                    <div className="upload-card">
                        <div className="upload-icon">
                            <FileText size={48} />
                        </div>
                        <h3>Upload Your Resume</h3>
                        <p>Upload your resume in PDF or TXT format for AI-powered analysis</p>

                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.txt"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="resume-upload" className="upload-btn">
                            <Upload size={20} />
                            Choose File
                        </label>

                        {file && (
                            <div className="file-info">
                                <CheckCircle2 size={20} color="#10b981" />
                                <span>{file.name}</span>
                            </div>
                        )}

                        {file && (
                            <Button
                                variant="primary"
                                onClick={analyzeResume}
                                disabled={analyzing}
                                style={{ marginTop: 16 }}
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze Resume'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div className="analysis-section">
                        <div className="analysis-card">
                            <div className="analysis-header">
                                <h3>Analysis Results</h3>
                                <Button variant="outline" size="small">
                                    <Download size={16} />
                                    Export
                                </Button>
                            </div>
                            <div className="analysis-content">
                                <div dangerouslySetInnerHTML={{
                                    __html: analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                {!analysis && (
                    <div className="tips-section">
                        <h3>Resume Tips</h3>
                        <div className="tips-grid">
                            <div className="tip-card">
                                <CheckCircle2 size={24} color="#10b981" />
                                <h4>Clear Formatting</h4>
                                <p>Use consistent fonts, spacing, and bullet points</p>
                            </div>
                            <div className="tip-card">
                                <CheckCircle2 size={24} color="#10b981" />
                                <h4>Quantify Achievements</h4>
                                <p>Use numbers and metrics to show impact</p>
                            </div>
                            <div className="tip-card">
                                <CheckCircle2 size={24} color="#10b981" />
                                <h4>Relevant Keywords</h4>
                                <p>Include industry-specific terms for ATS</p>
                            </div>
                            <div className="tip-card">
                                <CheckCircle2 size={24} color="#10b981" />
                                <h4>Concise Content</h4>
                                <p>Keep it to 1-2 pages maximum</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    )
}

export default ResumeAnalyzer
