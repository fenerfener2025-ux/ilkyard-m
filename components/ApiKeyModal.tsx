import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onClose: () => void;
  onClear: () => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, onClear, currentKey }) => {
  const [input, setInput] = useState(currentKey);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative transform transition-all scale-100">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
            <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <i className="fa-solid fa-wand-magic-sparkles text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ultra Akıllı Mod</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Uygulamanın görsel oluşturma ve yapay zeka asistanı özelliklerini açmak için Gemini API anahtarını girin.
          </p>
        </div>
        
        <div className="mb-6">
             <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Gemini API Anahtarı</label>
            <input
            type="password"
            className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-800 placeholder-gray-400"
            placeholder="AI Studio API Key..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => input && onSave(input)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-red-200 transform hover:-translate-y-0.5"
          >
            {currentKey ? 'Anahtarı Güncelle' : 'Özellikleri Aktifleştir'}
          </button>
          
          {currentKey && (
              <button
                onClick={onClear}
                className="w-full bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Anahtarı Kaldır (Standart Mod)
              </button>
          )}
        </div>

        <div className="mt-6 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                API Anahtarı Al <i className="fa-solid fa-external-link-alt ml-1"></i>
            </a>
            <p className="text-[10px] text-gray-400 mt-2">
                Anahtarınız sadece tarayıcınızda saklanır.
            </p>
        </div>
      </div>
    </div>
  );
};