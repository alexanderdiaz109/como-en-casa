import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import Navbar from '../../components/client/Navbar';
import { ArrowLeft, Plus, X } from 'lucide-react';
import './CartSummary.css';

const CartSummary = () => {
  const { cart, total, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Formatear las modificaciones legibles para mostrar al usuario
  const formatMods = (modsReadable) => {
    if (!modsReadable || Object.keys(modsReadable).length === 0) return 'Receta tradicional';
    return Object.entries(modsReadable)
      .map(([name, action]) => action === 'quitar' ? `Sin ${name}` : `Extra ${name}`)
      .join(', ');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Tu carrito está vacío</h2>
            <p>¡Agrega algo delicioso del menú!</p>
            <button className="go-menu-btn" onClick={() => navigate('/')}>Ver Menú</button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-page">
      <Navbar />

      <div className="cart-container">
        {/* HEADER */}
        <div className="cart-header-row">
          <button className="cart-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Menú
          </button>
          <h1 className="cart-title">Tu Pedido</h1>
          <span className="cart-count-badge">{totalItems} platillo{totalItems !== 1 ? 's' : ''}</span>
        </div>

        {/* LISTA DE ITEMS */}
        {cart.map((item) => (
          <div key={item.uniqueId} className="cart-item-card">
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.nombre}</h3>
              <p className="cart-item-mods">{formatMods(item.modsReadable)}</p>
              <p className="cart-item-price">${(item.subtotal * item.quantity).toFixed(2)}</p>
            </div>

            <div className="cart-item-controls">
              {/* Controles +/-  */}
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => decreaseQuantity(item.uniqueId)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => increaseQuantity(item.uniqueId)}>+</button>
              </div>
              {/* Eliminar */}
              <button className="remove-btn" onClick={() => removeFromCart(item.uniqueId)}>
                <X size={12} /> Eliminar
              </button>
            </div>
          </div>
        ))}

        {/* AGREGAR OTRO PLATILLO */}
        <button className="add-another-btn" onClick={() => navigate('/')}>
          <Plus size={16} /> Agregar otro platillo
        </button>

        {/* RESUMEN DE PRECIO */}
        <div className="cart-summary-box">
          <div className="summary-row">
            <span>Subtotal ({totalItems} {totalItems !== 1 ? 'platillos' : 'platillo'})</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row shipping">
            <span>Costo de envío</span>
            <span>Calculado al pagar</span>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total-row">
            <span>Total estimado</span>
            <span className="summary-total-value">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* BOTÓN FIJO PARA CONTINUAR AL PAGO */}
      <div className="cart-continue-bar">
        <button className="continue-btn" onClick={() => navigate('/checkout')}>
          Continuar al Pago — ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
