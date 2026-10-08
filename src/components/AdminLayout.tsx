import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  MessageSquare,
  Star,
  ShoppingBag,
  Ticket,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <img
          src="/WhatsApp_Image_2026-03-17_at_5.26.17_PM.jpeg"
          alt="Durga Printers"
          className="h-9 w-auto"
        />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex flex-1 pt-14 lg:pt-0 min-h-0">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-200 ease-in-out lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo — desktop only */}
          <div className="hidden lg:flex items-start p-5 border-b shrink-0">
            <div>
              <img
                src="/WhatsApp_Image_2026-03-17_at_5.26.17_PM.jpeg"
                alt="Durga Printers"
                className="h-11 w-auto"
              />
              <p className="text-xs text-gray-500 mt-1 font-medium">Admin Panel</p>
            </div>
          </div>

          {/* Nav — scrollable */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-3 border-t shrink-0">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors text-sm font-medium"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
