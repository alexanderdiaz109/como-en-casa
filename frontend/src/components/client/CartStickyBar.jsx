import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import './CartStickyBar.css';

const CartStickyBar = () => {
  const { cart, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return null;

  return (
    <div className="cart-sticky-bar" onClick={() => navigate('/checkout')}>
      <div className="cart-info">
        <span className="cart-count">Llevas {cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
        <span className="cart-total">Total: ${total.toFixed(2)}</span>
      </div>
      <button className="cart-checkout-btn">
        Ver Orden
      </button>
    </div>
  );
};

export default CartStickyBar;
