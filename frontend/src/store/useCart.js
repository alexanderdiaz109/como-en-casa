import { create } from 'zustand';

export const useCart = create((set) => ({
  cart: [],
  total: 0,

  // Añadir producto con sus personalizaciones (siempre como nuevo item)
  addToCart: (product, mods, modsReadable) => set((state) => {
    const newItem = {
      ...product,
      mods,         // mods con IDs para enviar al backend
      modsReadable, // mods con nombres legibles para mostrar al usuario
      quantity: 1,
      uniqueId: Date.now(),
      subtotal: parseFloat(product.subtotal || product.precio_base)
    };
    const newCart = [...state.cart, newItem];
    const newTotal = newCart.reduce((acc, item) => acc + (item.subtotal * item.quantity), 0);
    return { cart: newCart, total: newTotal };
  }),

  // Incrementar cantidad de un item existente
  increaseQuantity: (uniqueId) => set((state) => {
    const newCart = state.cart.map(item =>
      item.uniqueId === uniqueId ? { ...item, quantity: item.quantity + 1 } : item
    );
    const newTotal = newCart.reduce((acc, item) => acc + (item.subtotal * item.quantity), 0);
    return { cart: newCart, total: newTotal };
  }),

  // Decrementar cantidad (elimina si llega a 0)
  decreaseQuantity: (uniqueId) => set((state) => {
    const newCart = state.cart
      .map(item => item.uniqueId === uniqueId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter(item => item.quantity > 0);
    const newTotal = newCart.reduce((acc, item) => acc + (item.subtotal * item.quantity), 0);
    return { cart: newCart, total: newTotal };
  }),

  // Quitar del carrito completamente
  removeFromCart: (uniqueId) => set((state) => {
    const newCart = state.cart.filter(item => item.uniqueId !== uniqueId);
    const newTotal = newCart.reduce((acc, item) => acc + (item.subtotal * item.quantity), 0);
    return { cart: newCart, total: newTotal };
  }),

  clearCart: () => set({ cart: [], total: 0 })
}));
