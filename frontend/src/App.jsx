import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  const handleLogin = (newToken, name) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', name);
    setToken(newToken);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName(null);
  };

  return (
    <Router>
      <div className="app-layout">
        {token && (
          <header className="header">
            <h2>Smart Task Manager V2</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Welcome, {userName}</span>
              <button className="glass-button secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>
        )}
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
