import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart, getCartItemCount } = useCart();
  
  // Create cuisine-specific menu items based on restaurant type
  const getMenuItemsForRestaurant = (restaurant) => {
    const restaurantName = restaurant.name;
    const cuisine = restaurant.cuisine.toLowerCase();

    if (restaurantName === 'Pizza Palace' || cuisine.includes('italian') || cuisine.includes('pizza')) {
      return [
        {
          id: 1,
          name: 'Margherita Pizza',
          description: 'Fresh tomatoes, mozzarella, basil, olive oil',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop&crop=center',
          category: 'Pizza',
        },
        {
          id: 2,
          name: 'Pepperoni Pizza',
          description: 'Pepperoni, mozzarella, tomato sauce',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop&crop=center',
          category: 'Pizza',
        },
        {
          id: 3,
          name: 'Pasta Carbonara',
          description: 'Creamy pasta with bacon, eggs, and parmesan',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop&crop=center',
          category: 'Pasta',
        },
        {
          id: 4,
          name: 'Lasagna',
          description: 'Layers of pasta, meat sauce, and cheese',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&h=200&fit=crop&crop=center',
          category: 'Pasta',
        },
        {
          id: 5,
          name: 'Caesar Salad',
          description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center',
          category: 'Salads',
        },
        {
          id: 6,
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee and mascarpone',
          price: 6.99,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop&crop=center',
          category: 'Desserts',
        },
      ];
    } else if (restaurantName === 'Burger House' || cuisine.includes('american') || cuisine.includes('fast food')) {
      return [
        {
          id: 1,
          name: 'Classic Cheeseburger',
          description: 'Beef patty, cheese, lettuce, tomato, onion, pickles',
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop&crop=center',
          category: 'Burgers',
        },
        {
          id: 2,
          name: 'BBQ Bacon Burger',
          description: 'Beef patty, bacon, BBQ sauce, onion rings',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=300&h=200&fit=crop&crop=center',
          category: 'Burgers',
        },
        {
          id: 3,
          name: 'Crispy Chicken Sandwich',
          description: 'Fried chicken breast, coleslaw, spicy mayo',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1606755962773-d324e2013afd?w=300&h=200&fit=crop&crop=center',
          category: 'Sandwiches',
        },
        {
          id: 4,
          name: 'Loaded Fries',
          description: 'Crispy fries with cheese, bacon, and green onions',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop&crop=center',
          category: 'Sides',
        },
        {
          id: 5,
          name: 'Buffalo Wings',
          description: '8 pieces of spicy buffalo wings with ranch',
          price: 10.99,
          image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=200&fit=crop&crop=center',
          category: 'Appetizers',
        },
        {
          id: 6,
          name: 'Chocolate Milkshake',
          description: 'Thick chocolate milkshake with whipped cream',
          price: 5.99,
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop&crop=center',
          category: 'Beverages',
        },
      ];
    } else if (restaurantName === 'Sushi Express' || cuisine.includes('japanese') || cuisine.includes('sushi')) {
      return [
        {
          id: 1,
          name: 'California Roll',
          description: 'Crab, avocado, cucumber with sesame seeds',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300&h=200&fit=crop&crop=center',
          category: 'Sushi Rolls',
        },
        {
          id: 2,
          name: 'Salmon Nigiri',
          description: 'Fresh salmon over seasoned sushi rice (2 pieces)',
          price: 6.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop&crop=center',
          category: 'Nigiri',
        },
        {
          id: 3,
          name: 'Dragon Roll',
          description: 'Eel, cucumber, avocado with eel sauce',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=200&fit=crop&crop=center',
          category: 'Sushi Rolls',
        },
        {
          id: 4,
          name: 'Miso Soup',
          description: 'Traditional soybean paste soup with tofu and seaweed',
          price: 3.99,
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=200&fit=crop&crop=center',
          category: 'Soups',
        },
        {
          id: 5,
          name: 'Chicken Teriyaki',
          description: 'Grilled chicken with teriyaki sauce and steamed rice',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&crop=center',
          category: 'Main Course',
        },
        {
          id: 6,
          name: 'Green Tea Ice Cream',
          description: 'Traditional Japanese green tea flavored ice cream',
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop&crop=center',
          category: 'Desserts',
        },
      ];
    } else if (restaurantName === 'Taco Fiesta' || cuisine.includes('mexican') || cuisine.includes('tacos')) {
      return [
        {
          id: 1,
          name: 'Beef Tacos',
          description: 'Seasoned ground beef with lettuce, cheese, tomatoes',
          price: 9.99,
          image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=300&h=200&fit=crop&crop=center',
          category: 'Tacos',
        },
        {
          id: 2,
          name: 'Chicken Quesadilla',
          description: 'Grilled chicken and cheese in a flour tortilla',
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=300&h=200&fit=crop&crop=center',
          category: 'Quesadillas',
        },
        {
          id: 3,
          name: 'Carnitas Burrito',
          description: 'Slow-cooked pork with rice, beans, and salsa',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=200&fit=crop&crop=center',
          category: 'Burritos',
        },
        {
          id: 4,
          name: 'Guacamole & Chips',
          description: 'Fresh avocado dip with crispy tortilla chips',
          price: 7.99,
          image: 'https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=300&h=200&fit=crop&crop=center',
          category: 'Appetizers',
        },
        {
          id: 5,
          name: 'Fish Tacos',
          description: 'Grilled fish with cabbage slaw and lime crema',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=300&h=200&fit=crop&crop=center',
          category: 'Tacos',
        },
        {
          id: 6,
          name: 'Churros',
          description: 'Fried dough pastry with cinnamon sugar and chocolate',
          price: 5.99,
          image: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=300&h=200&fit=crop&crop=center',
          category: 'Desserts',
        },
      ];
    } else {
      // Default menu for any other restaurant
      return [
        {
          id: 1,
          name: 'House Special',
          description: 'Chef\'s signature dish with seasonal ingredients',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&crop=center',
          category: 'Specials',
        },
        {
          id: 2,
          name: 'Garden Salad',
          description: 'Fresh mixed greens with house dressing',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center',
          category: 'Salads',
        },
        {
          id: 3,
          name: 'Grilled Chicken',
          description: 'Herb-marinated grilled chicken breast with vegetables',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop&crop=center',
          category: 'Main Course',
        },
      ];
    }
  };

  const [menuItems] = useState(getMenuItemsForRestaurant(restaurant));

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
        style={styles.scrollView}
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