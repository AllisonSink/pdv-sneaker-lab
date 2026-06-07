'use client';

import React, { useState, useRef } from 'react';
import { Settings, Store, Printer, HardDrive, Image, Camera, Barcode, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [testBipVal, setTestBipVal] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
          toast.success('Logo de recibo carregado com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestPrint = () => {
    toast.success('Sinal de teste enviado para a impressora térmica!');
  };

  const handleBipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTestBipVal(val);
    if (val.length >= 8) {
      toast.success(`Código lido pelo leitor óptico: ${val}`);
      setTimeout(() => setTestBipVal(''), 1500);
    }
  };

  const handleSaveSettings = () => {
    toast.success('Todas as configurações do terminal salvas com sucesso!');
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased min-h-screen relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Settings className="w-5.5 h-5.5" />
          Configurações do Terminal
        </h1>
        <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
          Ajustes de hardware de impressão, perfil da loja sneaker e segurança.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        
        {/* Card: Perfil da Loja */}
        <div className="bg-white dark:bg-zinc-955 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Store className="w-4 h-4 text-zinc-400" />
            Perfil da Loja
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Logo Upload Slot */}
            <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-28 h-28 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden transition-all duration-200 ${
                  logoUrl 
                    ? 'border-zinc-200 dark:border-zinc-800' 
                    : 'border-zinc-350 hover:border-zinc-450 dark:border-zinc-700 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30'
                }`}
              >
                {logoUrl ? (
                  <div className="relative w-full h-full group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo da Loja" className="w-full h-full object-contain p-2 bg-white" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3">
                    <Image className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-1.5" />
                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider leading-tight">Upload Logo</span>
                    <span className="text-[8px] text-zinc-450 dark:text-zinc-600 mt-0.5">(Recibo)</span>
                  </div>
                )}
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUrl('');
                    toast.info('Logo do recibo removido.');
                  }}
                  className="mt-2.5 text-[9px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover Logo
                </button>
              )}
            </div>

            {/* Inputs Perfil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
              <div>
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">Nome da Filial</label>
                <input 
                  type="text" 
                  defaultValue="SNEAKER LAB - SÃO PAULO" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1 block">CNPJ da Filial</label>
                <input 
                  type="text" 
                  defaultValue="12.345.678/0001-99" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Card: Impressora */}
        <div className="bg-white dark:bg-zinc-955 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Printer className="w-4 h-4 text-zinc-400" />
            Configuração de Impressão Térmica
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-2 block">Largura da Bobina</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold rounded-xl border border-transparent cursor-pointer">
                  80mm (Padrão)
                </button>
                <button className="py-2.5 bg-zinc-55 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold rounded-xl border border-zinc-200/40 dark:border-zinc-800 cursor-pointer">
                  58mm
                </button>
                <button className="py-2.5 bg-zinc-55 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold rounded-xl border border-zinc-200/40 dark:border-zinc-800 cursor-pointer">
                  A4 (Termo)
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl">
              <div>
                <p className="text-xs font-bold leading-tight">Corte Automático da Guilhotina</p>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">Enviar sinal de corte após window.print().</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-950 dark:accent-zinc-50" />
            </div>

            {/* Test Printer Button Row */}
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900/40 mt-4">
              <button
                type="button"
                onClick={handleTestPrint}
                className="py-2.5 px-4 bg-zinc-55 hover:bg-zinc-100 active:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-200/40 dark:border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> Testar Impressão (Cupom Teste)
              </button>
            </div>
          </div>
        </div>

        {/* Card: Leitor */}
        <div className="bg-white dark:bg-zinc-955 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            Periféricos e Bipador
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-emerald-55/50 dark:bg-emerald-955/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-emerald-805 dark:text-emerald-400 leading-tight">Bipador USB Externo</p>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-500/80 mt-0.5">Capturando eventos no barramento de teclado principal.</p>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase">Conectado</span>
            </div>

            {/* Test Barcode Reader Field */}
            <div className="space-y-1.5">
              <label htmlFor="testBip" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold block">Área de Teste do Bipador</label>
              <div className="relative">
                <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input 
                  id="testBip"
                  type="text" 
                  value={testBipVal}
                  onChange={handleBipChange}
                  placeholder="Clique aqui e bipe um código para testar..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Global Action Footer */}
      <div className="max-w-3xl flex justify-end pt-4 border-t border-zinc-200/40 dark:border-zinc-900/60 mt-8 mb-6">
        <button
          onClick={handleSaveSettings}
          className="py-3 px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-xs font-bold rounded-2xl transition-all shadow-md shadow-zinc-950/10 active:scale-[0.98] select-none cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Salvar Configurações
        </button>
      </div>

    </div>
  );
}
