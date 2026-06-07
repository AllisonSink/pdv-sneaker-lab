import React from 'react';
import { CartItem, Customer, PaymentMethod } from '@/types';

interface ReceiptProps {
  items: CartItem[];
  customer?: Customer;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  saleId: string;
  dateTime: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  money: 'Dinheiro',
};

export const Receipt: React.FC<ReceiptProps> = ({
  items,
  customer,
  paymentMethod,
  subtotal,
  total,
  saleId,
  dateTime,
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div
      id="receipt-print"
      className="hidden print:block w-[80mm] mx-auto bg-white p-4 font-mono text-black text-[10px] leading-tight select-none"
      style={{ width: '80mm', maxWidth: '80mm', color: '#000', backgroundColor: '#fff' }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-sm font-bold tracking-widest uppercase">KICKS PDV</h1>
        <p className="text-[8px] uppercase opacity-75">Concept & Kicks Shop</p>
        <p className="text-[8px] mt-1">Av. Paulista, 1000 - São Paulo/SP</p>
        <p className="text-[8px]">CNPJ: 12.345.678/0001-99</p>
        <p className="text-[8px]">TEL: (11) 3232-4040</p>
      </div>

      {/* Sale Details */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between">
          <span>CUPOM: {saleId}</span>
          <span>DATA: {dateTime}</span>
        </div>
        {customer && (
          <div className="mt-1 pt-1 border-t border-dotted border-black/50">
            <p className="uppercase">CLIENTE: {customer.name}</p>
            {customer.cpf && <p>CPF: {customer.cpf}</p>}
          </div>
        )}
      </div>

      {/* Items Header */}
      <div className="border-b border-dashed border-black pb-1 mb-1 font-bold">
        <div className="grid grid-cols-12 gap-1 text-left">
          <span className="col-span-2">QTD</span>
          <span className="col-span-6">ITEM</span>
          <span className="col-span-4 text-right">VALOR</span>
        </div>
      </div>

      {/* Items List */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-1 py-1 align-top">
            <span className="col-span-2">{item.quantity}x</span>
            <div className="col-span-6 flex flex-col">
              <span className="font-semibold uppercase">{item.product.brand} {item.product.name}{item.product.colorway ? ` - ${item.product.colorway}` : ''}</span>
              <span className="text-[8px] opacity-75 uppercase">TAM: {item.size} | SKU: {item.sku}</span>
            </div>
            <span className="col-span-4 text-right">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {subtotal !== total && (
          <div className="flex justify-between">
            <span>DESCONTO:</span>
            <span>{formatCurrency(subtotal - total)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-[11px] pt-1">
          <span>TOTAL A PAGAR:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="border-b border-dashed border-black pb-2 mb-3">
        <div className="flex justify-between">
          <span>PAGAMENTO:</span>
          <span className="font-semibold uppercase">{PAYMENT_LABELS[paymentMethod]}</span>
        </div>
        <div className="flex justify-between">
          <span>VALOR RECEBIDO:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer / Barcode */}
      <div className="text-center space-y-2 mt-4">
        <p className="text-[9px] uppercase tracking-wide">Obrigado pela preferência!</p>
        <p className="text-[8px] opacity-75">Desenvolvido por Kicks PDV OS</p>
        
        {/* Simulated Thermal Ticket Barcode */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="h-6 w-3/4 flex justify-between overflow-hidden opacity-90">
            {/* Generating standard-looking barcode lines */}
            {Array.from({ length: 42 }).map((_, i) => {
              const widths = [1, 2, 3, 1, 4, 2, 1, 3, 2];
              const w = widths[i % widths.length];
              return (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{
                    width: `${w}px`,
                    marginRight: i % 2 === 0 ? '1px' : '2px',
                    display: i % 7 === 0 ? 'none' : 'block',
                  }}
                />
              );
            })}
          </div>
          <span className="text-[7px] mt-1 tracking-[4px]">{saleId.replace(/-/g, '')}</span>
        </div>
      </div>
    </div>
  );
};
