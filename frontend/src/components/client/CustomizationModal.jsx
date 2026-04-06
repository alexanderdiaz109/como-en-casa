import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import './CustomizationModal.css';

const CustomizationModal = ({ product, onClose, onConfirm }) => {
  // Estado para rastrear cambios en ingredientes
  const [mods, setMods] = useState({}); // { id_ingrediente: 'quitar' | 'extra' | 'normal' }
  const ingredientes = product.ingredientes_personalizables || [];
  
  const calculateTotal = () => {
    let extraPrice = 0;
    Object.keys(mods).forEach(id => {
      if (mods[id] === 'extra') {
        const ing = ingredientes.find(i => i.id === id);
        if (ing && ing.precio_extra) {
            extraPrice += parseFloat(ing.precio_extra);
        }
      }
    });
    return (parseFloat(product.precio_base) + extraPrice).toFixed(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* CABECERA CON IMAGEN */}
        <div className="modal-header">
          <img src={product.imagen_url} className="modal-image" alt={product.nombre} />
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} color="#4A2C2A" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="modal-body">
          <h2 className="modal-title">{product.nombre}</h2>
          <p className="modal-desc">{product.descripcion}</p>

          {ingredientes.length > 0 && (
            <>
                <h3 className="modal-subtitle">Personaliza tu orden:</h3>
                <div className="modal-ingredients-list">
                    {ingredientes.map((ing) => {
                        const state = mods[ing.id] || 'normal';
                        return (
                            <div key={ing.id} className="ingredient-row">
                            <span className={`ingredient-name ${state === 'quitar' ? 'ingredient-removed' : ''}`}>
                                {ing.nombre_ingrediente} 
                                {state === 'extra' && <span className="ingredient-extra-price"> (Doble +${ing.precio_extra})</span>}
                            </span>

                            <div className="ingredient-controls">
                                <button 
                                onClick={() => setMods({...mods, [ing.id]: state === 'quitar' ? 'normal' : 'quitar'})}
                                className={`control-btn ${state === 'quitar' ? 'btn-remove-active' : 'btn-default'}`}
                                >
                                <Minus size={20} />
                                </button>
                                
                                <span className="control-label">
                                {state}
                                </span>

                                <button 
                                onClick={() => setMods({...mods, [ing.id]: state === 'extra' ? 'normal' : 'extra'})}
                                className={`control-btn ${state === 'extra' ? 'btn-add-active' : 'btn-default'}`}
                                disabled={!ing.permite_doble}
                                >
                                <Plus size={20} />
                                </button>
                            </div>
                            </div>
                        )
                    })}
                </div>
            </>
          )}
        </div>

        {/* BOTÓN FINAL */}
        <div className="modal-footer">
          <div className="modal-total-section">
            <p className="total-label">Total este platillo</p>
            <p className="total-value">${calculateTotal()}</p>
          </div>
          <button 
            onClick={() => {
              // Construir mods legibles: { "Cebolla": "quitar", "Carne": "extra" }
              const modsReadable = {};
              Object.keys(mods).forEach(id => {
                const ing = ingredientes.find(i => i.id === id);
                if (ing && mods[id] !== 'normal') {
                  modsReadable[ing.nombre_ingrediente] = mods[id];
                }
              });
              onConfirm(product, mods, modsReadable, calculateTotal());
            }}
            className="confirm-btn"
          >
            <Check size={20} /> Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;
