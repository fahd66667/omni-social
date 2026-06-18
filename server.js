import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const parseUserSession = async (req, res, next) => {
    const rawCookies = req.headers.cookie || '';
    const userIdCookie = rawCookies.split('; ').find(row => row.startsWith('userId='));
    
    if (userIdCookie) {
        const userId = parseInt(userIdCookie.split('=')[1]);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            req.user = user;
            res.locals.user = user;
        }
    }
    next();
};
app.use(parseUserSession);

const requireAuth = (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    next();
};

app.get('/', (req, res) => {
    res.redirect(req.user ? '/feed' : '/login');
});

app.get('/login', (req, res) => res.render('login', { error: null }));
app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await prisma.user.create({ data: { username, email, password } });
        res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; Max-Age=2592000`);
        res.redirect('/feed');
    } catch (err) {
        res.render('register', { error: "Username or Email already taken." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
        res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; Max-Age=2592000`);
        res.redirect('/feed');
    } else {
        res.render('login', { error: "Invalid credentials." });
    }
});

app.get('/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.redirect('/login');
});

// Upgraded Feed: Supports Category Filtering
app.get('/feed', requireAuth, async (req, res) => {
    const { category } = req.query;
    try {
        const posts = await prisma.post.findMany({
            where: category ? { category: category.toLowerCase() } : {},
            include: { author: true, comments: { include: { author: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.render('feed', { posts, selectedCategory: category || null });
    } catch (error) {
        res.status(500).send("Error loading feed.");
    }
});

// Dashboard View for Editing Everything
app.get('/dashboard', requireAuth, async (req, res) => {
    const myPosts = await prisma.post.findMany({ 
        where: { authorId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.render('dashboard', { myPosts, error: null });
});

// Create Post with Category
app.post('/posts/create', requireAuth, async (req, res) => {
    let { content, category } = req.body;
    // Strip '#' symbol if they typed it in
    category = category ? category.replace('#', '').trim().toLowerCase() : 'general';
    
    await prisma.post.create({ data: { content, category, authorId: req.user.id } });
    res.redirect('/feed');
});

// Edit Existing Post
app.post('/posts/:id/edit', requireAuth, async (req, res) => {
    const postId = parseInt(req.params.id);
    let { content, category } = req.body;
    category = category ? category.replace('#', '').trim().toLowerCase() : 'general';

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId === req.user.id) {
        await prisma.post.update({
            where: { id: postId },
            data: { content, category }
        });
    }
    res.redirect('/dashboard');
});

app.post('/posts/:id/delete', requireAuth, async (req, res) => {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId === req.user.id) {
        await prisma.comment.deleteMany({ where: { postId: postId } });
        await prisma.post.delete({ where: { id: postId } });
    }
    res.redirect('/dashboard');
});

// Full Facebook-Style Profile Update
app.post('/profile/update', requireAuth, async (req, res) => {
    const { username, email, profilePic, website } = req.body;
    try {
        await prisma.user.update({ 
            where: { id: req.user.id }, 
            data: { username, email, profilePic, website } 
        });
        res.redirect('/dashboard');
    } catch (err) {
        const myPosts = await prisma.post.findMany({ where: { authorId: req.user.id }, orderBy: { createdAt: 'desc' } });
        res.render('dashboard', { myPosts, error: "Username or email already taken." });
    }
});

// Interactive reactions
app.post('/posts/:id/like', requireAuth, async (req, res) => {
    await prisma.post.update({ where: { id: parseInt(req.params.id) }, data: { likes: { increment: 1 } } });
    res.redirect('/feed');
});
app.post('/posts/:id/dislike', requireAuth, async (req, res) => {
    await prisma.post.update({ where: { id: parseInt(req.params.id) }, data: { dislikes: { increment: 1 } } });
    res.redirect('/feed');
});
app.post('/posts/:id/comment', requireAuth, async (req, res) => {
    const { content } = req.body;
    await prisma.comment.create({ data: { content, postId: parseInt(req.params.id), authorId: req.user.id } });
    res.redirect('/feed');
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));