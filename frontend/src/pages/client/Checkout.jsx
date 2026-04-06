import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { User, Phone, Utensils, ShoppingBag, Truck } from 'lucide-react';
import './Checkout.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const formatMods = (modsReadable) => {
  if (!modsReadable || Object.keys(modsReadable).length === 0) return null;
  return Object.entries(modsReadable)
    .map(([name, action]) => action === 'quitar' ? `Sin ${name}` : `Extra ${name}`)
    .join(', ');
};

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState('local');
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', table: '', address: '', landmark: ''
  });

  const handleConfirmOrder = async () => {
    if (!formData.name.trim()) return alert("Por favor, ingresa tu nombre.");
    if (cart.length === 0) return alert("Tu carrito está vacío.");

    setSending(true);
    try {
      const response = await fetch('http://localhost:3000/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData, cart, total, deliveryType, localId: LOCAL_ID })
      });

      if (!response.ok) throw new Error("Error en el servidor");

      alert("¡Pedido Confirmado! 🎉 Tu orden ya está en la cocina.");
      clearCart();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Hubo un error al enviar tu pedido. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="checkout-page">

      {/* BANDA SUPERIOR OSCURA - Navegación y título */}
      <div className="checkout-hero">
        <button className="checkout-hero-back" onClick={() => navigate('/cart')}>
          ← Mi carrito
        </button>
        <h1 className="checkout-hero-title">Confirmar Pedido</h1>
        <div className="checkout-hero-steps">
          <span>Carrito</span>
          <span>›</span>
          <span className="step-active">Datos</span>
          <span>›</span>
          <span>Listo</span>
        </div>
      </div>

      <div className="checkout-container">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="checkout-form-panel">
          <h2 className="checkout-title">Detalles de tu pedido</h2>

          <div className="form-content">
            {/* Nombre y Teléfono */}
            <div className="form-group-grid">
              <div className="form-field">
                <label className="form-label">Nombre Completo</label>
                <div className="input-container">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="¿Cómo te llamas?"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Teléfono</label>
                <div className="input-container">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" placeholder="10 dígitos"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Modalidad */}
            <div className="form-field">
              <label className="form-label">¿Cómo prefieres comer hoy?</label>
              <div className="delivery-modes-grid">
                {[
                  { id: 'local', label: 'En el local', icon: Utensils },
                  { id: 'pickup', label: 'Para llevar', icon: ShoppingBag },
                  { id: 'delivery', label: 'A domicilio', icon: Truck }
                ].map((mode) => (
                  <button key={mode.id}
                    onClick={() => setDeliveryType(mode.id)}
                    className={`delivery-mode-btn ${deliveryType === mode.id ? 'active' : ''}`}>
                    <mode.icon className="delivery-icon" size={22} />
                    <span className="delivery-label">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo condicional: Mesa */}
            {deliveryType === 'local' && (
              <div className="conditional-field">
                <label className="form-label">Número de Mesa</label>
                <input type="number" placeholder="Ej: 5"
                  className="input-standalone"
                  value={formData.table}
                  onChange={(e) => setFormData({...formData, table: e.target.value})} />
              </div>
            )}

            {/* Campo condicional: Domicilio */}
            {deliveryType === 'delivery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Ubicación</label>
                  <textarea placeholder="Calle, número, colonia..."
                    className="textarea-field"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-field">
                  <label className="form-label">Referencia</label>
                  <input type="text" placeholder="Ej: Portón café, frente al parque..."
                    className="input-standalone"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-panel">

            {/* Cabecera del panel */}
            <div className="summary-header">
              <h3 className="summary-title">Resumen del pedido</h3>
            </div>

            {/* Lista de items */}
            <div className="summary-items-list">
              {cart.map((item) => (
                <div key={item.uniqueId} className="summary-item">
                  <div>
                    <p className="summary-item-name">
                      {item.quantity > 1 ? `×${item.quantity}  ` : ''}{item.nombre}
                    </p>
                    {formatMods(item.modsReadable) && (
                      <p className="summary-item-mods">{formatMods(item.modsReadable)}</p>
                    )}
                  </div>
                  <p className="summary-item-price">${(item.subtotal * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Total y botón */}
            <div className="summary-total-section">
              <p className="summary-total-label">Total estimado</p>
              <div className="summary-total-row">
                <span className="summary-total-value">${total.toFixed(2)}</span>
              </div>
              <button onClick={handleConfirmOrder} className="confirm-order-btn" disabled={sending}>
                {sending ? 'Enviando pedido...' : 'Confirmar Pedido'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
