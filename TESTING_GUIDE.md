# Testing Guide for Food Delivery App

## Account Creation & Authentication

### ✅ Email Confirmation Disabled
**Good News**: Email confirmation has been disabled for faster testing!
- Users are automatically logged in after successful registration
- No need to check email or click confirmation links
- Immediate access to the app after signup

### Rate Limiting (429 Error)
If you encounter "Too Many Requests" errors when creating accounts:

**Cause**: Supabase free tier has rate limits on authentication requests.

**Solutions**:
1. **Wait 5-10 minutes** between signup attempts
2. **Use different email addresses** for testing
3. **Clear browser cache** and try again
4. **Use incognito/private browsing mode**

### Testing Account Creation

#### Option 1: Use Test Accounts
Instead of creating new accounts repeatedly, use these test credentials:

```
Email: test@example.com
Password: testpassword123
```

#### Option 2: Create Accounts Strategically
- Use unique email addresses (e.g., test1@example.com, test2@example.com)
- Wait at least 5 minutes between attempts
- Use different browsers or incognito mode

#### Option 3: Database Direct Access
If you have Supabase dashboard access:
1. Go to Authentication > Users
2. Create test users directly in the dashboard
3. Use these accounts for testing

## App Features to Test

### 1. Authentication Flow
- ✅ Login with existing account
- ✅ Signup (with rate limit awareness)
- ✅ Password reset
- ✅ Logout

### 2. Main App Features
- ✅ Browse restaurants
- ✅ Search functionality
- ✅ View restaurant details
- ✅ Add items to cart
- ✅ Manage cart (update quantities, remove items)
- ✅ View order history
- ✅ Profile management

### 3. Navigation
- ✅ Tab navigation between screens
- ✅ Stack navigation for details
- ✅ Authentication state handling

## Known Issues & Workarounds

### 1. Rate Limiting (Fixed)
- **Issue**: 429 errors on signup
- **Fix**: Added better error handling and user-friendly messages
- **Workaround**: Wait between attempts or use existing accounts

### 2. Deprecated Warnings (Fixed)
- **Issue**: `props.pointerEvents is deprecated` warning
- **Fix**: Added LogBox warning suppression
- **Note**: This is from third-party libraries and doesn't affect functionality

## Development Tips

### Testing on Different Platforms
```bash
# Web (recommended for initial testing)
npm run web

# iOS Simulator (requires Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android
```

### Debugging
1. **Web**: Use browser developer tools
2. **Mobile**: Use React Native Debugger or Expo Dev Tools
3. **Network**: Check Supabase dashboard for API calls

### Sample Data
The app includes mock data for:
- Restaurants
- Food items
- Categories
- Order history

This allows testing without setting up the full database initially.

## Troubleshooting

### Common Issues
1. **App won't start**: Check if Expo CLI is installed globally
2. **Supabase errors**: Verify environment variables in `.env`
3. **Navigation issues**: Clear Metro cache with `npx expo start -c`
4. **Styling issues**: Check if all dependencies are installed

### Getting Help
1. Check the main README.md for setup instructions
2. Review the database/README.md for database setup
3. Check Expo and Supabase documentation
4. Use the app's error messages for specific guidance

## Performance Notes

- The app is optimized for web and mobile
- Images are placeholder URLs (replace with real CDN in production)
- Database queries are optimized with proper indexing
- Real-time features are ready but use mock data for testing

Happy testing! 🚀