import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { ShoppingBag } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate('/')}>
        <div className="navbar-logo-icon">C</div>
        <span className="navbar-brand-name">Como en Casa</span>
      </button>

      <div className="navbar-links">
        <button className="nav-link" onClick={() => navigate('/')}>Menú</button>
        <button className="nav-link disabled" disabled title="Próximamente">Reservas</button>
        <button className="nav-cart-btn" onClick={() => navigate('/cart')}>
          <ShoppingBag size={18} />
          Mi Carrito
          {totalItems > 0 && (
            <span className="nav-cart-badge">{totalItems}</span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
