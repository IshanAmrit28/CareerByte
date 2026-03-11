const PDFParser = require("pdf2json").default || require("pdf2json");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

const extractResumeText = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
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
      text = text.replace(/\s+/g, " ").replace(/[^\x20-\x7E]+/g, " ").trim();
      resolve(text);
    });
    pdfParser.parseBuffer(fileBuffer);
  });
};

exports.analyzeResumeContent = async (req, res) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    let text = "";
    if (resumeFile.mimetype === "application/pdf") {
        text = await extractResumeText(resumeFile.buffer);
    } else if (resumeFile.mimetype === "text/plain") {
        text = resumeFile.buffer.toString("utf8");
    } else {
        return res.status(400).json({ success: false, message: "Only PDF and TXT files are supported" });
    }

    // Use GEN_AI_KEY1 for this specific task
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume and provide detailed feedback:

Resume Content:
${text}

Please provide:
1. **Overall Score** (out of 10)
2. **Strengths** (3-5 bullet points)
3. **Areas for Improvement** (3-5 bullet points)
4. **ATS Compatibility** (score out of 10 and tips)
5. **Specific Recommendations** (actionable suggestions)

Format your response in markdown.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return res.status(200).json({ success: true, analysis: feedback });

  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return res.status(500).json({ success: false, message: "Error analyzing resume", error: error.message });
  }
};
