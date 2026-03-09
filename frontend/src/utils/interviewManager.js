/**
 * Interview Manager - Handles AI-powered mock interview flow
 * Ported from TalentScout-Hiring-Assistant Python implementation
 */

import api from '../services/api';
import { API_BASE_URL } from '../constants';

// Conversation States
export const ConversationState = {
    GREETING: 'GREETING',
    COLLECT_NAME: 'COLLECT_NAME',
    COLLECT_EMAIL: 'COLLECT_EMAIL',
    COLLECT_PHONE: 'COLLECT_PHONE',
    COLLECT_EXPERIENCE: 'COLLECT_EXPERIENCE',
    COLLECT_POSITION: 'COLLECT_POSITION',
    COLLECT_LOCATION: 'COLLECT_LOCATION',
    COLLECT_TECH_STACK: 'COLLECT_TECH_STACK',
    TECHNICAL_QA: 'TECHNICAL_QA',
    WRAP_UP: 'WRAP_UP',
    ENDED: 'ENDED'
}

// Exit keywords
const EXIT_KEYWORDS = ['exit', 'quit', 'bye', 'goodbye', 'stop', 'end']

// Candidate Information Class
export class CandidateInfo {
    constructor() {
        this.fullName = null
        this.email = null
        this.phone = null
        this.yearsExperience = null
        this.desiredPositions = []
        this.currentLocation = null
        this.techStack = []
        this.technicalResponses = {}
    }

    // Validation methods
    validateName(name) {
        const trimmed = name.trim()
        if (!/^[a-zA-Z\s\-\.]+$/.test(trimmed)) {
            throw new Error('Name must contain only letters, spaces, hyphens, and periods')
        }
        if (trimmed.length < 2) {
            throw new Error('Name must be at least 2 characters long')
        }
        return trimmed
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format')
        }
        return email.trim()
    }

    validatePhone(phone) {
        const cleaned = phone.replace(/[^\d+]/g, '')
        if (cleaned.length < 10) {
            throw new Error('Invalid phone number')
        }
        return phone.trim()
    }

    validateExperience(years) {
        const num = parseInt(years)
        if (isNaN(num) || num < 0 || num > 50) {
            throw new Error('Years of experience must be between 0 and 50')
        }
        return num
    }

    getCompletionPercentage() {
        const fields = [
            this.fullName,
            this.email,
            this.phone,
            this.yearsExperience,
            this.desiredPositions.length > 0,
            this.currentLocation,
            this.techStack.length > 0
        ]
        const completed = fields.filter(f => f !== null && f !== false).length
        return Math.round((completed / fields.length) * 100)
    }

    isComplete() {
        return this.getCompletionPercentage() === 100
    }
}

// Interview Manager Class
export class InterviewManager {
    constructor() {
        this.apiUrl = `${API_BASE_URL}/interview/generate-content`;
        this.state = ConversationState.GREETING
        this.candidate = new CandidateInfo()
        this.conversationHistory = []
        this.currentTechIndex = 0
        this.questionsAsked = 0
        this.maxQuestionsPerTech = 3
    }

