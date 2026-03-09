import { useState } from 'react'
import { BrainCircuit, CheckCircle, AlertCircle, ArrowRight, RotateCw, BookOpen, Server, Globe, Network, Calculator } from 'lucide-react'
import Button from '../../components/Button'

import { quizTopics, getQuizByTopic } from '../../data/quizData'
import './Home.css' // Reusing grid styles

function Quiz() {
    const [activeTopic, setActiveTopic] = useState(null)
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [quizFinished, setQuizFinished] = useState(false)

    // Icons map
    const ICONS = {
        dsa: <BrainCircuit size={32} />,
        os: <Server size={32} />,
        dbms: <BookOpen size={32} />,
        web: <Globe size={32} />,
        cn: <Network size={32} />,
        aptitude: <Calculator size={32} />
    }

    const handleStartQuiz = (topicId) => {
        setActiveTopic(topicId)
        setCurrentQuestionIdx(0)
        setScore(0)
        setQuizFinished(false)
        setShowResult(false)
        setSelectedOption(null)
    }

    const handleOptionSelect = (index) => {
        if (showResult) return
        setSelectedOption(index)
    }

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return

        const questions = getQuizByTopic(activeTopic)
        const currentQ = questions[currentQuestionIdx]

        if (currentQ.answer === selectedOption) {
            setScore(s => s + 1)
        }
        setShowResult(true)
    }

    const handleNextQuestion = () => {
        const questions = getQuizByTopic(activeTopic)
        if (currentQuestionIdx + 1 < questions.length) {
            setCurrentQuestionIdx(p => p + 1)
            setSelectedOption(null)
            setShowResult(false)
        } else {
            setQuizFinished(true)
        }
    }

    const questions = activeTopic ? getQuizByTopic(activeTopic) : []
    const currentQ = questions[currentQuestionIdx]

    return (
        <div className="app-container">


            {/* Topic Selection */}
            {!activeTopic && (
                <div className="grid-3">
                    {quizTopics.map(topic => (
                        <div key={topic.id} className="dense-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleStartQuiz(topic.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: 12, borderRadius: 8 }}>
                                    {ICONS[topic.id] || <BrainCircuit />}
                                </div>
                                <span className={`badge ${topic.difficulty === 'High' ? 'badge-orange' : 'badge-green'}`}>
                                    {topic.difficulty}
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: 'var(--text-main)' }}>{topic.name}</h3>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{topic.count} questions available</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Quiz Interface */}
            {activeTopic && !quizFinished && currentQ && (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Button variant="ghost" size="small" onClick={() => setActiveTopic(null)}>Exit</Button>
                        <div style={{ flexGrow: 1, height: 4, background: 'var(--border-main)', borderRadius: 2 }}>
                            <div style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {currentQuestionIdx + 1} / {questions.length}
                        </span>
                    </div>

                    <div className="dense-card" style={{ padding: 40 }}>
                        <span className="badge badge-blue" style={{ marginBottom: 16 }}>{quizTopics.find(t => t.id === activeTopic)?.name}</span>
                        <h2 style={{ fontSize: 20, lineHeight: 1.5, marginBottom: 32, marginTop: 12 }}>{currentQ.question}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {currentQ.options.map((opt, idx) => {
                                let borderColor = 'var(--border-main)';
                                let bgColor = 'var(--bg-surface)';

                                if (showResult) {
                                    if (idx === currentQ.answer) {
                                        borderColor = '#10b981';
                                        bgColor = 'rgba(16, 185, 129, 0.05)';
                                    } else if (idx === selectedOption) {
                                        borderColor = '#ef4444';
                                        bgColor = 'rgba(239, 68, 68, 0.05)';
                                    }
                                } else if (selectedOption === idx) {
                                    borderColor = 'var(--primary)';
                                    bgColor = 'var(--bg-subtle)';
                                }

                                return (
                                    <div
                                        key={opt}
                                        onClick={() => handleOptionSelect(idx)}
                                        style={{
                                            padding: 16,
                                            border: `1px solid ${borderColor}`,
                                            background: bgColor,
                                            borderRadius: 6,
                                            cursor: showResult ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            fontSize: 14,
                                            transition: 'all 0.2s',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            border: `1px solid ${selectedOption === idx || (showResult && idx === currentQ.answer) ? borderColor : 'var(--text-faint)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {(showResult && idx === currentQ.answer) && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>}
                                            {(!showResult && selectedOption === idx) && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }}></div>}
                                        </div>
                                        {opt}
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {showResult && (
                                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                                    <span style={{ fontWeight: 600 }}>Explanation:</span> {currentQ.explanation}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
                                {!showResult ? (
                                    <Button variant="primary" onClick={handleSubmitAnswer} disabled={selectedOption === null}>Check Answer</Button>
                                ) : (
                                    <Button variant="primary" onClick={handleNextQuestion}>
                                        {currentQuestionIdx + 1 === questions.length ? 'Finish Quiz' : 'Next'} <ArrowRight size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {quizFinished && (
                <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
                    <div className="dense-card" style={{ padding: 40 }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ marginBottom: 8 }}>Quiz Complete</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
                            You scored <strong>{score}</strong> out of {questions.length}
                        </p>
                        <Button variant="primary" onClick={() => setActiveTopic(null)}>Back to Topics</Button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Quiz
