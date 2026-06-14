'use client';
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      alert('Login Successful! Token: ' + response.data.token);
    } catch (error) {
      alert('Login Failed: ' + error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 border p-6 rounded shadow-md">
        <input 
          type="email" placeholder="Email" value={email} 
          onChange={(e) => setEmail(e.target.value)} className="border p-2" 
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)} className="border p-2" 
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}