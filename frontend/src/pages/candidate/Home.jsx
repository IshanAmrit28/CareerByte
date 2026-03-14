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
      <div className="dashboard-header rounded-3xl p-6 sm:p-10 mb-8 border border-gray-800 bg-[#111b27]/60 shadow-xl relative overflow-hidden text-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="greeting-section flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">{greeting}! 👋</h1>
            <p className="text-base md:text-lg text-gray-300">Ready to level up your skills today?</p>
          </div>
          <div className="time-display flex-shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-right w-full md:w-auto">
            <div className="text-2xl md:text-3xl font-bold text-white tabular-nums tracking-tight">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm font-semibold text-gray-300 uppercase tracking-widest mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="section-header mt-12 mb-6">
        <h2 className="text-xl md:text-2xl font-bold m-0 text-white tracking-tight">Quick Actions</h2>
        <p className="text-sm md:text-base text-gray-400 mt-1 mb-0">Jump right into learning</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {quickActions.map((action, idx) => (
          <Link
            key={idx}
            to={action.link}
            className="action-card-new h-full min-h-[160px] md:min-h-[200px]"
          >
            <div className="action-gradient" style={{ background: action.gradient }}></div>
            <div className="action-content p-6 sm:p-8">
              <div className="action-icon-new w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6">{action.icon}</div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.desc}</p>
              <div className="action-arrow hidden sm:flex"><ArrowRight size={18} /></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recommended Topics - Full Width */}
      <div className="mb-12">
        <div className="section-header mb-6">
          <h2 className="text-xl md:text-2xl font-bold m-0 text-white tracking-tight">Recommended Topics</h2>
          <p className="text-sm md:text-base text-gray-400 mt-1 mb-0">Start learning these high-priority topics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {upcomingTopics.map((topic, idx) => {
            const gradient = topic.difficulty === 'Hard' 
              ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            
            return (
              <Link
                key={idx}
                to={`/candidate/topic/${topic.id}`}
                className="topic-card flex flex-col p-5 md:p-6"
                style={{ textDecoration: 'none' }}
              >
                <div className="action-gradient" style={{ background: gradient }}></div>
                <div className="flex justify-between items-start gap-3 md:gap-4 mb-3 md:mb-4">
                  <h4 className="text-base md:text-lg font-bold text-white flex-1 leading-snug m-0">{topic.title}</h4>
                  <span className={`badge shrink-0 badge-${topic.difficulty === 'Hard' ? 'orange' : 'blue'}`}>
                    {topic.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-white/5 mt-auto">
                  <span className="badge badge-purple">{topic.category}</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Clock size={12} /> {topic.time}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Motivational Quote */}
        <div className="quote-card mt-8 p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0 mt-1">
            💡 Daily Motivation
          </div>
          <p className="m-0 text-sm md:text-base italic text-gray-300 leading-relaxed md:leading-relaxed">
            "The expert in anything was once a beginner. Keep pushing forward!"
          </p>
        </div>
      </div>

    </div>
  )
}

export default Home
