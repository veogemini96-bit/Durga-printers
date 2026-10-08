import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_KEY = 'guest_wishlist';

function loadGuestWishlist(): WishlistItem[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuestWishlist(items: WishlistItem[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Reload whenever auth state changes
  useEffect(() => {
    if (user) {
      loadDbWishlist(user.id);
    } else {
      setWishlist(loadGuestWishlist());
    }
  }, [user]);

  const loadDbWishlist = async (userId: string) => {
    const { data } = await supabase
      .from('wishlists')
      .select('id, product_id, products(id, name, base_price, featured_image, slug)')
      .eq('user_id', userId);

    if (data) {
      setWishlist(data.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.products?.name || '',
        price: item.products?.base_price || 0,
        image: item.products?.featured_image || '',
        slug: item.products?.slug || '',
      })));
    }
  };

  const addToWishlist = async (item: Omit<WishlistItem, 'id'>) => {
    if (isInWishlist(item.productId)) return;

    if (!user) {
      const newItem: WishlistItem = { ...item, id: `local_${Date.now()}` };
      const updated = [...wishlist, newItem];
      setWishlist(updated);
      saveGuestWishlist(updated);
      return;
    }

    const { data } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: item.productId })
      .select()
      .single();

    if (data) {
      setWishlist(prev => [...prev, { ...item, id: data.id }]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      const updated = wishlist.filter(i => i.productId !== productId);
      setWishlist(updated);
      saveGuestWishlist(updated);
      return;
    }

    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    setWishlist(prev => prev.filter(i => i.productId !== productId));
  };

  const isInWishlist = (productId: string) => wishlist.some(i => i.productId === productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount: wishlist.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
