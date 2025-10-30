import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { supabase } from '../config/supabase';

import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '../screens/auth/PasswordResetScreen';

// Main App Screens
import HomeScreen from '../screens/main/HomeScreen';
import RestaurantsScreen from '../screens/main/RestaurantsScreen';
import CartScreen from '../screens/main/CartScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RestaurantDetailScreen from '../screens/main/RestaurantDetailScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import AddressScreen from '../screens/main/AddressScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Restaurants') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === 'Cart') {
          iconName = focused ? 'bag' : 'bag-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B6B',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ unmountOnBlur: true }} />
    <Tab.Screen name="Restaurants" component={RestaurantsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="Address" component={AddressScreen} />
    <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const navigationRef = useRef();
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasCheckedInitialUrl, setHasCheckedInitialUrl] = useState(false);
  const [processedUrls, setProcessedUrls] = useState(new Set());

  console.log('🟢 AppNavigator: Render - user:', user?.email || 'null', 'loading:', loading);
  console.log('🟢 AppNavigator: Will render:', user ? 'MainStack' : 'AuthStack');

  // Check URL immediately on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasCheckedInitialUrl) {
      const currentUrl = window.location.href;
      console.log('🔗 AppNavigator: Checking initial URL on mount:', currentUrl);
      
      if (currentUrl.includes('#access_token=')) {
        console.log('🔗 AppNavigator: Found password reset tokens in URL');
        const urlParts = currentUrl.split('#')[1];
        const params = new URLSearchParams(urlParts);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (accessToken && refreshToken) {
          console.log('🔗 AppNavigator: Setting pending navigation for password reset');
          setPendingNavigation({
            screen: 'PasswordReset',
            params: {
              access_token: accessToken,
              refresh_token: refreshToken,
              ...(type ? { type } : {}),
            }
          });
        }
      }
      setHasCheckedInitialUrl(true);
    }
  }, [hasCheckedInitialUrl]);

  // Handle pending navigation when navigation is ready
  useEffect(() => {
    if (pendingNavigation && !loading) {
      console.log('🔗 AppNavigator: Attempting to execute pending navigation:', pendingNavigation);
      
      const attemptNavigation = (attempt = 1) => {
        console.log(`🔗 AppNavigator: Navigation attempt ${attempt}`);
        
        if (navigationRef.current) {
          try {
            console.log('🔗 AppNavigator: Navigation ref is ready, navigating...');
            navigationRef.current.navigate(pendingNavigation.screen, pendingNavigation.params);
            console.log('🔗 AppNavigator: Navigation successful!');
            setPendingNavigation(null);
            return;
          } catch (error) {
            console.error('🔗 AppNavigator: Navigation failed:', error);
          }
        }
        
        // Retry up to 5 times with increasing delays
        if (attempt < 5) {
          const delay = attempt * 200; // 200ms, 400ms, 600ms, 800ms
          console.log(`🔗 AppNavigator: Retrying navigation in ${delay}ms...`);
          setTimeout(() => attemptNavigation(attempt + 1), delay);
        } else {
          console.error('🔗 AppNavigator: Failed to navigate after 5 attempts');
        }
      };
      
      // Start first attempt immediately
      attemptNavigation();
    }
  }, [pendingNavigation, loading]);

  useEffect(() => {
    const handleDeepLink = async (url) => {
      console.log('🔗 AppNavigator: Handling deep link:', url);
      console.log('🔗 AppNavigator: Current user state:', !!user);
      console.log('🔗 AppNavigator: Current loading state:', loading);
      console.log('🔗 AppNavigator: Navigation ref ready:', !!navigationRef.current);
      
      // Check if this URL has already been processed
      if (processedUrls.has(url)) {
        console.log('🔗 AppNavigator: URL already processed, skipping:', url);
        return;
      }
      
      // Check for auth parameters in both hash (#) and query (?) parameters
      let params = null;
      let urlParts = '';
      let hashParams = null;
      let queryParams = null;
      
      // Parse both query and hash parameters
      if (url && url.includes('?')) {
        const queryPart = url.split('?')[1].split('#')[0];
        queryParams = new URLSearchParams(queryPart);
      }
      
      if (url && url.includes('#')) {
        const hashPart = url.split('#')[1];
        hashParams = new URLSearchParams(hashPart);
      }
      
      // Check for password reset indicators (access_token, code, or type=recovery)
      const hasAccessToken = (queryParams && queryParams.get('access_token')) || (hashParams && hashParams.get('access_token'));
      const hasCode = (queryParams && queryParams.get('code')) || (hashParams && hashParams.get('code'));
      const hasRecoveryType = (queryParams && queryParams.get('type') === 'recovery') || (hashParams && hashParams.get('type') === 'recovery');
      
      if (url && (hasAccessToken || hasCode || hasRecoveryType)) {
        // Combine both query and hash parameters
        params = new URLSearchParams();
        
        if (queryParams) {
          for (const [key, value] of queryParams) {
            params.set(key, value);
          }
        }
        
        if (hashParams) {
          for (const [key, value] of hashParams) {
            params.set(key, value);
          }
        }
        
        console.log('🔗 AppNavigator: Found auth parameters:', {
          hasAccessToken,
          hasCode,
          hasRecoveryType,
          allParams: Array.from(params.entries())
        });
        
        if (params) {
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const code = params.get('code');
          const type = params.get('type');
          const tokenHash = params.get('token_hash');
          const errorCode = params.get('error');
          const errorDescription = params.get('error_description');

          console.log('🔗 AppNavigator: URL params:', { 
            accessToken: !!accessToken, 
            refreshToken: !!refreshToken, 
            code: !!code,
            type, 
            errorCode,
            errorDescription,
            allParams: Array.from(params.entries())
          });

          // Check for errors first
          if (errorCode) {
            console.error('🔗 AppNavigator: URL contains error:', errorCode, errorDescription);
            
            // Navigate to ForgotPassword screen with error message
            let errorMessage = 'An error occurred with the password reset link.';
            
            if (errorCode === 'otp_expired') {
              errorMessage = 'This password reset link has expired. Please request a new one.';
            } else if (errorCode === 'access_denied') {
              errorMessage = 'The password reset link is invalid or has been used already. Please request a new one.';
            } else if (errorDescription) {
              errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
            }
            
            // Navigate to ForgotPassword screen to show error and allow new request
            if (navigationRef.current) {
              setTimeout(() => {
                navigationRef.current?.navigate('ForgotPassword', { 
                  errorMessage: errorMessage 
                });
              }, 100);
            } else {
              setPendingNavigation({
                screen: 'ForgotPassword',
                params: { errorMessage: errorMessage }
              });
            }
            return;
          }

          // If token_hash + type=recovery present, verify OTP to establish session
          if (tokenHash && type === 'recovery') {
            console.log('🔗 AppNavigator: Found token_hash for recovery, verifying OTP...');
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash: tokenHash,
            });
            if (verifyError) {
              console.error('🔗 AppNavigator: OTP verification failed:', verifyError);
              const message = verifyError?.message || 'Verification failed. Please request a new reset link.';
              if (navigationRef.current) {
                setTimeout(() => {
                  navigationRef.current?.navigate('ForgotPassword', { errorMessage: message });
                }, 100);
              } else {
                setPendingNavigation({
                  screen: 'ForgotPassword',
                  params: { errorMessage: message },
                });
              }
              setProcessedUrls(prev => new Set([...prev, url]));
              return;
            }
            console.log('🔗 AppNavigator: OTP verified; session established. Navigating to PasswordReset.');
            setProcessedUrls(prev => new Set([...prev, url]));
            const navigationData = {
              screen: 'PasswordReset',
              params: { type: 'recovery' },
            };
            if (navigationRef.current && !loading) {
              setTimeout(() => {
                navigationRef.current?.navigate(navigationData.screen, navigationData.params);
              }, 100);
            } else {
              setPendingNavigation(navigationData);
            }
            return;
          }

          // If access_token + refresh_token present, establish session
          if (accessToken && refreshToken && type === 'recovery') {
            console.log('🔗 AppNavigator: Found access/refresh tokens for recovery, establishing session...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              console.error('🔗 AppNavigator: Session establishment failed:', sessionError);
              const message = sessionError?.message || 'Session establishment failed. Please request a new reset link.';
              if (navigationRef.current) {
                setTimeout(() => {
                  navigationRef.current?.navigate('ForgotPassword', { errorMessage: message });
                }, 100);
              } else {
                setPendingNavigation({
                  screen: 'ForgotPassword',
                  params: { errorMessage: message },
                });
              }
              setProcessedUrls(prev => new Set([...prev, url]));
              return;
            }
            console.log('🔗 AppNavigator: Session established with tokens. Navigating to PasswordReset.');
            setProcessedUrls(prev => new Set([...prev, url]));
            const navigationData = {
              screen: 'PasswordReset',
              params: { type: 'recovery' },
            };
            if (navigationRef.current && !loading) {
              setTimeout(() => {
                navigationRef.current?.navigate(navigationData.screen, navigationData.params);
              }, 100);
            } else {
              setPendingNavigation(navigationData);
            }
            return;
          }

          // Handle password reset - support both token-based and code-based flows
          const isPasswordReset = (accessToken && refreshToken) || code || type === 'recovery' || 
                                  url.includes('password') || url.includes('reset');
          
          if (isPasswordReset) {
            console.log('🔗 AppNavigator: Password reset link detected', {
              hasTokens: !!(accessToken && refreshToken),
              hasCode: !!code,
              type
            });
            
            // Mark this URL as processed
            setProcessedUrls(prev => new Set([...prev, url]));
          
            const navigationData = {
              screen: 'PasswordReset',
              params: {}
            };
            
            // Add available parameters
            if (accessToken) navigationData.params.access_token = accessToken;
            if (refreshToken) navigationData.params.refresh_token = refreshToken;
            if (code) navigationData.params.code = code;
            if (type) navigationData.params.type = type;

            // If navigation is ready, navigate immediately, otherwise store for later
            if (navigationRef.current && !loading) {
              console.log('🔗 AppNavigator: Navigating immediately to PasswordReset with params:', navigationData.params);
              setTimeout(() => {
                navigationRef.current?.navigate(navigationData.screen, navigationData.params);
              }, 100);
            } else {
              console.log('🔗 AppNavigator: Storing navigation for later execution');
              setPendingNavigation(navigationData);
            }
          }
      }
    }
    };

    // Handle initial URL when app is opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 AppNavigator: Initial URL:', url);
        handleDeepLink(url);
      }
    });

    // Handle URLs when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 AppNavigator: URL event:', event.url);
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, [loading]);

  if (loading) {
    console.log('🟢 AppNavigator: Showing LoadingScreen');
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;