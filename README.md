# CareerByte

![CareerByte Landing](images/Screenshot%202026-03-24%20162559.png)

CareerByte is a comprehensive developer preparation platform designed to bridge the gap between learning and employment. It provides a multi-interface experience tailored for **Candidates**, **Recruiters**, and **Super Admins**.

---

## 🚀 Feature Showcase

### 👤 For Candidates
Empowering developers with tools to learn, practice, and land their dream jobs.

*   **Personalized Dashboard & Performance Tracking**
    Visualize your progress, interview scores, and skill distribution to identify areas for improvement.
    ![Candidate Profile](images/Screenshot%202026-03-24%20162523.png)
    ![Performance History](images/Screenshot%202026-03-24%20162531.png)

*   **Interactive Coding Playground**
    Solve high-impact DSA problems in a secure, real-time development environment.
    ![Problem List](images/Screenshot%202026-03-24%20162440.png)
    ![Coding Playground](images/Screenshot%202026-03-24%20162449.png)

*   **AI-Powered Interview Simulation**
    Practice with an AI interviewer that provides real-time feedback and technical assessments.
    ![Interview Dashboard](images/Screenshot%202026-03-24%20165215.png)
    ![Interview Simulation](images/Screenshot%202026-03-24%20163741.png)

*   **Competitive Programming & Leaderboards**
    Compete in weekly contests and benchmark your skills against a global community.
    ![Contests](images/Screenshot%202026-03-24%20162503.png)
    ![Global Leaderboard](images/Screenshot%202026-03-24%20162542.png)
    ![Detailed Leaderboard](images/Screenshot%202026-03-24%20162633.png)

*   **Job Discovery & Tracking**
    Discover external job opportunities and manage your application pipeline in one place.
    ![External Jobs](images/Screenshot%202026-03-24%20162424.png)

---

### 💼 For Recruiters
Streamlining the hiring process with data-driven insights and automated assessments.

*   **Recruitment Analytics Dashboard**
    Get a high-level view of your hiring funnel, success rates, and active job posts.
    ![Recruiter Dashboard](images/Screenshot%202026-03-24%20162314.png)

*   **Assessment & Question Management**
    Build custom technical assessments using a library of public and private coding problems.
    ![Assessment Management](images/Screenshot%202026-03-24%20162324.png)
    ![Private Question Management](images/Screenshot%202026-03-24%20162103.png)

*   **Detailed Candidate Reports**
    Evaluate candidate performance with granular reports on coding efficiency and interview responses.
    ![Candidate Reports](images/Screenshot%202026-03-24%20162351.png)

---

### 🛡️ For Super Admins
Maintaining platform integrity and managing the global ecosystem.

*   **User & Company Governance**
    Oversee the entire community and verify company registrations to ensure a professional environment.
    ![User Overview](images/Screenshot%202026-03-24%20161448.png)
    ![Company Management](images/Screenshot%202026-03-24%20161928.png)

*   **Global Problem Database**
    Curate and manage the central repository of coding problems available platform-wide.
    ![Question Database](images/Screenshot%202026-03-24%20161513.png)
    ![Add Problem](images/Screenshot%202026-03-24%20161531.png)

*   **Contest Orchestration**
    Schedule and manage global contests to engage the developer community.
    ![Admin Contests](images/Screenshot%202026-03-24%20161741.png)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit & Redux Persist
- **Styling**: Tailwind CSS & Framer Motion (Animations)
- **UI Components**: Radix UI & Headless UI
- **Visualization**: Recharts & React Flow

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis (Upstash)
- **AI Integration**: Google Generative AI (Gemini)
- **Code Execution**: Judge0 (Dockerized)
- **Authentication**: Passport.js & JWT
- **Storage**: AWS S3
- **Automation**: Cron-based External Job Scraper

---

## 📂 Project Structure

```text
InterView/
├── backend/            # Express server
│   ├── controllers/    # API request handlers
│   ├── middleware/     # Auth (JWT) & Protection layers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Endpoint definitions
│   └── utils/          # Cron jobs, cleanups & helpers
├── frontend/           # React application
│   ├── src/pages/      # Candidate, Recruiter & Admin interfaces
│   ├── src/redux/      # State management (Toolkit)
│   └── src/components/ # Reusable UI components
├── judge0_setup.md     # Code execution setup guide
└── README.md           # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running instance (Local or Atlas)
- **Redis**: Upstash or local instance for caching
- **Docker**: Required for running Judge0 (code execution)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd InterView
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example and fill in your credentials
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and set VITE_API_URL
   npm run dev
   ```

4. **Setup Code Execution (Judge0)**:
   Follow the instructions in [judge0_setup.md](file:///c:/Users/HP/Desktop/InterView/judge0_setup.md) to get the coding interface working.

---

## 📝 Configuration

Ensure your `backend/.env` includes the following:
- `MONGO_URL`: Your MongoDB connection string.
- `JWT_SECRET`: Secret key for authentication.
- `GEMINI_API_KEY`: API key for Google Generative AI.
- `JUDGE0_URL`: URL for your Judge0 instance (default: `http://localhost:2358`).
- `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: For file uploads.

---

## 📄 License
This project is licensed under the ISC License.
