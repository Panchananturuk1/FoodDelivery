import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Mock data - replace with actual Supabase queries
    setFeaturedRestaurants([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Pizza Palace',
        cuisine: 'Italian, Pizza',
        rating: 4.5,
        deliveryTime: '25-30 min',
        deliveryFee: 'Free',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Burger Barn',
        cuisine: 'American, Fast Food',
        rating: 4.2,
        deliveryTime: '20-25 min',
        deliveryFee: '$2.99',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&crop=center',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Sushi Spot',
        cuisine: 'Japanese, Sushi',
        rating: 4.7,
        deliveryTime: '30-35 min',
        deliveryFee: '$1.99',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop&crop=center',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Spice Garden',
        cuisine: 'Indian',
        rating: 4.3,
        deliveryTime: '15-20 min',
        deliveryFee: 'Free',
        image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop&crop=center',
      },
    ]);

    setCategories([
      { id: 1, name: 'Pizza', icon: '🍕', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop&crop=center' },
      { id: 2, name: 'Burgers', icon: '🍔', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&crop=center' },
      { id: 3, name: 'Sushi', icon: '🍣', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=200&h=200&fit=crop&crop=center' },
      { id: 4, name: 'Tacos', icon: '🌮', image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=200&h=200&fit=crop&crop=center' },
      { id: 5, name: 'Desserts', icon: '🍰', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&crop=center' },
    ]);
  }, []);

  const isFocused = useIsFocused();
  useEffect(() => {
    // Ensure Home modal does not block interactions on other screens
    if (!isFocused) {
      setShowUserMenu(false);
    }
  }, [isFocused]);

  const renderRestaurantCard = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <View style={styles.restaurantDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
          <Text style={styles.deliveryFee}>{item.deliveryFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const email = user.email;
    return email.charAt(0).toUpperCase();
  };

  // Handle logout with detailed debugging
  const handleLogout = async () => {
    setShowUserMenu(false);
    
    console.log('🔴 LOGOUT: Starting logout...');
    console.log('🔴 LOGOUT: Current user:', user?.email || 'null');
    console.log('🔴 LOGOUT: User object:', user);
    
    try {
      console.log('🔴 LOGOUT: Calling signOut()...');
      const result = await signOut();
      console.log('🔴 LOGOUT: signOut() result:', result);
      console.log('🔴 LOGOUT: Result type:', typeof result);
      console.log('🔴 LOGOUT: Result keys:', Object.keys(result || {}));
      
      if (result.error) {
        console.log('🔴 LOGOUT: Error occurred:', result.error.message);
        Alert.alert('Logout Error', result.error.message);
      } else {
        console.log('🔴 LOGOUT: Logout successful, error is:', result.error);
        Alert.alert('Logout Success', 'Logout completed successfully');
      }
    } catch (e) {
      console.error('🔴 LOGOUT: Exception during logout:', e);
      Alert.alert('Logout Exception', e.message);
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    setShowUserMenu(false);
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#FF6B6B" />
            <Text style={styles.locationText}>Deliver to</Text>
            <Text style={styles.address}>123 Main St, City</Text>
          </View>
          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.notificationButton}>
               <Ionicons name="notifications-outline" size={24} color="#333" />
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.userButton}
               onPress={() => setShowUserMenu(true)}
             >
               <Text style={styles.userInitials}>{getUserInitials()}</Text>
             </TouchableOpacity>
           </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants or food"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Promotional Banner */}
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Free Delivery</Text>
            <Text style={styles.promoSubtitle}>On orders over $25</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="bicycle" size={60} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Restaurants')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredRestaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.restaurantsList}
          />
        </View>
      </ScrollView>

      {/* User Menu Overlay - Web Compatible */}
      {showUserMenu && isFocused && (
        <View 
          style={styles.modalOverlay}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel="User menu"
        >
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={() => setShowUserMenu(false)}
            accessible={false}
          />
          <View 
            style={styles.userMenuContainer}
            accessible={true}
            accessibilityRole="menu"
          >
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                navigation.navigate('Profile');
              }}
            >
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.userMenuItemText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                navigation.navigate('Orders');
              }}
            >
              <Ionicons name="receipt-outline" size={24} color="#333" />
              <Text style={styles.userMenuItemText}>Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                navigation.navigate('Settings');
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={styles.userMenuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.userMenuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <Text style={[styles.userMenuItemText, styles.logoutMenuText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  address: {
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  promoBanner: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  promoSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  restaurantsList: {
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  restaurantImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  restaurantInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
  },
  // User Button Styles
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Overlay Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  userMenuContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  userMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  userMenuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userMenuInitials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userMenuInfo: {
    flex: 1,
  },
  userMenuEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userMenuSubtext: {
    fontSize: 12,
    color: '#666',
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userMenuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutMenuText: {
    color: '#FF6B6B',
  },
});

export default HomeScreen;