    addToHistory(role, content) {
        this.conversationHistory.push({ role, content })
        // Keep only last 20 messages for context
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20)
        }
    }

    checkExitIntent(userInput) {
        const lower = userInput.toLowerCase().trim()
        return EXIT_KEYWORDS.some(keyword => lower.includes(keyword))
    }

    async generateContent(prompt) {
        try {
            const response = await api.post(
                this.apiUrl, 
                { prompt }
            );
            return response.data.text;
        } catch (error) {
            console.error('AI Generation Error:', error);
            return "I'm having trouble connecting to the AI service. Please try again.";
        }
    }

    async processMessage(userInput) {
        const trimmed = userInput.trim()

        // Check for exit intent
        if (this.checkExitIntent(trimmed) && this.state !== ConversationState.GREETING) {
            this.state = ConversationState.ENDED
            const response = `Thank you for your time! Your interview session has been saved. Our team will review your responses and get back to you soon. Have a great day!`
            this.addToHistory('user', trimmed)
            this.addToHistory('assistant', response)
            return response
        }

        // Handle based on current state
        switch (this.state) {
            case ConversationState.GREETING:
                return await this.handleGreeting()
            case ConversationState.COLLECT_NAME:
                return await this.handleNameCollection(trimmed)
            case ConversationState.COLLECT_EMAIL:
                return await this.handleEmailCollection(trimmed)
            case ConversationState.COLLECT_PHONE:
                return await this.handlePhoneCollection(trimmed)
            case ConversationState.COLLECT_EXPERIENCE:
                return await this.handleExperienceCollection(trimmed)
            case ConversationState.COLLECT_POSITION:
                return await this.handlePositionCollection(trimmed)
            case ConversationState.COLLECT_LOCATION:
                return await this.handleLocationCollection(trimmed)
            case ConversationState.COLLECT_TECH_STACK:
                return await this.handleTechStackCollection(trimmed)
            case ConversationState.TECHNICAL_QA:
                return await this.handleTechnicalQA(trimmed)
            case ConversationState.WRAP_UP:
                return await this.handleWrapUp(trimmed)
            default:
                return "I'm not sure how to respond to that. Could you please clarify?"
        }
    }

    async handleGreeting() {
        const response = `👋 Welcome to the Mock Interview Platform!\n\nI'm your AI interviewer, and I'll be conducting a comprehensive screening interview with you today. This will help you practice for real job interviews.\n\nThe interview will cover:\n✓ Basic Information\n✓ Professional Experience\n✓ Technical Skills Assessment\n✓ Q&A Session\n\nLet's get started! What's your full name?`
        this.addToHistory('assistant', response)
        this.state = ConversationState.COLLECT_NAME
        return response
    }

    async handleNameCollection(userInput) {
        try {
            this.candidate.fullName = this.candidate.validateName(userInput)
            this.addToHistory('user', userInput)
            const response = `Nice to meet you, ${this.candidate.fullName}! 😊\n\nCould you please provide your email address?`
            this.addToHistory('assistant', response)
            this.state = ConversationState.COLLECT_EMAIL
            return response
        } catch (error) {
            this.addToHistory('user', userInput)
            const response = `I noticed an issue: ${error.message}\n\nCould you please provide your full name again?`
            this.addToHistory('assistant', response)
            return response
        }
    }

    async handleEmailCollection(userInput) {
        try {
            this.candidate.email = this.candidate.validateEmail(userInput)
            this.addToHistory('user', userInput)
            const response = `Thank you! I've noted your email as ${this.candidate.email}.\n\nWhat's your phone number?`
            this.addToHistory('assistant', response)
            this.state = ConversationState.COLLECT_PHONE
            return response
        } catch (error) {
            this.addToHistory('user', userInput)
            const response = `That doesn't appear to be a valid email address. Please provide a valid email (e.g., name@example.com).`
            this.addToHistory('assistant', response)
            return response
        }
    }

    async handlePhoneCollection(userInput) {
        try {
            this.candidate.phone = this.candidate.validatePhone(userInput)
            this.addToHistory('user', userInput)
            const response = `Perfect! I've saved your phone number.\n\nHow many years of professional experience do you have? (Please provide a number)`
            this.addToHistory('assistant', response)
            this.state = ConversationState.COLLECT_EXPERIENCE
            return response
        } catch (error) {
            this.addToHistory('user', userInput)
            const response = `Please provide a valid phone number (e.g., +1234567890 or 123-456-7890).`
            this.addToHistory('assistant', response)
            return response
        }
    }

    async handleExperienceCollection(userInput) {
        try {
            const numbers = userInput.match(/\d+/)
            if (!numbers) throw new Error('No number found')

            const years = this.candidate.validateExperience(numbers[0])
            this.candidate.yearsExperience = years
            this.addToHistory('user', userInput)

            const expLevel = years < 2 ? 'beginner' : years < 5 ? 'intermediate' : 'senior'
            const response = `Great! ${years} years of experience - that's ${expLevel} level. 💼\n\nWhat position(s) are you interested in? (You can list multiple positions separated by commas)`
            this.addToHistory('assistant', response)
            this.state = ConversationState.COLLECT_POSITION
            return response
        } catch (error) {
            this.addToHistory('user', userInput)
            const response = `Please provide your years of experience as a number (e.g., 3 or 5 years).`
            this.addToHistory('assistant', response)
            return response
        }
    }

    async handlePositionCollection(userInput) {
        const positions = userInput.split(',').map(p => p.trim()).filter(p => p)
        this.candidate.desiredPositions = positions
        this.addToHistory('user', userInput)

        const response = positions.length === 1
            ? `Excellent! You're looking for a ${positions[0]} role. 🎯\n\nWhere are you currently located?`
            : `Excellent! You're interested in: ${positions.join(', ')}. 🎯\n\nWhere are you currently located?`

        this.addToHistory('assistant', response)
        this.state = ConversationState.COLLECT_LOCATION
        return response
    }

    async handleLocationCollection(userInput) {
        this.candidate.currentLocation = userInput.trim()
        this.addToHistory('user', userInput)

        const response = `Perfect! I've noted that you're in ${this.candidate.currentLocation}. 📍\n\nNow, let's talk about your technical skills.\n\nPlease list the programming languages, frameworks, databases, and tools you're proficient in.\n(e.g., Python, React, PostgreSQL, Docker)`
        this.addToHistory('assistant', response)
        this.state = ConversationState.COLLECT_TECH_STACK
        return response
    }

    async handleTechStackCollection(userInput) {
        const techStack = userInput.split(/[,;\n]/).map(t => t.trim()).filter(t => t)
        this.candidate.techStack = techStack
        this.addToHistory('user', userInput)

        const techList = techStack.join(', ')
        let response = `Impressive tech stack! 🚀 I see you work with: ${techList}.\n\n`

        // Generate technical questions
        const prompt = `You are an experienced technical interviewer. The candidate has ${this.candidate.yearsExperience} years of experience and knows: ${techList}.

Generate ONE specific technical question about ${techStack[0]}. The question should:
- Be appropriate for their experience level
- Test practical knowledge
- Be clear and concise
- Focus on real-world scenarios

Just provide the question, nothing else.`

        try {
            const question = await this.generateContent(prompt)
            response += `Let's dive into some technical questions.\n\n${question}`
        } catch (error) {
            response += `Let's start with ${techStack[0]}. Can you tell me about a recent project where you used ${techStack[0]}? What was your role and what challenges did you face?`
        }

        this.addToHistory('assistant', response)
        this.state = ConversationState.TECHNICAL_QA
        this.currentTechIndex = 0
        this.questionsAsked = 1
        return response
    }

    async handleTechnicalQA(userInput) {
        this.addToHistory('user', userInput)

        // Store the answer
        if (this.candidate.techStack.length > 0) {
            const tech = this.candidate.techStack[Math.min(this.currentTechIndex, this.candidate.techStack.length - 1)]
            if (!this.candidate.technicalResponses[tech]) {
                this.candidate.technicalResponses[tech] = []
            }
            this.candidate.technicalResponses[tech].push(userInput)
        }

        // Check if we should continue with questions
        this.questionsAsked++
        const totalQuestionsNeeded = Math.min(this.candidate.techStack.length * this.maxQuestionsPerTech, 15)

        if (this.questionsAsked >= totalQuestionsNeeded) {
            // Move to wrap up
            this.state = ConversationState.WRAP_UP
            const response = `Thank you for your detailed answers! 🎉\n\nYou've done great in this initial screening. Our team will review your responses and get back to you within 2-3 business days.\n\nIs there anything you'd like to ask about the position or our process?`
            this.addToHistory('assistant', response)
            return response
        }

        // Generate next question
        if (this.candidate.techStack.length > 0) {
            const tech = this.candidate.techStack[this.currentTechIndex % this.candidate.techStack.length]
            const prompt = `You are an experienced technical interviewer. Based on the candidate's previous answer: "${userInput}"

Generate ONE follow-up technical question about ${tech}. The question should:
- Build on their previous answer or explore a different aspect
- Be appropriate for ${this.candidate.yearsExperience} years of experience
- Test deeper understanding
- Be clear and concise

Just provide the question, nothing else.`

            try {
                const response = await this.generateContent(prompt)
                this.currentTechIndex++
                this.addToHistory('assistant', response)
                return response
            } catch (error) {
                const response = `That's interesting! Can you elaborate more on how you approached that challenge?`
                this.addToHistory('assistant', response)
                return response
            }
        }

        return "Thank you for your answer. Let's continue."
    }

    async handleWrapUp(userInput) {
        this.addToHistory('user', userInput)

        // Check if they have a question
        const hasQuestion = userInput.includes('?') ||
            /\b(what|when|where|how|why|who|can|could|would|will)\b/i.test(userInput)

        if (hasQuestion) {
            // Generate answer to their question
            const prompt = `You are a professional HR representative. The candidate asked: "${userInput}"

Provide a brief, helpful, and encouraging answer about the hiring process, timeline, or next steps. Keep it professional and positive. Maximum 3 sentences.`

            try {
                let response = await this.generateContent(prompt)
                response += '\n\nIs there anything else you\'d like to know?'
                this.addToHistory('assistant', response)
                return response
            } catch (error) {
                const response = `That's a great question! Typically, our hiring process takes 2-3 weeks. We'll review your interview and get back to you with next steps within 2-3 business days.\n\nIs there anything else you'd like to know?`
                this.addToHistory('assistant', response)
                return response
            }
        } else {
            // Final goodbye
            const response = `Thank you so much for your time today, ${this.candidate.fullName}! 🙏\n\nWe're excited about your candidacy and will be in touch soon. Have a wonderful day!\n\nBest regards,\nMock Interview Team`
            this.state = ConversationState.ENDED
            this.addToHistory('assistant', response)
            return response
        }
    }

    getStateDescription() {
        const descriptions = {
            [ConversationState.GREETING]: 'Initial Greeting',
            [ConversationState.COLLECT_NAME]: 'Collecting Name',
            [ConversationState.COLLECT_EMAIL]: 'Collecting Email',
            [ConversationState.COLLECT_PHONE]: 'Collecting Phone',
            [ConversationState.COLLECT_EXPERIENCE]: 'Collecting Experience',
            [ConversationState.COLLECT_POSITION]: 'Collecting Position',
            [ConversationState.COLLECT_LOCATION]: 'Collecting Location',
            [ConversationState.COLLECT_TECH_STACK]: 'Collecting Tech Stack',
            [ConversationState.TECHNICAL_QA]: 'Technical Assessment',
            [ConversationState.WRAP_UP]: 'Wrapping Up',
            [ConversationState.ENDED]: 'Interview Completed'
        }
        return descriptions[this.state] || 'Unknown'
    }

    exportTranscript() {
        return {
            candidate: {
                fullName: this.candidate.fullName,
                email: this.candidate.email,
                phone: this.candidate.phone,
                yearsExperience: this.candidate.yearsExperience,
                desiredPositions: this.candidate.desiredPositions,
                currentLocation: this.candidate.currentLocation,
                techStack: this.candidate.techStack,
                technicalResponses: this.candidate.technicalResponses
            },
            conversation: this.conversationHistory,
            completionPercentage: this.candidate.getCompletionPercentage(),
            questionsAsked: this.questionsAsked,
            timestamp: new Date().toISOString()
        }
    }
}
