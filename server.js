import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

app.post('/register', async (req, res) => {
    try {
        // Logic for registration
        res.redirect('/feed');
    } catch (error) {
        console.error("Registration Database Error:", error);
        res.status(500).send("Internal Server Error: Failed to register user.");
    }
});

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

// Listen on 0.0.0.0 for Railway compatibility
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});