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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        id: 1,
        name: 'Pizza Palace',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        rating: 4.5,
        deliveryTime: '25-30 min',
        cuisine: 'Italian',
        deliveryFee: 2.99,
      },
      {
        id: 2,
        name: 'Burger Barn',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
        rating: 4.3,
        deliveryTime: '20-25 min',
        cuisine: 'American',
        deliveryFee: 1.99,
      },
      {
        id: 3,
        name: 'Sushi Spot',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
        rating: 4.7,
        deliveryTime: '30-35 min',
        cuisine: 'Japanese',
        deliveryFee: 3.99,
      },
    ]);

    setCategories([
      { id: 1, name: 'Pizza', icon: '🍕' },
      { id: 2, name: 'Burgers', icon: '🍔' },
      { id: 3, name: 'Sushi', icon: '🍣' },
      { id: 4, name: 'Chinese', icon: '🥡' },
      { id: 5, name: 'Mexican', icon: '🌮' },
      { id: 6, name: 'Indian', icon: '🍛' },
    ]);
  }, []);

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
          <Text style={styles.deliveryFee}>${item.deliveryFee} delivery</Text>
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

  // Handle logout
  const handleLogout = () => {
     console.log('🟡 HomeScreen: handleLogout called');
     setShowUserMenu(false);
     
     Alert.alert(
       'Logout',
       'Are you sure you want to logout?',
       [
         { text: 'Cancel', style: 'cancel' },
         {
           text: 'Logout',
           style: 'destructive',
           onPress: async () => {
             console.log('🟡 HomeScreen: User confirmed logout, calling signOut...');
             try {
               const result = await signOut();
               console.log('🟡 HomeScreen: signOut result:', result);
               if (!result.success) {
                 console.error('🟡 HomeScreen: signOut failed:', result.error);
                 Alert.alert('Error', 'Failed to logout. Please try again.');
               } else {
                 console.log('🟡 HomeScreen: signOut successful, should redirect now');
               }
             } catch (error) {
               console.error('🟡 HomeScreen: Exception during signOut:', error);
               Alert.alert('Error', 'An unexpected error occurred during logout.');
             }
           },
         },
       ]
     );
   };

  // Handle view profile
  const handleViewProfile = () => {
    setShowUserMenu(false);
    navigation.navigate('Profile');
  };





  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantsList}
          />
        </View>
      </ScrollView>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <TouchableOpacity 
            style={styles.userMenuContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.userMenuHeader}>
              <View style={styles.userMenuAvatar}>
                <Text style={styles.userMenuInitials}>{getUserInitials()}</Text>
              </View>
              <View style={styles.userMenuInfo}>
                <Text style={styles.userMenuEmail}>{user?.email || 'User'}</Text>
                <Text style={styles.userMenuSubtext}>Food Delivery User</Text>
              </View>
            </View>
            
            <View style={styles.userMenuDivider} />
            
            <TouchableOpacity 
              style={styles.userMenuItem}
              onPress={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
            >
              <Ionicons name="person-outline" size={20} color="#333" />
              <Text style={styles.userMenuItemText}>View Profile</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.userMenuItem}
              onPress={async (e) => {
                console.log('🟡 Modal: Logout button pressed - using direct logout');
                e.stopPropagation();
                setShowUserMenu(false);
                
                // Use the same direct logout functionality that worked in test button
                try {
                  console.log('🟡 Modal: Calling signOut directly...');
                  const result = await signOut();
                  console.log('🟡 Modal: Direct signOut result:', result);
                  if (!result.success) {
                    console.error('🟡 Modal: Direct signOut failed:', result.error);
                    Alert.alert('Error', 'Failed to logout. Please try again.');
                  } else {
                    console.log('🟡 Modal: Direct signOut successful, should redirect now');
                  }
                } catch (error) {
                  console.error('🟡 Modal: Exception during direct signOut:', error);
                  Alert.alert('Error', 'An unexpected error occurred during logout.');
                }
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={[styles.userMenuItemText, { color: '#FF6B6B' }]}>Logout</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 15,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 5,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  restaurantInfo: {
    padding: 15,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
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
});

export default HomeScreen;