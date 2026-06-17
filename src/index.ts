import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// The exact route your client is requesting
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Minimal validation
    if (!email || !password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login request for:", email);

    res.status(200).json({ 
        message: "Login successful!", 
        token: "success-token-123" 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});