// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Considerar usar una variable de entorno en prod (process.env.JWT_SECRET)
const SECRET_KEY = "Tu_Clave_Súper_Secreta_Antigraviti";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/login-pin', async (req, res) => {
    const { pin, localId } = req.body;

    // 1. Buscamos al usuario en Supabase que coincida con el PIN y el Local
    const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_local', localId)
        .eq('pin', pin) // En producción usaríamos hashing
        .single();

    if (error || !user) {
        return res.status(401).json({ error: "PIN incorrecto para esta sucursal" });
    }

    // 2. Generamos el JWT
    const token = jwt.sign(
        { userId: user.id, role: user.rol, localId: user.id_local },
        SECRET_KEY,
        { expiresIn: '12h' } 
    );

    res.json({ token, user: { nombre: user.nombre, rol: user.rol } });
});

module.exports = router;
