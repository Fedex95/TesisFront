import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Layout from './components/home/Layout';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Cart from './components/cart/Cart';
import Pedidos from './components/cart/Pedidos';
import Producto from './components/book/Producto';
import PerfilUsuario from './components/home/PerfilUsuario';
import AdminView from './components/home/Adminview';
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
            <Route path="/producto" element={<ProtectedRoute><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><Producto userData={userData} /></Layout></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><PerfilUsuario userData={userData} /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={isAuthenticated && admin ? <ProtectedRoute requireAdmin><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><AdminView userData={userData} /></Layout></ProtectedRoute> : <Navigate to="/login" replace />} />
            <Route path="/cart" element={<ProtectedRoute><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><Cart userData={userData} /></Layout></ProtectedRoute>} />
            <Route path="/pedidos" element={<ProtectedRoute><Layout onLogout={handleLogout} cartItemsCount={cartItems.length} userData={userData}><Pedidos userData={userData} /></Layout></ProtectedRoute>} />
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