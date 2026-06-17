const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); // Import Prisma

const app = express();
const prisma = new PrismaClient(); // Initialize Prisma

// Middleware
app.use(cors());
app.use(express.json());

// --- Authentication Route ---
app.post('/api/auth/login', (req, res) => {
    // This is currently a mock; later you will use: 
    // const user = await prisma.user.findUnique({ where: { email: ... } })
    console.log("Login attempt received");
    res.status(200).json({ message: "Login successful", token: "fake-token-123" });
});

// --- New Post Route ---
app.post('/api/posts/create', async (req, res) => {
    try {
        const { content, authorId } = req.body;
        
        // Save to Database
        const newPost = await prisma.post.create({
            data: { 
                content, 
                authorId: parseInt(authorId) // Ensure ID is a number
            }
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