import React from 'react';
import { Check, Printer, Plus } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onPrint: () => void;
  onNewSale: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onPrint,
  onNewSale,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div 
        className="w-full max-w-sm overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center text-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
      >
        {/* Success Icon */}
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 mb-6 border border-emerald-100 dark:border-emerald-900/30">
          <Check className="w-8 h-8 animate-bounce" strokeWidth={2.5} />
        </div>

        {/* Text Details */}
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
          Venda Concluída!
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-[240px]">
          A transação foi registrada. Deseja imprimir o recibo da venda agora?
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onPrint}
            className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-zinc-950/10 dark:shadow-zinc-50/5 active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Imprimir Recibo
          </button>
          
          <button
            onClick={onNewSale}
            className="w-full py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nova Venda
          </button>
        </div>
      </div>
    </div>
  );
};
