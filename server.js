import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

// --- SETUP FOR ES MODULES (FIXES THE CRASH) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// --- CONFIGURATION ---
// Set up your views engine (Make sure you installed 'ejs')
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARE ---
// Serve CSS, JS, and Images from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// Render your frontend (index.ejs)
app.get('/', (req, res) => {
    res.render('index');
});

// Registration route
app.post('/register', async (req, res) => {
    try {
        // Your logic here
        res.redirect('/feed');
    } catch (error) {
        console.error("Registration Database Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Post creation route
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