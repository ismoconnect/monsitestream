import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, User, Menu, Search } from 'lucide-react';
import ValidationBadge from './ValidationBadge';

const ClientHeader = ({ currentUser, onMobileMenuToggle }) => {
  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-8 sticky top-0 z-40">
      <div className="w-full flex justify-between items-center">
        {/* Left: Menu & Search */}
        <div className="flex items-center flex-1 max-w-xl">
          <button onClick={onMobileMenuToggle} className="lg:hidden p-2 text-gray-400 mr-4 hover:bg-gray-50 rounded-lg transition-colors">
            <Menu size={22} />
          </button>
          
          <div className="hidden md:flex items-center bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2.5 w-full max-w-sm group focus-within:border-indigo-200 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-indigo-50/50 transition-all duration-300">
            <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none focus:ring-0 text-xs font-bold ml-3 w-full text-slate-600 placeholder-slate-400 focus:outline-none tracking-tight"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-3 lg:space-x-8">
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 border-r border-slate-100 pr-6 hidden md:flex">
            <button className="relative p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group">
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
              <MessageSquare size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            {/* User Info and Badges */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase tracking-widest">
                {currentUser?.displayName || 'Mon Compte'}
              </p>
              <div className="flex justify-end">
                {currentUser?.subscription?.type === 'vip' ? (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-white text-[7px] font-black uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-amber-200/50 border border-white/20">
                    VIP ELITE
                  </span>
                ) : (currentUser?.subscription?.type === 'premium' || isPremium) ? (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 text-white text-[7px] font-black uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-indigo-200/50 border border-white/20">
                    PREMIUM
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[7px] font-black uppercase tracking-[0.3em] rounded-lg border border-slate-200">
                    STANDARD
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:border-indigo-100 overflow-hidden shadow-sm transition-all duration-300">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <User size={22} className="text-slate-300" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isPremium ? 'bg-indigo-500' : 'bg-slate-300'}`} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
