import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  useEffect(() => {
    // Mock data - replace with Supabase query
    const mockRestaurants = [
      {
        id: 1,
        name: 'Pizza Palace',
        image: 'https://via.placeholder.com/400x250/FF6B6B/FFFFFF?text=Pizza+Palace',
        rating: 4.5,
        deliveryTime: '25-30 min',
        cuisine: 'Italian',
        deliveryFee: 2.99,
        description: 'Authentic Italian pizza and pasta',
      },
      {
        id: 2,
        name: 'Burger Barn',
        image: 'https://via.placeholder.com/400x250/4ECDC4/FFFFFF?text=Burger+Barn',
        rating: 4.3,
        deliveryTime: '20-25 min',
        cuisine: 'American',
        deliveryFee: 1.99,
        description: 'Juicy burgers and crispy fries',
      },
      {
        id: 3,
        name: 'Sushi Spot',
        image: 'https://via.placeholder.com/400x250/45B7D1/FFFFFF?text=Sushi+Spot',
        rating: 4.7,
        deliveryTime: '30-35 min',
        cuisine: 'Japanese',
        deliveryFee: 3.49,
        description: 'Fresh sushi and Japanese cuisine',
      },
      {
        id: 4,
        name: 'Taco Time',
        image: 'https://via.placeholder.com/400x250/FF9500/FFFFFF?text=Taco+Time',
        rating: 4.2,
        deliveryTime: '15-20 min',
        cuisine: 'Mexican',
        deliveryFee: 1.49,
        description: 'Authentic Mexican tacos and burritos',
      },
      {
        id: 5,
        name: 'Thai Garden',
        image: 'https://via.placeholder.com/400x250/E74C3C/FFFFFF?text=Thai+Garden',
        rating: 4.6,
        deliveryTime: '35-40 min',
        cuisine: 'Thai',
        deliveryFee: 2.49,
        description: 'Spicy and flavorful Thai dishes',
      },
      {
        id: 6,
        name: 'Healthy Bowls',
        image: 'https://via.placeholder.com/400x250/27AE60/FFFFFF?text=Healthy+Bowls',
        rating: 4.4,
        deliveryTime: '20-25 min',
        cuisine: 'Healthy',
        deliveryFee: 1.99,
        description: 'Fresh salads and healthy bowls',
      },
    ];
    setRestaurants(mockRestaurants);
    setFilteredRestaurants(mockRestaurants);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, restaurants]);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantDescription}>{item.description}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisine"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]} // ensure space for tab bar
        showsVerticalScrollIndicator={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
  list: {
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
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
    fontSize: 14,
    color: '#666',
  },
  deliveryFee: {
    fontSize: 14,
    color: '#666',
  },
});

export default RestaurantsScreen;