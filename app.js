require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 1. SECURITY

const bfhlRoutes = require('./routes/bfhl');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet()); // Protects against header attacks

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

app.use('/', bfhlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

