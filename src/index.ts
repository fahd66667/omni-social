// server/index.js
require('dotenv').config(); // MUST BE FIRST
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma'); // Import the singleton
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send('OmniSocial API Operational');
});

// Example route using the imported prisma client
app.get('/api/status', async (req, res) => {
    try {
        // Simple check to ensure Prisma is ready
        await prisma.$connect();
        res.json({ status: 'connected' });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Your other routes go here...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Essential for Vercel Serverless