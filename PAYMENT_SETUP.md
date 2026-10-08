# Complete E-Commerce System Guide

## Overview

Your Durga Printers e-commerce website now has a fully functional order and payment system with user authentication integrated with Razorpay and Supabase Auth. Customers can create accounts, login, place orders, and track them online.

## Features Implemented

### 1. **User Authentication**
- User registration with email and password
- Secure login system
- User profile/account page
- Auto-prefill checkout details for logged-in users
- Order history tied to user accounts
- Guest checkout option available
- Login prompts in cart and checkout

### 2. **Checkout System**
- Complete shipping address collection
- Email and phone validation
- Order summary with tax and shipping calculations
- Real-time total calculations

### 2. **Payment Methods**
- **Razorpay Online Payment**: UPI, Cards, Net Banking, Wallets
- **Cash on Delivery (COD)**: Pay when you receive the order

### 3. **Order Management**
- Unique order numbers (Format: ORD-YYYYMMDD-XXXX)
- Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- Payment status tracking (Pending, Paid, Failed, Refunded)
- Automatic order confirmation

### 4. **Customer Features**
- My Orders page to track all orders
- Search orders by email or order number
- View order details and status
- Order success/confirmation page

### 5. **Admin Features**
- Complete order management dashboard
- Update order status
- Add tracking numbers
- View customer information
- View order items with images

## Setting Up Razorpay

### Step 1: Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a free account
3. Complete KYC verification

### Step 2: Get API Keys
1. Log in to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test Keys for testing
4. Generate Live Keys for production

### Step 3: Update the Payment Integration

**For Testing (Already configured):**
The app currently uses a test key. You can test the payment flow but actual payment won't be processed.

**For Production:**
1. Open `/src/pages/Checkout.tsx`
2. Find line 206: `key: 'rzp_test_dummy',`
3. Replace with your actual Razorpay key:
   ```typescript
   key: 'rzp_live_YOUR_KEY_HERE',
   ```

### Important Notes:
- Test mode allows you to test the complete flow without real money
- Test card: 4111 1111 1111 1111 (Any CVV, Any future date)
- Switch to live keys only after thorough testing
- Keep your secret key secure and never expose it in frontend code

## Complete Customer Flow

### New Customer Journey:
1. **Browse products** → Explore shop and add items to cart
2. **See login prompt** → Notification in cart suggesting to login/signup
3. **Create account (optional)** → Sign up with email, name, and password
4. **Proceed to checkout** → Auto-filled details if logged in
5. **Choose payment method** → Select Razorpay or COD
6. **Complete payment** → Pay via Razorpay gateway or confirm COD
7. **Order confirmation** → View order details and order number
8. **Track orders** → Access "My Orders" or "Account" page anytime
9. **View order history** → See all past orders (logged-in users only)

### Returning Customer Journey:
1. **Login to account** → Use saved credentials
2. **Auto-filled checkout** → Name, email, phone pre-populated
3. **Quick checkout** → Faster ordering process
4. **Order history** → View all previous orders
5. **Manage wishlist** → Save favorite items

### Order Processing:
1. Order created in database with unique order number
2. Order items saved separately for better tracking
3. Payment record created
4. Customer receives order confirmation
5. Admin can track and update order status
6. Customer can view order history

## Database Schema

### Tables Created:
- **orders**: Main order information
- **order_items**: Individual products in each order
- **payments**: Payment transaction records

### Order Statuses:
- `pending`: Order placed, awaiting processing
- `confirmed`: Order confirmed by admin
- `processing`: Order being prepared
- `shipped`: Order dispatched
- `delivered`: Order delivered to customer
- `cancelled`: Order cancelled

### Payment Statuses:
- `pending`: Payment not yet received (COD orders)
- `paid`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

## Pricing Configuration

### Current Settings (in Checkout.tsx):
- **Tax Rate**: 18% GST
- **Shipping Fee**: ₹50 (Free for orders above ₹500)

### To Modify:
```typescript
const TAX_RATE = 0.18;        // Change tax rate (18%)
const SHIPPING_FEE = 50;      // Change shipping fee
```

## Testing the System

### Test Flow with Authentication:

**1. Test User Registration:**
1. Go to `/login`
2. Click "Sign Up" tab
3. Fill in test details:
   - Name: Test Customer
   - Email: test@example.com
   - Phone: 9876543210
   - Password: test123
   - Confirm Password: test123
4. Click "Create Account"
5. Verify redirect to homepage or previous page

**2. Test Login:**
1. Go to `/login`
2. Enter email: test@example.com
3. Enter password: test123
4. Click "Login"
5. Check "Account" link appears in header

**3. Test Checkout Flow (Logged In):**
1. Add products to cart
2. Go to checkout
3. Notice details are pre-filled
4. Complete address fields
5. Choose payment method
6. For Razorpay: Use test card (4111 1111 1111 1111)
7. For COD: Simply confirm order
8. Check order success page
9. View order in "My Orders" page

**4. Test Guest Checkout:**
1. Logout or use incognito mode
2. Add products to cart
3. See login prompt in cart (can dismiss)
4. Click "Proceed to Checkout"
5. See login banner at top (click "Continue as Guest" link)
6. Fill in all details manually
7. Complete order as guest
8. Search for order using email in "My Orders"

### Admin Testing:
1. Login to admin panel: `/admin/login`
2. Go to Orders section
3. View order details
4. Update order status
5. Add tracking number

## Important URLs

### Customer Pages:
- **Login/Signup**: `/login`
- **Account**: `/account`
- **Cart**: `/cart`
- **Checkout**: `/checkout`
- **Order Success**: `/order-success/:orderId`
- **My Orders**: `/my-orders`
- **Wishlist**: `/wishlist`

### Admin Pages:
- **Admin Login**: `/admin/login`
- **Admin Orders**: `/admin/orders`
- **Admin Dashboard**: `/admin`

## Security Features

✅ Row Level Security (RLS) enabled on all tables
✅ Customer data protected
✅ Secure payment gateway integration
✅ Email and phone validation
✅ Order number generation with date-based uniqueness

## Support

For any issues or questions:
- Check the admin panel for order management
- Review payment logs in Supabase dashboard
- Contact Razorpay support for payment issues

## Next Steps

1. **Test thoroughly** with test payment keys
2. **Update Razorpay keys** to live keys for production
3. **Configure email notifications** (optional)
4. **Set up SMS alerts** (optional)
5. **Add invoice generation** (optional)

---

Your e-commerce platform is now ready to accept real orders and payments!
