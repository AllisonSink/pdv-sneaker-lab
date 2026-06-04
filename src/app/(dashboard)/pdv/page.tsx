'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  Coins, 
  User, 
  ShoppingBag, 
  ArrowRight,
  RefreshCw,
  Check,
  FileText,
  Lock,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { Product, CartItem, PaymentMethod, Customer, Sale } from '@/types';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Receipt } from '@/components/Receipt';
import { useCashRegister } from '@/context/CashRegisterContext';
import { useAuth } from '@/context/AuthContext';
import { useExchangeCredit } from '@/context/ExchangeCreditContext';
import { useTeam } from '@/context/TeamContext';
import { toast } from 'sonner';

function generateSaleId() {
  return `SNK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10)}`;
}

export default function PDVPage() {
  // Cash Register State
  const { 
    isCashRegisterOpen, 
    initialChange, 
    transactions, 
    openCashRegister, 
    closeCashRegister, 
    addTransaction,
    addSaleTransaction
  } = useCashRegister();

  // Auth State
  const { user } = useAuth();

  // Exchange Credit State
  const { creditoDeTroca, exchangeItemDetails, clearExchangeCredit } = useExchangeCredit();

  // Team and Seller State
  const { teamMembers, registerSaleForMember } = useTeam();
  const [selectedSellerName, setSelectedSellerName] = useState('');

  // Dialog State
  const [isOpeningOpen, setIsOpeningOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [isClosingOpen, setIsClosingOpen] = useState(false);

  // Form Inputs
  const [openingChangeInput, setOpeningChangeInput] = useState('');
  const [txAmountInput, setTxAmountInput] = useState('');
  const [txReasonInput, setTxReasonInput] = useState('');
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);

  // Helper Form Handlers
  const handleOpenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const change = parseFloat(openingChangeInput);
    if (isNaN(change) || change < 0) {
      toast.error("Por favor, informe um valor de fundo de troco válido.");
      return;
    }
    openCashRegister(change);
    setIsOpeningOpen(false);
    setOpeningChangeInput('');
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmountInput);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor, informe um valor válido.");
      return;
    }
    if (!txReasonInput.trim()) {
      toast.error("Por favor, informe a justificativa.");
      return;
    }
    addTransaction(txType, amount, txReasonInput.trim());
    setIsTxModalOpen(false);
    setTxAmountInput('');
    setTxReasonInput('');
  };

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [customer, setCustomer] = useState<Customer>({ name: '', cpf: '' });
  const [discount, setDiscount] = useState<number>(0);
  const [hideOutOfStock] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedHide = localStorage.getItem('hide_out_of_stock_pdv');
        return savedHide ? JSON.parse(savedHide) : false;
      }
    } catch (e) {
      console.warn('Failed to load hide_out_of_stock_pdv in PDV state:', e);
    }
    return false;
  });
  
  // UI States
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const [dateTimeString, setDateTimeString] = useState('');

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    let loadedProducts = MOCK_PRODUCTS;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedProducts = localStorage.getItem('sneaker_pos_products');
        if (savedProducts) {
          loadedProducts = JSON.parse(savedProducts);
        } else {
          localStorage.setItem('sneaker_pos_products', JSON.stringify(MOCK_PRODUCTS));
        }
      }
    } catch (e) {
      console.warn('Failed to load products in PDV from LocalStorage:', e);
      loadedProducts = MOCK_PRODUCTS;
    }
    setTimeout(() => {
      setProducts(loadedProducts);
    }, 0);
  }, []);

  // Listen to background simulator updates to reload products in real-time
  useEffect(() => {
    const handleUpdate = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedProducts = localStorage.getItem('sneaker_pos_products');
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
          }
        }
      } catch (e) {
        console.warn('Failed to reload products in PDV:', e);
      }
    };
    window.addEventListener('sneaker_pos_update', handleUpdate);
    return () => window.removeEventListener('sneaker_pos_update', handleUpdate);
  }, []);

  // Update DateTime
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateTimeString(
        now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Audio scan feedback
  const playScanBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note, crisp POS beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Low volume to be elegant

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); // 80ms beep
    } catch {
      console.warn('Audio Context not allowed by browser permissions yet.');
    }
  };

  // Toast Helper
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  // Barcode / Text Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query matches any barcode exactly
    let foundItem = false;
    
    for (const prod of products) {
      const matchingSize = prod.sizes.find(sz => sz.barcode === query);
      if (matchingSize) {
        foundItem = true;
        if (matchingSize.stock > 0) {
          addItemToCart(prod, matchingSize.size);
          playScanBeep();
          setSearchQuery('');
          triggerToast(`${prod.brand} ${prod.name} (Tam ${matchingSize.size}) adicionado!`, 'success');
        } else {
          triggerToast(`Tamanho ${matchingSize.size} do ${prod.name} sem estoque!`, 'error');
        }
        break;
      }
    }

    // If not found by barcode, we do nothing on Enter since results are filtered below
    if (!foundItem) {
      if (/^\d+$/.test(query)) {
        triggerToast('Produto não encontrado.', 'error');
      } else {
        triggerToast(`Pesquisando por "${query}" no catálogo...`, 'info');
      }
    }
  };

  // Add Item to Cart logic
  const addItemToCart = (product: Product, size: string) => {
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) return;

    // Determine current item stock limit
    const currentCartItem = cart.find(item => item.sku === sizeInfo.sku);
    const cartQty = currentCartItem ? currentCartItem.quantity : 0;

    if (cartQty >= sizeInfo.stock) {
      triggerToast('Limite de estoque atingido para este tamanho.', 'error');
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.sku === sizeInfo.sku);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${size}`,
          product,
          size,
          sku: sizeInfo.sku,
          barcode: sizeInfo.barcode,
          quantity: 1,
          price: product.price
        };
        return [...prevCart, newItem];
      }
    });

    setSelectedProductForSize(null);
  };

  // Remove / Decrement / Increment from Cart
  const updateQuantity = (sku: string, amount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.sku === sku) {
          const productInDb = products.find(p => p.id === item.product.id);
          const sizeInDb = productInDb?.sizes.find(s => s.size === item.size);
          const currentStock = sizeInDb ? sizeInDb.stock : 99;

          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          if (newQty > currentStock) {
            triggerToast('Quantidade excede o estoque disponível.', 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeCartItem = (sku: string) => {
    setCart(prevCart => prevCart.filter(item => item.sku !== sku));
    triggerToast('Item removido do carrinho.', 'info');
  };

  const updateItemPrice = (sku: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    setCart(prevCart => 
      prevCart.map(item => 
        item.sku === sku ? { ...item, price: newPrice } : item
      )
    );
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal - discount - creditoDeTroca;

  // Auto focus refocussing
  const keepSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as HTMLElement;
    if (related && (
      related.tagName === 'INPUT' || 
      related.tagName === 'SELECT' || 
      related.tagName === 'BUTTON' || 
      related.getAttribute('role') === 'button'
    )) {
      return;
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  // Filter products by search query
  const filteredProducts = searchQuery.trim() 
    ? products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;
        if (hideOutOfStock) {
          return p.sizes.some(sz => sz.stock > 0);
        }
        return true;
      })
    : [];

  const visibleProducts = useMemo(() => {
    if (!hideOutOfStock) return products;
    return products.filter(p => p.sizes.some(sz => sz.stock > 0));
  }, [products, hideOutOfStock]);

  // Reset inventory to mocks
  const handleResetInventory = () => {
    if (confirm('Deseja redefinir o estoque inicial padrão? Isso também apagará o histórico de vendas.')) {
      setProducts(MOCK_PRODUCTS);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sneaker_pos_products', JSON.stringify(MOCK_PRODUCTS));
          localStorage.removeItem('sneaker_pos_sales');
        }
      } catch (e) {
        console.error('Failed to reset inventory in LocalStorage:', e);
      }
      setCart([]);
      setDiscount(0);
      clearExchangeCredit();
      triggerToast('Estoque e histórico de vendas redefinidos.', 'success');
    }
  };

  // Save Sale to local storage
  const saveSaleToHistory = (saleObj: Sale) => {
    try {
      const savedSales = localStorage.getItem('sneaker_pos_sales');
      const salesList = savedSales ? JSON.parse(savedSales) : [];
      salesList.unshift(saleObj);
      localStorage.setItem('sneaker_pos_sales', JSON.stringify(salesList));
    } catch (e) {
      console.error('Failed to save sale to history:', e);
    }
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      triggerToast('Carrinho está vazio.', 'error');
      return;
    }

    // Generate Sale details
    const saleId = generateSaleId();
    const saleObj: Sale = {
      id: saleId,
      items: [...cart],
      customer: customer.name ? { ...customer } : undefined,
      subtotal,
      total,
      paymentMethod,
      createdAt: dateTimeString,
      sellerName: selectedSellerName || undefined
    };

    setActiveSale(saleObj);
    setIsConfirmationOpen(true);
  };

  // Action: Print Receipt
  const handlePrint = () => {
    if (!activeSale) return;

    // 1. Decrement Stock from Database
    const updatedProducts = products.map(prod => {
      const updatedSizes = prod.sizes.map(sz => {
        const cartMatch = activeSale.items.find(item => item.sku === sz.sku);
        if (cartMatch) {
          return {
            ...sz,
            stock: Math.max(0, sz.stock - cartMatch.quantity)
          };
        }
        return sz;
      });
      return {
        ...prod,
        sizes: updatedSizes
      };
    });

    setProducts(updatedProducts);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_products', JSON.stringify(updatedProducts));
      }
    } catch (e) {
      console.error('Failed to save updated products in LocalStorage:', e);
    }
    
    // Save to history for dashboard
    saveSaleToHistory(activeSale);

    // Register sale transaction in cash register
    addSaleTransaction(activeSale.total, activeSale.paymentMethod);

    // Register sale for team member comissioning
    if (activeSale.sellerName) {
      registerSaleForMember(activeSale.sellerName, activeSale.total);
    }

    // 2. Perform Print
    setTimeout(() => {
      window.print();
      
      // 3. Reset Cart & State
      setCart([]);
      setDiscount(0);
      setCustomer({ name: '', cpf: '' });
      setSelectedSellerName('');
      clearExchangeCredit();
      setIsConfirmationOpen(false);
      setActiveSale(null);
      triggerToast('Venda registrada e recibo impresso!', 'success');
    }, 100);
  };

  // Action: New Sale without printing
  const handleNewSale = () => {
    if (!activeSale) return;

    // Decrement stock from database
    const updatedProducts = products.map(prod => {
      const updatedSizes = prod.sizes.map(sz => {
        const cartMatch = activeSale.items.find(item => item.sku === sz.sku);
        if (cartMatch) {
          return {
            ...sz,
            stock: Math.max(0, sz.stock - cartMatch.quantity)
          };
        }
        return sz;
      });
      return {
        ...prod,
        sizes: updatedSizes
      };
    });

    setProducts(updatedProducts);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_products', JSON.stringify(updatedProducts));
      }
    } catch (e) {
      console.error('Failed to save updated products in LocalStorage:', e);
    }

    // Save to history for dashboard
    saveSaleToHistory(activeSale);

    // Register sale transaction in cash register
    addSaleTransaction(activeSale.total, activeSale.paymentMethod);

    // Register sale for team member comissioning
    if (activeSale.sellerName) {
      registerSaleForMember(activeSale.sellerName, activeSale.total);
    }

    // Reset Cart & State
    setCart([]);
    setDiscount(0);
    setCustomer({ name: '', cpf: '' });
    setSelectedSellerName('');
    clearExchangeCredit();
    setIsConfirmationOpen(false);
    setActiveSale(null);
    triggerToast('Venda finalizada com sucesso!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 font-sans antialiased min-h-screen">
      
      {/* Main App Layout (Hidden when printing) */}
      <div className="flex-1 flex flex-col print:hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-250/30 dark:border-zinc-900 bg-white dark:bg-zinc-950 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold tracking-tight text-base">Frente de Caixa (PDV)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">Bipador Ativo</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline">
              {dateTimeString}
            </span>

            {/* Cash Register Controller Button */}
            {isCashRegisterOpen ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
                  className="py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors focus:outline-none cursor-pointer select-none"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Caixa Aberto</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-450" />
                </button>

                {isRegisterDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-xl rounded-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('entrada');
                        setIsTxModalOpen(true);
                        setIsRegisterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-255 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                      Suprimento (Entrada)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('saida');
                        setIsTxModalOpen(true);
                        setIsRegisterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-255 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
                      Sangria (Saída)
                    </button>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsClosingOpen(true);
                        setIsRegisterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Fechar Caixa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpeningOpen(true)}
                className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-650 dark:text-zinc-350 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors focus:outline-none cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Caixa Fechado</span>
              </button>
            )}

            <button 
              onClick={handleResetInventory}
              title="Redefinir Estoque Padrão"
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden lg:max-h-[calc(100vh-4rem)] overflow-y-auto pb-16 lg:pb-0">
          
          {!isCashRegisterOpen ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-[#09090b] min-h-[calc(100vh-8rem)]">
              <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-8 shadow-sm text-center flex flex-col items-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-zinc-55 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-450 dark:text-zinc-650 border border-zinc-200/20 dark:border-zinc-800 mb-6">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Caixa Fechado
                </h2>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-2 mb-8 leading-relaxed max-w-[280px]">
                  Para iniciar as operações de venda no PDV, você precisa abrir o caixa informando o valor de fundo de troco inicial.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpeningOpen(true)}
                  className="w-full py-3.5 px-5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-zinc-950/10 dark:shadow-zinc-50/5 cursor-pointer focus:outline-none"
                >
                  <Coins className="w-4 h-4" />
                  Abrir Caixa para Vendas
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* LEFT SIDE: Barcode Search & Cart List */}
              <section className="flex-1 flex flex-col p-4 lg:p-6 lg:overflow-y-auto">
            
            {/* Barcode Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-6 relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-650 dark:group-focus-within:text-zinc-200 transition-colors" />
                <input
                  ref={searchInputRef}
                  autoFocus
                  onBlur={keepSearchFocus}
                  type="text"
                  placeholder="Escaneie o código de barras ou digite o modelo do tênis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 md:pr-12 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all shadow-sm placeholder-zinc-400 dark:placeholder-zinc-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 text-zinc-400">
                  <Barcode className="w-5 h-5 animate-pulse" />
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono hidden md:inline">BIP</span>
                </div>
              </div>

              {/* Barcode search dropdown suggestions */}
              {searchQuery.trim().length > 0 && filteredProducts.length > 0 && (
                <div className="relative sm:absolute sm:top-full left-0 right-0 w-full mt-2 z-[50] max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md rounded-2xl p-2">
                  <p className="text-[10px] text-zinc-400 font-semibold px-3 py-1 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg mb-1 uppercase tracking-wider">Produtos Encontrados</p>
                  {filteredProducts.map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => {
                        setSelectedProductForSize(prod);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/10 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-center" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-snug">
                          {prod.brand} {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-[9px] text-emerald-500 font-medium">Disponível</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* Size Grade Selection Drawer/Modal */}
            {selectedProductForSize && (
              <div className="mb-6 p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{selectedProductForSize.brand}</span>
                    <h3 className="text-base font-bold leading-tight">{selectedProductForSize.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProductForSize(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-xs text-zinc-400 mb-2">Selecione o tamanho para adicionar ao carrinho:</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {selectedProductForSize.sizes.map((sz) => {
                    const isOutOfStock = sz.stock <= 0;
                    return (
                      <button
                        key={sz.size}
                        disabled={isOutOfStock}
                        onClick={() => addItemToCart(selectedProductForSize, sz.size)}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                          isOutOfStock
                            ? 'bg-zinc-50 dark:bg-zinc-950/20 text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-900/60 cursor-not-allowed'
                            : 'bg-white hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border-zinc-200/80 dark:border-zinc-850 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <span className="text-sm">{sz.size}</span>
                        <span className={`text-[8px] mt-0.5 font-medium ${isOutOfStock ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {isOutOfStock ? '0 u.' : `${sz.stock} u.`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shopping Cart List */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  Carrinho de Vendas
                </h2>
                {cart.length > 0 && (
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 px-2.5 py-1 rounded-full font-medium">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                /* Empty Cart State */
                <div className="h-36 flex flex-col items-center justify-center px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 rounded-2xl transition-all">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-2">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Carrinho Vazio</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center max-w-[260px] mt-1 leading-normal">
                    Passe um produto no leitor de código de barras ou digite o nome do produto na busca.
                  </p>
                </div>
              ) : (
                /* Cart Items List */
                <div className="space-y-3 max-h-[35vh] lg:max-h-[40vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div 
                      key={item.sku}
                      className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm"
                    >
                      {/* Sneaker Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover object-center" />
                      </div>

                      {/* Product Name & Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate leading-snug">
                          {item.product.brand} {item.product.name}{item.product.colorway ? ` - ${item.product.colorway}` : ''}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            Tamanho {item.size}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono truncate">
                            {item.sku}
                          </span>
                        </div>
                      </div>

                      {/* Counter Controls */}
                      <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900/60 p-1 rounded-xl border border-zinc-100 dark:border-zinc-900/60">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="w-11 h-11 lg:w-7 lg:h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center select-none">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="w-11 h-11 lg:w-7 lg:h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Value and Delete */}
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 group/price">
                          <span className="text-[10px] text-zinc-400 font-semibold">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price || ''}
                            onChange={(e) => updateItemPrice(item.sku, parseFloat(e.target.value))}
                            className="w-20 text-right bg-transparent border border-transparent rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-50 py-0.5 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-250/25 dark:hover:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10"
                            title="Preço Unitário (Editável)"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-400 font-medium">
                          Total: {((item.price || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.sku)}
                          className="w-11 h-11 lg:w-8 lg:h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Catalog browser (premium feature for POS workflow) - Desktop only here */}
            <div className="mt-10 pt-6 border-t border-zinc-200/40 dark:border-zinc-800/40 hidden lg:block">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Acesso Rápido ao Estoque</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductForSize(prod)}
                    className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200/45 dark:border-zinc-900 rounded-2xl cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 transition-all select-none hover:shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full aspect-square rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60 overflow-hidden mb-2 shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain p-2" />
                      </div>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{prod.brand}</span>
                      <h4 className="text-xs font-bold leading-tight truncate mb-1" title={`${prod.name}${prod.colorway ? ` - ${prod.colorway}` : ''}`}>
                        {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-50 dark:border-zinc-900/20">
                      <span className="text-xs font-bold truncate">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <span className="text-[8px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded shrink-0">Grade</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* RIGHT SIDE: Customer Information & Billing Checkout */}
          <section className="w-full lg:w-[380px] xl:w-[420px] bg-white dark:bg-zinc-950 lg:bg-zinc-50/30 lg:dark:bg-zinc-950/20 p-5 lg:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200/60 dark:border-zinc-900 shadow-inner lg:shadow-none lg:h-full lg:overflow-y-auto">
            
            <div className="space-y-6">
              {/* Client Info Block */}
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  Identificação do Cliente
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Nome do cliente"
                        value={customer.name}
                        onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">CPF (Nota Fiscal)</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={customer.cpf}
                        onChange={(e) => setCustomer(prev => ({ ...prev, cpf: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-655"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-2xl flex flex-col items-start gap-2.5 border text-left transition-all relative overflow-hidden select-none active:scale-[0.98] ${
                      paymentMethod === 'credit_card'
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100/55 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Crédito</p>
                      <p className="text-[9px] opacity-60">Cartão de Crédito</p>
                    </div>
                    {paymentMethod === 'credit_card' && (
                      <div className="absolute right-2 top-2 bg-emerald-500 text-white p-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3.5 rounded-2xl flex flex-col items-start gap-2.5 border text-left transition-all relative overflow-hidden select-none active:scale-[0.98] ${
                      paymentMethod === 'pix'
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100/55 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Pix</p>
                      <p className="text-[9px] opacity-60">Instantâneo Pix</p>
                    </div>
                    {paymentMethod === 'pix' && (
                      <div className="absolute right-2 top-2 bg-emerald-500 text-white p-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit_card')}
                    className={`p-3.5 rounded-2xl flex flex-col items-start gap-2.5 border text-left transition-all relative overflow-hidden select-none active:scale-[0.98] ${
                      paymentMethod === 'debit_card'
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100/55 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Débito</p>
                      <p className="text-[9px] opacity-60">Cartão de Débito</p>
                    </div>
                    {paymentMethod === 'debit_card' && (
                      <div className="absolute right-2 top-2 bg-emerald-500 text-white p-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('money')}
                    className={`p-3.5 rounded-2xl flex flex-col items-start gap-2.5 border text-left transition-all relative overflow-hidden select-none active:scale-[0.98] ${
                      paymentMethod === 'money'
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100/55 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50'
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Dinheiro</p>
                      <p className="text-[9px] opacity-60">Cédulas físicas</p>
                    </div>
                    {paymentMethod === 'money' && (
                      <div className="absolute right-2 top-2 bg-emerald-500 text-white p-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Seletor de Vendedor */}
            <div className="mt-4 pt-4 border-t border-zinc-150/40 dark:border-zinc-900/60">
              <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider block mb-2">
                Vendedor Responsável
              </label>
              <div className="relative">
                <select
                  value={selectedSellerName}
                  onChange={(e) => setSelectedSellerName(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-250/20 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-955 text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                >
                  <option value="">Selecionar Vendedor...</option>
                  {teamMembers
                    .filter(m => m.status === 'active')
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role === 'admin' ? 'Admin' : 'Vendedor'})
                      </option>
                    ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Subtotal & Primary CTA button */}
            <div className="sticky bottom-16 -mx-5 -mb-5 p-5 bg-white dark:bg-zinc-955 border-t border-zinc-200 dark:border-zinc-900 z-20 lg:relative lg:bottom-auto lg:m-0 lg:p-0 lg:border-t-0 mt-8 pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                  <span>Itens no carrinho</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} u.</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>

                {creditoDeTroca > 0 && (
                  <div className="flex justify-between items-center text-xs font-semibold py-1.5 px-3 bg-green-50 dark:bg-green-950/20 border border-green-200/20 dark:border-green-900/10 rounded-xl text-green-700 dark:text-green-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0 font-medium">Crédito de Troca (Devolução)</span>
                      {exchangeItemDetails && (
                        <span className="text-[10px] opacity-75 truncate" title={exchangeItemDetails}>
                          • {exchangeItemDetails}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span>- {creditoDeTroca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <button
                        type="button"
                        onClick={clearExchangeCredit}
                        className="p-0.5 rounded-md hover:bg-green-105 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 cursor-pointer"
                        title="Remover crédito"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Global Discount Input */}
                <div className="flex justify-between items-center text-xs text-zinc-550 dark:text-zinc-400 font-medium py-1">
                  <span>Desconto Adicional</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={discount === 0 ? '' : discount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDiscount(isNaN(val) ? 0 : val);
                      }}
                      className="w-20 text-right bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg text-xs font-semibold py-1 px-2 focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      title="Desconto Global"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end pt-1">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Valor Total</span>
                  <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleFinalizeSale}
                className={`w-full py-4 px-4 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] select-none ${
                  cart.length === 0
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-455 dark:text-zinc-700 cursor-not-allowed border border-zinc-200/10'
                    : total < 0
                      ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-xl shadow-green-600/10 cursor-pointer'
                      : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-955/10 cursor-pointer'
                }`}
              >
                {total < 0 ? 'Gerar Troco/Estorno' : 'Finalizar Venda'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>

          {/* Quick Catalog browser (premium feature for POS workflow) - Mobile only here */}
          <div className="p-5 bg-zinc-50 dark:bg-zinc-955 border-t border-zinc-200/40 dark:border-zinc-900 block lg:hidden pb-24 shadow-inner">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Acesso Rápido ao Estoque</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visibleProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductForSize(prod)}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200/45 dark:border-zinc-900 rounded-2xl cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 transition-all select-none hover:shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full aspect-square rounded-xl bg-slate-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60 overflow-hidden mb-2 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{prod.brand}</span>
                    <h4 className="text-xs font-bold leading-tight truncate mb-1" title={`${prod.name}${prod.colorway ? ` - ${prod.colorway}` : ''}`}>
                      {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-50 dark:border-zinc-900/20">
                    <span className="text-xs font-bold truncate">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span className="text-[8px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded shrink-0">Grade</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

        </main>
      </div>

      {/* Confirmation Modal overlay (minimalistic, apple-like blur overlay) */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onPrint={handlePrint}
        onNewSale={handleNewSale}
      />

      {/* Hidden Receipt Component exclusively styled for paper output via @media print */}
      {activeSale && (
        <Receipt
          items={activeSale.items}
          customer={activeSale.customer}
          paymentMethod={activeSale.paymentMethod}
          subtotal={activeSale.subtotal}
          total={activeSale.total}
          saleId={activeSale.id}
          dateTime={activeSale.createdAt}
        />
      )}

      {/* Modal: Abrir Caixa */}
      {isOpeningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleOpenRegisterSubmit}
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 border border-zinc-200/10">
              <Coins className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              Abrir Caixa
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-6 text-center leading-relaxed">
              Informe o valor em dinheiro do fundo de troco inicial disponível na gaveta.
            </p>

            <div className="w-full space-y-2 mb-6 text-left">
              <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block">
                Fundo de Troco Inicial (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={openingChangeInput}
                onChange={(e) => setOpeningChangeInput(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
              />
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpeningOpen(false);
                  setOpeningChangeInput('');
                }}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none"
              >
                Abrir Caixa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Entrada (Suprimento) / Saída (Sangria) */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleTxSubmit}
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-zinc-200/10 ${
              txType === 'entrada'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
            }`}>
              {txType === 'entrada' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              {txType === 'entrada' ? 'Entrada de Dinheiro (Suprimento)' : 'Saída de Dinheiro (Sangria)'}
            </h3>
            <p className="text-xs text-zinc-555 dark:text-zinc-450 mb-6 text-center leading-relaxed">
              Registre a movimentação de valores em dinheiro na gaveta do caixa.
            </p>

            <div className="w-full space-y-4 mb-6 text-left">
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={txAmountInput}
                  onChange={(e) => setTxAmountInput(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  Justificativa
                </label>
                <input
                  type="text"
                  required
                  value={txReasonInput}
                  onChange={(e) => setTxReasonInput(e.target.value)}
                  placeholder="Ex: Troco extra, Motoboy..."
                  className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTxModalOpen(false);
                  setTxAmountInput('');
                  setTxReasonInput('');
                }}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-4 font-semibold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none ${
                  txType === 'entrada'
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white'
                }`}
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Fechar Caixa */}
      {isClosingOpen && (() => {
        const totalSold = transactions.filter(t => t.type === 'venda').reduce((sum, t) => sum + t.amount, 0);
        const totalEntradas = transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
        const totalSaidas = transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
        const totalVendasDinheiro = transactions.filter(t => t.type === 'venda' && t.paymentMethod === 'money').reduce((sum, t) => sum + t.amount, 0);
        const expectedCashInDrawer = initialChange + totalVendasDinheiro + totalEntradas - totalSaidas;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
            <div className="w-full max-w-md overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-555 mb-4 border border-zinc-200/10 flex items-center justify-center">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center">
                Resumo do Turno & Fechamento
              </h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 mb-4 text-center leading-relaxed">
                Confira o resumo financeiro das movimentações registradas neste turno de caixa.
              </p>

              {user?.role === 'admin' && (
                <div className="mb-4 px-3 py-1.5 bg-red-500/10 dark:bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/15 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center">
                  Sobrescrita de Administrador (Override) Ativa
                </div>
              )}

              {/* Turn Summary Sheet Card */}
              <div className="w-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800 rounded-2xl p-4.5 space-y-3.5 mb-6 text-left text-xs font-semibold">
                <div className="flex justify-between items-center text-zinc-550 dark:text-zinc-400">
                  <span>Fundo de Troco Inicial</span>
                  <span>{initialChange.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-555 dark:text-zinc-400">
                  <span>Total Vendido (Faturamento)</span>
                  <span>{totalSold.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-450 dark:text-zinc-500 pl-3 border-l border-zinc-150 dark:border-zinc-800 font-medium">
                  <span>Vendas em Dinheiro</span>
                  <span>{totalVendasDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Suprimentos (Entradas (+))</span>
                  <span>{totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                  <span>Sangrias (Saídas (-))</span>
                  <span>{totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="border-t border-zinc-200/50 dark:border-zinc-800/80 pt-3 flex justify-between items-end">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">Dinheiro Esperado na Gaveta</span>
                  <span className="text-base font-black text-zinc-900 dark:text-zinc-50">
                    {expectedCashInDrawer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsClosingOpen(false)}
                  className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCashRegister();
                    setIsClosingOpen(false);
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none"
                >
                  Confirmar Fechamento
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
