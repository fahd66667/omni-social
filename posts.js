const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Create a new post
router.post('/create', async (req, res) => {
    try {
        const { content, authorId, title } = req.body;
        
        if (!content || !authorId) {
            return res.status(400).json({ error: "Content and authorId are required" });
        }

        const newPost = await prisma.post.create({
            data: { 
                content, 
                authorId, 
                title: title || null // If no title provided, saves as null
            }
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: { author: true }
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;