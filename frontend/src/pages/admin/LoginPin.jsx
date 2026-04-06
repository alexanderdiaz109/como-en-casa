import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPin.css';

const LoginPin = () => {
    const [pin, setPin] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

    const handleNumber = (num) => {
        if (pin.length < 4) setPin(prev => prev + num);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, localId })
            });
            const data = await response.json();
            
            if (response.ok && data.token) {
                login(data.token, data.user);
                navigate('/admin');
            } else {
                alert(data.error || "PIN incorrecto");
                setPin("");
            }
        } catch (err) {
            console.error(err);
            alert("Error conectándose al servidor");
            setPin("");
        }
    };

    return (
        <div className="pin-container">
            <h1 className="pin-title">Acceso Recepción</h1>
            
            {/* Visualizador de PIN */}
            <div className="pin-display">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`pin-dot ${pin[i] ? 'pin-dot-filled' : 'pin-dot-empty'}`}>
                        {pin[i] ? '•' : ''}
                    </div>
                ))}
            </div>

            {/* Teclado Numérico */}
            <div className="numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handleNumber(n)} className="numpad-btn">
                        {n}
                    </button>
                ))}
                <button onClick={() => setPin("")} className="numpad-btn-clear">BORRAR</button>
                <button onClick={() => handleNumber(0)} className="numpad-btn">0</button>
                <button onClick={handleSubmit} className="numpad-btn-enter">ENTRAR</button>
            </div>
        </div>
    );
};

export default LoginPin;
