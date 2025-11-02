import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { restaurantService } from '../../services/restaurantService';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart, getCartItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuData();
  }, [restaurant.id]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await restaurantService.getRestaurantById(restaurant.id);
      
      if (response && response.data && response.data.menu_items) {
        const data = response.data;
        setMenuData(data);
        
        // Set first category as default if available
        if (data.menu_categories && data.menu_categories.length > 0) {
          const firstCategoryId = data.menu_categories[0].id;
          setSelectedCategory(firstCategoryId);
        }
      } else {
        setError('No menu items found for this restaurant');
      }
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemsForCategory = (categoryId) => {
    if (!menuData || !menuData.menu_items) return [];
    return menuData.menu_items.filter(item => item.category_id === categoryId);
  };
  
  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart!`);
  };

  const renderMenuItem = (item) => (
    <View key={item.id} style={styles.menuItem}>
      <Image 
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&crop=center' }} 
        style={styles.menuItemImage} 
      />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
        <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryTabs = () => {
    if (!menuData || !menuData.menu_categories) return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {menuData.menu_categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.selectedCategoryTab
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.id && styles.selectedCategoryTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMenuData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentMenuItems = selectedCategory ? getMenuItemsForCategory(selectedCategory) : [];



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
          {renderCategoryTabs()}
          {currentMenuItems.length > 0 ? (
            currentMenuItems.map(renderMenuItem)
          ) : (
            <Text style={styles.noItemsText}>No items available in this category</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTabs: {
    marginBottom: 20,
  },
  categoryTabsContent: {
    paddingHorizontal: 5,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  selectedCategoryTab: {
    backgroundColor: '#FF6B6B',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryTabText: {
    color: 'white',
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default RestaurantDetailScreen;