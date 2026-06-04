'use client';

import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { MOCK_PRODUCTS, SNEAKER_IMAGES } from '@/data/mockProducts';
import { Product, SizeStock } from '@/types';
import { 
  Layers, 
  Grid,
  LayoutList,
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Sparkles,
  Save,
  Barcode,
  Camera
} from 'lucide-react';

function formatBRL(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  const cents = parseInt(cleanValue, 10);
  if (isNaN(cents)) return '';
  
  const floatValue = cents / 100;
  return floatValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseBRL(formattedValue: string): number {
  const cleanValue = formattedValue.replace(/\D/g, '');
  if (!cleanValue) return 0;
  return parseInt(cleanValue, 10) / 100;
}

export default function ProdutosPage() {
  // Inventory State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [viewMode, setViewMode] = useState<'detailed' | 'list' | 'grid'>('detailed');

  // Form / Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [groupInput, setGroupInput] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formColorway, setFormColorway] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSizes, setFormSizes] = useState<SizeStock[]>([]);
  const [formImageUrl, setFormImageUrl] = useState('');

  const [formError, setFormError] = useState('');
  
  // Drag and drop / File Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
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
      console.warn('Failed to load products from LocalStorage:', e);
      loadedProducts = MOCK_PRODUCTS;
    }
    setTimeout(() => {
      setProducts(loadedProducts);
    }, 0);
  }, []);

  const saveProductsToDb = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_products', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('Failed to save products to LocalStorage:', e);
    }
  };

  const handleResetInventory = () => {
    if (confirm('Deseja resetar o estoque das grades para os padrões iniciais? Isso apagará customizações.')) {
      saveProductsToDb(MOCK_PRODUCTS);
    }
  };

  // Open Sheet for Adding
  const openAddSheet = () => {
    setEditingProduct(null);
    setGroupInput('');
    setFormName('');
    setFormColorway('');
    setFormPrice('');
    setFormImageUrl(''); // empty to trigger dropzone
    setFormSizes([
      { size: '38', sku: '', barcode: '', stock: 5 },
      { size: '39', sku: '', barcode: '', stock: 5 },
      { size: '40', sku: '', barcode: '', stock: 5 }
    ]);
    setFormError('');
    setIsSheetOpen(true);
  };

  // Open Sheet for Editing
  const openEditSheet = (product: Product) => {
    setEditingProduct(product);
    setGroupInput(product.group || product.brand);
    setFormName(product.name);
    setFormColorway(product.colorway || '');
    setFormPrice(formatBRL(Math.round(product.price * 100).toString()));
    setFormImageUrl(product.imageUrl);
    setFormSizes([...product.sizes]);
    setFormError('');
    setIsSheetOpen(true);
  };

  // Form: Add size row
  const addFormSizeRow = () => {
    let nextSize = '40';
    if (formSizes.length > 0) {
      const lastSizeNum = parseInt(formSizes[formSizes.length - 1].size);
      if (!isNaN(lastSizeNum)) {
        nextSize = (lastSizeNum + 1).toString();
      }
    }

    setFormSizes([
      ...formSizes,
      { size: nextSize, sku: '', barcode: '', stock: 5 }
    ]);
  };

  // Form: Remove size row
  const removeFormSizeRow = (index: number) => {
    setFormSizes(formSizes.filter((_, idx) => idx !== index));
  };

  // Form: Update size row field
  const updateFormSizeRow = (index: number, field: keyof SizeStock, value: string | number) => {
    setFormSizes(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === 'stock' ? (parseInt(value as string) || 0) : value
        };
      }
      return item;
    }));
  };

  // Image Upload / Drag and Drop Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Por favor, carregue apenas arquivos de imagem.');
      return;
    }
    
    setIsCompressing(true);
    setFormError('');

    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImageUrl(event.target.result as string);
          setFormError('');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      setFormError('Falha ao processar e otimizar imagem. Tente outro arquivo.');
      toast.error("Falha ao otimizar imagem.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Form: Submit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const priceNum = parseBRL(formPrice);
    if (!groupInput.trim() || !formName.trim() || priceNum <= 0) {
      setFormError('Por favor, preencha as informações básicas do modelo corretamente.');
      return;
    }

    if (formSizes.length === 0) {
      setFormError('Por favor, adicione pelo menos um tamanho à grade.');
      return;
    }

    const invalidSize = formSizes.some(s => !s.size.trim());
    if (invalidSize) {
      setFormError('O campo de tamanho não pode ficar em branco.');
      return;
    }

    const formattedSizes = formSizes.map(sz => {
      const cleanBrand = groupInput.toUpperCase().replace(/\s+/g, '').slice(0, 3);
      const cleanName = formName.toUpperCase().replace(/\s+/g, '').slice(0, 5);
      const autoSku = sz.sku.trim() || `${cleanBrand}-${cleanName}-${sz.size}`;
      const autoBarcode = sz.barcode.trim() || `789000${Math.floor(100000 + Math.random() * 900000).toString().slice(-6)}`;

      return {
        size: sz.size.trim(),
        sku: autoSku,
        barcode: autoBarcode,
        stock: Math.max(0, sz.stock)
      };
    });

    let updatedProducts: Product[] = [];
    const finalImageUrl = formImageUrl || SNEAKER_IMAGES.airforce; // Fallback to Nike mock if no photo uploaded

    if (editingProduct) {
      // Edit Mode
      updatedProducts = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            brand: groupInput.trim(),
            group: groupInput.trim(),
            name: formName.trim(),
            colorway: formColorway.trim(),
            price: priceNum,
            imageUrl: finalImageUrl,
            sizes: formattedSizes
          };
        }
        return p;
      });
    } else {
      // Add Mode
      const newProduct: Product = {
        id: `prod-custom-${Date.now()}`,
        brand: groupInput.trim(),
        group: groupInput.trim(),
        name: formName.trim(),
        colorway: formColorway.trim(),
        price: priceNum,
        imageUrl: finalImageUrl,
        sizes: formattedSizes
      };
      updatedProducts = [newProduct, ...products];
    }

    saveProductsToDb(updatedProducts);
    setIsSheetOpen(false);
    toast.success(editingProduct ? "Produto salvo com sucesso!" : "Produto cadastrado com sucesso!");
  };

  // Form: Delete Product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja remover este tênis do estoque permanentemente?')) {
      const updated = products.filter(p => p.id !== productId);
      saveProductsToDb(updated);
      setIsSheetOpen(false);
      toast.success("Item removido.");
    }
  };

  // Dynamic Unique Groups
  const uniqueGroups = ['Todos', ...Array.from(new Set(products.map(p => p.group || p.brand).filter(Boolean)))];

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = selectedGroup === 'Todos' || (p.group || p.brand) === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  // Unique groups for combobox select dropdown
  const existingGroups = Array.from(new Set(products.map(p => p.group || p.brand).filter(Boolean)));
  
  const filteredGroupsForSelect = existingGroups.filter(g => 
    g.toLowerCase().includes(groupInput.toLowerCase())
  );
  
  const showCreateOption = groupInput.trim() && !existingGroups.some(g => g.toLowerCase() === groupInput.trim().toLowerCase());

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased min-h-screen relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-200" />
            Estoque & Grade de Produtos
          </h1>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Visualização de estoque por tamanho e códigos de barra para bipagem.
          </p>
        </div>
        <button
          onClick={handleResetInventory}
          className="self-start py-2.5 px-4 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-xs font-semibold rounded-xl border border-zinc-250/20 dark:border-zinc-800 flex items-center gap-2 transition-colors active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restaurar Estoque Inicial
        </button>
      </div>

      {/* Filter and search bar / View Switcher / CTA Button */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search & Add buttons */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450" />
            <input
              type="text"
              placeholder="Filtrar por marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
            />
          </div>
          
          <button
            onClick={openAddSheet}
            className="py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-zinc-950/10 dark:shadow-zinc-50/5 select-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Tênis
          </button>
        </div>
          {/* View Mode Toggle Group */}
        <div className="flex items-center gap-1.5 self-start md:self-center bg-white dark:bg-zinc-955 p-1.5 rounded-2xl border border-zinc-200/40 dark:border-zinc-900 shrink-0 shadow-sm">
          <button
            onClick={() => setViewMode('detailed')}
            className={`p-3.5 md:p-2 rounded-xl transition-all ${
              viewMode === 'detailed'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title="Exibição Detalhada"
          >
            <Layers className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3.5 md:p-2 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title="Exibição em Grade"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`p-3.5 md:p-2 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title="Exibição em Lista"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Horizontal scrolling Group Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {uniqueGroups.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none active:scale-95 border ${
              selectedGroup === g
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 font-bold shadow-sm'
                : 'bg-white border-zinc-200/50 hover:bg-zinc-55 text-zinc-500 hover:text-zinc-800 dark:bg-zinc-950 dark:border-zinc-900 dark:hover:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {g === 'Todos' ? 'Todos os Produtos' : g}
          </button>
        ))}
      </div>

      {/* PRODUCTS DISPLAY SECTION */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl bg-white/40 dark:bg-zinc-950/5">
          <Layers className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">Nenhum produto encontrado</h3>
          <p className="text-xs text-zinc-450 mt-1 max-w-[240px] mx-auto leading-relaxed">Não encontramos calçados que correspondam ao termo pesquisado ou filtro de marca selecionado.</p>
        </div>
      ) : (
        <>
          {/* 1. DETAILED VIEW MODE (Cards with Sizes) */}
          {viewMode === 'detailed' && (
            <div className="space-y-6">
              {filteredProducts.map(prod => {
                const totalStock = prod.sizes.reduce((sum, s) => sum + s.stock, 0);
                return (
                  <div 
                    key={prod.id} 
                    className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-5 lg:p-6 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-center" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{prod.brand}</span>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                            {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                          </h3>
                          <p className="text-[10px] text-zinc-455 mt-1">Preço unitário: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className={`text-[10px] py-1 px-3 rounded-full font-bold uppercase flex items-center gap-1.5 ${
                          totalStock === 0
                            ? 'bg-red-50 text-red-500 dark:bg-red-950/20'
                            : totalStock <= 10
                            ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20'
                            : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20'
                        }`}>
                          {totalStock === 0 ? 'Esgotado' : totalStock <= 10 ? `Baixo Estoque (${totalStock} u.)` : `Em Estoque (${totalStock} u.)`}
                        </span>

                        <button
                          onClick={() => openEditSheet(prod)}
                          className="p-3.5 md:p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all border border-zinc-200/20 flex items-center justify-center"
                          title="Editar Tênis"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[10px] text-zinc-450 dark:text-zinc-555 uppercase font-bold tracking-wider mb-3">Grade de Tamanhos & Códigos de Barras</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {prod.sizes.map(sz => (
                        <div 
                          key={sz.sku}
                          className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-150">Tamanho {sz.size}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                sz.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/45 dark:text-red-400' :
                                sz.stock <= 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/45 dark:text-amber-400' :
                                'bg-zinc-200/50 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400'
                              }`}>
                                {sz.stock} u.
                              </span>
                            </div>
                            <p className="text-[8px] text-zinc-400 font-mono mt-1 truncate">{sz.sku}</p>
                            <p className="text-[8px] text-zinc-400 font-mono leading-none truncate mt-0.5 flex items-center gap-0.5"><Barcode className="w-2.5 h-2.5 opacity-60" /> {sz.barcode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GRID VIEW MODE (Compact Cards style e-commerce) */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
              {filteredProducts.map(prod => {
                const totalStock = prod.sizes.reduce((sum, s) => sum + s.stock, 0);
                return (
                  <div 
                    key={prod.id}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl p-4 flex flex-col justify-between hover:shadow-md transition-all relative group"
                  >
                    <button
                      onClick={() => openEditSheet(prod)}
                      className="absolute top-3 right-3 p-1.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-3 h-3" />
                    </button>

                    <div className="w-full aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900/60 overflow-hidden mb-3 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-center" />
                    </div>

                    <div>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{prod.brand}</span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5" title={`${prod.name}${prod.colorway ? ` - ${prod.colorway}` : ''}`}>
                        {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                      </h4>
                      <p className="text-sm font-black mt-1 leading-none">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900/60 flex justify-between items-center text-[9px]">
                      <span className="text-zinc-400 font-medium">Estoque Total</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded-full ${
                        totalStock === 0 ? 'bg-red-50 text-red-500 dark:bg-red-950/20' :
                        totalStock <= 10 ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' :
                        'bg-zinc-100 text-zinc-655 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}>{totalStock} u.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. LIST VIEW MODE (Compact Apple Table) */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 uppercase font-bold tracking-wider bg-zinc-50/50 dark:bg-zinc-950">
                      <th className="py-4 px-6 w-20">Foto</th>
                      <th className="py-4 px-4">Modelo</th>
                      <th className="py-4 px-4">Marca / Grupo</th>
                      <th className="py-4 px-4 text-right">Preço</th>
                      <th className="py-4 px-4 text-center">Grade (Total)</th>
                      <th className="py-4 px-6 text-center w-24">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(prod => {
                      const totalStock = prod.sizes.reduce((sum, s) => sum + s.stock, 0);
                      return (
                        <tr 
                          key={prod.id} 
                          className="border-b border-zinc-100 dark:border-zinc-900 text-xs hover:bg-zinc-55/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-center" />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                          </td>
                          <td className="py-3 px-4 uppercase text-zinc-400 dark:text-zinc-500 font-semibold">{prod.brand}</td>
                          <td className="py-3 px-4 text-right font-black">{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              totalStock === 0 ? 'bg-red-50 text-red-500 dark:bg-red-950/20' :
                              totalStock <= 10 ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' :
                              'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400'
                            }`}>{totalStock} u. ({prod.sizes.length} tam.)</span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => openEditSheet(prod)}
                              className="p-3.5 md:p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center justify-center mx-auto"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* DYNAMIC CRUD SHEET: Gaveta Lateral de Cadastro (Apple-style drawer) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setIsGroupDropdownOpen(false);
              setIsSheetOpen(false);
            }}
          />

          {/* Sheet Drawer Container */}
          <div 
            className="relative w-full max-w-lg bg-white/98 dark:bg-zinc-950/98 h-full shadow-2xl flex flex-col z-10 border-l border-zinc-200/40 dark:border-zinc-900 transition-transform duration-300 animate-in slide-in-from-right"
          >
            
            {/* Sheet Header */}
            <div className="h-16 border-b border-zinc-150/40 dark:border-zinc-900 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-zinc-50" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
                  {editingProduct ? 'Editar Modelo' : 'Novo Tênis no Estoque'}
                </h2>
              </div>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-55/60 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-650"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body (Scrollable Form) */}
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Form Error message */}
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-3 text-red-700 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Informações Básicas do Tênis
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Searchable Combobox for Brand / Group */}
                    <div className="relative">
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Grupo / Marca</label>
                      <input 
                        type="text" 
                        placeholder="Pesquise ou crie uma marca..." 
                        value={groupInput}
                        onChange={(e) => {
                          setGroupInput(e.target.value);
                          setIsGroupDropdownOpen(true);
                        }}
                        onFocus={() => setIsGroupDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsGroupDropdownOpen(false), 220);
                        }}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                        required
                      />
                      {isGroupDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-40 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-xl rounded-xl p-1 backdrop-blur-xl animate-in fade-in duration-100">
                          {filteredGroupsForSelect.map(g => (
                            <div
                              key={g}
                              onClick={() => {
                                setGroupInput(g);
                                setIsGroupDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-xs hover:bg-zinc-55 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors text-zinc-800 dark:text-zinc-200 text-left"
                            >
                              {g}
                            </div>
                          ))}
                          {showCreateOption && (
                            <div
                              onClick={() => {
                                setGroupInput(groupInput.trim());
                                setIsGroupDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-xs hover:bg-zinc-55 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors text-emerald-600 dark:text-emerald-400 font-semibold border-t border-zinc-100 dark:border-zinc-800 mt-1 text-left"
                            >
                              + Criar grupo &ldquo;{groupInput}&rdquo;
                            </div>
                          )}
                          {filteredGroupsForSelect.length === 0 && !showCreateOption && (
                            <div className="px-3 py-2 text-xs text-zinc-400 text-center">Digite para criar novo grupo</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Modelo</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Dunk Low" 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Cor / Colorway</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Preto/Branco" 
                        value={formColorway}
                        onChange={(e) => setFormColorway(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Preço Unitário (R$)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: R$ 899,90" 
                        value={formPrice}
                        onChange={(e) => setFormPrice(formatBRL(e.target.value))}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                        required
                      />
                    </div>

                  </div>

                  {/* Photo Real Upload Section (NEW MODULE) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Foto do Tênis</label>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    {formImageUrl ? (
                      /* Preview Mode */
                      <div className="relative w-full aspect-square max-h-48 rounded-2xl border border-zinc-200/40 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 overflow-hidden flex items-center justify-center p-0 animate-in fade-in duration-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover object-center" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageUrl('');
                            toast.info("Foto removida.");
                          }}
                          className="absolute top-2.5 right-2.5 py-1.5 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-500 text-[10px] font-bold rounded-lg border border-red-200/20 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover
                        </button>
                      </div>
                    ) : (
                      /* Dropzone Mode */
                      <div
                        onClick={isCompressing ? undefined : triggerFileSelect}
                        onDragOver={isCompressing ? (e) => e.preventDefault() : handleDragOver}
                        onDragLeave={isCompressing ? undefined : handleDragLeave}
                        onDrop={isCompressing ? (e) => e.preventDefault() : handleDrop}
                        className={`w-full h-32 rounded-2xl border border-dashed flex flex-col items-center justify-center p-4 text-center select-none transition-all duration-200 ${
                          isCompressing
                            ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/10 cursor-not-allowed opacity-80'
                            : isDragging 
                            ? 'border-zinc-900 bg-zinc-100/50 dark:border-zinc-50 dark:bg-zinc-900/60 cursor-pointer' 
                            : 'border-zinc-250 hover:border-zinc-450 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-900 dark:hover:bg-zinc-900/30 cursor-pointer'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-2 border border-zinc-200/10">
                          <Camera className={`w-5 h-5 text-zinc-400 ${isCompressing ? 'animate-spin' : ''}`} />
                        </div>
                        <p className={`text-[11px] font-bold transition-colors duration-150 ${isCompressing ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-250'}`}>
                          {isCompressing ? 'Otimizando imagem...' : 'Arraste e solte ou clique para fazer upload da foto real'}
                        </p>
                        <p className="text-[9px] text-zinc-400 mt-1 max-w-[220px]">
                          {isCompressing ? 'Reduzindo dimensões e peso da foto em segundo plano.' : 'JPG, PNG ou WEBP. Sem limites de tamanho, otimização automática.'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Section 2: Gerenciamento de Grade */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5" />
                      Grade de Tamanhos
                    </h3>
                    <button
                      type="button"
                      onClick={addFormSizeRow}
                      className="py-1 px-2.5 text-[10px] font-bold text-zinc-850 hover:text-zinc-950 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-lg transition-all"
                    >
                      + Adicionar Tamanho
                    </button>
                  </div>

                  {/* Size Rows */}
                  <div className="space-y-3">
                    {formSizes.map((sz, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/20 dark:border-zinc-850 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-1 duration-150 relative"
                      >
                        <div className="grid grid-cols-12 gap-2 flex-1">
                          
                          {/* Tamanho */}
                          <div className="col-span-3">
                            <label className="text-[8px] text-zinc-400 font-bold block mb-0.5">TAM.</label>
                            <input 
                              type="text" 
                              placeholder="38"
                              value={sz.size}
                              onChange={(e) => updateFormSizeRow(idx, 'size', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                              required
                            />
                          </div>

                          {/* Quantidade */}
                          <div className="col-span-3">
                            <label className="text-[8px] text-zinc-400 font-bold block mb-0.5">QTD.</label>
                            <input 
                              type="number" 
                              min="0"
                              placeholder="10"
                              value={sz.stock}
                              onChange={(e) => updateFormSizeRow(idx, 'stock', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                              required
                            />
                          </div>

                          {/* Código de Barras (EAN) */}
                          <div className="col-span-6">
                            <label className="text-[8px] text-zinc-400 font-bold block mb-0.5">EAN / BARCODE (OPCIONAL)</label>
                            <input 
                              type="text" 
                              placeholder="7890..."
                              value={sz.barcode}
                              onChange={(e) => updateFormSizeRow(idx, 'barcode', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-xs font-mono focus:outline-none focus:border-zinc-900"
                            />
                          </div>

                        </div>

                        {/* Remove Size Row Button */}
                        <button
                          type="button"
                          onClick={() => removeFormSizeRow(idx)}
                          disabled={formSizes.length <= 1}
                          className="mt-4 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0 disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sheet Footer actions */}
              <div className="p-5 border-t border-zinc-150/40 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950 flex justify-between gap-3 shrink-0">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id)}
                    className="py-2.5 px-4 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center gap-1.5 transition-colors active:scale-98"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSheetOpen(false)}
                    className="py-2.5 px-4 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors active:scale-98"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow active:scale-98"
                  >
                    <Save className="w-4 h-4" /> Salvar Produto
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
