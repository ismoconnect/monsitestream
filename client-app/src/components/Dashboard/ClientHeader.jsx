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
          
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full max-w-sm group focus-within:border-indigo-200 transition-all">
            <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un message, un média..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full text-gray-600 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 lg:space-x-3">
            <button className="relative p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <MessageSquare size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 tracking-tight">{currentUser?.displayName || 'Pauline'}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{isPremium ? 'Membre Premium' : 'Standard'}</p>
              </div>
            </div>
            <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm group cursor-pointer hover:border-indigo-200 transition-all">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <User size={20} className="text-gray-300" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
