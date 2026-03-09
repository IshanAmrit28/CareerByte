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
      title: 'Browse Notes',
      desc: '17 Topics Available',
      icon: <BookOpen size={24} />,
      link: '/notes',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Take Quiz',
      desc: 'Test Your Knowledge',
      icon: <PenTool size={24} />,
      link: '/quiz',
      color: 'green',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'AI Assistant',
      desc: 'Ask Anything',
      icon: <Bot size={24} />,
      link: '/chat',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Study Plan',
      desc: 'Create Roadmap',
      icon: <Calendar size={24} />,
      link: '/study-plan',
      color: 'orange',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      title: 'Mock Interview',
      desc: 'AI Practice Sessions',
      icon: <Bot size={24} />,
      link: '/interview',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Learning Roadmap',
      desc: 'Structured Paths',
      icon: <Target size={24} />,
      link: '/roadmap',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Interview Questions',
      desc: 'Role-Based Prep',
      icon: <Zap size={24} />,
      link: '/coding-practice',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ]

  const upcomingTopics = [
    { id: 'dynamic-programming', title: 'Dynamic Programming Patterns', difficulty: 'Hard', time: '45 min', category: 'DSA' },
    { id: 'system-design-caching', title: 'System Design: Caching', difficulty: 'Medium', time: '30 min', category: 'System Design' },
    { id: 'react-performance', title: 'React Performance Optimization', difficulty: 'Medium', time: '25 min', category: 'Web Dev' },
    { id: 'database-indexing', title: 'Database Indexing Strategies', difficulty: 'Hard', time: '40 min', category: 'DBMS' }
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
          {upcomingTopics.map((topic, idx) => (
            <Link
              key={idx}
              to={`/topic/${topic.id}`}
              className="topic-card"
              style={{ textDecoration: 'none' }}
            >
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
          ))}
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
