'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  User,
  Target,
  Sparkles,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Sale, PaymentMethod, Product } from '@/types';
import DatePickerWithRange from '@/components/ui/DatePickerWithRange';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { MOCK_PRODUCTS } from '@/data/mockProducts';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Crédito',
  debit_card: 'Débito',
  pix: 'PIX',
  money: 'Dinheiro',
};

// Help helper to seed mock history sales if empty, so the user sees a beautiful dashboard at first load
const SEED_SALES: Sale[] = [
  {
    id: 'SNK-92842-1',
    items: [
      {
        id: 'prod-yeezy-350-38',
        product: { id: 'prod-yeezy-350', name: 'Yeezy Boost 350 V2', brand: 'Adidas', group: 'Adidas', price: 1899.90, imageUrl: '', sizes: [] },
        size: '38',
        sku: 'ADI-YZ350-WHT-38',
        barcode: '789000100038',
        quantity: 1,
        price: 1899.90
      }
    ],
    customer: { name: 'Gustavo Santos', cpf: '123.456.789-00' },
    subtotal: 1899.90,
    total: 1899.90,
    paymentMethod: 'pix',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleDateString('pt-BR') + ' 10:30' // 12 hours ago
  },
  {
    id: 'SNK-74829-5',
    items: [
      {
        id: 'prod-airforce-1-40',
        product: { id: 'prod-airforce-1', name: 'Air Force 1 \'07 Triple White', brand: 'Nike', group: 'Nike', price: 799.90, imageUrl: '', sizes: [] },
        size: '40',
        sku: 'NKE-AF1-WHT-40',
        barcode: '789000200040',
        quantity: 2,
        price: 799.90
      }
    ],
    customer: { name: 'Mariana Lima', cpf: '987.654.321-11' },
    subtotal: 1599.80,
    total: 1599.80,
    paymentMethod: 'credit_card',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') + ' 16:15' // 1 day ago
  },
  {
    id: 'SNK-38501-9',
    items: [
      {
        id: 'prod-jordan-1-39',
        product: { id: 'prod-jordan-1', name: 'Air Jordan 1 Retro High OG', brand: 'Nike', group: 'Nike', price: 1499.90, imageUrl: '', sizes: [] },
        size: '39',
        sku: 'NKE-AJ1-RED-39',
        barcode: '789000300039',
        quantity: 1,
        price: 1499.90
      }
    ],
    customer: undefined,
    subtotal: 1499.90,
    total: 1499.90,
    paymentMethod: 'money',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') + ' 11:05' // 3 days ago
  },
  {
    id: 'SNK-20481-2',
    items: [
      {
        id: 'prod-adidas-samba-38',
        product: { id: 'prod-adidas-samba', name: 'Samba Leather Black/White', brand: 'Adidas', group: 'Adidas', price: 699.90, imageUrl: '', sizes: [] },
        size: '38',
        sku: 'ADI-SAM-BLK-38',
        barcode: '789000400038',
        quantity: 1,
        price: 699.90
      },
      {
        id: 'prod-airforce-1-38',
        product: { id: 'prod-airforce-1', name: 'Air Force 1 \'07 Triple White', brand: 'Nike', group: 'Nike', price: 799.90, imageUrl: '', sizes: [] },
        size: '38',
        sku: 'NKE-AF1-WHT-38',
        barcode: '789000200038',
        quantity: 1,
        price: 799.90
      }
    ],
    customer: { name: 'Rodrigo Faro', cpf: '444.555.666-77' },
    subtotal: 1499.80,
    total: 1499.80,
    paymentMethod: 'debit_card',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') + ' 14:40' // 4 days ago
  },
  {
    id: 'SNK-59421-4',
    items: [
      {
        id: 'prod-nb-550-40',
        product: { id: 'prod-nb-550', name: 'New Balance 550 White Blue', brand: 'New Balance', group: 'New Balance', price: 899.90, imageUrl: '', sizes: [] },
        size: '40',
        sku: 'NB-550-BLU-40',
        barcode: '789000500040',
        quantity: 1,
        price: 899.90
      }
    ],
    customer: undefined,
    subtotal: 899.90,
    total: 899.90,
    paymentMethod: 'pix',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') + ' 09:20' // 6 days ago
  }
];

