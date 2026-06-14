'use client';
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. Sending request to http://localhost:5000/api/auth/login");

  try {
  const response = await axios.post('http://localhost:5000/api/auth/login', {
    email,
    password,
  });

  // Log the whole response to see what the server sent
  console.log("Full response from server:", response.data);

  // Access the token specifically
  const token = response.data.token;
  alert('Login Successful! Token: ' + token);

} catch (error) {
  console.error(error);
  alert('Login Failed');
}
  return (
    <div style={{ padding: '50px' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', marginBottom: '10px' }} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}