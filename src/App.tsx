import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop, { ScrollReset } from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import OrderTracking from './pages/OrderTracking';
import CustomPrinting from './pages/CustomPrinting';
import BulkOrders from './pages/BulkOrders';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import CustomerLogin from './pages/Login';
import Account from './pages/Account';
import Shipping from './pages/support/Shipping';
import Returns from './pages/support/Returns';
import Privacy from './pages/support/Privacy';
import Terms from './pages/support/Terms';
import FAQ from './pages/support/FAQ';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import BlogPosts from './pages/admin/BlogPosts';
import Inquiries from './pages/admin/Inquiries';
import Reviews from './pages/admin/Reviews';
import Orders from './pages/admin/Orders';
import Coupons from './pages/admin/Coupons';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
          <ScrollReset />
          <Routes>
            <Route path="/admin/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <ProtectedRoute>
                  <BlogPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute>
                  <Inquiries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute>
                  <Coupons />
                </ProtectedRoute>
              }
            />

            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/track-order" element={<OrderTracking />} />
                      <Route path="/custom-printing" element={<CustomPrinting />} />
                      <Route path="/bulk-orders" element={<BulkOrders />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/login" element={<CustomerLogin />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/shipping-policy" element={<Shipping />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <ScrollToTop />
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </WishlistProvider>
  </AuthProvider>
  </ToastProvider>
  </ErrorBoundary>
  );
}

export default App;
