// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Es mejor usar SERVICE_ROLE en el backend para que las interacciones confíen en el servidor y superen RLS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

module.exports = (io) => {
    router.post('/confirm', async (req, res) => {
        const { customer, cart, total, deliveryType, localId } = req.body;

        try {
            // 1. Insertar la cabecera del pedido (Tabla: pedidos)
            const { data: order, error: orderError } = await supabase
                .from('pedidos')
                .insert([{
                    id_local: localId,
                    nombre_cliente: customer.name,
                    telefono: customer.phone,
                    modalidad: deliveryType,
                    numero_mesa: customer.table || null,
                    direccion_envio: customer.address || null,
                    referencia_ubicacion: customer.landmark || null,
                    total_pago: total,
                    estado: 'entrante'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insertar el detalle de los productos (Tabla: detalle_pedido)
            const details = cart.map(item => ({
                id_pedido: order.id,
                id_producto: item.id,
                cantidad: item.quantity || 1,
                personalizacion: item.mods, // El JSON que analizamos
                subtotal: item.subtotal
            }));

            const { error: detailsError } = await supabase
                .from('detalle_pedido')
                .insert(details);

            if (detailsError) throw detailsError;

            // 3. ¡TIEMPO REAL! Notificar al Admin de la Sucursal Timucuy
            // Usamos un "room" basado en el localId para que no le llegue a otros locales
            io.to(localId).emit('new_order', {
                message: "¡Nuevo pedido recibido!",
                orderId: order.id,
                customerName: order.nombre_cliente,
                total: order.total_pago
            });

            res.status(201).json({ 
                success: true, 
                orderId: order.id,
                message: "Pedido procesado correctamente" 
            });

        } catch (error) {
            console.error("Error al procesar pedido:", error);
            res.status(500).json({ error: "No se pudo crear el pedido" });
        }
    });

    return router;
};
