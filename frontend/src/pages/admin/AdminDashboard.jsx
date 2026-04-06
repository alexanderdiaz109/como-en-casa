import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Bell, Play, CheckCircle, Package } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import './AdminDashboard.css';

// Conexión al servidor de Node.js
const socket = io('http://localhost:3000');

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197"; // Timucuy

  useEffect(() => {
    // 0. Cargar pedidos existentes al iniciar
    const fetchInitialOrders = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id_local', localId)
        .neq('estado', 'finalizado')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setOrders(data);
      }
    };
    fetchInitialOrders();

    // 1. Unirse al "cuarto" privado de la sucursal
    socket.emit('join_local', localId);

    // 2. Escuchar nuevos pedidos ("El Despertador")
    socket.on('new_order', (newOrder) => {
      const audio = new Audio('/alert.mp3'); 
      audio.play().catch(e => console.log("Esperando interacción para sonar"));
      
      const fullOrder = {
          id: newOrder.orderId,
          nombre_cliente: newOrder.customer.name,
          estado: 'entrante',
          modalidad: newOrder.deliveryType,
          numero_mesa: newOrder.customer.table || '-'
      };

      setOrders((prev) => [fullOrder, ...prev]);
    });

    return () => socket.off('new_order');
  }, []);

  const advanceOrder = async (order) => {
    let nextState = '';
    if (order.estado === 'entrante') nextState = 'cocina';
    else if (order.estado === 'cocina') nextState = 'listo';
    else if (order.estado === 'listo') nextState = 'finalizado';
    
    if (!nextState) return;

    // Actualizar optimísticamente en la UI
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, estado: nextState } : o));

    // Persistir en base de datos
    await supabase
        .from('pedidos')
        .update({ estado: nextState })
        .eq('id', order.id);
  };

  // Columnas del Kanban
  const states = [
    { id: 'entrante', label: 'Entrantes', className: 'entrante', icon: Bell },
    { id: 'cocina', label: 'En Cocina', className: 'cocina', icon: Play },
    { id: 'listo', label: 'Listos', className: 'listo', icon: CheckCircle },
    { id: 'finalizado', label: 'Entregados', className: 'finalizado', icon: Package },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Panel de Recepción - Timucuy</h1>
        <div className="flex items-center gap-4">
          <span className="status-badge">En Línea</span>
        </div>
      </header>

      <main className="kanban-board">
        {states.map((state) => (
          <div key={state.id} className={`kanban-col ${state.className}`}>
            <div className="kanban-col-header">
              <state.icon size={20} color="#374151" />
              <h2 className="kanban-col-title">{state.label}</h2>
            </div>

            <div className="kanban-col-content">
              {orders.filter(o => o.estado === state.id).map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">#{String(order.id).slice(-4)}</span>
                    <span className="order-time">Hace 2 min</span>
                  </div>
                  <p className="order-customer">{order.nombre_cliente}</p>
                  <p className="order-details">{order.modalidad} - Mesa {order.numero_mesa}</p>
                  
                  <div className="order-actions">
                    <button className="btn-detalle">DETALLE</button>
                    <button className="btn-siguiente" onClick={() => advanceOrder(order)}>SIGUIENTE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;
