'use client';

import React from 'react';
import { Settings, Store, Printer, HardDrive } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased">
      
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
        
        {/* Card: Loja */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-zinc-400" />
            Perfil da Loja
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Card: Impressora */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Printer className="w-4 h-4 text-zinc-400" />
            Configuração de Impressão Térmica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-2 block">Largura da Bobina</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold rounded-xl border border-transparent">
                  80mm (Padrão)
                </button>
                <button className="py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold rounded-xl border border-zinc-200/40 dark:border-zinc-800">
                  58mm
                </button>
                <button className="py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold rounded-xl border border-zinc-200/40 dark:border-zinc-800">
                  A4 (Termo)
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl">
              <div>
                <p className="text-xs font-bold leading-tight">Corte Automático da Guilhotina</p>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-0.5">Enviar sinal de corte após window.print().</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-950 dark:accent-zinc-50" />
            </div>
          </div>
        </div>

        {/* Card: Leitor */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm rounded-3xl p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            Periféricos e Bipador
          </h2>
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-tight">Bipador USB Externo</p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-500/80 mt-0.5">Capturando eventos no barramento de teclado principal.</p>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase">Conectado</span>
          </div>
        </div>

      </div>

    </div>
  );
}
