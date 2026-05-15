import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

const AdminHeader = ({ title, subtitle = "Gestion Haute Couture", onRefresh, loading, setIsMobileMenuOpen }) => {
  return (
    <header className="bg-[#0f172a] sticky top-0 z-50 border-b border-white/8">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {setIsMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">{title}</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
          </div>
        </div>
        
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50" 
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
