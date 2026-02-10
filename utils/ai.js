const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const answerSingleWord = async (AI) => {
    // 4. TIMEOUT HANDLING & CORRECT MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Answer this in a single word: ${AI}`;

    // Race: Either AI finishes, OR we timeout after 8 seconds
    const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request Timeout (8s limit)")), 8000))
    ]);

    const response = await result.response;
    return response.text().trim();
};

module.exports = { answerSingleWord };

