import React from 'react';
import {
  Database,
  Server,
  Layout,
  Cpu,
  Layers,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenMernGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMernGuide }) => {
  return (
    <footer className="bg-nova-950 text-slate-400 text-xs border-t border-nova-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Summary */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" variant="light" />

            <p className="text-slate-400 leading-relaxed max-w-md text-xs">
              A modern, production-grade practice e-commerce application. Built with MongoDB document collections, Express.js REST APIs, React SPA components, and Node.js with secure JWT authentication and bcrypt password cryptography.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <Database className="w-3.5 h-3.5" /> MongoDB
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/30">
                <Server className="w-3.5 h-3.5" /> Express.js
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-cyan-400 px-2.5 py-1 rounded-md border border-cyan-500/30">
                <Layout className="w-3.5 h-3.5" /> React.js
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-teal-400 px-2.5 py-1 rounded-md border border-teal-500/30">
                <Cpu className="w-3.5 h-3.5" /> Node.js
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Store Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cart')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  My Order History
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Admin Control Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Learning & Documentation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              MERN Architecture
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore how this project structures MongoDB models, Express controllers, JWT middleware, and server-side pricing.
            </p>
            <button
              onClick={onOpenMernGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Architecture Guide</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-nova-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} NovaCart MERN Stack Practice Project.
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Crafted with MERN: MongoDB • Express • React • Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
