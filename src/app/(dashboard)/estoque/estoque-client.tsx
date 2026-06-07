'use client';

import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { SNEAKER_IMAGES } from '@/data/mockProducts';
import { Product, SizeStock } from '@/types';
import { 
  Layers, 
  Grid,
  LayoutList,
  AlertTriangle, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Sparkles,
  Save,
  Barcode,
  Camera,
  Image
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

const ADULT_SIZES = ['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const KIDS_SIZES = ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'];

export default function EstoqueClient({ initialProducts }: { initialProducts: Product[] }) {
  const { user } = useAuth();
  const router = useRouter();

  // Inventory State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [viewMode, setViewMode] = useState<'detailed' | 'list' | 'grid'>('detailed');

  // Form / Sheet State for Edit
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
  
  // New Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addColorway, setAddColorway] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addSizeStocks, setAddSizeStocks] = useState<Record<string, number>>({});
  const [addPriceCost, setAddPriceCost] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addError, setAddError] = useState('');
  const [sizeCategory, setSizeCategory] = useState<'adulto' | 'infantil'>('adulto');

  // Image Upload for Add Modal
  const [addFormImageUrl, setAddFormImageUrl] = useState('');
  const [isAddCompressing, setIsAddCompressing] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop / File Upload state for edit form
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync products when initialProducts changes
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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

  // Form: Add size row in Edit Mode
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

  // Form: Remove size row in Edit Mode
  const removeFormSizeRow = (index: number) => {
    setFormSizes(formSizes.filter((_, idx) => idx !== index));
  };

  // Form: Update size row field in Edit Mode
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

  // Image Upload / Drag and Drop Handlers for Edit Mode
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

  // Action: Add New Product Real Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!user) return;

    const priceNum = parseBRL(addPrice);
    const priceCostNum = parseBRL(addPriceCost);

    if (!addName.trim() || !addBrand.trim() || priceNum <= 0) {
      setAddError('Por favor, preencha as informações básicas do modelo corretamente.');
      return;
    }

    const addSelectedSizes = Object.keys(addSizeStocks);
    if (addSelectedSizes.length === 0) {
      setAddError('Por favor, selecione pelo menos um tamanho disponível.');
      return;
    }

    const supabase = createClient();

    // Construct sizes grid
    const sizesGrid = addSelectedSizes.map(size => {
      const cleanBrand = addBrand.toUpperCase().replace(/\s+/g, '').slice(0, 3);
      const cleanName = addName.toUpperCase().replace(/\s+/g, '').slice(0, 5);
      const baseSku = addSku.trim() || `${cleanBrand}-${cleanName}`;
      const autoSku = `${baseSku}-${size}`;
      const autoBarcode = `789000${Math.floor(100000 + Math.random() * 900000).toString().slice(-6)}`;

      return {
        size: size,
        sku: autoSku,
        barcode: autoBarcode,
        stock: Math.max(0, addSizeStocks[size] ?? 0)
      };
    });

    const finalImageUrl = addFormImageUrl || SNEAKER_IMAGES.airforce;

    const { error } = await supabase
      .from('produtos')
      .insert({
        name: addName.trim(),
        brand: addBrand.trim(),
        group: addBrand.trim(),
        price: priceNum,
        price_cost: priceCostNum,
        colorway: addColorway.trim(),
        sizes: sizesGrid,
        image_url: finalImageUrl,
        user_id: user.id
      });

    if (error) {
      console.error(error);
      setAddError(`Erro ao cadastrar produto no Supabase: ${error.message}`);
      toast.error('Erro ao cadastrar produto.');
    } else {
      toast.success('Produto cadastrado com sucesso!');
      setIsAddModalOpen(false);
      setAddName('');
      setAddBrand('');
      setAddColorway('');
      setAddSku('');
      setAddSizeStocks({});
      setAddFormImageUrl('');
      setAddError('');
      router.refresh();
    }
  };

  // Form: Save Product (Edit Mode)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!user || !editingProduct) return;

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

    const finalImageUrl = formImageUrl || SNEAKER_IMAGES.airforce;
    const supabase = createClient();

    const { error } = await supabase
      .from('produtos')
      .update({
        brand: groupInput.trim(),
        group: groupInput.trim(),
        name: formName.trim(),
        colorway: formColorway.trim(),
        price: priceNum,
        image_url: finalImageUrl,
        sizes: formattedSizes
      })
      .eq('id', editingProduct.id)
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      setFormError(`Erro ao atualizar: ${error.message}`);
      toast.error('Erro ao atualizar produto.');
    } else {
      setIsSheetOpen(false);
      toast.success("Produto atualizado com sucesso!");
      router.refresh();
    }
  };

  // Form: Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;

    if (confirm('Tem certeza que deseja remover este tênis do estoque permanentemente?')) {
      const supabase = createClient();
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
        toast.error('Erro ao remover produto.');
      } else {
        setIsSheetOpen(false);
        toast.success("Item removido.");
        router.refresh();
      }
    }
  };

  const handleSizeToggle = (size: string) => {
    setAddSizeStocks(prev => {
      const next = { ...prev };
      if (size in next) {
        delete next[size];
      } else {
        next[size] = 1;
      }
      return next;
    });
  };

  const generateSKU = () => {
    if (!addName.trim() || !addColorway.trim()) {
      toast.warning('Preencha o nome e a cor para gerar o SKU');
      return;
    }

    const cleanName = addName.trim().toUpperCase();
    const cleanColor = addColorway.trim().toUpperCase().slice(0, 3);
    
    const nameWords = cleanName.split(/[\s\-_/]+/).filter(Boolean);
    
    if (nameWords.length === 0) {
      toast.error('Nome inválido para gerar SKU');
      return;
    }

    const skuParts: string[] = [];
    const firstWord = nameWords[0];
    skuParts.push(firstWord);

    const numberWord = nameWords.find(w => /\d+/.test(w));
    if (numberWord && numberWord !== firstWord) {
      skuParts.push(numberWord);
    } else if (nameWords.length > 1) {
      const secondWord = nameWords.find(w => w !== firstWord && w !== 'BOOST' && w !== 'RETRO' && w !== 'LOW' && w !== 'HIGH');
      if (secondWord) {
        skuParts.push(secondWord.slice(0, 3));
      }
    }

    skuParts.push(cleanColor);

    const generated = skuParts.join('-');
    setAddSku(generated);
    toast.success('SKU gerado com sucesso!');
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAddImageFile(file);
    }
  };

  const processAddImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAddError('Por favor, carregue apenas arquivos de imagem.');
      return;
    }
    
    setIsAddCompressing(true);
    setAddError('');

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
          setAddFormImageUrl(event.target.result as string);
          setAddError('');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Erro ao comprimir imagem do cadastro:', error);
      setAddError('Falha ao processar e otimizar imagem. Tente outro arquivo.');
      toast.error('Falha ao otimizar imagem.');
    } finally {
      setIsAddCompressing(false);
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
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-55 flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-200" />
            Estoque & Grade de Produtos
          </h1>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Visualização de estoque por tamanho e códigos de barra para bipagem.
          </p>
        </div>
      </div>

      {/* Filter and search bar / View Switcher / CTA Button */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search & Add buttons */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-455" />
            <input
              type="text"
              placeholder="Filtrar por marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
            />
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-zinc-950/10 dark:shadow-zinc-50/5 select-none shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Tênis
          </button>
        </div>

        {/* View Mode Toggle Group */}
        <div className="flex items-center gap-1.5 self-start md:self-center bg-white dark:bg-zinc-955 p-1.5 rounded-2xl border border-zinc-200/40 dark:border-zinc-900 shrink-0 shadow-sm">
          <button
            onClick={() => setViewMode('detailed')}
            className={`p-3.5 md:p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'detailed'
                ? 'bg-zinc-900 text-white dark:bg-zinc-805 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title="Exibição Detalhada"
          >
            <Layers className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3.5 md:p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-zinc-900 text-white dark:bg-zinc-805 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title="Exibição em Grade"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`p-3.5 md:p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-zinc-900 text-white dark:bg-zinc-805 dark:text-zinc-50 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300'
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none active:scale-95 border cursor-pointer ${
              selectedGroup === g
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 font-bold shadow-sm'
                : 'bg-white border-zinc-200/50 hover:bg-zinc-55 text-zinc-500 hover:text-zinc-805 dark:bg-zinc-955 dark:border-zinc-900 dark:hover:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
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
                const totalStock = prod.sizes?.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) || 0;
                return (
                  <div 
                    key={prod.id} 
                    className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-5 lg:p-6 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 shrink-0 overflow-hidden flex items-center justify-center">
                          {prod.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-center" />
                          ) : (
                            <Image className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{prod.brand}</span>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                            {prod.name}{prod.colorway ? ` - ${prod.colorway}` : ''}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            {prod.priceCost && (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                Custo: {prod.priceCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-zinc-100 dark:border-zinc-900 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Estoque Global</span>
                          <span className={`text-base font-black tracking-tight ${totalStock === 0 ? 'text-red-500' : totalStock <= 3 ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                            {totalStock} pares
                          </span>
                        </div>
                        <button
                          onClick={() => openEditSheet(prod)}
                          className="py-2 px-3 border border-zinc-200 hover:bg-zinc-55 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Grade / Editar
                        </button>
                      </div>
                    </div>
                    {/* Sizes Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {prod.sizes.map((sz, idx) => {
                        const stockNum = Number(sz.stock) || 0;
                        return (
                          <div 
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                              stockNum === 0
                                ? 'bg-zinc-50/50 border-zinc-200/40 dark:bg-zinc-950/20 dark:border-zinc-900 opacity-60 text-zinc-400'
                                : stockNum <= 2
                                ? 'bg-amber-50/20 border-amber-250/30 dark:bg-amber-955/5 dark:border-amber-900/10'
                                : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/20 dark:border-zinc-850'
                            }`}
                          >
                            <div>
                              <span className={`text-xs font-black tracking-tight block ${stockNum === 0 ? 'text-zinc-450 dark:text-zinc-550' : ''}`}>
                                Tam. {sz.size}
                              </span>
                              <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-550 tracking-tight block truncate mt-0.5" title={sz.sku}>{sz.sku}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900/40">
                              {stockNum === 0 ? (
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Esgotado</span>
                              ) : (
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  {stockNum} em estoque
                                </span>
                              )}
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                stockNum === 0 
                                  ? 'bg-zinc-300 dark:bg-zinc-700' 
                                  : stockNum <= 2 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GRID COMPACT VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => {
                const totalStock = prod.sizes?.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) || 0;
                return (
                  <div 
                    key={prod.id} 
                    className="bg-white dark:bg-zinc-955 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.imageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">{prod.brand}</span>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate leading-tight mt-0.5" title={prod.name}>
                              {prod.name}
                            </h3>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditSheet(prod)}
                          className="p-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sizes quick wrap */}
                      <div className="flex flex-wrap gap-1.5 py-3">
                        {prod.sizes.map((sz, idx) => (
                          <span 
                            key={idx}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                              sz.stock === 0
                                ? 'bg-red-50/20 text-red-500 border-red-200/20 dark:bg-red-955/5'
                                : sz.stock <= 2
                                ? 'bg-amber-50/20 text-amber-500 border-amber-200/20 dark:bg-amber-955/5'
                                : 'bg-zinc-50 text-zinc-600 border-zinc-200/30 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-850'
                            }`}
                          >
                            T{sz.size} ({sz.stock})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-3">
                      <div>
                        <span className="text-[8px] text-zinc-450 uppercase font-bold tracking-wider block">Preço</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-zinc-450 uppercase font-bold tracking-wider block">Total</span>
                        <span className={`text-sm font-black ${totalStock === 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {totalStock} un.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. LIST COMPACT VIEW */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 uppercase font-bold text-[9px] tracking-wider">
                      <th className="py-4 px-6">Produto</th>
                      <th className="py-4 px-6">Marca</th>
                      <th className="py-4 px-6">Preço</th>
                      <th className="py-4 px-6">Custo</th>
                      <th className="py-4 px-6 text-center">Tamanhos (Stock)</th>
                      <th className="py-4 px-6 text-right">Estoque</th>
                      <th className="py-4 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {filteredProducts.map(prod => {
                      const totalStock = prod.sizes?.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) || 0;
                      return (
                        <tr 
                          key={prod.id}
                          className="text-xs hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">
                            {prod.name}{prod.colorway ? ` (${prod.colorway})` : ''}
                          </td>
                          <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400">{prod.brand}</td>
                          <td className="py-4 px-6 font-semibold">
                            {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="py-4 px-6 text-zinc-400">
                            {prod.priceCost ? prod.priceCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                              {prod.sizes.map((sz, idx) => (
                                <span 
                                  key={idx}
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                    sz.stock === 0 ? 'bg-red-50/20 text-red-500 border-red-100 dark:bg-red-955/5' : 'bg-zinc-50 text-zinc-650 border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-450'
                                  }`}
                                >
                                  {sz.size}:{sz.stock}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className={`py-4 px-6 text-right font-black ${totalStock === 0 ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {totalStock}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => openEditSheet(prod)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-55 dark:hover:bg-zinc-900 transition-colors cursor-pointer inline-flex"
                            >
                              <Edit className="w-4 h-4" />
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

      {/* NEW MODAL: CLEAN 5-FIELD ADD SNEAKER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div 
            className="w-full max-w-lg overflow-hidden bg-white/98 dark:bg-zinc-900/98 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-6 w-full text-left uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Novo Produto
            </h3>

            {addError && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-2.5 text-red-700 dark:text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-4 w-full">
              
              {/* Espaço para Foto */}
              <div className="flex flex-col items-center justify-center pb-2">
                <input 
                  type="file" 
                  ref={addFileInputRef} 
                  onChange={handleAddFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  onClick={() => addFileInputRef.current?.click()}
                  className={`w-24 h-24 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden transition-all duration-200 ${
                    addFormImageUrl 
                      ? 'border-zinc-200 dark:border-zinc-800' 
                      : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30'
                  }`}
                >
                  {addFormImageUrl ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={addFormImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2">
                      <Image className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-1" />
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Adicionar Foto</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nome do Tênis */}
              <div className="space-y-1">
                <label htmlFor="addName" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Nome do Tênis</label>
                <input 
                  id="addName"
                  type="text" 
                  placeholder="Ex: Yeezy Boost 350 V2" 
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                  required
                />
              </div>

              {/* Marca & Cor / Colorway */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="addBrand" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Marca</label>
                  <input 
                    id="addBrand"
                    type="text" 
                    placeholder="Ex: Adidas" 
                    value={addBrand}
                    onChange={(e) => setAddBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="addColorway" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Cor / Colorway</label>
                  <input 
                    id="addColorway"
                    type="text" 
                    placeholder="Ex: Zebra" 
                    value={addColorway}
                    onChange={(e) => setAddColorway(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                    required
                  />
                </div>
              </div>

              {/* Código de Barras (SKU) com Gerador Automático Embutido */}
              <div className="space-y-1">
                <label htmlFor="addSku" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Código de Barras (SKU)</label>
                <div className="relative">
                  <input 
                    id="addSku"
                    type="text" 
                    placeholder="Ex: YZE-350-ZEB" 
                    value={addSku}
                    onChange={(e) => setAddSku(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    title="Gerar SKU Automático"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-805/65 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Preço de Custo e Venda */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="addPriceCost" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Preço de Custo</label>
                  <input 
                    id="addPriceCost"
                    type="text" 
                    placeholder="R$ 0,00" 
                    value={addPriceCost}
                    onChange={(e) => setAddPriceCost(formatBRL(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="addPrice" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Preço de Venda</label>
                  <input 
                    id="addPrice"
                    type="text" 
                    placeholder="R$ 0,00" 
                    value={addPrice}
                    onChange={(e) => setAddPrice(formatBRL(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                    required
                  />
                </div>
              </div>

              {/* Grade de Tamanhos & Lógica de Quantidade */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-semibold block">Grade de Tamanhos & Estoque</label>
                  
                  {/* Segmented Control / Tabs */}
                  <div className="bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg flex items-center gap-0.5 shrink-0 border border-zinc-200/10">
                    <button
                      type="button"
                      onClick={() => setSizeCategory('adulto')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        sizeCategory === 'adulto'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent'
                      }`}
                    >
                      Adulto
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeCategory('infantil')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        sizeCategory === 'infantil'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent'
                      }`}
                    >
                      Infantil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1.5 border border-zinc-250/20 dark:border-zinc-850 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10">
                  {(sizeCategory === 'adulto' ? ADULT_SIZES : KIDS_SIZES).map(size => {
                    const isSelected = size in addSizeStocks;
                    const qty = addSizeStocks[size] ?? '';
                    return (
                      <div 
                        key={size}
                        className={`flex flex-col p-2 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-sm shadow-zinc-900/10 dark:shadow-zinc-50/5' 
                            : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 dark:bg-zinc-955 dark:border-zinc-850 dark:text-zinc-450 dark:hover:bg-zinc-900/60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className="w-full text-center text-xs font-bold py-1 select-none active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />}
                          Tam. {size}
                        </button>
                        
                        {isSelected && (
                          <div className="mt-1.5 pt-1.5 border-t border-zinc-800 dark:border-zinc-200/20 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-85">Qtd:</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setAddSizeStocks(prev => ({
                                  ...prev,
                                  [size]: isNaN(val) ? 0 : val
                                }));
                              }}
                              className="w-full text-center text-[10px] font-bold bg-zinc-805 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900 border-0 rounded py-0.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:active:bg-zinc-850 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-955 font-bold rounded-2xl transition-all text-xs shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC CRUD SHEET: Gaveta Lateral de Cadastro (Apple-style drawer for Edit) */}
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
            className="relative w-full max-w-lg bg-white/98 dark:bg-zinc-955/98 h-full shadow-2xl flex flex-col z-10 border-l border-zinc-200/40 dark:border-zinc-900 transition-transform duration-300 animate-in slide-in-from-right"
          >
            
            {/* Sheet Header */}
            <div className="h-16 border-b border-zinc-150/40 dark:border-zinc-900 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-zinc-50" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
                  Editar Modelo
                </h2>
              </div>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-55/60 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body (Scrollable Form) */}
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Form Error message */}
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-3 text-red-700 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
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
                        className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
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
                        className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
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
                        className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Preço Unitário (R$)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: R$ 899,90" 
                        value={formPrice}
                        onChange={(e) => setFormPrice(formatBRL(e.target.value))}
                        className="w-full px-4 py-2.5 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all"
                        required
                      />
                    </div>

                  </div>

                  {/* Photo Real Upload Section */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-3 block">Foto do Tênis</label>
                    
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
                          className="absolute top-2.5 right-2.5 py-1.5 px-3 bg-red-50 dark:bg-red-955/20 hover:bg-red-100 text-red-500 text-[10px] font-bold rounded-lg border border-red-200/20 flex items-center gap-1 transition-colors cursor-pointer"
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
                            ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/10 cursor-not-allowed opacity-85'
                            : isDragging 
                            ? 'border-zinc-900 bg-zinc-100/50 dark:border-zinc-55 dark:bg-zinc-900/60 cursor-pointer' 
                            : 'border-zinc-250 hover:border-zinc-450 hover:bg-zinc-55 dark:border-zinc-800 dark:hover:border-zinc-900 dark:hover:bg-zinc-900/30 cursor-pointer'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-2 border border-zinc-200/10">
                          <Camera className={`w-5 h-5 text-zinc-400 ${isCompressing ? 'animate-spin' : ''}`} />
                        </div>
                        <p className={`text-[11px] font-bold transition-colors duration-155 ${isCompressing ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-250'}`}>
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
                    <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5" />
                      Grade de Tamanhos
                    </h3>
                    <button
                      type="button"
                      onClick={addFormSizeRow}
                      className="py-1 px-2.5 text-[10px] font-bold text-zinc-850 hover:text-zinc-950 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-lg transition-all cursor-pointer"
                    >
                      + Adicionar Tamanho
                    </button>
                  </div>

                  {/* Size Rows */}
                  <div className="space-y-3">
                    {formSizes.map((sz, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/20 dark:border-zinc-850 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-1 duration-150 relative"
                      >
                        <div className="grid grid-cols-12 gap-4 flex-1">
                          
                          {/* Tamanho */}
                          <div className="col-span-3">
                            <label className="text-[8px] text-zinc-400 font-bold block mb-0.5">TAM.</label>
                            <input 
                              type="text" 
                              placeholder="38"
                              value={sz.size}
                              onChange={(e) => updateFormSizeRow(idx, 'size', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-base md:text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
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
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-base md:text-xs focus:outline-none focus:border-zinc-900"
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
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-900 rounded-lg text-base md:text-xs font-mono focus:outline-none focus:border-zinc-900"
                            />
                          </div>

                        </div>

                        {/* Remove Size Row Button */}
                        <button
                          type="button"
                          onClick={() => removeFormSizeRow(idx)}
                          disabled={formSizes.length <= 1}
                          className="mt-4 p-1.5 ml-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg shrink-0 disabled:opacity-40 cursor-pointer"
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
                    className="py-2.5 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-955/20 rounded-xl flex items-center gap-1.5 transition-colors active:scale-98 cursor-pointer"
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
                    className="py-2.5 px-4 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors active:scale-98 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow active:scale-98 cursor-pointer"
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
