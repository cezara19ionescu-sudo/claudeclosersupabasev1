import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, fullScreen = false }: ModalProps) {
  const [viewportHeight, setViewportHeight] = React.useState<number>(window.visualViewport?.height || window.innerHeight);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.8);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/40 z-[200] flex justify-center transition-all duration-300",
        fullScreen ? "items-stretch" : (isKeyboardOpen ? "items-start pt-4" : "items-end")
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-white w-full max-w-[430px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300",
          fullScreen ? "rounded-none" : "rounded-t-[20px] p-6"
        )}
        style={{ 
          height: fullScreen ? viewportHeight : undefined,
          maxHeight: viewportHeight * (fullScreen ? 1 : 0.85),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!fullScreen && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[17px] font-bold text-slate-800">{title}</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 premium-touch"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
