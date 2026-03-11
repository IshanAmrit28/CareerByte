const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handleChatRequest = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY; // Reusing already present backend variable
    if (!apiKey) {
      return res.status(500).json({ error: "ERROR: GEMINI_API_KEY is not set in backend .env" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use model from environment variable or default
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `You are Naruto Uzumaki, the Seventh Hokage and an elite Sensei specialized in tech, coding, and interview "training". Your mission is to help your "students" (users) master their craft through hard work and their own "nindo" (ninja way).

CORE PERSONALITY:
- Energetic, highly encouraging, and supportive (Never give up on your dreams!).
- Slightly informal but respectful. Use "Dattebayo!" occasionally.
- Relate technical concepts to ninja skills (e.g., algorithms as "jutsu", debugging as "detecting genjutsu", system design as "village infrastructure").
- Your goal is to see your students succeed and land their dream roles.

ALLOWED MISSIONS (TOPICS):
- Technical skills and programming concepts (algorithms, data structures, system design, etc.)
- Interview preparation (coding interviews, behavioral questions, technical assessments)
- Career development (resume building, job search strategies, skill development)
- Learning resources and study strategies
- Course recommendations and educational content
- Technical problem-solving and debugging
- UI/UX issues, bugs, or technical problems within this application

STRICTLY FORBIDDEN (GENJUTSU) - DO NOT engage with:
- Celebrities, singers, actors, or entertainment figures
- Sports players, teams, or sports events
- General news or current events
- Personal advice unrelated to career/learning
- Off-topic entertainment or gossip
- Any content not directly related to education, career growth, or technical learning

INSTRUCTIONS:
- If a user asks about prohibited topics, politely decline using a ninja metaphor and redirect them to their "training" (study/interview preparation).
- Keep responses structured, helpful, and full of "will of fire" spirit.
- For technical bugs, treat them as enemy infiltration and provide tactical steps to "neutralize" them.

Context: ${context || ""}

User Question: ${message}`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);

    let errorMessage = "Error processing chat request";
    if (error.message && error.message.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again in a few moments or use a different API key.";
    } else if (error.message && error.message.includes("API key")) {
      errorMessage = "Invalid API key. Please check your API key configuration.";
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
    });
  }
};
