import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Layout from './components/home/Layout';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Verify from './components/auth/Verify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  const [userData, setUserData] = useState(() => {
    const savedUser = sessionStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [admin, setAdmin] = useState(() => {
    return sessionStorage.getItem('admin') === 'true';
  });

  const [cartItems, setCartItems] = useState([]);

  const handleLogin = async (data) => {
    setIsAuthenticated(true);
    setUserData(data);
    setAdmin(data.rol === 'ADMIN');  

    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify(data));
    sessionStorage.setItem('admin', String(data.rol === 'ADMIN')); 
    if (data?.token) sessionStorage.setItem('auth_token', data.token);
   
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setCartItems([]);
    setAdmin(false);
    sessionStorage.clear();
  };

  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requireAdmin && !admin) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />

        {isAuthenticated ? (
          <>
            <Route path="/" element={<ProtectedRoute><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><Home userData={userData} /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;