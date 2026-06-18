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
    try {
        const rawCookies = req.headers.cookie || '';
        const userIdCookie = rawCookies.split('; ').find(row => row.startsWith('userId='));
        
        if (userIdCookie) {
            const userId = parseInt(userIdCookie.split('=')[1]);
            if (!isNaN(userId)) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                    req.user = user;
                    res.locals.user = user;
                }
            }
        }
    } catch (err) {
        console.error("Session Parsing Error:", err);
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

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Your existing logic
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (user && user.password === password) {
            res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; Max-Age=2592000`);
            res.redirect('/feed');
        } else {
            res.render('login', { error: "Invalid credentials." });
        }
    } catch (err) {
        // THIS IS THE FIX: This prints the real error to your Railway Logs
        console.error("!!! DATABASE ERROR !!!", err);
        res.status(500).send("Server Error: " + err.message);
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // This is the line that is likely failing
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (user && user.password === password) {
            res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; Max-Age=2592000`);
            res.redirect('/feed');
        } else {
            res.render('login', { error: "Invalid credentials." });
        }
    } catch (err) {
        // THIS IS THE KEY: This will force Railway to output the REAL error to your logs
        console.error("!!! DATABASE ERROR !!!", err);
        
        // This prevents the "500 Internal Server Error" crash
        res.render('login', { error: "Database error. Check logs for details." });
    }
});
app.get('/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.redirect('/login');
});

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
        console.error("Feed Error:", error);
        res.status(500).send("Error loading feed.");
    }
});

app.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const myPosts = await prisma.post.findMany({ 
            where: { authorId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.render('dashboard', { myPosts, error: null });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send("Error loading dashboard.");
    }
});

app.post('/posts/create', requireAuth, async (req, res) => {
    try {
        let { content, category } = req.body;
        category = category ? category.replace('#', '').trim().toLowerCase() : 'general';
        await prisma.post.create({ data: { content, category, authorId: req.user.id } });
        res.redirect('/feed');
    } catch (err) {
        console.error("Create Post Error:", err);
        res.redirect('/dashboard');
    }
});

app.post('/posts/:id/edit', requireAuth, async (req, res) => {
    try {
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
    } catch (err) {
        console.error("Edit Post Error:", err);
        res.redirect('/dashboard');
    }
});

app.post('/posts/:id/delete', requireAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (post && post.authorId === req.user.id) {
            await prisma.comment.deleteMany({ where: { postId: postId } });
            await prisma.post.delete({ where: { id: postId } });
        }
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Delete Post Error:", err);
        res.redirect('/dashboard');
    }
});

app.post('/profile/update', requireAuth, async (req, res) => {
    try {
        const { username, email, profilePic, website } = req.body;
        await prisma.user.update({ 
            where: { id: req.user.id }, 
            data: { username, email, profilePic, website } 
        });
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Profile Update Error:", err);
        const myPosts = await prisma.post.findMany({ where: { authorId: req.user.id }, orderBy: { createdAt: 'desc' } });
        res.render('dashboard', { myPosts, error: "Update failed." });
    }
});

app.post('/posts/:id/like', requireAuth, async (req, res) => {
    try {
        await prisma.post.update({ where: { id: parseInt(req.params.id) }, data: { likes: { increment: 1 } } });
    } catch (err) { console.error("Like Error:", err); }
    res.redirect('/feed');
});

app.post('/posts/:id/dislike', requireAuth, async (req, res) => {
    try {
        await prisma.post.update({ where: { id: parseInt(req.params.id) }, data: { dislikes: { increment: 1 } } });
    } catch (err) { console.error("Dislike Error:", err); }
    res.redirect('/feed');
});

app.post('/posts/:id/comment', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        await prisma.comment.create({ data: { content, postId: parseInt(req.params.id), authorId: req.user.id } });
    } catch (err) { console.error("Comment Error:", err); }
    res.redirect('/feed');
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));