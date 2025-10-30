import { supabase } from '../config/supabase';

export const profileService = {
  // Get user profile
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If profile doesn't exist, create one
      if (!data) {
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          profile_image_url: user.user_metadata?.avatar_url || null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        return { data: createdProfile, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message };
    }
  },

  // Add delivery address
  async addDeliveryAddress(address) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure user profile exists before adding address
      const profileResult = await this.getProfile();
      if (profileResult.error) {
        throw new Error('Failed to ensure user profile exists: ' + profileResult.error);
      }

      // Helper function to normalize address type
      const normalizeAddressType = (type) => {
        if (!type) return 'home';
        const normalized = type.toLowerCase();
        if (['home', 'work', 'other'].includes(normalized)) {
          return normalized;
        }
        // Map common variations
        if (normalized.includes('home') || normalized.includes('house')) return 'home';
        if (normalized.includes('work') || normalized.includes('office') || normalized.includes('business')) return 'work';
        return 'other';
      };

      // Prepare address data for insertion
      const addressData = {
        user_id: user.id,
        address_type: normalizeAddressType(address.address_type || address.label),
        street_address: address.street_address || address.street || address.address,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code || address.zipCode,
        country: address.country || 'India',
        latitude: address.latitude,
        longitude: address.longitude,
        is_default: address.is_default || false
      };

      const { data, error } = await supabase
        .from('user_addresses')
        .insert(addressData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding delivery address:', error);
      return { data: null, error: error.message };
    }
  },

  // Update delivery address
  async updateDeliveryAddress(addressId, updatedAddress) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Helper function to normalize address type
      const normalizeAddressType = (type) => {
        if (!type) return 'home';
        const normalized = type.toLowerCase();
        if (['home', 'work', 'other'].includes(normalized)) {
          return normalized;
        }
        // Map common variations
        if (normalized.includes('home') || normalized.includes('house')) return 'home';
        if (normalized.includes('work') || normalized.includes('office') || normalized.includes('business')) return 'work';
        return 'other';
      };

      // Prepare updated address data
      const addressData = {
        address_type: normalizeAddressType(updatedAddress.address_type || updatedAddress.label),
        street_address: updatedAddress.street_address || updatedAddress.street || updatedAddress.address,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postal_code: updatedAddress.postal_code || updatedAddress.zipCode,
        country: updatedAddress.country || 'India',
        latitude: updatedAddress.latitude,
        longitude: updatedAddress.longitude,
        is_default: updatedAddress.is_default,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating delivery address:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete delivery address
  async deleteDeliveryAddress(addressId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting delivery address:', error);
      return { data: null, error: error.message };
    }
  },

  // Get delivery addresses
  async getDeliveryAddresses() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching delivery addresses:', error);
      return { data: [], error: error.message };
    }
  },

  // Upload avatar image
  async uploadAvatar(imageUri) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Convert image URI to blob (for web) or use directly (for mobile)
      let fileData;
      if (imageUri.startsWith('data:')) {
        // Base64 data
        const response = await fetch(imageUri);
        fileData = await response.blob();
      } else {
        // File URI
        const response = await fetch(imageUri);
        fileData = await response.blob();
      }

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete account
  async deleteAccount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete profile (this will cascade to related data due to foreign key constraints)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out and delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) throw authError;

      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { data: null, error: error.message };
    }
  }
};