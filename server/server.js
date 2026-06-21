const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); // Import Prisma

const app = express();
const prisma = new PrismaClient(); // Initialize Prisma

// Middleware
app.use(cors());
app.use(express.json());
// CRITICAL FIX: This tells Express how to read the data coming from your EJS HTML form
app.use(express.urlencoded({ extended: true })); 

// --- Authentication Route ---
app.post('/api/auth/login', (req, res) => {
    // This is currently a mock; later you will use: 
    // const user = await prisma.user.findUnique({ where: { email: ... } })
    console.log("Login attempt received");
    res.status(200).json({ message: "Login successful", token: "fake-token-123" });
});

// --- NEW FIX: Register Route ---
app.post('/register', async (req, res) => {
    try {
        // 1. Grab the exact names of the input fields from your EJS form
        const { username, email, password } = req.body;
        
        console.log("New registration attempt for:", email);

        // 2. Save to your database using Prisma
        const newUser = await prisma.user.create({
            data: { 
                username, 
                email, 
                password // Note: You will want to hash this later for security!
            }
        });
        
        // 3. Redirect them to the feed immediately after it succeeds
        res.redirect('/feed'); 

    } catch (error) {
        console.error("Registration Database Error:", error);
        // Send a visible error to the browser if it fails, so you aren't staring at a blank screen
        res.status(500).send("Internal Server Error: Failed to register user. Check Railway logs.");
    }
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