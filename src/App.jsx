import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-blue-100 px-6 py-3 flex items-center justify-between shadow-sm">
        
        {/* 1. Logo a la izquierda */}
        <div className="flex items-center gap-2 text-blue-800 font-bold text-xl tracking-wide">
          🎓 FOR UPC
        </div>

        {/* 2. Buscador central */}
        <div className="flex-1 max-w-lg mx-8">
          <input 
            type="text" 
            placeholder="Buscar temas o anuncios..." 
            className="w-full bg-blue-50 border border-blue-200 text-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
          />
        </div>

        {/* 3. Ícono de perfil y notificaciones a la derecha */}
        <div className="flex items-center gap-5">
          <button className="text-gray-400 hover:text-orange-500 transition-colors">
            🔔
          </button>
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-transparent hover:border-orange-400 cursor-pointer transition-all">
            TF
          </div>
        </div>

      </nav>
    </div>
  );
}