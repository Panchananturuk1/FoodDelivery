# Food Delivery App

A modern, cross-platform food delivery application built with React Native, Expo, and Supabase. This app provides a complete food ordering experience with user authentication, restaurant browsing, cart management, and order tracking.

## 🌐 Live Demo

**🚀 [View Live App](https://food-delivery-phi-plum.vercel.app/)**

The app is deployed on Vercel and accessible via web browser. You can test all features including user registration, login, and the complete food ordering experience.

## 🚀 Features

### User Authentication
- **Sign Up**: Create new account with email and password
- **Sign In**: Login with existing credentials
- **Password Reset**: Forgot password functionality
- **Profile Management**: Update user information and delivery addresses

### Restaurant & Food Browsing
- **Restaurant Listing**: Browse available restaurants with ratings and delivery info
- **Search Functionality**: Search restaurants by name or cuisine type
- **Food Categories**: Browse food by categories (Pizza, Burgers, Sushi, etc.)
- **Restaurant Details**: View detailed restaurant information and menu
- **Favorites**: Save favorite restaurants for quick access

### Shopping & Orders
- **Cart Management**: Add items to cart, update quantities, remove items
- **Order Placement**: Complete checkout with delivery address and payment info
- **Order History**: View past orders with status tracking
- **Real-time Updates**: Live order status updates
- **Coupon System**: Apply discount coupons to orders

### Additional Features
- **Cross-platform**: Works on iOS, Android, and Web
- **Responsive Design**: Optimized for different screen sizes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Order status notifications (ready for implementation)

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Navigation**: React Navigation 6
- **UI Components**: React Native Elements, React Native Paper
- **State Management**: React Context API
- **Icons**: Expo Vector Icons
- **Styling**: StyleSheet with responsive design

## 📱 Screenshots
 <img src="https://drive.google.com/uc?export=view&id=1Kbh3fDKiLYb2fGdLvOGGPzQIRd3wadj4" alt="Bible App Preview" width="300"> <img src="https://drive.google.com/uc?export=view&id=1T62rsvWdis3kabDc1FaAzlNFk-2h5NDR" alt="Menu" width="300">
 

The app includes:
- Authentication screens (Login, Signup, Password Reset)
- Home screen with featured restaurants and categories
- Restaurant listing and search
- Restaurant detail pages with menu
- Shopping cart and checkout
- Order history and tracking
- User profile and settings

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Food
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL scripts in the following order:
     1. `database/schema.sql` - Creates all tables and functions
     2. `database/sample_data.sql` - Inserts sample data for testing
   
   See `database/README.md` for detailed setup instructions.

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on different platforms**
   ```bash
   # Web
   npm run web
   
   # iOS (requires Xcode)
   npm run ios
   
   # Android (requires Android Studio)
   npm run android
   ```

## 📁 Project Structure

```
Food/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── contexts/
│   │   └── AuthContext.js       # Authentication context
│   ├── navigation/
│   │   └── AppNavigator.js      # Main navigation structure
│   ├── screens/
│   │   ├── auth/                # Authentication screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── main/                # Main app screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── RestaurantsScreen.js
│   │   │   ├── RestaurantDetailScreen.js
│   │   │   ├── CartScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── OrderHistoryScreen.js
│   │   └── LoadingScreen.js
│   └── services/                # API service layers
│       ├── restaurantService.js
│       ├── orderService.js
│       └── profileService.js
├── database/
│   ├── schema.sql              # Database schema
│   ├── sample_data.sql         # Sample data
│   └── README.md               # Database setup guide
├── assets/                     # Images and icons
├── .env                        # Environment variables
├── App.js                      # Main app component
└── package.json
```

## 🗄️ Database Schema

The app uses a comprehensive PostgreSQL schema with the following main tables:

- **profiles** - User profile information
- **restaurants** - Restaurant data and settings
- **food_categories** - Food categorization
- **food_items** - Individual menu items
- **orders** - Customer orders
- **order_items** - Items within orders
- **user_favorites** - User's favorite restaurants
- **reviews** - Restaurant reviews and ratings
- **coupons** - Discount coupons

All tables include Row Level Security (RLS) policies for data protection.

## 🔐 Authentication & Security

- **Supabase Auth**: Secure user authentication with email/password
- **Row Level Security**: Database-level security policies
- **JWT Tokens**: Automatic token management
- **Password Reset**: Secure password recovery flow
- **Data Validation**: Input validation on both client and server

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Engaging user interactions
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Screen reader support and proper contrast

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
# Deploy the web-build folder to your hosting service
```

### Mobile App Stores
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## 🧪 Testing

The app includes sample data for testing:
- 5 restaurants across different cuisines
- 15+ food items with various categories
- Sample coupons and discounts
- Mock order data

## 📈 Performance Optimizations

- **Image Optimization**: Lazy loading and caching
- **Database Indexing**: Optimized queries with proper indexes
- **Code Splitting**: Efficient bundle management
- **Caching**: Strategic data caching for better performance
- **Real-time Updates**: Efficient WebSocket connections

## 🔮 Future Enhancements

- **Push Notifications**: Real-time order updates
- **Payment Integration**: Stripe/PayPal integration
- **GPS Tracking**: Real-time delivery tracking
- **Chat Support**: In-app customer support
- **Social Features**: Reviews, ratings, and sharing
- **Admin Dashboard**: Restaurant management interface
- **Analytics**: User behavior and business insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the `database/README.md` for database setup issues
2. Verify your Supabase configuration and credentials
3. Ensure all dependencies are properly installed
4. Check the Expo development server logs for errors

## 🙏 Acknowledgments

- **Expo** - For the amazing React Native framework
- **Supabase** - For the powerful backend-as-a-service
- **React Navigation** - For seamless navigation
- **React Native Community** - For the excellent ecosystem

---

Built with ❤️ using React Native and Supabase