import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // Add item to cart
  const addToCart = (item, restaurant) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item to cart
        return [...prevItems, {
          ...item,
          quantity: 1,
          restaurant: restaurant.name,
          restaurantId: restaurant.id,
          addedAt: new Date().toISOString(),
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate delivery fee (could be dynamic based on restaurant)
  const getDeliveryFee = () => {
    if (cartItems.length === 0) return 0;
    // For now, use a fixed delivery fee, but this could be restaurant-specific
    return 2.99;
  };

  // Calculate tax (8% for example)
  const getTax = () => {
    return getSubtotal() * 0.08;
  };

  // Calculate total
  const getTotal = () => {
    return getSubtotal() + getDeliveryFee() + getTax();
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if cart has items from multiple restaurants
  const hasMultipleRestaurants = () => {
    const restaurantIds = [...new Set(cartItems.map(item => item.restaurantId))];
    return restaurantIds.length > 1;
  };

  // Get current restaurant (if all items are from same restaurant)
  const getCurrentRestaurant = () => {
    if (cartItems.length === 0) return null;
    return {
      id: cartItems[0].restaurantId,
      name: cartItems[0].restaurant,
    };
  };

  // Set delivery address
  const updateDeliveryAddress = (address) => {
    setDeliveryAddress(address);
  };

  // Validate and clean cart items (remove items that don't exist in database)
  const validateAndCleanCart = async () => {
    if (cartItems.length === 0) return;

    try {
      console.log('🔍 CartContext: Validating cart items...');
      const menuItemIds = cartItems.map(item => item.id);
      
      const { data: validMenuItems, error } = await supabase
        .from('menu_items')
        .select('id')
        .in('id', menuItemIds);

      if (error) {
        console.error('❌ CartContext: Error validating cart items:', error);
        return;
      }

      const validIds = validMenuItems.map(item => item.id);
      const invalidItems = cartItems.filter(item => !validIds.includes(item.id));

      if (invalidItems.length > 0) {
        console.log('🧹 CartContext: Removing invalid items from cart:', invalidItems.map(item => item.name));
        setCartItems(prevItems => prevItems.filter(item => validIds.includes(item.id)));
        return invalidItems.length;
      }

      console.log('✅ CartContext: All cart items are valid');
      return 0;
    } catch (error) {
      console.error('💥 CartContext: Error during cart validation:', error);
      return 0;
    }
  };

  const value = {
    cartItems,
    deliveryAddress,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getTax,
    getTotal,
    getCartItemCount,
    hasMultipleRestaurants,
    getCurrentRestaurant,
    updateDeliveryAddress,
    validateAndCleanCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;