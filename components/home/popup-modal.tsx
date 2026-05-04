'use client';

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { getPopupSettings } from '@/app/actions/settings';

export function PopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<{ enabled: boolean; title: string; content: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if the user has already seen and closed the popup
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
    
    if (!hasSeenPopup) {
      // Fetch settings
      getPopupSettings().then((data) => {
        setSettings(data as { enabled: boolean; title: string; content: string });
        if (data && data.enabled) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      });
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isMounted) return null;

  if (!isOpen || !settings?.enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Decorator */}
        <div className="h-2 w-full bg-congress-red" />
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-congress-red/10 rounded-full flex items-center justify-center mb-6">
            <Bell className="text-congress-red" size={32} />
          </div>
          
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {settings.title}
          </h2>
          
          <div className="text-gray-600 font-sans leading-relaxed whitespace-pre-line mb-8 max-h-[40vh] overflow-y-auto w-full px-2">
            {settings.content}
          </div>

          <button 
            onClick={handleClose}
            className="w-full sm:w-auto bg-congress-red hover:bg-congress-dark text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Anladım / Got it
          </button>
        </div>
      </div>
    </div>
  );
}
