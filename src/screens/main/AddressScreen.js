import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { orderService } from '../../services/orderService';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from '../../components/CustomAlert';

const AddressScreen = ({ navigation }) => {
  const { 
    updateDeliveryAddress, 
    deliveryAddress, 
    getTotal, 
    getSubtotal, 
    getDeliveryFee, 
    getTax, 
    cartItems, 
    getCurrentRestaurant,
    clearCart,
    validateAndCleanCart
  } = useCart();
  const { user, session } = useAuth();
  const { showAlert, alertConfig, hideAlert } = useAlert();
  const [selectedAddress, setSelectedAddress] = useState(deliveryAddress);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: '',
  });

  // Load addresses from database on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await profileService.getDeliveryAddresses();
      if (error) {
        console.error('Error loading addresses:', error);
        showAlert('Error', 'Failed to load saved addresses');
      } else {
        setSavedAddresses(data || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      showAlert('Error', 'Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    updateDeliveryAddress(address);
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const addressData = {
        label: newAddress.label,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zipCode,
        instructions: newAddress.instructions,
      };

      const { data, error } = await profileService.addDeliveryAddress(addressData);
      
      if (error) {
        showAlert('Error', 'Failed to save address. Please try again.');
        return;
      }

      // Reload addresses to get the updated list
      await loadAddresses();
      
      // Select the newly added address
      if (data) {
        handleSelectAddress(data);
      }

      setShowAddForm(false);
      setNewAddress({
        label: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: '',
      });
      showAlert('Success', 'Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      showAlert('Error', 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    console.log('🔥 BUTTON CLICKED - handleProceedToPayment called!');
    console.log('🔥 Selected address:', selectedAddress);
    console.log('🔥 Cart items:', cartItems);
    console.log('🔥 Cart items length:', cartItems?.length);
    
    if (!selectedAddress) {
      console.log('❌ No selected address');
      showAlert('Error', 'Please select a delivery address');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      console.log('❌ Cart is empty');
      showAlert('Error', 'Your cart is empty');
      return;
    }

    console.log('✅ All checks passed, showing confirmation dialog...');
    console.log('📍 Address for confirmation:', `${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip_code}`);
    console.log('💰 Total for confirmation:', getTotal().toFixed(2));
    
    showAlert(
      'Order Confirmation',
      `Your order will be delivered to:\n${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip_code}\n\nTotal: $${getTotal().toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => handleOrderPlacement(),
        },
      ]
    );
  };

  const handleOrderPlacement = async () => {
    console.log('🎯 USER CONFIRMED ORDER - Starting actual order placement...');
    console.log('🔍 About to start try-catch block...');
    
    // Check authentication state
    console.log('👤 Current user:', user);
    console.log('🔐 User session:', session);
    
    try {
      console.log('🚀 Starting order placement process...');
      setLoading(true);
      
      // Validate cart items first
      console.log('🔍 Validating cart items...');
      const removedItemsCount = await validateAndCleanCart();
      if (removedItemsCount > 0) {
        showAlert('Cart Updated', `${removedItemsCount} invalid item(s) were removed from your cart. Please review your order.`);
        setLoading(false);
        return;
      }
      
      // Get the current restaurant from cart items
      const currentRestaurant = getCurrentRestaurant();
      console.log('🏪 Current restaurant:', currentRestaurant);
      
      if (!currentRestaurant) {
        console.error('❌ No restaurant found in cart');
        showAlert('Error', 'Unable to identify restaurant. Please try again.');
        return;
      }

      // Log cart items
      console.log('🛒 Cart items:', cartItems);
      console.log('📍 Selected address:', selectedAddress);

      // Prepare order data
      const orderData = {
        restaurant_id: currentRestaurant.id,
        delivery_address_id: selectedAddress.id,
        payment_method_id: null, // Will be set when payment methods are implemented
        subtotal: getSubtotal(),
        delivery_fee: getDeliveryFee(),
        tax_amount: getTax(),
        total_amount: getTotal(),
        special_instructions: selectedAddress.instructions || '',
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          special_instructions: item.specialInstructions || ''
        }))
      };

      console.log('📦 Order data prepared:', JSON.stringify(orderData, null, 2));

      // Create the order
      console.log('📞 Calling orderService.createOrder...');
      const response = await orderService.createOrder(orderData);
      console.log('📋 Raw response from orderService:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ Error creating order:', response.error);
        showAlert('Error', 'Failed to place order. Please try again.');
        return;
      }

      if (!response.data) {
        console.error('❌ No order data received despite no error');
        showAlert('Error', 'Failed to place order. Please try again.');
        return;
      }

      const order = response.data;
      console.log('✅ Order created successfully:', order);

      // Clear the cart after successful order
      clearCart();
      console.log('🧹 Cart cleared');
      
      showAlert(
        'Success', 
        `Order placed successfully! Order #${order.order_number}\n\nYou will receive a confirmation shortly.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
          }
        ]
      );
    } catch (error) {
      console.error('💥 Exception during order placement:', error);
      showAlert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Order placement process finished');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    showAlert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await profileService.deleteDeliveryAddress(addressId);
              
              if (error) {
                showAlert('Error', 'Failed to delete address. Please try again.');
                return;
              }

              // If the deleted address was selected, clear selection
              if (selectedAddress?.id === addressId) {
                setSelectedAddress(null);
                updateDeliveryAddress(null);
              }

              // Reload addresses
              await loadAddresses();
              showAlert('Success', 'Address deleted successfully!');
            } catch (error) {
              console.error('Error deleting address:', error);
              showAlert('Error', 'Failed to delete address. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderAddressItem = (address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressItem,
        selectedAddress?.id === address.id && styles.selectedAddress,
      ]}
      onPress={() => handleSelectAddress(address)}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          <Ionicons
            name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'business' : 'location'}
            size={20}
            color="#FF6B6B"
          />
          <Text style={styles.addressLabel}>{address.label}</Text>
        </View>
        <View style={styles.addressActions}>
          {selectedAddress?.id === address.id && (
            <Ionicons name="checkmark-circle" size={24} color="#FF6B6B" style={styles.checkIcon} />
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAddress(address.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>
        {address.street}, {address.city}, {address.state} {address.zipCode}
      </Text>
      {address.instructions && (
        <Text style={styles.instructionsText}>Instructions: {address.instructions}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : savedAddresses.length > 0 ? (
            savedAddresses.map(renderAddressItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No saved addresses</Text>
              <Text style={styles.emptySubtext}>Add your first delivery address below</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF6B6B" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Address</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Address Label (e.g., Home, Work)"
                value={newAddress.label}
                onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="State"
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                value={newAddress.zipCode}
                onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Delivery Instructions (Optional)"
                value={newAddress.instructions}
                onChangeText={(text) => setNewAddress({ ...newAddress, instructions: text })}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddNewAddress}
                >
                  <Text style={styles.saveButtonText}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${getTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.proceedButton, 
                (!selectedAddress || loading) && styles.disabledButton
              ]}
              onPress={() => {
                console.log('🚨 PLACE ORDER BUTTON PRESSED!');
                if (!loading) {
                  handleProceedToPayment();
                }
              }}
              disabled={!selectedAddress || loading}
            >
              <Text style={styles.proceedButtonText}>
                {loading ? 'Processing...' : 'Place Order'}
              </Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    // Web-specific container styling
    ...(Platform.OS === 'web' && {
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  scrollView: {
    flex: 1,
    // Web-specific styling for proper scrolling
    ...(Platform.OS === 'web' && {
      height: '100%',
      maxHeight: '100%',
      overflow: 'auto',
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addressItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAddress: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 10,
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default AddressScreen;