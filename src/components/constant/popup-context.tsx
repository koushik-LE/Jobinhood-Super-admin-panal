'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { PopupMessage, type PopupMessageProps } from './popup-message';

type PopupContextType = {
  showPopup: (options: Omit<PopupMessageProps, 'isOpen' | 'onClose'>) => void;
  hidePopup: () => void;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popupProps, setPopupProps] = useState<Omit<
    PopupMessageProps,
    'isOpen' | 'onClose'
  > | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showPopup = (options: Omit<PopupMessageProps, 'isOpen' | 'onClose'>) => {
    setPopupProps(options);
    setIsOpen(true);
  };

  const hidePopup = () => {
    setIsOpen(false);
  };

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}
      {popupProps && <PopupMessage {...popupProps} isOpen={isOpen} onClose={hidePopup} />}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
