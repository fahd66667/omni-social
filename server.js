const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); 

const app = express();
const prisma = new PrismaClient(); 

// Middleware
app.use(cors());
app.use(express.json());
// CRITICAL FIX: This tells Express how to read the HTML form data
app.use(express.urlencoded({ extended: true })); 

// --- Authentication Route ---
app.post('/api/auth/login', (req, res) => {
    console.log("Login attempt received");
    res.status(200).json({ message: "Login successful", token: "fake-token-123" });
});

// --- NEW FIX: Register Route ---
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("New registration attempt for:", email);

        const newUser = await prisma.user.create({
            data: { username, email, password }
        });
        
        // Redirect to the feed immediately after it succeeds
        res.redirect('/feed'); 
    } catch (error) {
        console.error("Registration Database Error:", error);
        res.status(500).send("Internal Server Error: Failed to register user. Check Railway logs.");
    }
});

// --- New Post Route ---
app.post('/api/posts/create', async (req, res) => {
    try {
        const { content, authorId } = req.body;
        const newPost = await prisma.post.create({
            data: { content, authorId: parseInt(authorId) }
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
});

// Start Server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});