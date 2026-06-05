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
import { Product, CartItem, PaymentMethod, Customer, Sale, SizeStock } from '@/types';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Receipt } from '@/components/Receipt';
import { useCashRegister } from '@/context/CashRegisterContext';
import { useAuth } from '@/context/AuthContext';
import { useExchangeCredit } from '@/context/ExchangeCreditContext';
import { useTeam } from '@/context/TeamContext';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

function generateSaleId() {
  return `SNK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10)}`;
}

export default function PDVClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();

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
  const [products, setProducts] = useState<Product[]>(initialProducts);
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

  // Sync products prop
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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
      // Audio context block by browser
    }
  };

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    toast[type](msg);
  };

  const keepSearchFocus = () => {
    // Keep focus inside main POS search box for rapid scanning
    setTimeout(() => {
      if (isCashRegisterOpen && !selectedProductForSize && !isConfirmationOpen && !isOpeningOpen && !isTxModalOpen && !isClosingOpen) {
        searchInputRef.current?.focus();
      }
    }, 150);
  };

  // Keyboard navigation & Barcode Reader support (Universal POS bindings)
  useEffect(() => {
    let rawBarcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events on other inputs besides our POS Search
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== searchInputRef.current) {
        return;
      }

      // Check for scan events (fast keystrokes typical of hardware laser emulators)
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 50) {
        rawBarcodeBuffer = ''; // timeout, clear buffer
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (rawBarcodeBuffer.length >= 6) {
          e.preventDefault();
          handleScannedBarcode(rawBarcodeBuffer);
          rawBarcodeBuffer = '';
        }
      } else if (e.key !== 'Shift') {
        rawBarcodeBuffer += e.key;
      }

      // POS Global Hotkeys
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) handleFinalizeSale();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMethod('pix');
      }
      if (e.key === 'F10') {
        e.preventDefault();
        setPaymentMethod('credit_card');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleScannedBarcode = (barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed) return;

    // Search for matching size stock barcode
    let foundMatch = false;

    for (const prod of products) {
      const matchSize = prod.sizes.find(sz => sz.barcode === trimmed);
      if (matchSize) {
        if (matchSize.stock <= 0) {
          triggerToast(`Item esgotado: ${prod.name} (Tamanho ${matchSize.size})`, 'warning');
          foundMatch = true;
          break;
        }

        playScanBeep();
        addToCart(prod, matchSize.size);
        setSearchQuery('');
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      triggerToast(`Código de barras "${trimmed}" não cadastrado.`, 'error');
    }
  };

  // Cart operations
  const addToCart = (product: Product, size: string) => {
    const sizeStock = product.sizes.find(s => s.size === size);
    if (!sizeStock) return;

    const cartId = `${product.id}-${size}`;
    const existingIndex = cart.findIndex(item => item.id === cartId);

    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= sizeStock.stock) {
        triggerToast(`Limite de estoque atingido para o tamanho ${size}.`, 'warning');
        return;
      }

      setCart(prev => prev.map((item, idx) => {
        if (idx === existingIndex) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }));
    } else {
      const newItem: CartItem = {
        id: cartId,
        product: { ...product, sizes: [] }, // avoid heavy recursive loops
        size,
        sku: sizeStock.sku,
        barcode: sizeStock.barcode,
        quantity: 1,
        price: product.price
      };
      setCart(prev => [...prev, newItem]);
    }

    // Clear dropdown selection instantly to reveal size selection list/clear search
    setSelectedProductForSize(null);
    setSearchQuery('');
    
    // Auto-scroll or refocus
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const item = cart.find(i => i.id === cartId);
    if (!item) return;

    const originalProduct = products.find(p => p.id === item.product.id);
    const sizeStock = originalProduct?.sizes.find(s => s.size === item.size);

    if (!sizeStock) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }

    if (newQty > sizeStock.stock) {
      triggerToast(`Estoque esgotado. Apenas ${sizeStock.stock} disponíveis.`, 'warning');
      return;
    }

    setCart(prev => prev.map(i => {
      if (i.id === cartId) {
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartId));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount - creditoDeTroca);
  }, [subtotal, discount, creditoDeTroca]);

  // Live checkout Supabase transaction
  const saveSaleToDatabase = async (saleObj: Sale) => {
    if (!user) return false;

    try {
      const supabase = createClient();
      
      // 1. Insert sale record
      const { error: saleError } = await supabase
        .from('vendas')
        .insert({
          id: saleObj.id,
          items: saleObj.items,
          customer: saleObj.customer,
          subtotal: saleObj.subtotal,
          total: saleObj.total,
          payment_method: saleObj.paymentMethod,
          status: saleObj.status || 'completed',
          seller_name: saleObj.sellerName,
          user_id: user.id
        });

      if (saleError) {
        console.error('Error saving sale to Supabase:', saleError);
        triggerToast(`Erro ao registrar a venda no Supabase: ${saleError.message}`, 'error');
        return false;
      }

      // 2. Decrement stock for each product in the sale
      for (const item of saleObj.items) {
        const { data: dbProduct, error: fetchError } = await supabase
          .from('produtos')
          .select('sizes')
          .eq('id', item.product.id)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !dbProduct) {
          console.error(`Error fetching product ${item.product.id} sizes:`, fetchError);
          continue;
        }

        const currentSizes = dbProduct.sizes as SizeStock[];
        const updatedSizes = currentSizes.map(sz => {
          if (sz.sku === item.sku) {
            return {
              ...sz,
              stock: Math.max(0, sz.stock - item.quantity)
            };
          }
          return sz;
        });

        const { error: updateError } = await supabase
          .from('produtos')
          .update({ sizes: updatedSizes })
          .eq('id', item.product.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error(`Error updating stock for product ${item.product.id}:`, updateError);
        }
      }

      // 3. Update local products list from database
      const { data: dbProducts } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id);
      
      if (dbProducts) {
        const mapped: Product[] = dbProducts.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          group: p.group || p.brand,
          price: Number(p.price),
          imageUrl: p.image_url || '',
          sizes: p.sizes || [],
          colorway: p.colorway || '',
          priceCost: p.price_cost ? Number(p.price_cost) : undefined
        }));
        setProducts(mapped);
      }

      return true;
    } catch (e) {
      console.error('Failed to perform Supabase checkout transaction:', e);
      triggerToast('Ocorreu um erro no checkout real.', 'error');
      return false;
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
  const handlePrint = async () => {
    if (!activeSale) return;

    // Save to Supabase (insert sale + update stock)
    const success = await saveSaleToDatabase(activeSale);
    if (!success) return;

    // Register sale transaction in cash register
    addSaleTransaction(activeSale.total, activeSale.paymentMethod);

    // Register sale for team member commissioning
    if (activeSale.sellerName) {
      registerSaleForMember(activeSale.sellerName, activeSale.total);
    }

    // Perform Print
    setTimeout(() => {
      window.print();
      
      // Reset Cart & State
      setCart([]);
      setDiscount(0);
      setCustomer({ name: '', cpf: '' });
      setSelectedSellerName('');
      clearExchangeCredit();
      setIsConfirmationOpen(false);
      setActiveSale(null);
      triggerToast('Venda registrada e recibo impresso!', 'success');
      router.refresh();
    }, 100);
  };

  // Action: New Sale without printing
  const handleNewSale = async () => {
    if (!activeSale) return;

    // Save to Supabase (insert sale + update stock)
    const success = await saveSaleToDatabase(activeSale);
    if (!success) return;

    // Register sale transaction in cash register
    addSaleTransaction(activeSale.total, activeSale.paymentMethod);

    // Register sale for team member commissioning
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
    triggerToast('Venda registrada com sucesso!', 'success');
    router.refresh();
  };

  // Filter products for dropdown
  const visibleProducts = useMemo(() => {
    return products.filter(p => {
      if (hideOutOfStock) {
        const total = p.sizes.reduce((sum, s) => sum + s.stock, 0);
        if (total <= 0) return false;
      }
      return true;
    });
  }, [products, hideOutOfStock]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return visibleProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sizes.some(sz => sz.barcode.trim() === searchQuery.trim())
    ).slice(0, 5);
  }, [searchQuery, visibleProducts]);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] flex flex-col font-sans antialiased min-h-screen">
      
      {/* 1. Header (Quick POS indicators) */}
      <header className="h-14 border-b border-zinc-200/40 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-zinc-400" />
            Caixa: {isCashRegisterOpen ? 'Aberto' : 'Fechado'}
          </div>
          {isCashRegisterOpen && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              Fundo: R$ {initialChange.toFixed(2)}
            </span>
          )}
        </div>

        {/* Turn Actions Combobox dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
            className="py-1.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-xl text-xs font-bold transition-all border border-zinc-200/40 dark:border-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            Turno de Caixa
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          
          {isRegisterDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-xl rounded-2xl p-1 z-50 backdrop-blur-xl animate-in fade-in duration-100">
              {!isCashRegisterOpen ? (
                <button
                  onClick={() => {
                    setIsOpeningOpen(true);
                    setIsRegisterDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400"
                >
                  Abrir Turno (Caixa)
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setTxType('entrada');
                      setIsTxModalOpen(true);
                      setIsRegisterDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Registrar Entrada (Suprimento)
                  </button>
                  <button
                    onClick={() => {
                      setTxType('saida');
                      setIsTxModalOpen(true);
                      setIsRegisterDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Registrar Saída (Sangria)
                  </button>
                  <button
                    onClick={() => {
                      setIsClosingOpen(true);
                      setIsRegisterDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition-colors cursor-pointer border-t border-zinc-100 dark:border-zinc-800 mt-1"
                  >
                    Fechar Turno
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* POS main layout */}
      <div className="flex-1 flex flex-col justify-center relative">
        
        {/* Turn Blocking Overlay */}
        {!isCashRegisterOpen && (
          <div className="absolute inset-0 z-40 bg-zinc-50/70 dark:bg-zinc-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="max-w-sm flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-955 shadow-xl shadow-zinc-950/10">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Caixa Fechado</h2>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 leading-relaxed">
                  Para iniciar as operações de venda e utilizar a frente de caixa, você precisa primeiro abrir o turno informando o fundo de troco inicial.
                </p>
              </div>
              <button
                onClick={() => setIsOpeningOpen(true)}
                className="py-3 px-6 bg-zinc-900 hover:bg-zinc-800 active:bg-black dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-2xl transition-all shadow-lg text-xs cursor-pointer select-none"
              >
                Abrir Caixa Turno
              </button>
            </div>
          </div>
        )}

        {/* 2. Main content area (Split column) */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full items-stretch">
          
          {/* Left Column: Product Search & Size Selector */}
          <section className="lg:col-span-7 p-4 lg:p-6 flex flex-col gap-6 border-r border-zinc-200/40 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/5 overflow-y-auto">
            
            {/* Unified Search and Reader input bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Busque por marca, modelo ou bipe o código de barras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={keepSearchFocus}
                className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
              />
              
              {/* Search results popover overlay */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  {searchResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedProductForSize(prod);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl cursor-pointer transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60 overflow-hidden shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-bold text-zinc-450 uppercase tracking-widest block">{prod.brand}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate mt-0.5">{prod.name}</h4>
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                        {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-450 dark:text-zinc-500">
                      Nenhum calçado correspondente encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected product size picker card (Apple-style layout card) */}
            {selectedProductForSize ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-5 lg:p-6 shadow-sm animate-in zoom-in-95 duration-150 relative">
                <button
                  onClick={() => setSelectedProductForSize(null)}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProductForSize.imageUrl} alt={selectedProductForSize.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{selectedProductForSize.brand}</span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{selectedProductForSize.name}</h3>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                      {selectedProductForSize.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Selecione o Tamanho da Grade</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {selectedProductForSize.sizes.map(sz => {
                      const isOutOfStock = sz.stock <= 0;
                      return (
                        <button
                          key={sz.sku}
                          onClick={() => !isOutOfStock && addToCart(selectedProductForSize, sz.size)}
                          disabled={isOutOfStock}
                          className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-between gap-1 active:scale-95 cursor-pointer ${
                            isOutOfStock
                              ? 'bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-300 dark:text-zinc-700 border-zinc-150/10 opacity-40 cursor-not-allowed'
                              : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-xs font-black">T {sz.size}</span>
                          <span className="text-[8px] opacity-65 font-medium">{sz.stock} un</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Catalog Fast Grid view (shows when no active search) */
              <div className="flex-1 flex flex-col justify-center items-center py-12 border border-dashed border-zinc-200/50 dark:border-zinc-900 rounded-3xl bg-white/40 dark:bg-zinc-950/5">
                <Barcode className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mb-3 animate-pulse" />
                <h3 className="text-sm font-semibold">Leitor de Código Ativo</h3>
                <p className="text-xs text-zinc-450 mt-1 max-w-[240px] leading-relaxed">
                  Pressione <kbd className="font-mono bg-zinc-100 dark:bg-zinc-850 px-1 py-0.5 rounded text-[10px]">F8</kbd> a qualquer momento para finalizar a venda no PDV de forma ágil.
                </p>
              </div>
            )}
          </section>

          {/* Right Column: Checkout Cart & Bill Receipt Details */}
          <section className="lg:col-span-5 bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden relative shadow-2xl border-l border-zinc-100 dark:border-zinc-900">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-150/40 dark:border-zinc-900 flex justify-between items-center shrink-0">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                Carrinho de Compras
                <span className="text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-955 px-1.5 py-0.5 rounded-full font-bold">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Limpar Tudo
                </button>
              )}
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map(item => (
                <div 
                  key={item.id} 
                  className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/20 dark:border-zinc-850 rounded-2xl flex items-center gap-3 animate-in slide-in-from-right-1 duration-150"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-450 dark:text-zinc-500">
                      <span className="font-semibold">Tamanho {item.size}</span>
                      <span>•</span>
                      <span className="font-mono text-[9px]">{item.sku}</span>
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right shrink-0 min-w-[70px]">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                  <ShoppingBag className="w-10 h-10 text-zinc-200 dark:text-zinc-850 mb-3" />
                  <p className="text-xs font-semibold">O carrinho está vazio</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-0.5">Adicione sneakers para iniciar a venda.</p>
                </div>
              )}
            </div>

            {/* Checkout Form section */}
            <div className="p-5 border-t border-zinc-150/40 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4 shrink-0">
              
              {/* Vendedor Selector */}
              <div className="flex justify-between items-center text-xs font-medium py-1">
                <span className="text-zinc-550 dark:text-zinc-400">Vendedor Responsável</span>
                <select
                  value={selectedSellerName}
                  onChange={(e) => setSelectedSellerName(e.target.value)}
                  className="bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg text-xs font-semibold py-1 px-2 focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 transition-all text-right cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {teamMembers.filter(m => m.status === 'active').map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Customer input fields */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-100/50 dark:border-zinc-900/50">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Cliente (Nome)</label>
                  <input
                    type="text"
                    placeholder="Consumidor Geral"
                    value={customer.name}
                    onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-805 rounded-xl text-base md:text-xs font-medium focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={customer.cpf}
                    onChange={(e) => setCustomer(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-805 rounded-xl text-base md:text-xs font-medium focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-100/50 dark:border-zinc-900/50">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Forma de Pagamento</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'credit_card', label: 'Crédito', icon: CreditCard },
                    { id: 'debit_card', label: 'Débito', icon: CreditCard },
                    { id: 'pix', label: 'Pix', icon: QrCode },
                    { id: 'money', label: 'Dinheiro', icon: Coins }
                  ].map(method => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 font-black shadow-md'
                            : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 space-y-1">
                <div className="flex justify-between items-center text-xs text-zinc-550 dark:text-zinc-400 font-medium">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                
                {creditoDeTroca > 0 && (
                  <div className="flex justify-between items-center text-xs font-semibold py-1.5 px-3 bg-green-50 dark:bg-green-955/20 border border-green-200/20 dark:border-green-900/10 rounded-xl text-green-700 dark:text-green-400">
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
                        className="p-0.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 cursor-pointer"
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
                      className="w-20 text-right bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg text-base md:text-xs font-semibold py-1 px-2 focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className={`w-full py-4 px-4 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] select-none cursor-pointer ${
                  cart.length === 0
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-700 cursor-not-allowed border border-zinc-200/10'
                    : total < 0
                      ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-xl shadow-green-600/10'
                      : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-955/10'
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
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-805 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 border border-zinc-200/10">
              <Coins className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              Abrir Caixa
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 mb-6 text-center leading-relaxed">
              Informe o valor em dinheiro do fundo de troco inicial disponível na gaveta.
            </p>

            <div className="w-full space-y-2 mb-6 text-left">
              <label className="text-[10px] text-zinc-455 dark:text-zinc-500 uppercase font-semibold block">
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
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
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
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-805 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-zinc-200/10 ${
              txType === 'entrada'
                ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-500'
                : 'bg-amber-50 dark:bg-amber-955/20 text-amber-500'
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
                  className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
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
                  className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all placeholder-zinc-400"
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
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-805 text-zinc-805 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
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
            <div className="w-full max-w-md overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-805 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-955/20 text-red-555 mb-4 border border-zinc-200/10 flex items-center justify-center">
                <Lock className="w-6 h-6" />
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
