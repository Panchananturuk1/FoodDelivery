import { supabase } from '../config/supabase';

export const profileService = {
  // Get user profile
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If profile doesn't exist, create one
      if (!data) {
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          delivery_addresses: []
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
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
        .from('profiles')
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

      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('delivery_addresses')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentAddresses = profile.delivery_addresses || [];
      const newAddress = {
        id: Date.now().toString(),
        ...address,
        created_at: new Date().toISOString()
      };

      const updatedAddresses = [...currentAddresses, newAddress];

      const { data, error } = await supabase
        .from('profiles')
        .update({
          delivery_addresses: updatedAddresses,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data: newAddress, error: null };
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

      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('delivery_addresses')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentAddresses = profile.delivery_addresses || [];
      const updatedAddresses = currentAddresses.map(addr => 
        addr.id === addressId 
          ? { ...addr, ...updatedAddress, updated_at: new Date().toISOString() }
          : addr
      );

      const { data, error } = await supabase
        .from('profiles')
        .update({
          delivery_addresses: updatedAddresses,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data: updatedAddresses.find(addr => addr.id === addressId), error: null };
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

      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('delivery_addresses')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentAddresses = profile.delivery_addresses || [];
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          delivery_addresses: updatedAddresses,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

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
        .from('profiles')
        .select('delivery_addresses')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return { data: data.delivery_addresses || [], error: null };
    } catch (error) {
      console.error('Error fetching delivery addresses:', error);
      return { data: null, error: error.message };
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
        .from('profiles')
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
        .from('profiles')
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