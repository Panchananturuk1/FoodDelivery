import { supabase } from '../config/supabase';

export const orderService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Start a transaction by creating the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: orderData.restaurant_id,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          tax_amount: orderData.tax_amount || 0,
          discount_amount: orderData.discount_amount || 0,
          total_amount: orderData.total_amount,
          delivery_address: orderData.delivery_address,
          special_instructions: orderData.special_instructions,
          payment_method: orderData.payment_method,
          estimated_delivery_time: orderData.estimated_delivery_time
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        food_item_id: item.food_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { data: order, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error: error.message };
    }
  },

  // Get user's orders
  async getUserOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            id,
            name,
            image_url
          ),
          order_items (
            *,
            food_items (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return { data: null, error: error.message };
    }
  },

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            id,
            name,
            image_url,
            phone,
            address
          ),
          order_items (
            *,
            food_items (
              id,
              name,
              image_url,
              description
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return { data: null, error: error.message };
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { data: null, error: error.message };
    }
  },

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
    try {
      const updateData = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updateData.payment_transaction_id = transactionId;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { data: null, error: error.message };
    }
  },

  // Cancel order
  async cancelOrder(orderId, reason = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          special_instructions: reason ? `Cancelled: ${reason}` : 'Cancelled by user',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { data: null, error: error.message };
    }
  },

  // Get order tracking information
  async getOrderTracking(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          estimated_delivery_time,
          actual_delivery_time,
          created_at,
          restaurants (
            name,
            phone
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      return { data: null, error: error.message };
    }
  },

  // Apply coupon to order
  async applyCoupon(couponCode, orderAmount) {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .single();

      if (error) throw error;

      // Check if order meets minimum amount requirement
      if (orderAmount < coupon.minimum_order_amount) {
        throw new Error(`Minimum order amount of $${coupon.minimum_order_amount} required`);
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit exceeded');
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (orderAmount * coupon.discount_value) / 100;
        if (coupon.maximum_discount_amount) {
          discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount);
        }
      } else {
        discountAmount = coupon.discount_value;
      }

      return { 
        data: { 
          coupon, 
          discountAmount: Math.round(discountAmount * 100) / 100 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { data: null, error: error.message };
    }
  },

  // Subscribe to order status updates
  subscribeToOrderUpdates(orderId, callback) {
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from order updates
  unsubscribeFromOrderUpdates(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};