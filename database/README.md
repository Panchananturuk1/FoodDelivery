# Database Setup Instructions

This directory contains the database schema and sample data for the Food Delivery App.

## Files

- `schema.sql` - Complete database schema with tables, indexes, RLS policies, and functions
- `sample_data.sql` - Sample data for testing the application
- `README.md` - This file with setup instructions

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### 2. Run the Schema

1. Navigate to the **SQL Editor** in your Supabase dashboard
2. Copy the contents of `schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create:
- All necessary tables with proper relationships
- Indexes for optimal performance
- Row Level Security (RLS) policies
- Custom functions and triggers
- Enum types for order and payment status

### 3. Insert Sample Data

1. In the SQL Editor, copy the contents of `sample_data.sql`
2. Paste it into the SQL Editor
3. Click **Run** to insert the sample data

This will populate your database with:
- 6 food categories (Pizza, Burgers, Sushi, Indian, Chinese, Desserts)
- 5 sample restaurants
- 15 food items across different restaurants
- 3 sample coupons

### 4. Verify Setup

You can verify the setup by running these queries in the SQL Editor:

```sql
-- Check restaurants
SELECT name, cuisine_type, rating FROM public.restaurants;

-- Check food items
SELECT fi.name, r.name as restaurant, fc.name as category, fi.price 
FROM public.food_items fi
JOIN public.restaurants r ON fi.restaurant_id = r.id
JOIN public.food_categories fc ON fi.category_id = fc.id;

-- Check coupons
SELECT code, description, discount_type, discount_value FROM public.coupons;
```

## Database Schema Overview

### Core Tables

1. **profiles** - User profile information (extends Supabase auth.users)
2. **restaurants** - Restaurant information and settings
3. **food_categories** - Categories for organizing food items
4. **food_items** - Individual food items with pricing and details
5. **orders** - Customer orders with status tracking
6. **order_items** - Individual items within an order
7. **user_favorites** - User's favorite restaurants
8. **reviews** - Restaurant reviews and ratings
9. **coupons** - Discount coupons and promotions

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data (orders, profiles, favorites)
- Public read access for restaurants, food items, and categories
- Proper authentication checks using Supabase auth.uid()

### Features

- Automatic order number generation
- Automatic timestamp updates
- Comprehensive indexing for performance
- Support for multiple payment methods
- Order status tracking
- Review and rating system
- Coupon and discount system

## Environment Variables

Make sure your `.env` file contains the correct Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure RLS policies are properly set up
   - Check that the user is authenticated
   - Verify the auth.uid() matches the user_id in queries

2. **Foreign Key Constraint Errors**
   - Ensure referenced records exist before inserting
   - Check that UUIDs are properly formatted

3. **Function Not Found Errors**
   - Make sure the schema.sql was executed completely
   - Check that all functions and triggers were created

### Testing Authentication

To test the authentication flow:

1. Sign up a new user through the app
2. Check the `auth.users` table in Supabase
3. Verify that a corresponding profile is created in `public.profiles`

## Next Steps

After setting up the database:

1. Test the authentication flow in your app
2. Verify that restaurants and food items are loading correctly
3. Test the order creation process
4. Implement real-time updates using Supabase subscriptions
5. Add more sample data as needed for testing

## Support

If you encounter any issues with the database setup, check:

1. Supabase project settings and permissions
2. SQL execution logs in the Supabase dashboard
3. Network connectivity and API keys
4. RLS policy configurations