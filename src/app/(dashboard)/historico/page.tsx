'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  X, 
  CreditCard, 
  QrCode, 
  Coins, 
  Calendar, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { Sale, Product, CartItem, PaymentMethod } from '@/types';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { useRouter } from 'next/navigation';
import { useExchangeCredit } from '@/context/ExchangeCreditContext';
import { toast } from 'sonner';

const MOCK_SALES: Sale[] = [
  {
    id: 'SNK-109283-0',
    createdAt: '04/06/2026 10:15',
    paymentMethod: 'pix',
    subtotal: 1499.90,
    total: 1499.90,
    status: 'completed',
    customer: { name: 'Alexandre Silva', cpf: '123.456.789-00' },
    items: [
      {
        id: 'prod-jordan-1-39',
        size: '39',
        sku: 'NKE-AJ1-RED-39',
        barcode: '789000300039',
        quantity: 1,
        price: 1499.90,
        product: {
          id: 'prod-jordan-1',
          name: 'Air Jordan 1 Retro High OG',
          brand: 'Nike',
          group: 'Nike',
          price: 1499.90,
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12,45 L20,12 L35,10 L50,22 L65,30 L88,42 L84,46 L14,46 Z' fill='%23f7dfd4' stroke='%23ff3b30' /><path d='M20,12 L28,24 L48,22' stroke='%231c1c1e' stroke-width='2' /><path d='M35,10 L40,45' stroke='%231c1c1e' /><path d='M50,22 L82,41' fill='%231c1c1e' d='M50,22 L78,35 L80,38 Z' fill-rule='evenodd' fill='%231c1c1e' /><circle cx='30' cy='43' r='5' fill='%231c1c1e' /><circle cx='68' cy='43' r='5' fill='%231c1c1e' /></svg>",
          sizes: []
        }
      }
    ]
  },
  {
    id: 'SNK-736284-9',
    createdAt: '03/06/2026 16:32',
    paymentMethod: 'credit_card',
    subtotal: 799.90,
    total: 799.90,
    status: 'exchanged',
    customer: { name: 'Bruno Souza', cpf: '987.654.321-11' },
    items: [
      {
        id: 'prod-airforce-1-41',
        size: '41',
        sku: 'NKE-AF1-WHT-41',
        barcode: '789000200041',
        quantity: 1,
        price: 799.90,
        product: {
          id: 'prod-airforce-1',
          name: "Air Force 1 '07 Triple White",
          brand: 'Nike',
          group: 'Nike',
          price: 799.90,
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M10,42 L25,20 L45,20 L65,30 L90,42 L88,46 L12,46 Z' fill='%23ffffff' stroke='%231c1c1e' /><path d='M25,20 Q35,30 40,32' stroke='%231c1c1e' /><path d='M45,20 L50,35 L68,36' stroke='%238e8e93' stroke-dasharray='2 2' /><path d='M52,28 L80,36' stroke='%231c1c1e' stroke-width='3' /><circle cx='28' cy='43' r='5' fill='%231c1c1e' /><circle cx='70' cy='43' r='5' fill='%231c1c1e' /></svg>",
          sizes: []
        }
      }
    ]
  },
  {
    id: 'SNK-983145-1',
    createdAt: '03/06/2026 14:05',
    paymentMethod: 'money',
    subtotal: 1899.90,
    total: 1899.90,
    status: 'returned',
    customer: { name: 'Camila Santos', cpf: '456.789.123-22' },
    items: [
      {
        id: 'prod-yeezy-350-38',
        size: '38',
        sku: 'ADI-YZ350-WHT-38',
        barcode: '789000100038',
        quantity: 1,
        price: 1899.90,
        product: {
          id: 'prod-yeezy-350',
          name: 'Yeezy Boost 350 V2',
          brand: 'Adidas',
          group: 'Adidas',
          price: 1899.90,
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M10,40 Q25,35 35,22 Q42,12 55,18 L70,30 L90,45 L85,48 L15,48 Z' fill='%23e8e6e3' stroke='%233c3c43' /><path d='M55,18 Q45,28 35,28' stroke='%233c3c43' /><path d='M70,30 Q65,40 50,42' stroke='%233c3c43' /><circle cx='28' cy='45' r='4' fill='%231c1c1e' /><circle cx='72' cy='45' r='4' fill='%231c1c1e' /><path d='M12,48 Q10,43 15,42 Q25,48 40,48 Q70,48 88,48' stroke='%233c3c43' stroke-width='2' /></svg>",
          sizes: []
        }
      }
    ]
  }
];

