import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ProductsView } from './views/ProductsView';
import { ProductDetailsView } from './views/ProductDetailsView';
import { CartView } from './views/CartView';
import { MyOrdersView } from './views/MyOrdersView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AuthView } from './views/AuthView';
import { MernArchitectureModal } from './components/MernArchitectureModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { api, Product, Order } from './services/api';

function MainApp() {
  const { user } = useAuth();

  // Navigation and view state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Modals state
  const [isMernGuideOpen, setIsMernGuideOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Load products and categories from Express REST API
  const loadCatalog = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load catalog from server:', error);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'product-details' && param) {
      setSelectedProductId(param);
    } else if (view === 'products' && param) {
      setSelectedCategory(param);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCurrentView('products');
  };

  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    loadCatalog(); // Refresh available inventory counts
  };

  // Find currently selected product for details view
  const currentProduct = selectedProductId
    ? products.find((p) => p._id === selectedProductId) || null
    : null;

  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col antialiased font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-nova-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenMernGuide={() => setIsMernGuideOpen(true)}
        onSearchSubmit={handleSearchSubmit}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {isLoadingCatalog ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-medium">
              Connecting to NovaCart Express Server &amp; MongoDB Collections...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                products={products}
                categories={categories}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onNavigateToProducts={() => handleNavigate('products')}
                onOpenMernGuide={() => setIsMernGuideOpen(true)}
              />
            )}

            {currentView === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'product-details' && (
              currentProduct ? (
                <ProductDetailsView
                  product={currentProduct}
                  onBack={() => handleNavigate('products')}
                  onSelectCategory={handleSelectCategory}
                />
              ) : (
                <div className="py-16 text-center space-y-4">
                  <h3 className="font-bold text-slate-800">Product Not Found</h3>
                  <button
                    onClick={() => handleNavigate('products')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Return to Products Catalog
                  </button>
                </div>
              )
            )}

            {currentView === 'cart' && (
              <CartView
                onNavigateToProducts={() => handleNavigate('products')}
                onNavigateToLogin={() => handleNavigate('login')}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {currentView === 'orders' && (
              <MyOrdersView
                onNavigateToProducts={() => handleNavigate('products')}
                onNavigateToLogin={() => handleNavigate('login')}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboardView
                categories={categories}
                onRefreshProducts={loadCatalog}
              />
            )}

            {(currentView === 'login' || currentView === 'register') && (
              <AuthView
                initialMode={currentView as 'login' | 'register'}
                onSuccess={() => handleNavigate('products')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenMernGuide={() => setIsMernGuideOpen(true)}
      />

      {/* Interactive MERN Architecture Guide Modal */}
      <MernArchitectureModal
        isOpen={isMernGuideOpen}
        onClose={() => setIsMernGuideOpen(false)}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={Boolean(confirmedOrder)}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          handleNavigate('orders');
        }}
        onGoHome={() => {
          setConfirmedOrder(null);
          handleNavigate('home');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
