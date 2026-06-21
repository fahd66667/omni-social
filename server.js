const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client'); // Assuming you use Prisma
const prisma = new PrismaClient();

// --- MIDDLEWARE (Crucial: These must come before your routes) ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // If you have a public folder for CSS/images

// Set EJS or your view engine (if you are using one, e.g., ejs)
app.set('view engine', 'ejs'); 
app.set('views', './views');

// --- ROUTES ---

// Registration Route
app.post('/register', async (req, res) => {
    try {
        // Your logic to save the user goes here
        // Example: const newUser = await prisma.user.create({ data: req.body });
        res.redirect('/feed');
    } catch (error) {
        console.error("Registration Database Error:", error);
        res.status(500).send("Internal Server Error: Failed to register user.");
    }
});

// Create Post Route
app.post('/api/posts/create', async (req, res) => {
    try {
        const { content, authorId } = req.body;
        const newPost = await prisma.post.create({
            data: { 
                content, 
                authorId: parseInt(authorId) 
            }
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});