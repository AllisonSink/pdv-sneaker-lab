'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ExchangeCreditContextType {
  creditoDeTroca: number;
  setCreditoDeTroca: (value: number) => void;
  exchangeItemDetails: string | null;
  setExchangeItemDetails: (value: string | null) => void;
  clearExchangeCredit: () => void;
}

const ExchangeCreditContext = createContext<ExchangeCreditContextType | undefined>(undefined);

export const ExchangeCreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creditoDeTroca, setCreditoDeTroca] = useState<number>(0);
  const [exchangeItemDetails, setExchangeItemDetails] = useState<string | null>(null);

  // Load from sessionStorage on client mount
  useEffect(() => {
    const loadState = () => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const savedCredit = sessionStorage.getItem('sneaker_pos_exchange_credit');
          const savedDetails = sessionStorage.getItem('sneaker_pos_exchange_details');
          if (savedCredit) {
            setCreditoDeTroca(JSON.parse(savedCredit));
          }
          if (savedDetails) {
            setExchangeItemDetails(savedDetails);
          }
        }
      } catch (e) {
        console.warn('Failed to load exchange credit from sessionStorage:', e);
      }
    };
    setTimeout(loadState, 0);
  }, []);

  const updateCredit = (value: number) => {
    setCreditoDeTroca(value);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('sneaker_pos_exchange_credit', JSON.stringify(value));
      }
    } catch (e) {
      console.warn('Failed to save exchange credit to sessionStorage:', e);
    }
  };

  const updateDetails = (value: string | null) => {
    setExchangeItemDetails(value);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (value) {
          sessionStorage.setItem('sneaker_pos_exchange_details', value);
        } else {
          sessionStorage.removeItem('sneaker_pos_exchange_details');
        }
      }
    } catch (e) {
      console.warn('Failed to save exchange details to sessionStorage:', e);
    }
  };

  const clearExchangeCredit = () => {
    setCreditoDeTroca(0);
    setExchangeItemDetails(null);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('sneaker_pos_exchange_credit');
        sessionStorage.removeItem('sneaker_pos_exchange_details');
      }
    } catch (e) {
      console.warn('Failed to clear exchange credit from sessionStorage:', e);
    }
  };

  return (
    <ExchangeCreditContext.Provider
      value={{
        creditoDeTroca,
        setCreditoDeTroca: updateCredit,
        exchangeItemDetails,
        setExchangeItemDetails: updateDetails,
        clearExchangeCredit,
      }}
    >
      {children}
    </ExchangeCreditContext.Provider>
  );
};

export const useExchangeCredit = () => {
  const context = useContext(ExchangeCreditContext);
  if (context === undefined) {
    throw new Error('useExchangeCredit must be used within an ExchangeCreditProvider');
  }
  return context;
};
