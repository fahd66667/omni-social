import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import prisma from './lib/prisma';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ... (your routes) ...

// THE FIX: This only listens if you run 'node index.js' locally.
// Vercel imports this file and ignores this block.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;