// Helper functions defined outside component
function parseSaleDate(dateStr: string): Date {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [0, 0];
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return new Date();
    }
    return new Date(year, month - 1, day, hours, minutes);
  } catch {
    return new Date();
  }
}

function filterSalesByDate(salesList: Sale[], start: Date, end: Date): Sale[] {
  const startCopy = new Date(start);
  startCopy.setHours(0, 0, 0, 0);
  const endCopy = new Date(end);
  endCopy.setHours(23, 59, 59, 999);

  return salesList.filter(sale => {
    try {
      const saleDate = parseSaleDate(sale.createdAt);
      return saleDate >= startCopy && saleDate <= endCopy;
    } catch {
      return false;
    }
  });
}

function calculateDailyGoal(salesList: Sale[]): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const salesInLast30Days = salesList.filter(sale => {
    try {
      const saleDate = parseSaleDate(sale.createdAt);
      return saleDate >= thirtyDaysAgo;
    } catch {
      return false;
    }
  });

  const totalRevenue = salesInLast30Days.reduce((sum, sale) => sum + sale.total, 0);
  const dailyAverage = totalRevenue / 30;
  const goal = dailyAverage * 1.10;
  return Math.max(goal, 1200); // Floor of R$ 1.200,00
}

export default function DashboardPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'today' | 'yesterday' | '7days' | '30days' | 'custom'>('7days');
  const [isReplenishmentOpen, setIsReplenishmentOpen] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedHide = localStorage.getItem('hide_out_of_stock_pdv');
        return savedHide ? JSON.parse(savedHide) : false;
      }
    } catch (e) {
      console.warn('Failed to load hide_out_of_stock_pdv in Dashboard state:', e);
    }
    return false;
  });
  const [replenishAmounts, setReplenishAmounts] = useState<Record<string, number>>({});
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Load sales and products from local storage
  useEffect(() => {
    let salesList: Sale[] = SEED_SALES;
    let productsList: Product[] = [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSales = localStorage.getItem('sneaker_pos_sales');
        if (savedSales) {
          salesList = JSON.parse(savedSales);
        } else {
          localStorage.setItem('sneaker_pos_sales', JSON.stringify(SEED_SALES));
        }

        const savedProducts = localStorage.getItem('sneaker_pos_products');
        if (savedProducts) {
          productsList = JSON.parse(savedProducts);
        } else {
          localStorage.setItem('sneaker_pos_products', JSON.stringify(MOCK_PRODUCTS));
          productsList = MOCK_PRODUCTS;
        }
      }
    } catch (e) {
      console.warn('Failed to load data from LocalStorage:', e);
      salesList = SEED_SALES;
      productsList = MOCK_PRODUCTS;
    }
    const finalSales = salesList;
    const finalProducts = productsList;
    setTimeout(() => {
      setSales(finalSales);
      setProducts(finalProducts);
    }, 0);
  }, []);

  // Listen to background simulator updates to reload dashboard data in real-time
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
        console.warn('Failed to reload dashboard stats:', e);
      }
    };
    window.addEventListener('sneaker_pos_update', handleUpdate);
    return () => window.removeEventListener('sneaker_pos_update', handleUpdate);
  }, []);

  // Sync date range dynamically via useMemo (avoids set-state-in-effect issues)
  const dateRange = useMemo(() => {
    let start = new Date();
    let end = new Date();

    switch (filterType) {
      case 'today':
        start = new Date();
        end = new Date();
        break;
      case 'yesterday':
        start = new Date();
        start.setDate(start.getDate() - 1);
        end = new Date();
        end.setDate(end.getDate() - 1);
        break;
      case '7days':
        start = new Date();
        start.setDate(start.getDate() - 6);
        end = new Date();
        break;
      case '30days':
        start = new Date();
        start.setDate(start.getDate() - 29);
        end = new Date();
        break;
      case 'custom':
        if (customStart && customEnd) {
          const [sYear, sMonth, sDay] = customStart.split('-').map(Number);
          start = new Date(sYear, sMonth - 1, sDay);
          const [eYear, eMonth, eDay] = customEnd.split('-').map(Number);
          end = new Date(eYear, eMonth - 1, eDay);
        }
        break;
    }
    return { start, end };
  }, [filterType, customStart, customEnd]);

  // Reactive metrics
  const filteredSales = useMemo(() => {
    return filterSalesByDate(sales, dateRange.start, dateRange.end);
  }, [sales, dateRange]);

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    return sales
      .filter(sale => sale.createdAt.split(' ')[0] === todayStr)
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  const dailyGoal = useMemo(() => {
    return calculateDailyGoal(sales);
  }, [sales]);

  const periodMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const salesCount = filteredSales.length;
    const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;
    return {
      totalRevenue,
      salesCount,
      averageTicket
    };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const data: { dayName: string; total: number }[] = [];
    
    const startCopy = new Date(dateRange.start);
    startCopy.setHours(0, 0, 0, 0);
    const endCopy = new Date(dateRange.end);
    endCopy.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(endCopy.getTime() - startCopy.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays === 1) {
      const dateStr = startCopy.toLocaleDateString('pt-BR');
      const periods = [
        { name: 'Manhã (08-11h)', startHour: 8, endHour: 11 },
        { name: 'Almoço (11-14h)', startHour: 11, endHour: 14 },
        { name: 'Tarde (14-17h)', startHour: 14, endHour: 17 },
        { name: 'Noite (17-22h)', startHour: 17, endHour: 22 }
      ];
      
      periods.forEach(p => {
        const total = sales
          .filter(sale => {
            const parts = sale.createdAt.split(' ');
            if (parts[0] !== dateStr) return false;
            const time = parts[1];
            if (!time) return false;
            const hour = parseInt(time.split(':')[0], 10);
            return hour >= p.startHour && hour < p.endHour;
          })
          .reduce((sum, sale) => sum + sale.total, 0);
        data.push({ dayName: p.name, total });
      });
    } else if (diffDays <= 14) {
      for (let i = 0; i < diffDays; i++) {
        const current = new Date(startCopy);
        current.setDate(current.getDate() + i);
        const dayName = weekdays[current.getDay()];
        const dateStr = current.toLocaleDateString('pt-BR');
        
        const total = sales
          .filter(sale => sale.createdAt.split(' ')[0] === dateStr)
          .reduce((sum, sale) => sum + sale.total, 0);
        
        data.push({ 
          dayName: diffDays > 7 ? `${dayName} ${current.getDate()}/${current.getMonth() + 1}` : dayName, 
          total 
        });
      }
    } else {
      for (let i = 0; i < diffDays; i++) {
        const current = new Date(startCopy);
        current.setDate(current.getDate() + i);
        const dateStr = current.toLocaleDateString('pt-BR');
        
        const total = sales
          .filter(sale => sale.createdAt.split(' ')[0] === dateStr)
          .reduce((sum, sale) => sum + sale.total, 0);
        
        const showLabel = diffDays <= 20 || i % Math.ceil(diffDays / 8) === 0 || i === diffDays - 1;
        
        data.push({
          dayName: showLabel ? `${current.getDate()}/${current.getMonth() + 1}` : '',
          total
        });
      }
    }
    
    return data;
  }, [sales, dateRange]);

  const maxSalesVal = useMemo(() => {
    return Math.max(...chartData.map(d => d.total), 1000);
  }, [chartData]);

  const topProducts = useMemo(() => {
    const productMap: Record<string, {
      id: string;
      name: string;
      brand: string;
      colorway?: string;
      imageUrl: string;
      quantity: number;
      totalRevenue: number;
    }> = {};

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const p = item.product;
        if (!productMap[p.id]) {
          productMap[p.id] = {
            id: p.id,
            name: p.name,
            brand: p.brand,
            colorway: p.colorway,
            imageUrl: p.imageUrl || '',
            quantity: 0,
            totalRevenue: 0
          };
        }
        productMap[p.id].quantity += item.quantity;
        productMap[p.id].totalRevenue += item.quantity * item.price;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity || b.totalRevenue - a.totalRevenue)
      .slice(0, 3);
  }, [filteredSales]);

  const paymentBreakdown = useMemo(() => {
    let pixTotal = 0;
    let cardTotal = 0;
    let moneyTotal = 0;

    filteredSales.forEach(sale => {
      if (sale.paymentMethod === 'pix') {
        pixTotal += sale.total;
      } else if (sale.paymentMethod === 'credit_card' || sale.paymentMethod === 'debit_card') {
        cardTotal += sale.total;
      } else if (sale.paymentMethod === 'money') {
        moneyTotal += sale.total;
      }
    });

    const total = pixTotal + cardTotal + moneyTotal;

    // Normalize percentages to sum to 100 if total > 0
    let pixPctNorm = 0;
    let cardPctNorm = 0;
    let moneyPctNorm = 0;
    if (total > 0) {
      const sum = pixTotal + cardTotal + moneyTotal;
      pixPctNorm = (pixTotal / sum) * 100;
      cardPctNorm = (cardTotal / sum) * 100;
      moneyPctNorm = (moneyTotal / sum) * 100;
    }

    return {
      pixTotal,
      cardTotal,
      moneyTotal,
      total,
      pixPct: pixPctNorm,
      cardPct: cardPctNorm,
      moneyPct: moneyPctNorm
    };
  }, [filteredSales]);

  const stockAlerts = useMemo(() => {
    const alerts: {
      id: string;
      name: string;
      brand: string;
      colorway?: string;
      imageUrl: string;
      size: string;
      stock: number;
    }[] = [];

    products.forEach(p => {
      p.sizes.forEach(sz => {
        if (sz.stock <= 2) {
          alerts.push({
            id: `${p.id}-${sz.size}`,
            name: p.name,
            brand: p.brand,
            colorway: p.colorway,
            imageUrl: p.imageUrl || '',
            size: sz.size,
            stock: sz.stock
          });
        }
      });
    });

    // Fallback alerts if none match critical thresholds
    if (alerts.length === 0) {
      return [
        {
          id: 'mock-1',
          name: 'Air Force 1 \'07 Triple White',
          brand: 'Nike',
          colorway: 'Triple White',
          imageUrl: '',
          size: '41',
          stock: 0
        },
        {
          id: 'mock-2',
          name: 'Yeezy Boost 350 V2',
          brand: 'Adidas',
          colorway: 'Zebra',
          imageUrl: '',
          size: '42',
          stock: 1
        },
        {
          id: 'mock-3',
          name: 'Samba Leather Black/White',
          brand: 'Adidas',
          colorway: 'Black/White',
          imageUrl: '',
          size: '39',
          stock: 2
        },
        {
          id: 'mock-4',
          name: 'New Balance 550 White Blue',
          brand: 'New Balance',
          colorway: 'White Blue',
          imageUrl: '',
          size: '40',
          stock: 0
        }
      ];
    }

    return alerts;
  }, [products]);

  const handleReplenishStock = (productId: string, size: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor, digite uma quantidade válida.");
      return;
    }

    const updated = products.map(p => {
      if (p.id === productId) {
        const updatedSizes = p.sizes.map(sz => {
          if (sz.size === size) {
            return { ...sz, stock: sz.stock + amount };
          }
          return sz;
        });
        return { ...p, sizes: updatedSizes };
      }
      return p;
    });

    setProducts(updated);
    try {
      localStorage.setItem('sneaker_pos_products', JSON.stringify(updated));
      toast.success(`Adicionado ${amount} par(es) de tamanho ${size}!`);
      setReplenishAmounts(prev => ({ ...prev, [`${productId}-${size}`]: 0 }));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar estoque.");
    }
  };

  const getChartTitle = () => {
    switch (filterType) {
      case 'today':
        return 'Receita de Hoje (Por Período)';
      case 'yesterday':
        return 'Receita de Ontem (Por Período)';
      case '7days':
        return 'Receita nos Últimos 7 Dias';
      case '30days':
        return 'Receita nos Últimos 30 Dias';
      case 'custom':
        return 'Receita no Período Customizado';
      default:
        return 'Detalhamento de Receita';
    }
  };

  const getChartSubtitle = () => {
    switch (filterType) {
      case 'today':
        return 'Distribuição das vendas realizadas hoje.';
      case 'yesterday':
        return 'Distribuição das vendas realizadas ontem.';
      case '7days':
        return 'Detalhamento financeiro da última semana.';
      case '30days':
        return 'Detalhamento financeiro dos últimos 30 dias.';
      case 'custom':
        return `Detalhamento financeiro de ${dateRange.start.toLocaleDateString('pt-BR')} até ${dateRange.end.toLocaleDateString('pt-BR')}.`;
      default:
        return 'Detalhamento financeiro do caixa.';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleExportXlsx = () => {
    if (filteredSales.length === 0) {
      toast.error('Nenhuma transação encontrada no período para exportar.');
      return;
    }

    const dataToExport = filteredSales.map((sale) => {
      const productsStr = sale.items
        .map((item) => `${item.quantity}x ${item.product.name} (${item.product.brand}${item.product.colorway ? ` - ${item.product.colorway}` : ''} - Tam. ${item.size})`)
        .join(', ');

      return {
        'Data': sale.createdAt,
        'Cliente/ID': sale.customer ? `${sale.customer.name} (${sale.id})` : `Consumidor (${sale.id})`,
        'Produto(s)': productsStr,
        'Método de Pagamento': PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod,
        'Valor Total': sale.total,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Vendas');

    // Auto-fit column widths
    const maxLens = Object.keys(dataToExport[0]).map((key) => {
      let maxLen = key.length;
      dataToExport.forEach((row) => {
        const val = row[key as keyof typeof row];
        if (val !== undefined && val !== null) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: maxLen + 4 };
    });
    worksheet['!cols'] = maxLens;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const filename = `Relatorio_Vendas_Sneaker_${day}-${month}-${year}.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success('Relatório gerado com sucesso!');
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard Financeiro</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Métricas de receita e histórico consolidado do caixa.</p>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="bg-zinc-200/35 dark:bg-zinc-900/60 p-1 rounded-2xl flex gap-1 border border-zinc-200/20 dark:border-zinc-800/40 overflow-x-auto whitespace-nowrap hide-scrollbar max-w-full w-full sm:w-auto">
            {[
              { label: 'Hoje', value: 'today' },
              { label: 'Ontem', value: 'yesterday' },
              { label: '7 Dias', value: '7days' },
              { label: '30 Dias', value: '30days' },
              { label: 'Personalizado', value: 'custom' }
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => setFilterType(preset.value as 'today' | 'yesterday' | '7days' | '30days' | 'custom')}
                className={`text-[11px] px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                  filterType === preset.value
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/10'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {filterType === 'custom' && (
            <DatePickerWithRange 
              selectedRange={dateRange}
              onChange={(range) => {
                setCustomStart(range.start.toISOString().split('T')[0]);
                setCustomEnd(range.end.toISOString().split('T')[0]);
              }}
            />
          )}

          <button
            onClick={handleExportXlsx}
            className="flex items-center justify-center gap-2 text-[11px] px-3.5 py-1.5 rounded-xl font-medium transition-all border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50 active:scale-98 shadow-sm cursor-pointer w-full sm:w-auto"
            title="Exportar transações do período para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .XLSX</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* KPI: Period Revenue */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm p-5 rounded-3xl relative overflow-hidden select-none flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Faturamento</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-2 leading-none">
              {formatCurrency(periodMetrics.totalRevenue)}
            </h3>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-550 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Receita consolidada
              </span>
              no período
            </p>
          </div>
        </div>

        {/* KPI: Period Sales Count */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm p-5 rounded-3xl relative overflow-hidden select-none flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Vendas</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-450 border border-blue-100 dark:border-blue-900/30">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-2 leading-none">
              {periodMetrics.salesCount} <span className="text-xs font-normal text-zinc-400">pedidos</span>
            </h3>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-400 mt-1">
              Transações efetuadas no período
            </p>
          </div>
        </div>

        {/* KPI: Period Average Ticket */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm p-5 rounded-3xl relative overflow-hidden select-none flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Ticket Médio</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-500 dark:text-purple-450 border border-purple-100 dark:border-purple-900/30">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-2 leading-none">
              {formatCurrency(periodMetrics.averageTicket)}
            </h3>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-400 mt-1">
              Média por transação no período
            </p>
          </div>
        </div>

        {/* KPI: Progresso da Meta Diária */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm p-5 rounded-3xl relative overflow-hidden select-none flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Meta Diária</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30">
              <Target className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                {formatCurrency(todayRevenue)}
              </h3>
              <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                meta: {formatCurrency(dailyGoal)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, dailyGoal > 0 ? (todayRevenue / dailyGoal) * 100 : 0)}%` }}
              />
            </div>
            
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 flex items-center gap-1">
              {todayRevenue >= dailyGoal ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Meta diária atingida!
                </span>
              ) : (
                <span>
                  Faltam <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(dailyGoal - todayRevenue)}</span> para a meta
                </span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Main Charts & Table section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Chart and Transactions table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico de Vendas */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider">{getChartTitle()}</h3>
                  <p className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-0.5">{getChartSubtitle()}</p>
                </div>
              </div>
              
              {/* Custom Tailwind Bar Chart */}
              <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                <div className="h-48 flex items-end justify-between gap-2.5 pt-4 min-w-[450px] md:min-w-0">
                  {chartData.map((d, index) => {
                    const pct = Math.max(8, (d.total / maxSalesVal) * 100);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        
                        {/* Bar Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-zinc-900/95 dark:bg-zinc-50/95 text-white dark:text-zinc-950 text-[9px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-10 border border-zinc-800 dark:border-zinc-200">
                          {formatCurrency(d.total)}
                        </div>

                        {/* Chart Bar */}
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-750 ease-out origin-bottom ${
                            d.total > 0 
                              ? 'bg-zinc-900 dark:bg-zinc-50 group-hover:opacity-80' 
                              : 'bg-zinc-100 dark:bg-zinc-900/50'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                        
                        {/* Day label */}
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium truncate max-w-full text-center">
                          {d.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-4 mt-4 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Gráfico dinâmico alimentado pelo caixa</span>
              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                Sincronizado <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Últimas Vendas Table */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider">Transações do Período</h3>
                <span className="text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">Fita de Caixa</span>
              </div>

              {/* List */}
              {filteredSales.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">Nenhuma transação encontrada</p>
                  <p className="text-[10px] opacity-75 mt-0.5">As transações realizadas no período aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {filteredSales.slice(0, 5).map((sale) => (
                    <div 
                      key={sale.id}
                      className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-xl transition-colors border border-transparent hover:border-zinc-200/10"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7.5 h-7.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200/20 text-zinc-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-none truncate">
                            {sale.customer ? sale.customer.name : 'Consumidor'}
                          </p>
                          <p className="text-[9px] text-zinc-400 mt-1 leading-none font-mono">
                            {sale.id} • {PAYMENT_LABELS[sale.paymentMethod]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold">{formatCurrency(sale.total)}</p>
                        <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">{sale.createdAt.split(' ')[1] || sale.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-4 mt-4 flex justify-end">
              <span className="text-[9px] text-zinc-400 font-medium flex items-center gap-0.5 cursor-pointer hover:text-zinc-650 transition-colors">
                Ver histórico completo <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Payment split & Top Selling Products */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Divisão de Pagamentos */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider mb-1">Divisão de Pagamentos</h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mb-4">Proporção financeira por meio de pagamento no período.</p>
              
              {/* iOS style storage segmented bar */}
              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex mb-4">
                {paymentBreakdown.total > 0 ? (
                  <>
                    {paymentBreakdown.pixPct > 0 && (
                      <div 
                        className="h-full bg-emerald-500 transition-all" 
                        style={{ width: `${paymentBreakdown.pixPct}%` }} 
                        title={`PIX: ${paymentBreakdown.pixPct.toFixed(0)}%`}
                      />
                    )}
                    {paymentBreakdown.cardPct > 0 && (
                      <div 
                        className="h-full bg-blue-500 transition-all" 
                        style={{ width: `${paymentBreakdown.cardPct}%` }} 
                        title={`Cartões: ${paymentBreakdown.cardPct.toFixed(0)}%`}
                      />
                    )}
                    {paymentBreakdown.moneyPct > 0 && (
                      <div 
                        className="h-full bg-amber-500 transition-all" 
                        style={{ width: `${paymentBreakdown.moneyPct}%` }} 
                        title={`Dinheiro: ${paymentBreakdown.moneyPct.toFixed(0)}%`}
                      />
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" />
                )}
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>PIX</span>
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(paymentBreakdown.pixTotal)} ({paymentBreakdown.pixPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>Cartão (Crédito/Débito)</span>
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(paymentBreakdown.cardTotal)} ({paymentBreakdown.cardPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Dinheiro</span>
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(paymentBreakdown.moneyTotal)} ({paymentBreakdown.moneyPct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Top Produtos Vendidos */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider mb-1">Produtos mais Vendidos</h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mb-4">Os 3 tênis mais vendidos no período.</p>
              
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-400">
                  <ShoppingBag className="w-7 h-7 opacity-30 mb-1.5" />
                  <p className="text-[10px] font-semibold">Nenhum produto vendido no período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-2xl transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Placement badge */}
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 w-4 text-center shrink-0">
                          #{idx + 1}
                        </span>
                        
                        {/* Product Thumbnail */}
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={p.imageUrl} 
                              alt={p.name} 
                              className="w-full h-full aspect-square object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-450 dark:text-zinc-500">
                              SNK
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[9px] text-zinc-400 truncate leading-tight mt-0.5">
                            {p.brand} {p.colorway ? `• ${p.colorway}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quantity / Revenue */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-50 block">
                          {p.quantity} {p.quantity === 1 ? 'par' : 'pares'}
                        </span>
                        <span className="text-[9px] text-zinc-450 dark:text-zinc-400 block mt-0.5">
                          {formatCurrency(p.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: Alertas de Estoque */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider mb-1">Alertas de Estoque</h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-500 mb-4">Numerações baixas ou esgotadas.</p>
              
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between gap-3 p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-2xl transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Product Thumbnail */}
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 overflow-hidden shrink-0 flex items-center justify-center">
                        {alert.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={alert.imageUrl} 
                            alt={alert.name} 
                            className="w-full h-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-450 dark:text-zinc-500">
                            SNK
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                          {alert.name}
                        </p>
                        <p className="text-[9px] text-zinc-450 dark:text-zinc-400 truncate leading-tight mt-0.5">
                          Tamanho {alert.size} • {alert.brand}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="shrink-0">
                      {alert.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Esgotado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          Restam {alert.stock}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trigger to open replenishment Modal */}
              <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-4 mt-4 flex justify-end">
                <button
                  onClick={() => setIsReplenishmentOpen(true)}
                  className="text-[10px] text-zinc-555 dark:text-zinc-400 font-semibold flex items-center gap-1 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors bg-transparent border-0 focus:outline-none"
                >
                  Gerenciar Alertas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dialog Modal: Central de Reposição */}
      {isReplenishmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="w-full max-w-xl overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col max-h-[80vh] transform scale-100 transition-transform duration-300 animate-in zoom-in-95">
            
            {/* Header with Title and Global Action */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-zinc-150/40 dark:border-zinc-900/60 pb-6 mb-6">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Central de Reposição
                </h3>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 leading-relaxed">
                  Atualize o saldo de itens críticos e organize sua vitrine.
                </p>
              </div>
              
              <button
                onClick={() => {
                  const nextVal = !hideOutOfStock;
                  setHideOutOfStock(nextVal);
                  localStorage.setItem('hide_out_of_stock_pdv', JSON.stringify(nextVal));
                  toast.success(nextVal ? "Esgotados serão ocultados do PDV." : "Todos os itens serão exibidos no PDV.");
                }}
                className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-xl font-bold border transition-all shrink-0 cursor-pointer ${
                  hideOutOfStock
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950'
                    : 'bg-white dark:bg-zinc-955 border-zinc-200/60 dark:border-zinc-850 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                {hideOutOfStock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Ocultar Esgotados</span>
              </button>
            </div>

            {/* Scrollable list content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-6">
              {stockAlerts.map((alert) => {
                const inputKey = `${alert.id}`;
                const amountVal = replenishAmounts[inputKey] || 0;
                const isMock = alert.id.startsWith('mock');
                
                return (
                  <div 
                    key={alert.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-900/40 rounded-2xl hover:border-zinc-250 dark:hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail */}
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 overflow-hidden shrink-0 flex items-center justify-center">
                        {alert.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={alert.imageUrl} 
                            alt={alert.name} 
                            className="w-full h-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-[9px] font-black text-zinc-450 dark:text-zinc-500">
                            SNK
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                          {alert.name}
                        </p>
                        <p className="text-[10px] text-zinc-450 dark:text-zinc-400 mt-1 leading-none">
                          Tamanho {alert.size} • {alert.brand}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0 sm:mr-3">
                        {alert.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                            Esgotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400">
                            Restam {alert.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Action replenishment inputs */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={amountVal === 0 ? '' : amountVal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setReplenishAmounts(prev => ({ 
                            ...prev, 
                            [inputKey]: isNaN(val) ? 0 : val 
                          }));
                        }}
                        className="w-16 px-2.5 py-1.5 bg-white dark:bg-zinc-955 border border-zinc-200/60 dark:border-zinc-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      
                      <button
                        onClick={() => {
                          if (amountVal <= 0) {
                            toast.error("Por favor, digite uma quantidade válida.");
                            return;
                          }
                          if (isMock) {
                            toast.success(`[Simulação] Adicionado ${amountVal} par(es) ao ${alert.name} (Tamanho ${alert.size})!`);
                            setReplenishAmounts(prev => ({ ...prev, [inputKey]: 0 }));
                            return;
                          }
                          const dashIndex = alert.id.lastIndexOf('-');
                          const prodId = alert.id.slice(0, dashIndex);
                          const sizeStr = alert.id.slice(dashIndex + 1);
                          handleReplenishStock(prodId, sizeStr, amountVal);
                        }}
                        className="py-1.5 px-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-250 transition-all text-[10px] active:scale-95 cursor-pointer shadow-sm"
                      >
                        Repor
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-150/40 dark:border-zinc-900/60">
              <button
                onClick={() => {
                  setIsReplenishmentOpen(false);
                  router.push('/estoque');
                }}
                className="py-2.5 px-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Ver todo o estoque
              </button>
              <button
                onClick={() => setIsReplenishmentOpen(false)}
                className="py-2.5 px-5 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
