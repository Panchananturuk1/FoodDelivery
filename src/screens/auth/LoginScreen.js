import React, { useState, useEffect } from 'react';
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

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const { alertConfig, showAlert, hideAlert, showValidationError, showInvalidInput } = useAlert();

  // Pre-fill email if coming from signup
  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
    
    // Show confirmation message if user needs to verify email
    if (route.params?.showConfirmationMessage) {
      Alert.alert(
        'Email Confirmation Required',
        'Please check your email and click the confirmation link before signing in. Once confirmed, you can sign in with your credentials.',
        [{ text: 'OK' }]
      );
    }
  }, [route.params]);

  const validateForm = () => {
    // Check for empty fields
    if (!email.trim()) {
      showValidationError('Please enter your email address');
      return false;
    }

    if (!password.trim()) {
      showValidationError('Please enter your password');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showInvalidInput('Email', 'Please enter a valid email address (e.g., user@example.com)');
      return false;
    }

    // Check minimum password length
    if (password.length < 6) {
      showInvalidInput('Password', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('Email not confirmed')) {
        showAlert(
          'Email Not Verified',
          'Please check your email and click the verification link before signing in.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (error.message.includes('Invalid login credentials')) {
        showAlert(
          'Invalid Credentials',
          'The email or password you entered is incorrect. Please try again.',
          [
            { text: 'Cancel', style: 'cancel', onPress: hideAlert },
            { 
              text: 'Forgot Password?', 
              onPress: () => {
                hideAlert();
                navigation.navigate('ForgotPassword');
              }
            }
          ]
        );
      } else if (error.message.includes('Too many requests')) {
        showAlert(
          'Too Many Attempts',
          'Too many login attempts. Please wait a few minutes before trying again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else if (error.message.includes('User not found')) {
        showAlert(
          'Account Not Found',
          'No account found with this email address. Please check your email or sign up for a new account.',
          [
            { text: 'Cancel', style: 'cancel', onPress: hideAlert },
            { 
              text: 'Sign Up', 
              onPress: () => {
                hideAlert();
                navigation.navigate('Signup');
              }
            }
          ]
        );
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        showAlert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else {
        showAlert(
          'Login Failed',
          error.message || 'An unexpected error occurred. Please try again.',
          [{ text: 'OK', onPress: hideAlert }]
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
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="restaurant" size={80} color="white" />
            <Text style={styles.title}>FoodDelivery</Text>
            <Text style={styles.subtitle}>Delicious food at your doorstep</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#FFB3B3',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;