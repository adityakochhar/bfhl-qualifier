require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 1. SECURITY
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet()); // Protects against header attacks

// CONFIGURATION
const OFFICIAL_EMAIL = "aditya1511.be23@chitkara.edu.in"; 

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. RENDER SLEEP FIX: Pings itself every 10 minutes to stay awake
// Replace the URL below with your actual Render URL if it changes
const PING_URL = "https://bfhl-qualifier.onrender.com/health"; 
setInterval(async () => {
    try {
        // Only ping if the URL is defined and valid
        if (PING_URL && PING_URL.startsWith("http")) {
            await fetch(PING_URL);
            console.log(`[Keep-Alive] Pinged ${PING_URL} successfully`);
        }
    } catch (e) {
        console.error(`[Keep-Alive] Ping failed: ${e.message}`);
    }
}, 10 * 60 * 1000); // 10 minutes

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

// GET /health API
app.get('/health', (req, res) => {
    res.status(200).json({
        "is_success": true,
        "official_email": OFFICIAL_EMAIL
    });
});

// POST /bfhl API
app.post('/bfhl', async (req, res) => {
    try {
        const { fibonacci, prime, lcm, hcf, AI } = req.body;
        let data = null;

        // 3. EDGE VALIDATION: Check types before processing
        if (fibonacci !== undefined) {
            const n = parseInt(fibonacci);
            if (isNaN(n) || n < 0) throw new Error("Input must be a positive integer");
            data = getFibonacci(n);
        } 
        else if (prime !== undefined) {
            if (!Array.isArray(prime)) throw new Error("Input must be an array");
            // Filter out non-numbers to prevent crashes
            data = prime.filter(num => !isNaN(parseInt(num)) && isPrime(parseInt(num)));
        } 
        else if (lcm !== undefined) {
            if (!Array.isArray(lcm) || lcm.length === 0) throw new Error("Input must be a non-empty array");
            data = lcm.reduce((acc, num) => getLCM(acc, parseInt(num)));
        } 
        else if (hcf !== undefined) {
            if (!Array.isArray(hcf) || hcf.length === 0) throw new Error("Input must be a non-empty array");
            data = hcf.reduce((acc, num) => getGCD(acc, parseInt(num)));
        } 
        else if (AI !== undefined) {
            if (typeof AI !== 'string') throw new Error("AI input must be a string");

            // 4. TIMEOUT HANDLING & CORRECT MODEL
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Answer this in a single word: ${AI}`;

            // Race: Either AI finishes, OR we timeout after 8 seconds
            const result = await Promise.race([
                model.generateContent(prompt),
                new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request Timeout (8s limit)")), 8000))
            ]);

            const response = await result.response;
            data = response.text().trim();
        } 
        else {
            return res.status(400).json({ 
                "is_success": false, 
                "official_email": OFFICIAL_EMAIL, 
                "message": "Invalid input key" 
            });
        }

        // Response Structure
        res.status(200).json({
            "is_success": true,
            "official_email": OFFICIAL_EMAIL,
            "data": data
        });

    } catch (error) {
        console.error("API Error:", error.message);
        
        // 5. STRUCTURE STRICTNESS: Always return strict JSON even on error [cite: 36-41]
        // We use 400 for Bad Request (user error) or 500 for Server Error
        const statusCode = error.message.includes("Timeout") || error.message.includes("Invalid") ? 400 : 500;
        
        res.status(statusCode).json({
            "is_success": false,
            "official_email": OFFICIAL_EMAIL,
            "message": error.message || "Error processing request"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));