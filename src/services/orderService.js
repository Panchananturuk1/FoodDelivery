import { supabase } from '../config/supabase';

export const orderService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      console.log('🔐 OrderService: Checking authentication...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 OrderService: User data:', user ? { id: user.id, email: user.email } : 'No user');
      
      if (!user) throw new Error('User not authenticated');

      console.log('📝 OrderService: Received order data:', JSON.stringify(orderData, null, 2));

      // Validate menu items exist in database before creating order
      console.log('🔍 OrderService: Validating menu items...');
      const menuItemIds = orderData.items.map(item => item.menu_item_id || item.id);
      const { data: validMenuItems, error: validationError } = await supabase
        .from('menu_items')
        .select('id, name')
        .in('id', menuItemIds);

      if (validationError) {
        console.error('❌ OrderService: Error validating menu items:', validationError);
        throw validationError;
      }

      const validIds = validMenuItems.map(item => item.id);
      const invalidIds = menuItemIds.filter(id => !validIds.includes(id));

      if (invalidIds.length > 0) {
        console.error('❌ OrderService: Invalid menu item IDs found:', invalidIds);
        throw new Error(`Invalid menu items in cart. Please refresh and try again. Invalid IDs: ${invalidIds.join(', ')}`);
      }

      console.log('✅ OrderService: All menu items validated successfully');

      // Start a transaction by creating the order first
      console.log('💾 OrderService: Inserting order into database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: orderData.restaurant_id,
          delivery_address_id: orderData.delivery_address_id,
          payment_method_id: orderData.payment_method_id,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          tax_amount: orderData.tax_amount || 0,
          discount_amount: orderData.discount_amount || 0,
          total_amount: orderData.total_amount,
          delivery_instructions: orderData.delivery_instructions,
          special_instructions: orderData.special_instructions,
          estimated_delivery_time: orderData.estimated_delivery_time
        })
        .select()
        .single();

      console.log('📋 OrderService: Order insert result:', { order, orderError });

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id || item.id, // Support both field names
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        total_price: item.total_price || (item.price * item.quantity),
        special_instructions: item.special_instructions
      }));

      console.log('🛒 OrderService: Prepared order items:', JSON.stringify(orderItems, null, 2));
      console.log('💾 OrderService: Inserting order items...');

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      console.log('📋 OrderService: Order items insert result:', { itemsError });

      if (itemsError) throw itemsError;

      console.log('✅ OrderService: Order created successfully with ID:', order.id);
      const response = { data: order, error: null };
      console.log('📤 OrderService: Returning response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('❌ OrderService: Error creating order:', error);
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
            menu_items (
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
            street_address
          ),
          order_items (
            *,
            menu_items (
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