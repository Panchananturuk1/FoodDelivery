import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();
  const { alertConfig, showAlert, hideAlert, showValidationError, showInvalidInput } = useAlert();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { fullName, email, phone, password, confirmPassword } = formData;
    
    // Check for empty fields
    if (!fullName.trim()) {
      showValidationError('Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      showValidationError('Please enter your email address');
      return false;
    }

    if (!phone.trim()) {
      showValidationError('Please enter your phone number');
      return false;
    }

    if (!password.trim()) {
      showValidationError('Please enter a password');
      return false;
    }

    if (!confirmPassword.trim()) {
      showValidationError('Please confirm your password');
      return false;
    }

    // Validate full name (at least 2 characters, letters and spaces only)
    if (fullName.trim().length < 2) {
      showInvalidInput('Name', 'Full name must be at least 2 characters long');
      return false;
    }

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName.trim())) {
      showInvalidInput('Name', 'Full name should only contain letters and spaces');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showInvalidInput('Email', 'Please enter a valid email address (e.g., user@example.com)');
      return false;
    }

    // Validate phone number (basic validation for 10+ digits)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      showInvalidInput('Phone', 'Please enter a valid phone number (at least 10 digits)');
      return false;
    }

    // Validate password strength
    if (password.length < 6) {
      showInvalidInput('Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (password.length > 50) {
      showInvalidInput('Password', 'Password must be less than 50 characters');
      return false;
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      showInvalidInput(
        'Password', 
        'Password must contain at least one letter and one number for better security'
      );
      return false;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      showValidationError('Passwords do not match. Please make sure both passwords are identical.');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { fullName, email, phone, password } = formData;
    
    const result = await signUp(email.trim(), password, {
      full_name: fullName.trim(),
      phone: phone.trim(),
    });
    
    console.log('SignupScreen: Signup result:', result);
    
    if (result.error) {
      // Handle specific error cases with user-friendly messages
      if (result.error.message?.includes('User already registered')) {
        showAlert(
          'Account Already Exists',
          'An account with this email address already exists. Please try logging in instead.',
          [
            { text: 'Cancel', style: 'cancel', onPress: hideAlert },
            { 
              text: 'Login', 
              onPress: () => {
                hideAlert();
                navigation.navigate('Login', { email: email.trim() });
              }
            }
          ]
        );
      } else if (result.error.message?.includes('Invalid email')) {
        showAlert(
          'Invalid Email',
          'Please enter a valid email address.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (result.error.message?.includes('Password should be at least')) {
        showAlert(
          'Weak Password',
          'Password must be at least 6 characters long.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (result.error.message?.includes('Too many requests') || result.error.message?.includes('429')) {
        showAlert(
          'Too Many Attempts',
          'Too many signup attempts. Please wait a few minutes before trying again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (result.error.message?.includes('network') || result.error.message?.includes('fetch')) {
        showAlert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (result.error.message?.includes('Email rate limit exceeded')) {
        showAlert(
          'Email Limit Exceeded',
          'Too many emails sent. Please wait before requesting another verification email.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else {
        showAlert(
          'Signup Failed',
          result.error.message || 'An unexpected error occurred during signup. Please try again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      }
    } else {
      // Handle different signup outcomes
      if (result.requiresConfirmation) {
        // Email confirmation required
        showAlert(
          'Check Your Email', 
          result.message || 'Account created successfully! Please check your email and click the confirmation link to activate your account.',
          [{ 
            text: 'OK', 
            onPress: () => {
              hideAlert();
              navigation.navigate('Login', { 
                email: email.trim(),
                message: 'Please check your email and confirm your account before logging in.'
              });
            }
          }]
        );
      } else {
        // Account immediately active
        showAlert(
          'Account Created', 
          result.message || 'Account created and activated successfully!',
          [{ 
            text: 'OK', 
            onPress: () => {
              hideAlert();
              navigation.navigate('Login', { 
                email: email.trim(),
                message: 'Account created successfully! You can now log in.'
              });
            }
          }]
        );
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="person-add" size={60} color="white" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us for delicious food delivery</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#666"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  signupButtonDisabled: {
    backgroundColor: '#A8E6E1',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;