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
  Clock,
  Receipt,
  Printer,
  ChevronRight
} from 'lucide-react';
import { Sale, Product, CartItem, PaymentMethod, SizeStock } from '@/types';
import { useRouter } from 'next/navigation';
import { useExchangeCredit } from '@/context/ExchangeCreditContext';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function HistoricoClient({ initialSales, initialProducts }: { initialSales: Sale[]; initialProducts: Product[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const { setCreditoDeTroca, setExchangeItemDetails } = useExchangeCredit();

  // Data States
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Exchange sub-form states
  const [exchangeItem, setExchangeItem] = useState<CartItem | null>(null);

  // Return sub-form states
  const [returnAllToStock, setReturnAllToStock] = useState(true);

  // Sync props
  useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-955/20 dark:text-green-400 border border-green-200/20">
            <CheckCircle className="w-3 h-3" />
            Concluída
          </span>
        );
      case 'exchanged':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200/20">
            <Clock className="w-3 h-3" />
            Trocada
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-200/20">
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
  const handleProcessExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !exchangeItem || !user) {
      toast.error('Selecione um item para devolução.');
      return;
    }

    // Find product locally
    const targetProduct = products.find(p => p.id === exchangeItem.product.id);
    if (!targetProduct) {
      toast.error('Produto não localizado no inventário.');
      return;
    }

    const supabase = createClient();

    // 1. Fetch current product sizes from database
    const { data: dbProduct, error: fetchError } = await supabase
      .from('produtos')
      .select('sizes')
      .eq('id', targetProduct.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbProduct) {
      console.error(fetchError);
      toast.error('Produto não localizado no banco de dados.');
      return;
    }

    // Return returned item to stock
    const currentSizes = dbProduct.sizes as SizeStock[];
    const updatedSizes = currentSizes.map(sz => {
      if (sz.size === exchangeItem.size) {
        return { ...sz, stock: sz.stock + 1 };
      }
      return sz;
    });

    // Update product sizes in database
    const { error: productUpdateError } = await supabase
      .from('produtos')
      .update({ sizes: updatedSizes })
      .eq('id', targetProduct.id)
      .eq('user_id', user.id);

    if (productUpdateError) {
      console.error(productUpdateError);
      toast.error('Erro ao devolver o item ao estoque no banco.');
      return;
    }

    // 2. Update Sale status in database
    const { error: saleUpdateError } = await supabase
      .from('vendas')
      .update({ status: 'exchanged' })
      .eq('id', selectedSale.id)
      .eq('user_id', user.id);

    if (saleUpdateError) {
      console.error(saleUpdateError);
      toast.error('Erro ao atualizar o status da venda.');
      return;
    }

    // 3. Set global exchange credit state
    setCreditoDeTroca(exchangeItem.price);
    setExchangeItemDetails(`${exchangeItem.product.brand} ${exchangeItem.product.name} (Tamanho ${exchangeItem.size})`);

    // Reset local state
    setIsExchangeOpen(false);
    setExchangeItem(null);
    setSelectedSale(null);

    toast.success(`Crédito de R$ ${exchangeItem.price.toFixed(2)} gerado! Direcionando ao PDV...`);
    
    // 4. Refresh router data and redirect to POS page
    router.refresh();
    router.push('/pdv');
  };

  // Handle Return / Refund Form Submission
  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !user) return;

    const supabase = createClient();

    // 1. Return items to stock in database if requested
    if (returnAllToStock) {
      for (const item of selectedSale.items) {
        const { data: dbProduct } = await supabase
          .from('produtos')
          .select('sizes')
          .eq('id', item.product.id)
          .eq('user_id', user.id)
          .single();

        if (dbProduct) {
          const currentSizes = dbProduct.sizes as SizeStock[];
          const updatedSizes = currentSizes.map(sz => {
            if (sz.size === item.size) {
              return { ...sz, stock: sz.stock + item.quantity };
            }
            return sz;
          });

          await supabase
            .from('produtos')
            .update({ sizes: updatedSizes })
            .eq('id', item.product.id)
            .eq('user_id', user.id);
        }
      }
    }

    // 2. Update Sale Status in database
    const { error: saleUpdateError } = await supabase
      .from('vendas')
      .update({ status: 'returned' })
      .eq('id', selectedSale.id)
      .eq('user_id', user.id);

    if (saleUpdateError) {
      console.error(saleUpdateError);
      toast.error('Erro ao atualizar o status da venda no banco.');
      return;
    }

    setIsReturnOpen(false);
    setSelectedSale(null);
    toast.success('Venda cancelada e estornada com sucesso!');
    router.refresh();
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
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Main Table View */}
      {filteredSales.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl bg-white/40 dark:bg-zinc-955/5">
          <History className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">Nenhuma venda localizada</h3>
          <p className="text-xs text-zinc-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Não encontramos recibos que correspondam aos termos buscados no histórico de vendas.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 uppercase font-bold tracking-wider bg-zinc-50/50 dark:bg-zinc-950">
                  <th className="py-4 px-6">Data / Hora</th>
                  <th className="py-4 px-4">Cliente</th>
                  <th className="py-4 px-4">ID do Recibo</th>
                  <th className="py-4 px-4 text-right">Valor Total</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr 
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="border-b border-zinc-100 dark:border-zinc-900 text-xs hover:bg-zinc-55/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer animate-in fade-in"
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
                    <td className="py-4 px-4 font-mono text-zinc-455 tracking-tight">
                      {sale.id}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-zinc-900 dark:text-zinc-50">
                      {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer flex items-center justify-center mx-auto"
                        title="Ver Recibo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-zinc-50 animate-pulse" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
                  Detalhes da Venda
                </h2>
                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 font-bold ml-2">
                  {selectedSale.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-55/60 dark:hover:bg-zinc-900 text-zinc-455 hover:text-zinc-650 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Receipt Header details */}
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Data / Hora</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedSale.createdAt}</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-100/50 dark:border-zinc-800/30 pt-2.5">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Cliente</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedSale.customer?.name || 'Cliente Geral'}</span>
                </div>
                {selectedSale.customer?.cpf && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">CPF</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{selectedSale.customer.cpf}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-zinc-100/50 dark:border-zinc-800/30 pt-2.5">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold uppercase">Status</span>
                  <span>{getStatusBadge(selectedSale.status)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Itens Comprados</h3>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl bg-white dark:bg-zinc-950 overflow-hidden px-4">
                  {selectedSale.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="py-3.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 truncate leading-tight">
                            {item.quantity}x {item.product.brand} {item.product.name}
                          </h4>
                          <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium mt-0.5">
                            Tam {item.size} • {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} c/u
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">
                          {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center text-zinc-550 dark:text-zinc-400 font-semibold">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedSale.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                {selectedSale.subtotal - selectedSale.total > 0 && (
                  <div className="flex justify-between items-center text-zinc-550 dark:text-zinc-400 font-semibold">
                    <span>Desconto</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      -{(selectedSale.subtotal - selectedSale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-550 dark:text-zinc-400 font-semibold">
                  <span>Forma de Pagamento</span>
                  <span className="font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                    {getPaymentIcon(selectedSale.paymentMethod)}
                    {getPaymentLabel(selectedSale.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-3 text-sm font-black border-t border-zinc-100 dark:border-zinc-900/65">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">Total Pago</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
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
                    {/* Imprimir 2ª Via Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toast.success('Sinal de impressão enviado! Imprimindo 2ª via do recibo ' + selectedSale.id + '...');
                      }}
                      className="py-3 px-4 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-zinc-500" />
                      Imprimir 2ª Via
                    </button>
                    
                    {/* Iniciar Troca / Devolução Button */}
                    <button
                      type="button"
                      onClick={() => setIsOptionsModalOpen(true)}
                      className="py-3 px-4 bg-red-50/50 hover:bg-red-50 dark:bg-red-955/10 dark:hover:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-200/20 dark:border-red-900/10 text-xs font-bold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Iniciar Troca / Devolução
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
        </div>
      )}

      {/* Modal: Processar Troca (Sub-modal) */}
      {isExchangeOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleProcessExchange}
            className="w-full max-w-md overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-805 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-955/20 text-blue-500 mb-4 border border-zinc-200/10 flex items-center justify-center self-center animate-bounce">
              <RotateCcw className="w-6 h-6" />
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
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-805 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50"
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
                <div className="p-3.5 bg-green-50 dark:bg-green-955/20 border border-green-200/20 dark:border-green-900/10 rounded-2xl text-center">
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
      )}

      {/* Modal: Processar Estorno (Sub-modal) */}
      {isReturnOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleProcessReturn}
            className="w-full max-w-sm overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-805 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-955/20 text-red-500 mb-4 border border-zinc-200/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center mb-2">
              Estornar Venda Completa?
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-550 mb-6 text-center leading-relaxed">
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

      {/* Modal: Escolha Troca / Devolução */}
      {isOptionsModalOpen && selectedSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div 
            className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 mb-4 border border-zinc-200/10 flex items-center justify-center self-center shrink-0">
              <RotateCcw className="w-5 h-5 text-zinc-500" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center mb-2">
              Iniciar Troca ou Devolução
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mb-6 text-center leading-relaxed">
              Escolha a operação que deseja realizar para a venda <span className="font-mono font-bold">{selectedSale.id}</span>.
            </p>

            <div className="w-full space-y-3.5 mb-6">
              {/* Option 1: Trocar Item */}
              <button
                type="button"
                disabled={selectedSale.status === 'exchanged'}
                onClick={() => {
                  setIsOptionsModalOpen(false);
                  if (selectedSale.items.length > 0) {
                    setExchangeItem(selectedSale.items[0]);
                  }
                  setIsExchangeOpen(true);
                }}
                className="w-full text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all flex items-center gap-4 cursor-pointer disabled:opacity-45 disabled:pointer-events-none group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    Trocar Item Específico
                  </h4>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                    Devolver um produto da venda e gerar crédito para compras no PDV.
                  </p>
                </div>
              </button>

              {/* Option 2: Estornar Venda Completa */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsModalOpen(false);
                  setIsReturnOpen(true);
                }}
                className="w-full text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all flex items-center gap-4 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    Estornar Venda Completa
                  </h4>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                    Cancelar o recibo e devolver o valor total das mercadorias.
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOptionsModalOpen(false)}
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:active:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
