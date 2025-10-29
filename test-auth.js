#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.log('Please check your .env file contains:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate random email
function generateTestEmail() {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
}

// Test registration function
async function testRegistration(email, password) {
  console.log('\n🔐 Testing Registration...');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'Test User',
          phone: '+1234567890'
        }
      }
    });

    if (error) {
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        console.log('⚠️  Rate limited! Please wait a few minutes before trying again.');
        return { success: false, error: 'Rate limited' };
      }
      console.log(`❌ Registration failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log('✅ Registration successful!');
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      console.log('🎉 User is automatically logged in (email confirmation disabled)');
      if (data.session) {
        console.log('🔑 Session created - user is ready to use the app!');
      }
      
      return { success: true, user: data.user };
    }

  } catch (error) {
    console.log(`❌ Registration error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test login function
async function testLogin(email, password) {
  console.log('\n🔑 Testing Login...');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        console.log('⚠️  Rate limited! Please wait a few minutes before trying again.');
        return { success: false, error: 'Rate limited' };
      }
      console.log(`❌ Login failed: ${error.message}`);
      
      // Handle rate limiting
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        console.log(`⏰ Please wait a few minutes before trying again`);
      }
      
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      console.log(`Last sign in: ${data.user.last_sign_in_at}`);
      return { success: true, user: data.user, session: data.session };
    }

  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    
    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      console.log(`⏰ Please wait a few minutes before trying again`);
    }
    
    return { success: false, error: error.message };
  }
}

// Test logout function
async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log(`❌ Logout failed: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Logout successful!');
    return { success: true };
    
  } catch (error) {
    console.log(`❌ Logout error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Supabase Authentication Tests');
  console.log('==========================================');
  
  // Test with existing account first
  console.log('\n📋 Test 1: Login with existing account');
  const existingEmail = 'test@example.com';
  const existingPassword = 'testpassword123';
  
  const loginResult = await testLogin(existingEmail, existingPassword);
  
  if (loginResult.success) {
    // Test logout
    await testLogout();
  }
  
  // Test registration with new account
  console.log('\n📋 Test 2: Register new account');
  const newEmail = generateTestEmail();
  const newPassword = 'testpassword123';
  
  const registerResult = await testRegistration(newEmail, newPassword);
  
  if (registerResult.success) {
    console.log('\n📋 Test 3: Login with newly created account');
    const newLoginResult = await testLogin(newEmail, newPassword);
    
    if (newLoginResult.success) {
      await testLogout();
    }
  }
  
  console.log('\n==========================================');
  console.log('🏁 Tests completed!');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`Existing account login: ${loginResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`New account registration: ${registerResult.success ? '✅ Success' : '❌ Failed'}`);
  
  if (registerResult.success) {
    console.log(`New account login: ✅ Success`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // Run full test suite
  runTests().catch(console.error);
} else if (args[0] === 'register' && args.length >= 3) {
  // Test registration only
  const email = args[1];
  const password = args[2];
  testRegistration(email, password).catch(console.error);
} else if (args[0] === 'login' && args.length >= 3) {
  // Test login only
  const email = args[1];
  const password = args[2];
  testLogin(email, password).catch(console.error);
} else {
  console.log('Usage:');
  console.log('  node test-auth.js                           # Run full test suite');
  console.log('  node test-auth.js register email password   # Test registration only');
  console.log('  node test-auth.js login email password      # Test login only');
  console.log('');
  console.log('Examples:');
  console.log('  node test-auth.js');
  console.log('  node test-auth.js register test@example.com mypassword123');
  console.log('  node test-auth.js login test@example.com mypassword123');
}