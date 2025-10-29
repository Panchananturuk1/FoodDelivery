import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E53']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="restaurant" size={100} color="white" />
        <Text style={styles.title}>FoodDelivery</Text>
        <Text style={styles.subtitle}>Delicious food at your doorstep</Text>
        <ActivityIndicator 
          size="large" 
          color="white" 
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;