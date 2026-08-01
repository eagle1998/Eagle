import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'eagle_cart';

function loadCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  }, [items]);

  const addToCart = useCallback((product) => {
    setItems(prev => {
      const id = product.id || product._id;
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        image: product.images?.[0] || '',
        quantity: 1,
        category: typeof product.category === 'object' && product.category ? product.category.name : (product.category || ''),
        brand: product.brand || ''
      }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((sum, i) => {
      const unitPrice = i.discount > 0 ? i.price * (1 - i.discount / 100) : i.price;
      return sum + unitPrice * i.quantity;
    }, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const cartTotal = useMemo(() => getCartTotal(), [getCartTotal]);
  const cartCount = useMemo(() => getCartCount(), [getCartCount]);
  const cartItems = items;

  const value = useMemo(() => ({
    // canonical names
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    // short aliases used by CartDrawer and other components
    items: cartItems,
    total: cartTotal,
    count: cartCount,
    add: addToCart,
    remove: removeFromCart,
    updateQty: updateQuantity,
    clear: clearCart,
  }), [cartItems, cartTotal, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
