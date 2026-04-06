import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './pages/client/Menu';
import CartSummary from './pages/client/CartSummary';
import Checkout from './pages/client/Checkout';
import LoginPin from './pages/admin/LoginPin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Lado del Cliente */}
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<CartSummary />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Lado del Admin */}
        <Route path="/admin/login" element={<LoginPin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
