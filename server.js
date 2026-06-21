import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// --- CONFIGURATION ---
// Since server.js is in the root, we look directly into 'views'
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARE ---
// Serve static files directly from 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// Homepage
app.get('/', (req, res) => {
    res.render('index'); 
});

app.post('/register', async (req, res) => {
    try {
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});