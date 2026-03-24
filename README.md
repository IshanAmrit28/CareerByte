@@ -0,0 +1,103 @@
# CareerByte

![CareerByte Landing](images/Screenshot%202026-03-24%20162559.png)

CareerByte is a comprehensive developer preparation platform designed to bridge the gap between learning and employment. It provides a dual-interface experience for both candidates looking to sharpen their skills and recruiters seeking to streamline their hiring process.

## 🚀 Key Features

### For Candidates
- **Interactive Dashboard**: Visualize your learning progress, contest performance, and application status.
  <br>![Candidate Dashboard](images/Screenshot%202026-03-24%20165215.png)
- **Coding Playground**: Solve complex coding problems with a real-time execution environment.
  <br>![Coding Playground](images/Screenshot%202026-03-24%20162449.png)
- **Interview Simulation**: Practice with mock interview questions and platform-specific assessments.
  <br>![Interview Simulation](images/Screenshot%202026-03-24%20163741.png)
- **Leaderboard & Contests**: Compete with other developers in timed coding contests and climb the ranks.
  <br>![Leaderboard](images/Screenshot%202026-03-24%20162633.png)
- **Job Tracker**: Manage your applications and track your progress in the hiring pipeline.

### For Recruiters
- **Candidate Analytics**: View detailed reports and performance metrics for applicants.
  <br>![Recruiter Dashboard](images/Screenshot%202026-03-24%20162314.png)
- **Job Management**: Create, update, and manage job postings with ease.
- **Assessment Builder**: Design custom technical assessments to evaluate candidate skills.
  <br>![Assessment Builder](images/Screenshot%202026-03-24%20161741.png)
- **Company Profile**: Customize your organization's presence on the platform.

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
- **Authentication**: Passport.js & JWT
- **Storage**: AWS S3

---

## 📂 Project Structure

```text
InterView/
├── backend/            # Express server, MongoDB models, and API logic
├── frontend/           # React application, components, and state management
├── judge0_setup.md     # Guide for setting up the code execution engine
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