export default function SalesHistoryPage() {
  const router = useRouter();
  const { setCreditoDeTroca, setExchangeItemDetails } = useExchangeCredit();

  // Data States
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  // Exchange sub-form states
  const [exchangeItem, setExchangeItem] = useState<CartItem | null>(null);

  // Return sub-form states
  const [returnAllToStock, setReturnAllToStock] = useState(true);

  // Load products and sales
  useEffect(() => {
    const loadState = () => {
      // Load products
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
        console.warn('Failed to load products in history:', e);
      }
      setProducts(loadedProducts);

      // Load sales
      let loadedSales = MOCK_SALES;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedSales = localStorage.getItem('sneaker_pos_sales');
          if (savedSales) {
            loadedSales = JSON.parse(savedSales);
          } else {
            localStorage.setItem('sneaker_pos_sales', JSON.stringify(MOCK_SALES));
          }
        }
      } catch (e) {
        console.warn('Failed to load sales in history:', e);
      }
      setSales(loadedSales);
    };

    setTimeout(loadState, 0);
  }, []);

  // Listen to background simulator updates to reload products and sales in real-time
  useEffect(() => {
    const handleUpdate = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedSales = localStorage.getItem('sneaker_pos_sales');
          if (savedSales) {
            setSales(JSON.parse(savedSales));
          }
          const savedProducts = localStorage.getItem('sneaker_pos_products');
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
          }
        }
      } catch (e) {
        console.warn('Failed to reload sales history:', e);
      }
    };
    window.addEventListener('sneaker_pos_update', handleUpdate);
    return () => window.removeEventListener('sneaker_pos_update', handleUpdate);
  }, []);

  const saveSalesToDb = (updatedSales: Sale[]) => {
    setSales(updatedSales);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_sales', JSON.stringify(updatedSales));
      }
    } catch (e) {
      console.error('Failed to save sales to LocalStorage:', e);
    }
  };

  const saveProductsToDb = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_products', JSON.stringify(updatedProducts));
      }
    } catch (e) {
      console.error('Failed to save products to LocalStorage:', e);
    }
  };

  // Helper to resolve HSL payment method styling and text
  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card': return 'Crédito';
      case 'debit_card': return 'Débito';
      case 'pix': return 'Pix';
      case 'money': return 'Dinheiro';
      default: return 'Desconhecido';
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'pix':
        return <QrCode className="w-3.5 h-3.5" />;
      case 'money':
        return <Coins className="w-3.5 h-3.5" />;
    }
  };

  // Helper to resolve HSL sales status styling
  const getStatusBadge = (status?: 'completed' | 'returned' | 'exchanged') => {
    const stat = status || 'completed';
    switch (stat) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/20">
            <CheckCircle className="w-3 h-3" />
            Concluída
          </span>
        );
      case 'exchanged':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/20">
            <Clock className="w-3 h-3" />
            Trocada
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/20">
            <AlertTriangle className="w-3 h-3" />
            Devolvida/Estornada
          </span>
        );
    }
  };

  // Filtering Logic
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer?.name && s.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Handle Exchange Form Submission (Generates exchange credit and redirects to POS)
  const handleProcessExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !exchangeItem) {
      toast.error('Selecione um item para devolução.');
      return;
    }

    // 1. Fetch current stock for products
    const dbProducts = [...products];
    const targetProduct = dbProducts.find(p => p.id === exchangeItem.product.id);
    if (!targetProduct) {
      toast.error('Produto não localizado no inventário.');
      return;
    }

    // Return returned item to stock
    const oldSizeStock = targetProduct.sizes.find(sz => sz.size === exchangeItem.size);
    if (oldSizeStock) {
      oldSizeStock.stock += 1;
    } else {
      toast.error('Tamanho do item não localizado no inventário.');
      return;
    }

    // 2. Update Sale status
    const updatedSales = sales.map(s => {
      if (s.id === selectedSale.id) {
        return {
          ...s,
          status: 'exchanged' as const
        };
      }
      return s;
    });

    // 3. Save products and sales back to DB
    saveProductsToDb(dbProducts);
    saveSalesToDb(updatedSales);

    // 4. Set global exchange credit state
    setCreditoDeTroca(exchangeItem.price);
    setExchangeItemDetails(`${exchangeItem.product.brand} ${exchangeItem.product.name} (Tamanho ${exchangeItem.size})`);

    // Reset local state
    setIsExchangeOpen(false);
    setExchangeItem(null);
    setSelectedSale(null);

    toast.success(`Crédito de R$ ${exchangeItem.price.toFixed(2)} gerado! Direcionando ao PDV...`);
    
    // 5. Redirect to POS page
    router.push('/pdv');
  };

  // Handle Return / Refund Form Submission
  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    // 1. Fetch current stock
    const dbProducts = [...products];

    // Return items to stock if requested
    if (returnAllToStock) {
      selectedSale.items.forEach(item => {
        const targetProduct = dbProducts.find(p => p.id === item.product.id);
        if (targetProduct) {
          const targetSize = targetProduct.sizes.find(sz => sz.size === item.size);
          if (targetSize) {
            targetSize.stock += item.quantity;
          }
        }
      });
    }

    // 2. Update Sale Status
    const updatedSales = sales.map(s => {
      if (s.id === selectedSale.id) {
        return {
          ...s,
          status: 'returned' as const
        };
      }
      return s;
    });

    // 3. Save
    saveProductsToDb(dbProducts);
    saveSalesToDb(updatedSales);

    // Sync selected sale state
    const currentUpdatedSale = updatedSales.find(s => s.id === selectedSale.id);
    setSelectedSale(currentUpdatedSale || null);

    setIsReturnOpen(false);
    toast.success('Venda cancelada e estornada com sucesso!');
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased min-h-screen relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-55 flex items-center gap-2">
            <History className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-200" />
            Histórico de Vendas
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Consulte recibos, realize trocas e estornos de vendas concluídas.
          </p>
        </div>
      </div>

      {/* Toolbar / Searchbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450" />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID do recibo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Main Table View */}
      {filteredSales.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl bg-white/40 dark:bg-zinc-950/5">
          <History className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">Nenhuma venda localizada</h3>
          <p className="text-xs text-zinc-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Não encontramos recibos que correspondam aos termos buscados no histórico de vendas.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 uppercase font-bold tracking-wider bg-zinc-50/50 dark:bg-zinc-950">
                  <th className="py-4 px-6">Data / Hora</th>
                  <th className="py-4 px-4">Cliente</th>
                  <th className="py-4 px-4">ID do Recibo</th>
                  <th className="py-4 px-4 text-right">Valor Total</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr 
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="border-b border-zinc-100 dark:border-zinc-900 text-xs hover:bg-zinc-55/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-medium text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {sale.createdAt}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-150">
                      {sale.customer?.name || 'Cliente Geral'}
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-450 tracking-tight">
                      {sale.id}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-zinc-900 dark:text-zinc-50">
                      {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(sale.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Sheet Sidebar Overlay */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-350"
            onClick={() => setSelectedSale(null)}
          />

          {/* Drawer Container */}
          <div 
            className="relative w-full max-w-lg bg-white/98 dark:bg-zinc-950/98 h-full shadow-2xl flex flex-col z-10 border-l border-zinc-200/40 dark:border-zinc-900 transition-transform duration-300 animate-in slide-in-from-right"
          >
            {/* Header */}
            <div className="h-16 border-b border-zinc-150/40 dark:border-zinc-900 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-zinc-50" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
                  Detalhes do Recibo
                </h2>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-55/60 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-650"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Receipt Header details */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/20 dark:border-zinc-850 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">ID Recibo</span>
                  <span className="font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{selectedSale.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Data / Hora</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{selectedSale.createdAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Forma de Pagamento</span>
                  <span className="font-bold flex items-center gap-1.5 text-zinc-850 dark:text-zinc-200">
                    {getPaymentIcon(selectedSale.paymentMethod)}
                    {getPaymentLabel(selectedSale.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Cliente</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedSale.customer?.name || 'Cliente Geral'}</span>
                </div>
                {selectedSale.customer?.cpf && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">CPF</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-350">{selectedSale.customer.cpf}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Status</span>
                  <span>{getStatusBadge(selectedSale.status)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Itens Comprados</h3>
                <div className="space-y-3">
                  {selectedSale.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-2xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100 leading-tight">
                          {item.product.brand} {item.product.name}
                        </h4>
                        <p className="text-[10px] text-zinc-450 mt-0.5">
                          Tamanho {item.size} • {item.quantity} un. x {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {((item.price) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Subtotal</span>
                  <span>{selectedSale.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {selectedSale.subtotal - selectedSale.total > 0 && (
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Desconto</span>
                    <span>{(selectedSale.subtotal - selectedSale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 text-sm font-black border-t border-zinc-100 dark:border-zinc-900/60">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">Total Pago</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-55">
                    {selectedSale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer with Actions (Only render if status is not already cancelled/returned) */}
            <div className="p-5 border-t border-zinc-150/40 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950 flex flex-col gap-3.5 shrink-0">
              {selectedSale.status !== 'returned' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {/* Process Exchange Button */}
                    <button
                      type="button"
                      disabled={selectedSale.status === 'exchanged'}
                      onClick={() => {
                        // Default choice: first item
                        if (selectedSale.items.length > 0) {
                          setExchangeItem(selectedSale.items[0]);
                        }
                        setIsExchangeOpen(true);
                      }}
                      className="py-3 px-4 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-850 text-xs font-bold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer disabled:opacity-45"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                      Processar Troca
                    </button>
                    
                    {/* Process Refund/Return Button */}
                    <button
                      type="button"
                      onClick={() => setIsReturnOpen(true)}
                      className="py-3 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 border border-red-200/20 dark:border-red-900/10 text-xs font-bold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Estornar Venda
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 rounded-2xl text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-bold tracking-wider text-center select-none">
                  Venda Cancelada / Sem Ações Disponíveis
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-2xl transition-all active:scale-98 focus:outline-none cursor-pointer text-center"
              >
                Voltar ao Histórico
              </button>
            </div>

          </div>
             {/* Modal: Processar Troca (Sub-modal) */}
      {isExchangeOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleProcessExchange}
            className="w-full max-w-md overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 mb-4 border border-zinc-200/10 flex items-center justify-center self-center">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center mb-2">
              Devolução de Item para Troca
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mb-6 text-center leading-relaxed">
              O item selecionado retornará ao estoque físico (+1 unidade) e gerará um crédito correspondente a ser aplicado no PDV.
            </p>

            <div className="w-full space-y-4 mb-6 text-left">
              {/* Item selection */}
              <div>
                <label className="text-[10px] text-zinc-455 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  Selecione o item sendo devolvido
                </label>
                <select
                  required
                  value={exchangeItem ? exchangeItem.id : ''}
                  onChange={(e) => {
                    const foundItem = selectedSale.items.find(item => item.id === e.target.value);
                    if (foundItem) {
                      setExchangeItem(foundItem);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50"
                >
                  {selectedSale.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product.brand} {item.product.name} (Tamanho {item.size}) - {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informative Credit Value display */}
              {exchangeItem && (
                <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200/20 dark:border-green-900/10 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider block mb-0.5">
                    Valor do Crédito a Gerar
                  </span>
                  <span className="text-xl font-black text-green-700 dark:text-green-400">
                    {exchangeItem.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}

            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsExchangeOpen(false);
                  setExchangeItem(null);
                }}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none"
              >
                Confirmar Devolução e Ir ao PDV
              </button>
            </div>
          </form>
        </div>
      )}     </div>
      )}

      {/* Modal: Processar Estorno (Sub-modal) */}
      {isReturnOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleProcessReturn}
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4 border border-zinc-200/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center mb-2">
              Estornar Venda Completa?
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mb-6 text-center leading-relaxed">
              Esta ação irá invalidar o recibo <span className="font-mono font-bold">{selectedSale.id}</span> e registrar a devolução financeira.
            </p>

            <div className="w-full space-y-4 mb-6 text-left">
              {/* Return items check */}
              <div className="flex items-center gap-2.5 select-none p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/20 dark:border-zinc-800 rounded-2xl">
                <input 
                  type="checkbox"
                  id="return-all-inventory"
                  checked={returnAllToStock}
                  onChange={(e) => setReturnAllToStock(e.target.checked)}
                  className="rounded border-zinc-250 dark:border-zinc-800 text-zinc-900 focus:ring-0 cursor-pointer"
                />
                <label 
                  htmlFor="return-all-inventory"
                  className="text-xs text-zinc-650 dark:text-zinc-400 font-bold cursor-pointer"
                >
                  Retornar todos os itens da venda ao estoque atual
                </label>
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => setIsReturnOpen(false)}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none"
              >
                Confirmar Estorno
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
