import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import CustomizationModal from '../../components/client/CustomizationModal';
import Navbar from '../../components/client/Navbar';
import { useCart } from '../../store/useCart';
import './Menu.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: catData } = await supabase
        .from('categorias')
        .select('*')
        .eq('id_local', LOCAL_ID)
        .order('orden', { ascending: true });

      const { data: prodData } = await supabase
        .from('productos')
        .select('*, ingredientes_personalizables(*)')
        .eq('id_local', LOCAL_ID)
        .eq('visible_menu', true);

      if (catData) {
        setCategories(catData);
        setActiveCategory(catData[0]?.id || null);
      }
      if (prodData) setProducts(prodData);
    };
    fetchMenu();
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.id_categoria === activeCategory)
    : products;

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.nombre || 'Platillos';

  return (
    <div className="menu-page">
      <Navbar />

      {/* CATEGORÍAS COMO PÍLDORAS HORIZONTALES */}
      <div className="category-pills-wrapper">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* TÍTULO DE SECCIÓN */}
      <h2 className="menu-section-title">{activeCategoryName}</h2>

      {/* GRID DE PRODUCTOS */}
      <main className="menu-main">
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
              <img
                src={product.imagen_url || 'https://placehold.co/400x200/F5F5DC/8B4513?text=Platillo'}
                alt={product.nombre}
                className="product-image"
              />
              <div className="product-info">
                <div className="product-header-row">
                  <h3 className="product-name">{product.nombre}</h3>
                  <span className="product-price">${product.precio_base}</span>
                </div>
                <p className="product-desc">{product.descripcion}</p>
                <button
                  className="add-button-full"
                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                >
                  Personalizar Platillo
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE PERSONALIZACIÓN */}
      {selectedProduct && (
        <CustomizationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(product, mods, modsReadable, subtotal) => {
            addToCart({ ...product, subtotal: parseFloat(subtotal) }, mods, modsReadable);
            setSelectedProduct(null);
            navigate('/cart');
          }}
        />
      )}
    </div>
  );
};

export default Menu;
