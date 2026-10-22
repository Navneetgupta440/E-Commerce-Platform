import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Laptop,
  Watch,
  Gamepad2,
  Cpu,
  Zap,
} from 'lucide-react';
import { Product } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  products: Product[];
  categories: string[];
  onSelectProduct: (productId: string) => void;
  onSelectCategory: (category: string) => void;
  onNavigateToProducts: () => void;
  onOpenMernGuide: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  onSelectProduct,
  onSelectCategory,
  onNavigateToProducts,
  onOpenMernGuide,
}) => {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'audio':
        return <Headphones className="w-5 h-5 text-emerald-400" />;
      case 'wearables':
        return <Watch className="w-5 h-5 text-cyan-400" />;
      case 'electronics':
        return <Laptop className="w-5 h-5 text-teal-400" />;
      case 'gaming':
        return <Gamepad2 className="w-5 h-5 text-indigo-400" />;
      default:
        return <Cpu className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.2),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:px-12 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Full-Stack Practice Project: MERN Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Future of Tech, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                Engineered in MERN
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Explore an ultra-fast, modern e-commerce experience powered by MongoDB document models, an Express REST API, React SPA components, and Node.js with JWT authentication and bcrypt password cryptography.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateToProducts}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenMernGuide}
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-emerald-300 rounded-xl font-semibold text-sm backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>MERN Architecture Guide</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-slate-900/90 p-2.5">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                alt="Featured Product"
                className="rounded-xl w-full h-80 object-cover"
              />
              <div className="p-4 bg-slate-950/90 rounded-xl mt-2 flex items-center justify-between border border-slate-800">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">
                    Featured Audio
                  </span>
                  <p className="text-sm font-bold text-white">Sony WH-1000XM5</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 line-through mr-1">$399</span>
                  <span className="text-base font-black text-emerald-400">$349.99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Highlights Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/30 shadow-md flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Express Delivery</h4>
            <p className="text-[11px] text-slate-400">Free on orders &gt; $50</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/30 shadow-md flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-teal-950/70 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">JWT Protected</h4>
            <p className="text-[11px] text-slate-400">bcrypt encrypted auth</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/30 shadow-md flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-950/70 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">30-Day Guarantee</h4>
            <p className="text-[11px] text-slate-400">Hassle-free refunds</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/30 shadow-md flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">MERN Clean Code</h4>
            <p className="text-[11px] text-slate-400">REST &amp; MongoDB</p>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Explore Categories</h2>
            <p className="text-xs text-slate-400">Find the gear tailored for your lifestyle</p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 group-hover:bg-emerald-950/60 flex items-center justify-center mb-3 transition-colors border border-slate-800 group-hover:border-emerald-500/30">
                  {getCategoryIcon(cat)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm group-hover:text-emerald-400 transition-colors">
                    {cat}
                  </h3>
                  <span className="text-[11px] text-slate-500">{count} Items</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Products</h2>
            <p className="text-xs text-slate-400">Top-rated tech gear verified by our community</p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Interactive MERN Learning Callout */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden border border-emerald-500/20">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Architecture Highlights
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold">
            How This MERN Project Operates
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The React client handles UI states and renders product components. The Express backend handles routing, applies bcrypt salt hashing to customer passwords, generates JWT tokens, calculates order totals with server-side pricing, and queries the MongoDB database collections for persistence.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenMernGuide}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Explore Code &amp; REST API Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
