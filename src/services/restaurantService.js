import { supabase } from '../config/supabase';

export const restaurantService = {
  // Get all active restaurants
  async getRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return { data: null, error: error.message };
    }
  },

  // Get restaurant by ID with food items
  async getRestaurantById(restaurantId) {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .eq('is_active', true)
        .single();

      if (restaurantError) throw restaurantError;

      const { data: foodItems, error: foodError } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            id,
            name
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('display_order');

      if (foodError) throw foodError;

      // Get unique categories from menu items
      const categoriesMap = new Map();
      foodItems.forEach(item => {
        if (item.menu_categories) {
          categoriesMap.set(item.menu_categories.id, item.menu_categories);
        }
      });
      const menu_categories = Array.from(categoriesMap.values());

      return { 
        data: { 
          ...restaurant, 
          menu_items: foodItems,
          menu_categories: menu_categories
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return { data: null, error: error.message };
    }
  },

  // Search restaurants by name or cuisine
  async searchRestaurants(query) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,cuisine_type.ilike.%${query}%`)
        .order('rating', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return { data: null, error: error.message };
    }
  },

  // Get restaurants by cuisine type
  async getRestaurantsByCuisine(cuisineType) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('cuisine_type', cuisineType)
        .order('rating', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching restaurants by cuisine:', error);
      return { data: null, error: error.message };
    }
  },

  // Get food categories
  async getFoodCategories() {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching food categories:', error);
      return { data: null, error: error.message };
    }
  },

  // Get food items by category
  async getFoodItemsByCategory(categoryId, restaurantId = null) {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          restaurants (
            id,
            name,
            delivery_fee,
            delivery_time_min,
            delivery_time_max
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_available', true);

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query.order('display_order');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching food items by category:', error);
      return { data: null, error: error.message };
    }
  },

  // Add restaurant to favorites
  async addToFavorites(restaurantId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { data: null, error: error.message };
    }
  },

  // Remove restaurant from favorites
  async removeFromFavorites(restaurantId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { data: null, error: error.message };
    }
  },

  // Get user's favorite restaurants
  async getFavoriteRestaurants() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          restaurants (
            *
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteRestaurants = data.map(item => item.restaurants);
      return { data: favoriteRestaurants, error: null };
    } catch (error) {
      console.error('Error fetching favorite restaurants:', error);
      return { data: null, error: error.message };
    }
  },

  // Check if restaurant is in favorites
  async isFavorite(restaurantId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: false, error: null };

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: !!data, error: null };
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return { data: false, error: error.message };
    }
  }
};