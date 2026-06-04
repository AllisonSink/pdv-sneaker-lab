'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CashTransaction {
  id: string;
  type: 'entrada' | 'saida' | 'venda';
  amount: number;
  reason: string;
  paymentMethod?: string;
  timestamp: string;
}

interface CashRegisterContextType {
  isCashRegisterOpen: boolean;
  initialChange: number;
  transactions: CashTransaction[];
  isLoading: boolean;
  openCashRegister: (initialChange: number) => void;
  closeCashRegister: () => void;
  addTransaction: (type: 'entrada' | 'saida', amount: number, reason: string) => void;
  addSaleTransaction: (amount: number, paymentMethod: string) => void;
  resetCashRegister: () => void;
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export const CashRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [initialChange, setInitialChange] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const loadState = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedOpen = localStorage.getItem('sneaker_pos_cash_open');
          const savedInitial = localStorage.getItem('sneaker_pos_cash_initial');
          const savedTransactions = localStorage.getItem('sneaker_pos_cash_transactions');

          if (savedOpen) {
            setIsCashRegisterOpen(JSON.parse(savedOpen));
          }
          if (savedInitial) {
            setInitialChange(JSON.parse(savedInitial));
          }
          if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
          }
        }
      } catch (e) {
        console.warn('Failed to load cash register state from LocalStorage:', e);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(loadState, 0);
  }, []);

  const openCashRegister = (change: number) => {
    setIsCashRegisterOpen(true);
    setInitialChange(change);
    setTransactions([]);
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_cash_open', JSON.stringify(true));
        localStorage.setItem('sneaker_pos_cash_initial', JSON.stringify(change));
        localStorage.setItem('sneaker_pos_cash_transactions', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Failed to save cash register open state to LocalStorage:', e);
    }
    toast.success(`Caixa aberto com fundo de troco de R$ ${change.toFixed(2)}`);
  };

  const closeCashRegister = () => {
    setIsCashRegisterOpen(false);
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_cash_open', JSON.stringify(false));
      }
    } catch (e) {
      console.error('Failed to save cash register close state to LocalStorage:', e);
    }
    toast.success('Caixa fechado com sucesso!');
  };

  const addTransaction = (type: 'entrada' | 'saida', amount: number, reason: string) => {
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      amount,
      reason,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setTransactions(prev => {
      const updated = [...prev, newTx];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sneaker_pos_cash_transactions', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to save transactions to LocalStorage:', e);
      }
      return updated;
    });

    const typeStr = type === 'entrada' ? 'Suprimento (entrada)' : 'Sangria (saída)';
    toast.success(`${typeStr} de R$ ${amount.toFixed(2)} registrado!`);
  };

  const addSaleTransaction = (amount: number, paymentMethod: string) => {
    const newTx: CashTransaction = {
      id: `sale-tx-${Date.now()}`,
      type: 'venda',
      amount,
      reason: `Venda #${Date.now().toString().slice(-4)}`,
      paymentMethod,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setTransactions(prev => {
      const updated = [...prev, newTx];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sneaker_pos_cash_transactions', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to save sale transaction to LocalStorage:', e);
      }
      return updated;
    });
  };

  const resetCashRegister = () => {
    setIsCashRegisterOpen(false);
    setInitialChange(0);
    setTransactions([]);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('sneaker_pos_cash_open');
        localStorage.removeItem('sneaker_pos_cash_initial');
        localStorage.removeItem('sneaker_pos_cash_transactions');
      }
    } catch (e) {
      console.error('Failed to clear cash register state:', e);
    }
  };

  return (
    <CashRegisterContext.Provider
      value={{
        isCashRegisterOpen,
        initialChange,
        transactions,
        isLoading,
        openCashRegister,
        closeCashRegister,
        addTransaction,
        addSaleTransaction,
        resetCashRegister
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  );
};

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (context === undefined) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};
