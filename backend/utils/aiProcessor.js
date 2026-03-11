// backend\utils\aiProcessor.js

const fs = require("fs");
const PDFParser = require("pdf2json");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// ====================== GEMINI CLIENT SETUP ======================
const genAI1 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1); // Resume Review
const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2); // Question Generation
const genAI3 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY3);

// ====================== SAFE STRING DECODER ======================
const safeDecode = (str) => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str.replace(/%([0-9A-F]{2})/gi, (m, p1) => {
      const code = parseInt(p1, 16);
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : " ";
    });
  }
};

// ====================== EXTRACT TEXT FROM PDF ======================
const extractResumeText = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore: TS definition exports default but CommonJS returns the class
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";
      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((t) => {
          t.R.forEach((r) => {
            text += safeDecode(r.T) + " ";
          });
        });
      });
      text = text
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E]+/g, " ")
        .trim();
      resolve(text);
    });
    pdfParser.parseBuffer(fileBuffer);
  });
};

// ====================== RESUME REVIEW (AI 1) ======================
// This prompt matches your database schema
const scoreResume = async (resumeText, jobDescription) => {
  try {
    const prompt = `
You are an expert technical recruiter. Analyze the candidate's resume against the provided job description.
Return STRICT JSON with this exact structure:
{
  "resumeScore": <A single number from 0-100 representing the resume's fit for the job>,
  "feedbackOnResume": {
  	"strengths": ["List 2-3 key strengths as strings in this array"],
  	"weaknesses": ["List 2-3 key weaknesses or areas for improvement"]
  }
}


JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;
    // ✅ FIX: Using 'gemini-flash-latest' from your working example
    const model = genAI1.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("AI JSON parse error (Resume Scoring):", err);
    return {
      resumeScore: 0,
      feedbackOnResume: {
        strengths: ["AI analysis failed."],
        weaknesses: ["AI analysis failed."],
      },
      // hiringChance: "Consider",
    };
  }
};

// ====================== QUESTION GENERATION (AI 2) ======================
const generateQuestions = async (resumeText, jobRole) => {
  try {
    const prompt = `
You are a technical interviewer hiring for the role of "${jobRole}".
Generate 6 short, technical questions based *only* on the candidate's resume projects and skills.
Do NOT ask generic questions IT WOULD BE BETTER TO ASK THEORITICAL QUESTION ,  QUESTIONS ON TECHNOLOGY USED IN PROJECTS or ON IMPLEMENTATION , STRUCTURE , ARCHETECTURE.
Return STRICT JSON in this format:
{
	"questions": ["Q1","Q2","Q3","Q4","Q5","Q6"]
}
RESUME:
${resumeText}
`;

    // ✅ FIX: Using 'gemini-flash-latest' from your working example
    const model = genAI2.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return parsed.questions || [];
  } catch (err) {
    console.error("AI JSON parse error (Resume Questions):", err);
    return [];
  }
};

// ====================== MAIN RESUME PROCESSOR (FROM PREVIOUS STEP) ======================
exports.processResume = async (fileBuffer, jobDescription, jobRole) => {
  try {
    const resumeText = await extractResumeText(fileBuffer); // Run resume scoring and question generation concurrently

    const [scoreData, questionsData] = await Promise.all([
      scoreResume(resumeText, jobDescription),
      generateQuestions(resumeText, jobRole),
    ]); // This function ONLY returns the data for the /start endpoint

    return {
      scoreData, // Contains { resumeScore, feedbackOnResume, hiringChance }
      questionsData, // Contains ["Q1", "Q2", ...]
    };
  } catch (err) {
    console.error("AI processing error:", err);
    throw new Error("AI processing failed.");
  }
};

// ====================== NEW FUNCTION FOR /END ENDPOINT ======================
/**
 * Evaluates a list of questions and answers using Gemini.
 * @param {Array<Object>} qaList - An array of { question, answer } objects.
 * @returns {Promise<Object>} - An object with scores and feedback.
 */
exports.evaluateAnswers = async (qaList) => {
  try {
    const prompt = `
You are an expert technical interviewer. I will provide you with a list of questions and the candidate's answers.
Evaluate each answer on a scale of 1 to 10, where 1 is "Poor" and 10 is "Excellent, if you feel that the annswer given is broken due to incomplete recoding or transcribing give grace marks as log as the keywords are present related to topic".
After scoring each question, provide an "overallScore" (0-100) and "feedbackOnInterviewAnswers" with strengths and weaknesses.

Return STRICT JSON with this exact structure:
{
  "scores_per_question": [
  	{ "question": "The first question", "aiScore": <1-10> },
  	{ "question": "The second question", "aiScore": <1-10> },
  	...
  ],
  "overallScore": <A single number from 0-100>,
  "feedbackOnInterviewAnswers": {
  	"strengths": ["List 2-3 key strengths from the answers"],
  	"weaknesses": ["List 2-3 key weaknesses from the answers"]
  },
"hiringChance": "<A single string: 'Hire', 'Consider', or 'Reject', be very strict if overall score is below 50 reject 51-75 consider above 75 hire, if test score is blow 50 reject,if there is unfrofessional behaviour then reject>"
}

QUESTIONS AND ANSWERS:
${JSON.stringify(qaList)}
`;

    const model = genAI3.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("AI JSON parse error (Answer Evaluation):", err); // Return a default error structure
    return {
      scores_per_question: qaList.map((q) => ({
        question: q.question,
        aiScore: 0,
      })),
      overallScore: 0,
      feedbackOnInterviewAnswers: {
        strengths: ["AI evaluation failed."],
        weaknesses: ["AI evaluation failed."],
      },
      hiringChance: "N/A",
    };
  }
};

// ====================== DYNAMIC INTERVIEW MANAGER GENERATION (AI 3) ======================
exports.generateInterviewPrompt = async (promptText) => {
    try {
        const model = genAI3.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(promptText);
        return result.response.text();
    } catch (err) {
        console.error("AI Error generating interview conversation:", err);
        throw new Error("Failed to generate response");
    }
};
