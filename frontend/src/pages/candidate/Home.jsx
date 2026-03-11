import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, PenTool, Calendar, Bot,
  Target, Zap,
  Clock, ArrowRight
} from 'lucide-react'

import './Home.css'

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [currentTime])

  const quickActions = [
    {
      title: 'Take Quiz',
      desc: 'Test your core concepts with timed assessments',
      icon: <PenTool size={28} />,
      link: '/candidate/quiz',
      color: 'green',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    },
    {
      title: 'AI Assistant',
      desc: 'Get instant answers and guidance from our AI',
      icon: <Bot size={28} />,
      link: '/candidate/chat',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      title: 'Mock Interview',
      desc: 'Practice real-world scenarios with AI feedback',
      icon: <Bot size={28} />,
      link: '/candidate/practice',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      title: 'Coding Challenges',
      desc: 'Solve high-impact DSA problems in our browser editor',
      icon: <Target size={28} />,
      link: '/candidate/coding-problems',
      color: 'orange',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    }
  ]

  const upcomingTopics = [
    { id: 'cloud', title: 'Cloud Architecture & Scaling', difficulty: 'Medium', time: '30 min', category: 'Cloud' },
    { id: 'ml', title: 'Machine Learning Fundamentals', difficulty: 'Hard', time: '45 min', category: 'ML' },
    { id: 'devops', title: 'CI/CD Pipeline Mastery', difficulty: 'Hard', time: '40 min', category: 'DevOps' },
    { id: 'system-design-caching', title: 'System Design: Caching', difficulty: 'Medium', time: '30 min', category: 'System Design' }
  ]

  return (
    <div className="app-container">
      {/* Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1 className="greeting-title">{greeting}! 👋</h1>
            <p className="greeting-subtitle">Ready to level up your skills today?</p>
          </div>
          <div className="time-display">
            <div className="current-time">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="current-date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="section-header" style={{ marginTop: 48, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Quick Actions</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Jump right into learning</p>
      </div>

      <div className="quick-actions-grid">
        {quickActions.map((action, idx) => (
          <Link
            key={idx}
            to={action.link}
            className="action-card-new"
          >
            <div className="action-gradient" style={{ background: action.gradient }}></div>
            <div className="action-content">
              <div className="action-icon-new">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
              <div className="action-arrow"><ArrowRight size={18} /></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recommended Topics - Full Width */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Recommended Topics</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Start learning these high-priority topics</p>
        </div>

        <div className="topics-list">
          {upcomingTopics.map((topic, idx) => {
            const gradient = topic.difficulty === 'Hard' 
              ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            
            return (
              <Link
                key={idx}
                to={`/candidate/topic/${topic.id}`}
                className="topic-card"
                style={{ textDecoration: 'none' }}
              >
                <div className="action-gradient" style={{ background: gradient }}></div>
                <div className="topic-header">
                  <h4>{topic.title}</h4>
                  <span className={`badge badge-${topic.difficulty === 'Hard' ? 'orange' : 'blue'}`}>
                    {topic.difficulty}
                  </span>
                </div>
                <div className="topic-meta">
                  <span className="badge badge-purple">{topic.category}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {topic.time}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Motivational Quote */}
        <div className="quote-card" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            💡 Daily Motivation
          </div>
          <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic', lineHeight: 1.6 }}>
            "The expert in anything was once a beginner. Keep pushing forward!"
          </p>
        </div>
      </div>

    </div>
  )
}

export default Home
