import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart, getCartItemCount } = useCart();
  
  const [menuItems] = useState([
    {
      id: 1,
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, basil, olive oil',
      price: 12.99,
      image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Margherita+Pizza',
      category: 'Pizza',
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      description: 'Pepperoni, mozzarella, tomato sauce',
      price: 14.99,
      image: 'https://via.placeholder.com/300x200/E74C3C/FFFFFF?text=Pepperoni+Pizza',
      category: 'Pizza',
    },
    {
      id: 3,
      name: 'Caesar Salad',
      description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
      price: 8.99,
      image: 'https://via.placeholder.com/300x200/27AE60/FFFFFF?text=Caesar+Salad',
      category: 'Salads',
    },
    {
      id: 4,
      name: 'Grilled Chicken',
      description: 'Herb-marinated grilled chicken breast with vegetables',
      price: 16.99,
      image: 'https://via.placeholder.com/300x200/F39C12/FFFFFF?text=Grilled+Chicken',
      category: 'Main Course',
    },
    {
      id: 5,
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon, eggs, and parmesan',
      price: 13.99,
      image: 'https://via.placeholder.com/300x200/FFD700/FFFFFF?text=Pasta+Carbonara',
      category: 'Pasta',
    },
    {
      id: 6,
      name: 'Fish & Chips',
      description: 'Beer-battered fish with crispy fries',
      price: 15.99,
      image: 'https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Fish+%26+Chips',
      category: 'Main Course',
    },
    {
      id: 7,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with vanilla ice cream',
      price: 6.99,
      image: 'https://via.placeholder.com/300x200/8E44AD/FFFFFF?text=Chocolate+Cake',
      category: 'Desserts',
    },
    {
      id: 8,
      name: 'Fresh Juice',
      description: 'Freshly squeezed orange juice',
      price: 4.99,
      image: 'https://via.placeholder.com/300x200/F1C40F/FFFFFF?text=Fresh+Juice',
      category: 'Beverages',
    },
  ]);

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart!`);
  };

  const renderMenuItem = (item) => (
    <View key={item.id} style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
        <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        >
            <Ionicons name="bag" size={24} color="white" />
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          
          <View style={styles.restaurantDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.detailText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.detailText}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bicycle" size={16} color="#666" />
              <Text style={styles.detailText}>${restaurant.deliveryFee} delivery</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>
          {menuItems.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  imageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cartButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 10,
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestaurantDetailScreen;