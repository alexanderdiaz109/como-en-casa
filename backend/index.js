// CEC/backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permitir conexiones de cualquier origen por ahora
});

app.use(cors());
app.use(express.json());

// Inicializar cliente de Supabase (Usamos SERVICE_ROLE en el backend para saltarnos RLS)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

// PRUEBA DE CONEXIÓN INICIAL
app.get('/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('locales')
            .select('*')
            .eq('id', process.env.LOCAL_ID_TIMUCUY);

        if (error) throw error;
        
        res.json({
            status: "Conexión Exitosa 🚀",
            sucursal: data.length > 0 ? data[0].nombre_sucursal : "No se encontró el local (posible problema de RLS o ID incorrecto)",
            datos: data,
            mensaje: "El backend ya habla con Supabase"
        });
    } catch (err) {
        res.status(500).json({ status: "Error de conexión", error: err.message });
    }
});

// Escuchar conexiones de Socket.io
io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Cuando la tablet admin se conecte, se unirá a su "room" con su Local ID
    socket.on('join_local', (localId) => {
        socket.join(localId);
        console.log(`Admin (Socket ${socket.id}) se unió a la sala de la sucursal: ${localId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

// Registrar Rutas
const ordersRoutes = require('./routes/orders')(io);
const authRoutes = require('./routes/auth');

app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor CEC corriendo en http://localhost:${PORT}`);
});
