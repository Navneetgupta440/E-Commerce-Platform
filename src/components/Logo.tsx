import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  withSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'auto',
  withSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Minimalist & Modern NovaCart Geometric Monogram Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-tr from-blue-700 via-teal-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
      >
        <div className="w-full h-full bg-[#060b17] rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Subtle ambient gradient mesh */}
          <div className="absolute inset-0 bg-radial from-emerald-500/20 via-blue-600/10 to-transparent pointer-events-none"></div>

          {/* Minimalist Vector Glyph: Interlocking 'N' and shopping cart with Nova star */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
          >
            {/* Cart handle and basket path forming geometric letter N */}
            <path
              d="M3 4H5.5L7.6 15.2C7.8 16.2 8.7 17 9.8 17H18.2C19.2 17 20.1 16.3 20.3 15.3L21.8 7.5H6.2"
              stroke="url(#novacart-grad)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* The 4-point orbital Nova star at the heart of the cart */}
            <path
              d="M13.5 7.5L14.3 10.2L17 11L14.3 11.8L13.5 14.5L12.7 11.8L10 11L12.7 10.2L13.5 7.5Z"
              fill="url(#nova-star-grad)"
            />
            {/* Wheel nodes with emerald glow */}
            <circle cx="10" cy="20" r="1.6" fill="#34D399" />
            <circle cx="18" cy="20" r="1.6" fill="#38BDF8" />

            <defs>
              <linearGradient id="novacart-grad" x1="3" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#34D399" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="nova-star-grad" x1="10" y1="7.5" x2="17" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#67E8F9" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-black tracking-tight font-sans leading-none flex items-center ${
            variant === 'light'
              ? 'text-white'
              : variant === 'dark'
              ? 'text-slate-900'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          Nova<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Cart</span>
        </span>
        {withSubtitle && (
          <span className="text-[9.5px] uppercase font-bold tracking-widest text-emerald-400 mt-0.5">
            MERN E-Commerce
          </span>
        )}
      </div>
    </div>
  );
};
