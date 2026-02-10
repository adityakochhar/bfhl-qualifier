require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONFIGURATION
// Replace this with your actual email
const OFFICIAL_EMAIL = "aditya1511.be23@chitkara.edu.in"; 

// Initialize Gemini AI (Get key from aistudio.google.com)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper Functions
const getFibonacci = (n) => {
    if (n <= 0) return [];
    if (n === 1) return [0];
    let series = [0, 1];
    while (series.length < n) {
        series.push(series[series.length - 1] + series[series.length - 2]);
    }
    return series;
};

const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getGCD = (a, b) => (b === 0 ? a : getGCD(b, a % b));
const getLCM = (a, b) => (a * b) / getGCD(a, b);

// 2. GET /health API
app.get('/health', (req, res) => {
    res.status(200).json({
        "is_success": true,
        "official_email": OFFICIAL_EMAIL
    });
});

// 3. POST /bfhl API
app.post('/bfhl', async (req, res) => {
    try {
        const { fibonacci, prime, lcm, hcf, AI } = req.body;
        let data = null;

        // Logic Mapping based on PDF [cite: 34]
        if (fibonacci !== undefined) {
            const n = parseInt(fibonacci);
            if (isNaN(n)) throw new Error("Invalid Integer");
            data = getFibonacci(n);
        } 
        else if (prime !== undefined) {
            if (!Array.isArray(prime)) throw new Error("Input must be an array");
            data = prime.filter(num => isPrime(parseInt(num)));
        } 
        else if (lcm !== undefined) {
            if (!Array.isArray(lcm) || lcm.length === 0) throw new Error("Input must be an array");
            data = lcm.reduce((acc, num) => getLCM(acc, num));
        } 
        else if (hcf !== undefined) {
            if (!Array.isArray(hcf) || hcf.length === 0) throw new Error("Input must be an array");
            data = hcf.reduce((acc, num) => getGCD(acc, num));
        } 
        else if (AI !== undefined) {
            // Integration with Gemini API [cite: 100]
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Answer this in a single word: ${AI}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            data = response.text().trim();
        } 
        else {
            return res.status(400).json({ is_success: false, official_email: OFFICIAL_EMAIL, message: "Invalid input key" });
        }

        // Response Structure [cite: 36]
        res.status(200).json({
            "is_success": true,
            "official_email": OFFICIAL_EMAIL,
            "data": data
        });

    } catch (error) {
        // Graceful error handling [cite: 12]
        console.error(error);
        res.status(500).json({
            "is_success": false,
            "official_email": OFFICIAL_EMAIL,
            "message": "Error processing request"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));