import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from '../../components/CustomAlert';

const PasswordResetScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { alertConfig, showAlert, hideAlert } = useAlert();

  // Get parameters from URL - support both token-based and code-based flows
  const accessToken = route.params?.access_token;
  const refreshToken = route.params?.refresh_token;
  const code = route.params?.code;
  const type = route.params?.type;

  useEffect(() => {
    // Check if we have valid reset parameters
    const hasTokens = accessToken && refreshToken;
    const hasCode = code;
    const isRecoveryType = type === 'recovery';
    
    console.log('🔑 PasswordResetScreen: Reset parameters:', {
      hasTokens,
      hasCode,
      isRecoveryType,
      allParams: route.params
    });
    
    // If no valid reset parameters are provided, redirect to login
    if (!hasTokens && !hasCode && !isRecoveryType) {
      showAlert(
        'Invalid Reset Link',
        'This password reset link is invalid or has expired. Please request a new one.',
        [{ 
          text: 'OK', 
          onPress: () => {
            hideAlert();
            navigation.navigate('Login');
          }
        }]
      );
    }
  }, [accessToken, refreshToken, code, type]);

  const validatePassword = (password) => {
    // Simple, clear requirements
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Za-z]/.test(password)) {
      return 'Password must contain at least one letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '#E0E0E0' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !['password', 'password123', '123456', '123456789', 'qwerty'].includes(password.toLowerCase())
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { strength: 1, label: 'Weak', color: '#FF4444' };
    if (score <= 4) return { strength: 2, label: 'Fair', color: '#FF8800' };
    if (score <= 5) return { strength: 3, label: 'Good', color: '#FFAA00' };
    return { strength: 4, label: 'Strong', color: '#00AA00' };
  };

  const handleResetPassword = async () => {
    console.log('🔄 PasswordResetScreen: handleResetPassword called');
    console.log('🔄 PasswordResetScreen: Current state:', { 
      password: password ? 'has value' : 'empty', 
      confirmPassword: confirmPassword ? 'has value' : 'empty',
      loading,
      accessToken: accessToken ? 'has value' : 'missing',
      refreshToken: refreshToken ? 'has value' : 'missing',
      code: code ? 'has value' : 'missing',
      type
    });
    
    // Check if password is empty
    if (!password.trim()) {
      showAlert(
        'Password Required', 
        'Please enter a new password to continue', 
        [{ text: 'OK', onPress: hideAlert }]
      );
      return;
    }

    // Check if confirmation password is empty
    if (!confirmPassword.trim()) {
      showAlert(
        'Confirmation Required', 
        'Please confirm your password by typing it again', 
        [{ text: 'OK', onPress: hideAlert }]
      );
      return;
    }

    // Check if password contains only whitespace
    if (password !== password.trim()) {
      showAlert(
        'Invalid Password', 
        'Password cannot start or end with spaces', 
        [{ text: 'OK', onPress: hideAlert }]
      );
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      showAlert(
        'Passwords Don\'t Match', 
        'The passwords you entered do not match. Please make sure both passwords are identical.', 
        [{ text: 'OK', onPress: hideAlert }]
      );
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      showAlert(
        'Password Requirements Not Met', 
        passwordError, 
        [{ text: 'OK', onPress: hideAlert }]
      );
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 PasswordResetScreen: About to call updatePassword with:', { 
        password: password ? 'has value' : 'empty', 
        accessToken: accessToken ? 'has value' : 'missing',
        refreshToken: refreshToken ? 'has value' : 'missing',
        code: code ? 'has value' : 'missing'
      });
      const result = await updatePassword(password, accessToken, refreshToken, code, type);
      console.log('🔄 PasswordResetScreen: updatePassword result:', result);
      
      if (result.error) {
        showAlert(
          'Reset Failed',
          result.error.message || 'Failed to reset password. Please try again.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      } else {
        // Clear URL parameters to prevent redirection loops
        if (typeof window !== 'undefined') {
          console.log('🔄 PasswordResetScreen: Clearing URL parameters after successful reset');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        showAlert(
          'Password Reset Successful',
          'Your password has been updated successfully. You can now log in with your new password.',
          [{ 
            text: 'OK', 
            onPress: () => {
              hideAlert();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }]
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showAlert(
        'Reset Failed',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', onPress: hideAlert }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor: level <= getPasswordStrength(password).strength
                              ? getPasswordStrength(password).color
                              : '#E0E0E0'
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthText, { color: getPasswordStrength(password).color }]}>
                    {getPasswordStrength(password).label}
                  </Text>
                </View>
              )}
              
              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <Text style={[styles.requirement, password.length >= 8 ? styles.requirementMet : styles.requirementNotMet]}>
                    ✓ At least 8 characters
                  </Text>
                  <Text style={[styles.requirement, /[a-z]/.test(password) ? styles.requirementMet : styles.requirementNotMet]}>
                    ✓ One lowercase letter
                  </Text>
                  <Text style={[styles.requirement, /[A-Z]/.test(password) ? styles.requirementMet : styles.requirementNotMet]}>
                    ✓ One uppercase letter
                  </Text>
                  <Text style={[styles.requirement, /\d/.test(password) ? styles.requirementMet : styles.requirementNotMet]}>
                    ✓ One number
                  </Text>
                  <Text style={[styles.requirement, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? styles.requirementMet : styles.requirementNotMet]}>
                    ✓ One special character
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <Text style={styles.requirement}>• At least 8 characters long</Text>
              <Text style={styles.requirement}>• Contains at least one letter</Text>
              <Text style={styles.requirement}>• Contains at least one number</Text>
            </View>

            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonDisabled]}
              onPress={() => {
                console.log('🔘 Button pressed!');
                handleResetPassword();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    {/* Web alert modal */}
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onClose={hideAlert}
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  strengthContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 5,
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  requirementMet: {
    color: '#28a745',
  },
  requirementNotMet: {
    color: '#dc3545',
  },
  passwordRequirements: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resetButton: {
    backgroundColor: '#007bff',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordResetScreen;