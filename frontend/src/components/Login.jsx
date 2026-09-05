import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/users` : 'http://localhost:5000/api/users';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/register`, formData);
        setIsRegister(false);
        setError('Registration successful! Please login.');
      } else {
        const res = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        onLogin(res.data.token, res.data.name);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-container" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input 
              type="text"
              className="glass-input"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          )}
          
          <input 
            type="email"
            className="glass-input"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input 
            type="password"
            className="glass-input"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button type="submit" className="glass-button">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
